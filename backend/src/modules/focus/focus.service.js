import { getSupabaseAdmin } from '../../config/supabase.js';
import { ApiError } from '../../shared/errors/ApiError.js';
import { completeTask } from '../tasks/tasks.service.js';

const FOCUS_TASK_COLUMNS = 'id, course_id, status';
const FOCUS_SESSION_COLUMNS =
  'id, user_id, course_id, task_id, duration_minutes, completed_task, started_at, ended_at';

const FOCUS_DATA_VALIDATION_MESSAGE = 'Invalid focus session data';

const FOCUS_CHECK_CONSTRAINTS = {
  focus_sessions_duration_minutes_range: 'Duration minutes must be between 1 and 120',
  focus_sessions_ended_at_after_started: 'Session end time must be after start time',
};

/**
 * @param {{ message?: string, details?: string } | null | undefined} error
 * @returns {string}
 */
function focusCheckValidationMessageFromError(error) {
  const haystack = `${error?.message ?? ''} ${error?.details ?? ''}`.toLowerCase();

  for (const [constraint, message] of Object.entries(FOCUS_CHECK_CONSTRAINTS)) {
    if (haystack.includes(constraint)) {
      return message;
    }
  }

  return FOCUS_DATA_VALIDATION_MESSAGE;
}

/**
 * @param {{ code?: string, message?: string, details?: string } | null} error
 */
function handleFocusSessionError(error) {
  if (!error) return;

  if (error.code === 'PGRST116') {
    throw new ApiError('NOT_FOUND', 'Focus session not found', 404);
  }

  if (error.code === '23514') {
    throw new ApiError('VALIDATION_ERROR', focusCheckValidationMessageFromError(error), 400);
  }

  throw new ApiError('DATABASE_ERROR', 'Failed to access focus session', 500);
}

/**
 * @param {Date} startedAt
 * @param {Date} endedAt
 * @param {number} sessionCeiling
 * @returns {number}
 */
export function calculateActualFocusMinutes(startedAt, endedAt, sessionCeiling) {
  const elapsedMs = endedAt.getTime() - startedAt.getTime();
  const elapsedMinutes = Math.floor(elapsedMs / 60_000);
  const cappedCeiling = Math.min(120, sessionCeiling);
  return Math.max(1, Math.min(cappedCeiling, elapsedMinutes));
}

/**
 * @param {{
 *   id: string,
 *   user_id: string,
 *   course_id: string,
 *   task_id: string,
 *   duration_minutes: number,
 *   completed_task: boolean,
 *   started_at: string,
 *   ended_at: string | null,
 * }} row
 */
export function mapFocusSession(row) {
  return {
    id: row.id,
    userId: row.user_id,
    courseId: row.course_id,
    taskId: row.task_id,
    durationMinutes: row.duration_minutes,
    completedTask: row.completed_task,
    startedAt: row.started_at,
    endedAt: row.ended_at,
  };
}

/**
 * @param {string} userId
 * @param {string} taskId
 */
async function getOwnedPendingTaskForFocus(userId, taskId) {
  const { data, error } = await getSupabaseAdmin()
    .from('study_tasks')
    .select(FOCUS_TASK_COLUMNS)
    .eq('id', taskId)
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new ApiError('NOT_FOUND', 'Task not found', 404);
    }
    throw new ApiError('DATABASE_ERROR', 'Failed to access study task', 500);
  }

  if (!data) {
    throw new ApiError('NOT_FOUND', 'Task not found', 404);
  }

  if (data.status === 'completed') {
    throw new ApiError(
      'VALIDATION_ERROR',
      'Cannot start focus on a completed task',
      400
    );
  }

  return {
    id: data.id,
    courseId: data.course_id,
  };
}

/**
 * @param {string} userId
 * @param {string} sessionId
 */
async function getOwnedFocusSessionOrThrow(userId, sessionId) {
  const { data, error } = await getSupabaseAdmin()
    .from('focus_sessions')
    .select(FOCUS_SESSION_COLUMNS)
    .eq('id', sessionId)
    .eq('user_id', userId)
    .single();

  if (error) {
    handleFocusSessionError(error);
  }

  if (!data) {
    throw new ApiError('NOT_FOUND', 'Focus session not found', 404);
  }

  return data;
}

/**
 * @param {string} userId
 * @param {{ taskId: string, durationMinutes: number }} input
 */
export async function startFocusSession(userId, input) {
  const task = await getOwnedPendingTaskForFocus(userId, input.taskId);

  const { data, error } = await getSupabaseAdmin()
    .from('focus_sessions')
    .insert({
      user_id: userId,
      course_id: task.courseId,
      task_id: task.id,
      duration_minutes: input.durationMinutes,
      completed_task: false,
    })
    .select(FOCUS_SESSION_COLUMNS)
    .single();

  if (error) {
    handleFocusSessionError(error);
  }

  return mapFocusSession(data);
}

/**
 * @param {string} userId
 * @param {string} sessionId
 * @param {{ completedTask: boolean }} input
 */
export async function completeFocusSession(userId, sessionId, input) {
  const existing = await getOwnedFocusSessionOrThrow(userId, sessionId);

  if (existing.ended_at !== null) {
    throw new ApiError('CONFLICT', 'Focus session already completed', 409);
  }

  const sessionCeiling = existing.duration_minutes;
  const endedAt = new Date();
  const startedAt = new Date(existing.started_at);
  const actualMinutes = calculateActualFocusMinutes(startedAt, endedAt, sessionCeiling);

  const { data, error } = await getSupabaseAdmin()
    .from('focus_sessions')
    .update({
      ended_at: endedAt.toISOString(),
      duration_minutes: actualMinutes,
      completed_task: input.completedTask,
    })
    .eq('id', sessionId)
    .eq('user_id', userId)
    .select(FOCUS_SESSION_COLUMNS)
    .single();

  if (error) {
    handleFocusSessionError(error);
  }

  const session = mapFocusSession(data);

  if (!input.completedTask) {
    return { session };
  }

  const task = await completeTask(userId, existing.task_id);
  return { session, task };
}
