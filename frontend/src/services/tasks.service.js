import { apiFetch } from './api.js';
import { ApiRequestError } from './courses.service.js';
import { getSupabaseBrowser } from '../lib/supabase.js';
import { getLocalTodayIsoCalendarDate } from '../utils/task-due-date.js';

export { ApiRequestError };

/** @type {typeof apiFetch | null} */
let apiFetchOverride = null;

/** @type {string | null} */
let accessTokenOverride = null;

/**
 * @param {typeof apiFetch | null} fn
 */
export function __setApiFetchForTests(fn) {
  apiFetchOverride = fn;
}

/**
 * @param {string | null} token
 */
export function __setAccessTokenForTests(token) {
  accessTokenOverride = token;
}

/**
 * @returns {Promise<string>}
 */
async function getAccessToken() {
  if (accessTokenOverride) {
    return accessTokenOverride;
  }

  const { data: { session } } = await getSupabaseBrowser().auth.getSession();
  if (!session?.access_token) {
    throw new ApiRequestError('AUTH_REQUIRED', 'Authentication required');
  }
  return session.access_token;
}

/**
 * @param {import('./api.js').ApiSuccess<unknown> | import('./api.js').ApiFailure} result
 */
function assertSuccess(result) {
  if (!result.success) {
    throw new ApiRequestError(result.error.code, result.error.message);
  }
  return result.data;
}

/**
 * @param {string} path
 * @param {RequestInit} [init]
 */
async function request(path, init = {}) {
  const token = await getAccessToken();
  const fetcher = apiFetchOverride ?? apiFetch;
  const result = await fetcher(path, init, token);
  return assertSuccess(result);
}

/**
 * @typedef {{
 *   id: string,
 *   courseId: string,
 *   materialId: string | null,
 *   title: string,
 *   description: string,
 *   priority: 'low' | 'medium' | 'high',
 *   estimatedMinutes: number,
 *   difficulty: string,
 *   tags: string[],
 *   status: 'pending' | 'completed',
 *   source: string,
 *   dueDate: string | null,
 *   createdAt: string,
 *   updatedAt: string,
 * }} StudyTask
 */

/**
 * @param {{
 *   status?: 'pending' | 'completed',
 *   deadline?: 'overdue' | 'due_today' | 'next_7_days',
 *   referenceDate?: string,
 * }} [filters]
 * @returns {URLSearchParams}
 */
function buildTaskListQueryParams(filters = {}) {
  const params = new URLSearchParams();
  const hasDeadline =
    filters.deadline === 'overdue' ||
    filters.deadline === 'due_today' ||
    filters.deadline === 'next_7_days';

  if (hasDeadline) {
    params.set('deadline', filters.deadline);
    params.set('referenceDate', filters.referenceDate ?? getLocalTodayIsoCalendarDate());
    params.set('status', 'pending');
  } else if (filters.status === 'pending' || filters.status === 'completed') {
    params.set('status', filters.status);
  }

  return params;
}

/**
 * @param {string} courseId
 * @param {{
 *   status?: 'pending' | 'completed',
 *   deadline?: 'overdue' | 'due_today' | 'next_7_days',
 * }} [filters]
 */
export async function listCourseTasks(courseId, filters = {}) {
  const params = buildTaskListQueryParams(filters);
  const query = params.toString();
  const path = query
    ? `/api/courses/${courseId}/tasks?${query}`
    : `/api/courses/${courseId}/tasks`;
  const data = await request(path, { method: 'GET' });
  return /** @type {{ tasks: StudyTask[] }} */ (data);
}

/**
 * @param {{
 *   courseId?: string,
 *   status?: 'pending' | 'completed',
 *   deadline?: 'overdue' | 'due_today' | 'next_7_days',
 * }} [filters]
 */
export async function listAllTasks(filters = {}) {
  const params = new URLSearchParams();
  if (filters.courseId) {
    params.set('courseId', filters.courseId);
  }
  const filterParams = buildTaskListQueryParams(filters);
  for (const [key, value] of filterParams.entries()) {
    params.set(key, value);
  }
  const query = params.toString();
  const path = query ? `/api/tasks?${query}` : '/api/tasks';
  const data = await request(path, { method: 'GET' });
  return /** @type {{ tasks: StudyTask[] }} */ (data);
}

/**
 * @param {string} courseId
 * @param {{
 *   title: string,
 *   estimatedMinutes: number,
 *   description?: string,
 *   priority?: 'low' | 'medium' | 'high',
 *   materialId?: string | null,
 *   dueDate?: string | null
 * }} body
 */
export async function createCourseTask(courseId, body) {
  const data = await request(`/api/courses/${courseId}/tasks`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return /** @type {{ task: StudyTask }} */ (data);
}

/**
 * @param {string} taskId
 * @param {{
 *   title: string,
 *   estimatedMinutes: number,
 *   description?: string,
 *   priority?: 'low' | 'medium' | 'high',
 *   materialId?: string | null,
 *   dueDate?: string | null
 * }} body
 */
export async function updateTask(taskId, body) {
  const data = await request(`/api/tasks/${taskId}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
  return /** @type {{ task: StudyTask }} */ (data);
}

/**
 * @param {string} taskId
 */
export async function completeTask(taskId) {
  const data = await request(`/api/tasks/${taskId}/complete`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
  return /** @type {{ task: StudyTask }} */ (data);
}

/**
 * @param {string} taskId
 */
export async function deleteTask(taskId) {
  const data = await request(`/api/tasks/${taskId}`, { method: 'DELETE' });
  return /** @type {{ deleted: boolean }} */ (data);
}
