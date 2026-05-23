import { getSupabaseAdmin } from '../../config/supabase.js';
import { ApiError } from '../../shared/errors/ApiError.js';
import { assertCourseOwned } from '../study-materials/study-materials.service.js';

const TASK_COLUMNS =
  'id, course_id, material_id, title, description, priority, estimated_minutes, difficulty, tags, status, source, created_at, updated_at';

const MATERIAL_OWNERSHIP_SELECT = 'id, course_id, courses!inner(id)';

const TITLE_VALIDATION_MESSAGE = 'Task title must be between 3 and 200 characters';
const DESCRIPTION_VALIDATION_MESSAGE = 'Task description must be at most 1000 characters';
const PRIORITY_VALIDATION_MESSAGE = 'Priority must be low, medium, or high';
const MINUTES_VALIDATION_MESSAGE = 'Estimated minutes must be between 5 and 480';
const TASK_DATA_VALIDATION_MESSAGE = 'Invalid study task data';

const TASK_CHECK_CONSTRAINTS = {
  study_tasks_title_length: TITLE_VALIDATION_MESSAGE,
  study_tasks_description_length: DESCRIPTION_VALIDATION_MESSAGE,
  study_tasks_priority_allowed: PRIORITY_VALIDATION_MESSAGE,
  study_tasks_estimated_minutes_range: MINUTES_VALIDATION_MESSAGE,
  study_tasks_difficulty_allowed: 'Invalid task difficulty',
  study_tasks_tags_cardinality: 'Task tags must contain at most 5 items',
  study_tasks_status_allowed: 'Invalid task status',
  study_tasks_source_allowed: 'Invalid task source',
};

/**
 * @param {{ message?: string, details?: string } | null | undefined} error
 * @returns {string}
 */
export function taskCheckValidationMessageFromError(error) {
  const haystack = `${error?.message ?? ''} ${error?.details ?? ''}`.toLowerCase();

  for (const [constraint, message] of Object.entries(TASK_CHECK_CONSTRAINTS)) {
    if (haystack.includes(constraint)) {
      return message;
    }
  }

  return TASK_DATA_VALIDATION_MESSAGE;
}

/**
 * @param {{ code?: string, message?: string, details?: string } | null} error
 */
function handleTaskError(error) {
  if (!error) return;

  if (error.code === 'PGRST116') {
    throw new ApiError('NOT_FOUND', 'Task not found', 404);
  }

  if (error.code === '23514') {
    throw new ApiError('VALIDATION_ERROR', taskCheckValidationMessageFromError(error), 400);
  }

  throw new ApiError('DATABASE_ERROR', 'Failed to access study task', 500);
}

/**
 * @param {{
 *   id: string,
 *   course_id: string,
 *   material_id: string | null,
 *   title: string,
 *   description: string,
 *   priority: string,
 *   estimated_minutes: number,
 *   difficulty: string,
 *   tags: string[],
 *   status: string,
 *   source: string,
 *   created_at: string,
 *   updated_at: string,
 * }} row
 */
export function mapTask(row) {
  return {
    id: row.id,
    courseId: row.course_id,
    materialId: row.material_id,
    title: row.title,
    description: row.description,
    priority: row.priority,
    estimatedMinutes: row.estimated_minutes,
    difficulty: row.difficulty,
    tags: row.tags ?? [],
    status: row.status,
    source: row.source,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * @param {string} userId
 * @param {string} courseId
 * @param {string} materialId
 */
export async function assertMaterialBelongsToOwnedCourse(userId, courseId, materialId) {
  await assertCourseOwned(userId, courseId);

  const { data, error } = await getSupabaseAdmin()
    .from('study_materials')
    .select(MATERIAL_OWNERSHIP_SELECT)
    .eq('id', materialId)
    .eq('course_id', courseId)
    .eq('courses.user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new ApiError('NOT_FOUND', 'Study material not found', 404);
    }
    throw new ApiError('DATABASE_ERROR', 'Failed to access study material', 500);
  }

  if (!data) {
    throw new ApiError('NOT_FOUND', 'Study material not found', 404);
  }
}

/**
 * @param {string} userId
 * @param {string} taskId
 */
export async function getOwnedTaskOrThrow(userId, taskId) {
  const { data, error } = await getSupabaseAdmin()
    .from('study_tasks')
    .select(TASK_COLUMNS)
    .eq('id', taskId)
    .eq('user_id', userId)
    .single();

  if (error) {
    handleTaskError(error);
  }

  if (!data) {
    throw new ApiError('NOT_FOUND', 'Task not found', 404);
  }

  return mapTask(data);
}

/**
 * @param {string} userId
 * @param {string} courseId
 * @param {{ status?: 'pending' | 'completed' }} [query]
 */
export async function listTasksByCourse(userId, courseId, query = {}) {
  await assertCourseOwned(userId, courseId);

  let builder = getSupabaseAdmin()
    .from('study_tasks')
    .select(TASK_COLUMNS)
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .order('created_at', { ascending: false });

  if (query.status) {
    builder = builder.eq('status', query.status);
  }

  const { data, error } = await builder;

  if (error) {
    throw new ApiError('DATABASE_ERROR', 'Failed to list study tasks', 500);
  }

  return (data ?? []).map(mapTask);
}

/**
 * @param {string} userId
 * @param {{ courseId?: string, status?: 'pending' | 'completed' }} [query]
 */
export async function listTasks(userId, query = {}) {
  if (query.courseId) {
    await assertCourseOwned(userId, query.courseId);
  }

  let builder = getSupabaseAdmin()
    .from('study_tasks')
    .select(TASK_COLUMNS)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (query.courseId) {
    builder = builder.eq('course_id', query.courseId);
  }

  if (query.status) {
    builder = builder.eq('status', query.status);
  }

  const { data, error } = await builder;

  if (error) {
    throw new ApiError('DATABASE_ERROR', 'Failed to list study tasks', 500);
  }

  return (data ?? []).map(mapTask);
}

/**
 * @param {string} userId
 * @param {string} courseId
 * @param {{
 *   title: string,
 *   description?: string,
 *   priority?: 'low' | 'medium' | 'high',
 *   estimatedMinutes: number,
 *   materialId?: string,
 * }} input
 */
export async function createTask(userId, courseId, input) {
  await assertCourseOwned(userId, courseId);

  if (input.materialId) {
    await assertMaterialBelongsToOwnedCourse(userId, courseId, input.materialId);
  }

  const { data, error } = await getSupabaseAdmin()
    .from('study_tasks')
    .insert({
      user_id: userId,
      course_id: courseId,
      material_id: input.materialId ?? null,
      title: input.title,
      description: input.description ?? '',
      priority: input.priority ?? 'medium',
      estimated_minutes: input.estimatedMinutes,
      difficulty: 'medium',
      tags: [],
      source: 'manual',
      status: 'pending',
    })
    .select(TASK_COLUMNS)
    .single();

  if (error) {
    handleTaskError(error);
  }

  return mapTask(data);
}

/**
 * @param {string} userId
 * @param {string} taskId
 * @param {{
 *   title?: string,
 *   description?: string,
 *   priority?: 'low' | 'medium' | 'high',
 *   estimatedMinutes?: number,
 *   materialId?: string | null,
 * }} input
 */
export async function updateTask(userId, taskId, input) {
  const existing = await getOwnedTaskOrThrow(userId, taskId);

  /** @type {Record<string, unknown>} */
  const patch = {};

  if (input.title !== undefined) {
    patch.title = input.title;
  }
  if (input.description !== undefined) {
    patch.description = input.description;
  }
  if (input.priority !== undefined) {
    patch.priority = input.priority;
  }
  if (input.estimatedMinutes !== undefined) {
    patch.estimated_minutes = input.estimatedMinutes;
  }
  if (input.materialId !== undefined) {
    if (input.materialId === null) {
      patch.material_id = null;
    } else {
      await assertMaterialBelongsToOwnedCourse(userId, existing.courseId, input.materialId);
      patch.material_id = input.materialId;
    }
  }

  const { data, error } = await getSupabaseAdmin()
    .from('study_tasks')
    .update(patch)
    .eq('id', taskId)
    .eq('user_id', userId)
    .select(TASK_COLUMNS)
    .single();

  if (error) {
    handleTaskError(error);
  }

  return mapTask(data);
}

/**
 * @param {string} userId
 * @param {string} taskId
 */
export async function completeTask(userId, taskId) {
  const existing = await getOwnedTaskOrThrow(userId, taskId);

  if (existing.status === 'completed') {
    return existing;
  }

  const { data, error } = await getSupabaseAdmin()
    .from('study_tasks')
    .update({ status: 'completed' })
    .eq('id', taskId)
    .eq('user_id', userId)
    .select(TASK_COLUMNS)
    .single();

  if (error) {
    handleTaskError(error);
  }

  return mapTask(data);
}

/**
 * @param {string} userId
 * @param {string} taskId
 */
export async function deleteTask(userId, taskId) {
  const { data, error } = await getSupabaseAdmin()
    .from('study_tasks')
    .delete()
    .eq('id', taskId)
    .eq('user_id', userId)
    .select('id')
    .single();

  if (error) {
    handleTaskError(error);
  }

  if (!data) {
    throw new ApiError('NOT_FOUND', 'Task not found', 404);
  }

  return { deleted: true };
}
