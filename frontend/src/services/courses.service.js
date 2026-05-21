import { apiFetch } from './api.js';
import { getSupabaseBrowser } from '../lib/supabase.js';

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

export class ApiRequestError extends Error {
  /**
   * @param {string} code
   * @param {string} message
   */
  constructor(code, message) {
    super(message);
    this.name = 'ApiRequestError';
    this.code = code;
  }
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
 * @typedef {{ id: string, title: string, createdAt: string, updatedAt: string }} Course
 */

export async function listCourses() {
  const data = await request('/api/courses', { method: 'GET' });
  return /** @type {{ courses: Course[] }} */ (data);
}

/**
 * @param {{ title: string }} body
 */
export async function createCourse(body) {
  const data = await request('/api/courses', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return /** @type {{ course: Course }} */ (data);
}

/**
 * @param {string} id
 */
export async function getCourse(id) {
  const data = await request(`/api/courses/${id}`, { method: 'GET' });
  return /** @type {{ course: Course, stats: { totalTasks: number, completedTasks: number, totalFlashcards: number } }} */ (data);
}

/**
 * @param {string} id
 * @param {{ title: string }} body
 */
export async function updateCourse(id, body) {
  const data = await request(`/api/courses/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
  return /** @type {{ course: Course }} */ (data);
}

/**
 * @param {string} id
 */
export async function deleteCourse(id) {
  const data = await request(`/api/courses/${id}`, { method: 'DELETE' });
  return /** @type {{ deleted: boolean }} */ (data);
}
