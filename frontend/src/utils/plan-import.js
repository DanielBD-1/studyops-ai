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
 *   materialId?: string,
 * }} CreateTaskBody
 */

/**
 * @param {StudyPlan['tasks'][number]} planTask
 * @param {string} materialId
 * @returns {CreateTaskBody}
 */
export function mapPlanTaskToCreateBody(planTask, materialId) {
  const title = typeof planTask.title === 'string' ? planTask.title.trim() : '';
  const description =
    typeof planTask.description === 'string' ? planTask.description.trim() : '';

  /** @type {CreateTaskBody} */
  const body = {
    title,
    estimatedMinutes: planTask.estimatedMinutes,
    materialId,
  };

  if (description !== '') {
    body.description = description;
  }

  if (VALID_PRIORITIES.has(planTask.priority)) {
    body.priority = /** @type {'low' | 'medium' | 'high'} */ (planTask.priority);
  }

  return body;
}

/**
 * @param {StudyPlan | null | undefined} plan
 * @param {string} materialId
 * @returns {{ success: true, bodies: CreateTaskBody[] } | { success: false, error: string }}
 */
export function buildValidatedImportBodies(plan, materialId) {
  if (!plan || !Array.isArray(plan.tasks) || plan.tasks.length === 0) {
    return { success: false, error: PLAN_IMPORT_VALIDATION_ERROR };
  }

  /** @type {CreateTaskBody[]} */
  const bodies = [];

  for (const planTask of plan.tasks) {
    const candidate = mapPlanTaskToCreateBody(planTask, materialId);
    const parsed = createTaskFormSchema.safeParse(candidate);
    if (!parsed.success) {
      return { success: false, error: PLAN_IMPORT_VALIDATION_ERROR };
    }

    /** @type {CreateTaskBody} */
    const body = {
      title: parsed.data.title,
      estimatedMinutes: parsed.data.estimatedMinutes,
      materialId: parsed.data.materialId,
    };
    if (parsed.data.description !== undefined) {
      body.description = parsed.data.description;
    }
    if (parsed.data.priority !== undefined) {
      body.priority = parsed.data.priority;
    }
    bodies.push(body);
  }

  return { success: true, bodies };
}

/**
 * @param {string} courseId
 * @param {CreateTaskBody[]} bodies
 * @param {(courseId: string, body: CreateTaskBody) => Promise<unknown>} createTask
 * @param {(current: number, total: number) => void} [onProgress]
 * @returns {Promise<
 *   | { success: true, imported: number }
 *   | { success: false, imported: number, total: number, error: unknown }
 * >}
 */
export async function importPlanTasksSequentially(
  courseId,
  bodies,
  createTask,
  onProgress
) {
  const total = bodies.length;
  let imported = 0;

  for (let index = 0; index < bodies.length; index += 1) {
    if (onProgress) {
      onProgress(index + 1, total);
    }

    try {
      await createTask(courseId, bodies[index]);
      imported += 1;
    } catch (err) {
      return { success: false, imported, total, error: err };
    }
  }

  return { success: true, imported };
}
