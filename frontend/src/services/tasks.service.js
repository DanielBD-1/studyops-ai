import { apiFetch } from './api.js';
import { ApiRequestError } from './courses.service.js';
import { getSupabaseBrowser } from '../lib/supabase.js';

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
 *   createdAt: string,
 *   updatedAt: string,
 * }} StudyTask
 */

/**
 * @param {string} courseId
 */
export async function listCourseTasks(courseId) {
  const data = await request(`/api/courses/${courseId}/tasks`, { method: 'GET' });
  return /** @type {{ tasks: StudyTask[] }} */ (data);
}

/**
 * @param {string} courseId
 * @param {{ title: string, estimatedMinutes: number, description?: string, priority?: 'low' | 'medium' | 'high' }} body
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
