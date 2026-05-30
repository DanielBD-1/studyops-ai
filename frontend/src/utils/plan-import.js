import { createTaskFormSchema } from './validation.js';

export const PLAN_IMPORT_VALIDATION_ERROR =
  'Plan tasks could not be imported. Try regenerating the plan.';

const VALID_PRIORITIES = new Set(['low', 'medium', 'high']);

/**
 * @typedef {import('../services/study-materials.service.js').StudyPlan} StudyPlan
 * @typedef {{
 *   title: string,
 *   estimatedMinutes: number,
 *   description?: string,
 *   priority?: 'low' | 'medium' | 'high',
 * }} ImportPlanTaskItem
 * @typedef {{
 *   imported: number,
 *   skipped: number,
 *   failed: number,
 *   total: number,
 * }} PlanImportSummary
 */

/**
 * @param {StudyPlan['tasks'][number]} planTask
 * @returns {ImportPlanTaskItem}
 */
export function mapPlanTaskToImportItem(planTask) {
  const title = typeof planTask.title === 'string' ? planTask.title.trim() : '';
  const description =
    typeof planTask.description === 'string' ? planTask.description.trim() : '';

  /** @type {ImportPlanTaskItem} */
  const item = {
    title,
    estimatedMinutes: planTask.estimatedMinutes,
  };

  if (description !== '') {
    item.description = description;
  }

  if (VALID_PRIORITIES.has(planTask.priority)) {
    item.priority = /** @type {'low' | 'medium' | 'high'} */ (planTask.priority);
  }

  return item;
}

/**
 * @deprecated Use mapPlanTaskToImportItem for plan import API payloads.
 * @param {StudyPlan['tasks'][number]} planTask
 * @param {string} materialId
 */
export function mapPlanTaskToCreateBody(planTask, materialId) {
  return {
    ...mapPlanTaskToImportItem(planTask),
    materialId,
  };
}

/**
 * @param {StudyPlan | null | undefined} plan
 * @returns {{ success: true, tasks: ImportPlanTaskItem[] } | { success: false, error: string }}
 */
export function buildValidatedPlanTasksImportPayload(plan) {
  if (!plan || !Array.isArray(plan.tasks) || plan.tasks.length === 0) {
    return { success: false, error: PLAN_IMPORT_VALIDATION_ERROR };
  }

  /** @type {ImportPlanTaskItem[]} */
  const tasks = [];

  for (const planTask of plan.tasks) {
    const candidate = mapPlanTaskToImportItem(planTask);
    const parsed = createTaskFormSchema.safeParse({
      ...candidate,
      materialId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    });
    if (!parsed.success) {
      return { success: false, error: PLAN_IMPORT_VALIDATION_ERROR };
    }

    /** @type {ImportPlanTaskItem} */
    const item = {
      title: parsed.data.title,
      estimatedMinutes: parsed.data.estimatedMinutes,
    };
    if (parsed.data.description !== undefined) {
      item.description = parsed.data.description;
    }
    if (parsed.data.priority !== undefined) {
      item.priority = parsed.data.priority;
    }
    tasks.push(item);
  }

  return { success: true, tasks };
}

/**
 * @param {StudyPlan | null | undefined} plan
 * @param {string} materialId
 * @returns {{ success: true, bodies: Array<ImportPlanTaskItem & { materialId: string }> } | { success: false, error: string }}
 */
export function buildValidatedImportBodies(plan, materialId) {
  const validated = buildValidatedPlanTasksImportPayload(plan);
  if (!validated.success) {
    return validated;
  }

  return {
    success: true,
    bodies: validated.tasks.map((task) => ({ ...task, materialId })),
  };
}

/**
 * @param {PlanImportSummary} summary
 * @param {'tasks' | 'flashcards'} kind
 * @returns {string}
 */
export function formatPlanImportSummaryMessage(summary, kind) {
  const label = kind === 'tasks' ? 'study tasks' : 'saved flashcards';
  const parts = [`Imported ${summary.imported} ${label}.`];

  if (summary.skipped > 0) {
    parts.push(`Skipped ${summary.skipped} already imported.`);
  }
  if (summary.failed > 0) {
    parts.push(`${summary.failed} could not be imported.`);
  }

  return parts.join(' ');
}

/**
 * @param {number} total
 * @param {'tasks' | 'flashcards'} kind
 * @returns {string}
 */
export function buildPlanImportConfirmMessage(total, kind) {
  const label = kind === 'tasks' ? 'tasks' : 'flashcards';
  return `Import ${total} ${label} from this plan into your workspace? Items already imported from this plan will be skipped.`;
}

/**
 * @param {string} materialId
 * @param {ImportPlanTaskItem[]} tasks
 * @param {(materialId: string, body: { tasks: ImportPlanTaskItem[] }) => Promise<{ summary: PlanImportSummary }>} importPlanTasks
 * @returns {Promise<
 *   | { success: true, summary: PlanImportSummary }
 *   | { success: false, summary?: PlanImportSummary, error: unknown }
 * >}
 */
export async function importPlanTasksFromPlan(materialId, tasks, importPlanTasks) {
  try {
    const result = await importPlanTasks(materialId, { tasks });
    const summary = result.summary;
    if (summary.failed > 0 && summary.imported === 0 && summary.skipped === 0) {
      return { success: false, summary, error: new Error('Failed to import study tasks') };
    }
    return { success: true, summary };
  } catch (err) {
    return { success: false, error: err };
  }
}

/**
 * @deprecated Use importPlanTasksFromPlan with the material import API.
 */
export async function importPlanTasksSequentially(courseId, bodies, createTask, onProgress) {
  void courseId;
  void createTask;
  void onProgress;
  return {
    success: false,
    imported: 0,
    total: bodies.length,
    error: new Error('Sequential plan task import is no longer supported'),
  };
}
