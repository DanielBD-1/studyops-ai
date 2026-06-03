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
 * @typedef {{
 *   connected: true,
 *   trelloMemberId: string,
 *   trelloUsername: string,
 *   scopes: string,
 *   expirationPolicy: string,
 *   expiresAt: string | null,
 *   defaultBoardId: string | null,
 *   defaultListId: string | null,
 *   connectedAt: string,
 *   updatedAt: string,
 * }} TrelloConnectionConnected
 */

/**
 * @typedef {{ connected: false }} TrelloConnectionDisconnected
 */

/**
 * @typedef {TrelloConnectionConnected | TrelloConnectionDisconnected} TrelloConnectionStatus
 */

/**
 * @returns {Promise<TrelloConnectionStatus>}
 */
export async function fetchTrelloConnection() {
  const data = await request('/api/trello/connection');
  return /** @type {TrelloConnectionStatus} */ (data);
}

/**
 * @returns {Promise<{ authorizeUrl: string }>}
 */
export async function fetchTrelloAuthorizeUrl() {
  const data = await request('/api/trello/authorize-url');
  return /** @type {{ authorizeUrl: string }} */ (data);
}

/**
 * @param {{ token: string, state: string }} body
 * @returns {Promise<TrelloConnectionConnected>}
 */
export async function completeTrelloConnection(body) {
  const data = await request('/api/trello/connect/complete', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return /** @type {TrelloConnectionConnected} */ (data);
}

/**
 * @returns {Promise<TrelloConnectionDisconnected>}
 */
export async function disconnectTrello() {
  const data = await request('/api/trello/disconnect', {
    method: 'POST',
    body: JSON.stringify({}),
  });
  return /** @type {TrelloConnectionDisconnected} */ (data);
}

/**
 * @param {{ apiKey?: string, token?: string }} [credentials]
 * @returns {Promise<{ boards: TrelloNamedItem[] }>}
 */
export async function fetchTrelloBoards(credentials) {
  const body =
    credentials?.apiKey != null && credentials?.token != null
      ? { apiKey: credentials.apiKey, token: credentials.token }
      : {};
  const data = await request('/api/trello/boards', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return /** @type {{ boards: TrelloNamedItem[] }} */ (data);
}

/**
 * @param {{ boardId: string, apiKey?: string, token?: string }} params
 * @returns {Promise<{ lists: TrelloNamedItem[] }>}
 */
export async function fetchTrelloBoardLists({ apiKey, token, boardId }) {
  const body =
    apiKey != null && token != null ? { apiKey, token } : {};
  const data = await request(`/api/trello/boards/${encodeURIComponent(boardId)}/lists`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return /** @type {{ lists: TrelloNamedItem[] }} */ (data);
}

/**
 * @param {{
 *   listId: string,
 *   taskIds: string[],
 *   apiKey?: string,
 *   token?: string,
 * }} params
 * @returns {Promise<{ results: TrelloSyncResult[], summary: TrelloSyncSummary }>}
 */
export async function syncTasksToTrello({ apiKey, token, listId, taskIds }) {
  const body =
    apiKey != null && token != null
      ? { apiKey, token, listId, taskIds }
      : { listId, taskIds };
  const data = await request('/api/trello/sync', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return /** @type {{ results: TrelloSyncResult[], summary: TrelloSyncSummary }} */ (data);
}
