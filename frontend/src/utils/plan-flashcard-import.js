import { createFlashcardFormSchema } from './validation.js';

export const PLAN_FLASHCARD_IMPORT_VALIDATION_ERROR =
  'Plan flashcards could not be imported. Try regenerating the plan.';

/**
 * @typedef {import('../services/study-materials.service.js').StudyPlan} StudyPlan
 * @typedef {{
 *   question: string,
 *   answer: string,
 *   tags?: string[],
 *   materialId: string,
 * }} CreateFlashcardBody
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
 * @param {string} materialId
 * @returns {CreateFlashcardBody}
 */
export function mapPlanFlashcardToCreateBody(planFlashcard, materialId) {
  const question = typeof planFlashcard.question === 'string' ? planFlashcard.question.trim() : '';
  const answer = typeof planFlashcard.answer === 'string' ? planFlashcard.answer.trim() : '';
  const tags = normalizePlanTags(planFlashcard.tags);

  /** @type {CreateFlashcardBody} */
  const body = {
    question,
    answer,
    materialId,
  };

  if (tags) {
    body.tags = tags;
  }

  return body;
}

/**
 * @param {StudyPlan | null | undefined} plan
 * @param {string} materialId
 * @returns {{ success: true, bodies: CreateFlashcardBody[] } | { success: false, error: string }}
 */
export function buildValidatedFlashcardImportBodies(plan, materialId) {
  if (!plan || !Array.isArray(plan.flashcards) || plan.flashcards.length === 0) {
    return { success: false, error: PLAN_FLASHCARD_IMPORT_VALIDATION_ERROR };
  }

  /** @type {CreateFlashcardBody[]} */
  const bodies = [];

  for (const planFlashcard of plan.flashcards) {
    const candidate = mapPlanFlashcardToCreateBody(planFlashcard, materialId);
    const parsed = createFlashcardFormSchema.safeParse(candidate);
    if (!parsed.success) {
      return { success: false, error: PLAN_FLASHCARD_IMPORT_VALIDATION_ERROR };
    }

    /** @type {CreateFlashcardBody} */
    const body = {
      question: parsed.data.question,
      answer: parsed.data.answer,
      materialId: parsed.data.materialId,
    };
    if (parsed.data.tags !== undefined) {
      body.tags = parsed.data.tags;
    }
    bodies.push(body);
  }

  return { success: true, bodies };
}

/**
 * @param {string} courseId
 * @param {CreateFlashcardBody[]} bodies
 * @param {(courseId: string, body: CreateFlashcardBody) => Promise<unknown>} createFlashcard
 * @param {(current: number, total: number) => void} [onProgress]
 * @returns {Promise<
 *   | { success: true, imported: number }
 *   | { success: false, imported: number, total: number, error: unknown }
 * >}
 */
export async function importPlanFlashcardsSequentially(
  courseId,
  bodies,
  createFlashcard,
  onProgress
) {
  const total = bodies.length;
  let imported = 0;

  for (let index = 0; index < bodies.length; index += 1) {
    if (onProgress) {
      onProgress(index + 1, total);
    }

    try {
      await createFlashcard(courseId, bodies[index]);
      imported += 1;
    } catch (err) {
      return { success: false, imported, total, error: err };
    }
  }

  return { success: true, imported };
}
