import { createFlashcardFormSchema } from './validation.js';

export const PLAN_FLASHCARD_IMPORT_VALIDATION_ERROR =
  'Plan flashcards could not be imported. Try regenerating the plan.';

/**
 * @typedef {import('../services/study-materials.service.js').StudyPlan} StudyPlan
 * @typedef {{
 *   question: string,
 *   answer: string,
 *   tags?: string[],
 * }} ImportPlanFlashcardItem
 * @typedef {{
 *   imported: number,
 *   skipped: number,
 *   failed: number,
 *   total: number,
 * }} PlanImportSummary
 */

/**
 * @param {unknown} value
 * @returns {string[] | undefined}
 */
function normalizePlanTags(value) {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const tags = value
    .filter((tag) => typeof tag === 'string')
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);

  return tags.length > 0 ? tags : undefined;
}

/**
 * @param {StudyPlan['flashcards'][number]} planFlashcard
 * @returns {ImportPlanFlashcardItem}
 */
export function mapPlanFlashcardToImportItem(planFlashcard) {
  const question = typeof planFlashcard.question === 'string' ? planFlashcard.question.trim() : '';
  const answer = typeof planFlashcard.answer === 'string' ? planFlashcard.answer.trim() : '';
  const tags = normalizePlanTags(planFlashcard.tags);

  /** @type {ImportPlanFlashcardItem} */
  const item = {
    question,
    answer,
  };

  if (tags) {
    item.tags = tags;
  }

  return item;
}

/**
 * @deprecated Use mapPlanFlashcardToImportItem for plan import API payloads.
 * @param {StudyPlan['flashcards'][number]} planFlashcard
 * @param {string} materialId
 */
export function mapPlanFlashcardToCreateBody(planFlashcard, materialId) {
  return {
    ...mapPlanFlashcardToImportItem(planFlashcard),
    materialId,
  };
}

/**
 * @param {StudyPlan | null | undefined} plan
 * @returns {{ success: true, flashcards: ImportPlanFlashcardItem[] } | { success: false, error: string }}
 */
export function buildValidatedPlanFlashcardsImportPayload(plan) {
  if (!plan || !Array.isArray(plan.flashcards) || plan.flashcards.length === 0) {
    return { success: false, error: PLAN_FLASHCARD_IMPORT_VALIDATION_ERROR };
  }

  /** @type {ImportPlanFlashcardItem[]} */
  const flashcards = [];

  for (const planFlashcard of plan.flashcards) {
    const candidate = mapPlanFlashcardToImportItem(planFlashcard);
    const parsed = createFlashcardFormSchema.safeParse({
      ...candidate,
      materialId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    });
    if (!parsed.success) {
      return { success: false, error: PLAN_FLASHCARD_IMPORT_VALIDATION_ERROR };
    }

    /** @type {ImportPlanFlashcardItem} */
    const item = {
      question: parsed.data.question,
      answer: parsed.data.answer,
    };
    if (parsed.data.tags !== undefined) {
      item.tags = parsed.data.tags;
    }
    flashcards.push(item);
  }

  return { success: true, flashcards };
}

/**
 * @param {StudyPlan | null | undefined} plan
 * @param {string} materialId
 * @returns {{ success: true, bodies: Array<ImportPlanFlashcardItem & { materialId: string }> } | { success: false, error: string }}
 */
export function buildValidatedFlashcardImportBodies(plan, materialId) {
  const validated = buildValidatedPlanFlashcardsImportPayload(plan);
  if (!validated.success) {
    return validated;
  }

  return {
    success: true,
    bodies: validated.flashcards.map((flashcard) => ({ ...flashcard, materialId })),
  };
}

/**
 * @param {PlanImportSummary} summary
 * @returns {string}
 */
export function formatPlanFlashcardImportSummaryMessage(summary) {
  const parts = [`Imported ${summary.imported} saved flashcards.`];

  if (summary.skipped > 0) {
    parts.push(`Skipped ${summary.skipped} already imported.`);
  }
  if (summary.failed > 0) {
    parts.push(`${summary.failed} could not be imported.`);
  }

  return parts.join(' ');
}

/**
 * @param {string} materialId
 * @param {ImportPlanFlashcardItem[]} flashcards
 * @param {(materialId: string, body: { flashcards: ImportPlanFlashcardItem[] }) => Promise<{ summary: PlanImportSummary }>} importPlanFlashcards
 * @returns {Promise<
 *   | { success: true, summary: PlanImportSummary }
 *   | { success: false, summary?: PlanImportSummary, error: unknown }
 * >}
 */
export async function importPlanFlashcardsFromPlan(
  materialId,
  flashcards,
  importPlanFlashcards
) {
  try {
    const result = await importPlanFlashcards(materialId, { flashcards });
    const summary = result.summary;
    if (summary.failed > 0 && summary.imported === 0 && summary.skipped === 0) {
      return { success: false, summary, error: new Error('Failed to import flashcards') };
    }
    return { success: true, summary };
  } catch (err) {
    return { success: false, error: err };
  }
}

/**
 * @deprecated Use importPlanFlashcardsFromPlan with the material import API.
 */
export async function importPlanFlashcardsSequentially(
  courseId,
  bodies,
  createFlashcard,
  onProgress
) {
  void courseId;
  void createFlashcard;
  void onProgress;
  return {
    success: false,
    imported: 0,
    total: bodies.length,
    error: new Error('Sequential plan flashcard import is no longer supported'),
  };
}
