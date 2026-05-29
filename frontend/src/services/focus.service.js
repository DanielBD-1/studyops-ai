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
 *   userId: string,
 *   courseId: string,
 *   taskId: string,
 *   durationMinutes: number,
 *   completedTask: boolean,
 *   startedAt: string,
 *   endedAt: string | null,
 * }} FocusSession
 */

/**
 * @param {string} taskId
 * @param {number} [durationMinutes]
 * @returns {Promise<{ session: FocusSession }>}
 */
export async function startFocusSession(taskId, durationMinutes = 25) {
  const data = await request('/api/focus', {
    method: 'POST',
    body: JSON.stringify({ taskId, durationMinutes }),
  });
  return /** @type {{ session: FocusSession }} */ (data);
}

/**
 * @param {string} sessionId
 * @param {boolean} completedTask
 * @returns {Promise<{ session: FocusSession, task?: import('./tasks.service.js').StudyTask }>}
 */
export async function completeFocusSession(sessionId, completedTask) {
  const data = await request(`/api/focus/${sessionId}/complete`, {
    method: 'POST',
    body: JSON.stringify({ completedTask }),
  });
  return /** @type {{ session: FocusSession, task?: import('./tasks.service.js').StudyTask }} */ (
    data
  );
}
