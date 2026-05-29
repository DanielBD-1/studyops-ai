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
 * @typedef {'success' | 'failed' | 'skipped'} TrelloSyncResultStatus
 */

/**
 * @typedef {{
 *   taskId: string,
 *   status: TrelloSyncResultStatus,
 *   trelloCardId: string | null,
 *   error: string | null,
 * }} TrelloSyncResult
 */

/**
 * @typedef {{
 *   total: number,
 *   success: number,
 *   skipped: number,
 *   failed: number,
 * }} TrelloSyncSummary
 */

/**
 * @typedef {{ id: string, name: string }} TrelloNamedItem
 */

/**
 * @param {{ apiKey: string, token: string }} body
 * @returns {Promise<{ boards: TrelloNamedItem[] }>}
 */
export async function fetchTrelloBoards(body) {
  const data = await request('/api/trello/boards', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return /** @type {{ boards: TrelloNamedItem[] }} */ (data);
}

/**
 * @param {{ apiKey: string, token: string, boardId: string }} body
 * @returns {Promise<{ lists: TrelloNamedItem[] }>}
 */
export async function fetchTrelloBoardLists({ apiKey, token, boardId }) {
  const data = await request(`/api/trello/boards/${encodeURIComponent(boardId)}/lists`, {
    method: 'POST',
    body: JSON.stringify({ apiKey, token }),
  });
  return /** @type {{ lists: TrelloNamedItem[] }} */ (data);
}

/**
 * @param {{
 *   apiKey: string,
 *   token: string,
 *   listId: string,
 *   taskIds: string[],
 * }} body
 * @returns {Promise<{ results: TrelloSyncResult[], summary: TrelloSyncSummary }>}
 */
export async function syncTasksToTrello(body) {
  const data = await request('/api/trello/sync', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return /** @type {{ results: TrelloSyncResult[], summary: TrelloSyncSummary }} */ (data);
}
