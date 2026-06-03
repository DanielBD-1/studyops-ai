const TRELLO_API_BASE = 'https://api.trello.com/1';
const TRELLO_TIMEOUT_MS = 15_000;
const TRELLO_DISCOVERY_FIELDS = 'id,name,closed';
const MAX_DISCOVERY_ITEMS = 500;

/** @type {typeof fetch | null} */
let fetchFnOverride = null;

/**
 * @param {typeof fetch | null} fn
 */
export function setTrelloFetchForTests(fn) {
  fetchFnOverride = fn;
}

/**
 * @typedef {'card' | 'boards' | 'lists' | 'member'} TrelloClientContext
 */

/**
 * @param {'TRELLO_AUTH' | 'TRELLO_LIST_NOT_FOUND' | 'TRELLO_BOARD_NOT_FOUND' | 'TRELLO_RATE_LIMIT' | 'TRELLO_TIMEOUT' | 'TRELLO_ERROR'} code
 * @param {TrelloClientContext} [context]
 * @returns {string}
 */
export function trelloClientErrorMessage(code, context = 'card') {
  switch (code) {
    case 'TRELLO_AUTH':
      return 'Trello authentication failed';
    case 'TRELLO_LIST_NOT_FOUND':
      return 'Trello list not found';
    case 'TRELLO_BOARD_NOT_FOUND':
      return 'Trello board not found';
    case 'TRELLO_RATE_LIMIT':
      return 'Trello rate limit reached';
    case 'TRELLO_TIMEOUT':
      if (context === 'boards') return 'Failed to load Trello boards';
      if (context === 'lists') return 'Failed to load Trello lists';
      if (context === 'member') return 'Failed to validate Trello connection';
      return 'Failed to create Trello card';
    default:
      if (context === 'boards') return 'Failed to load Trello boards';
      if (context === 'lists') return 'Failed to load Trello lists';
      if (context === 'member') return 'Failed to validate Trello connection';
      return 'Failed to create Trello card';
  }
}

/**
 * @param {number} status
 * @param {'TRELLO_LIST_NOT_FOUND' | 'TRELLO_BOARD_NOT_FOUND'} [notFoundCode]
 * @returns {'TRELLO_AUTH' | 'TRELLO_LIST_NOT_FOUND' | 'TRELLO_BOARD_NOT_FOUND' | 'TRELLO_RATE_LIMIT' | 'TRELLO_ERROR'}
 */
function mapHttpStatusToCode(status, notFoundCode = 'TRELLO_LIST_NOT_FOUND') {
  if (status === 401) return 'TRELLO_AUTH';
  if (status === 404) return notFoundCode;
  if (status === 429) return 'TRELLO_RATE_LIMIT';
  return 'TRELLO_ERROR';
}

/**
 * @param {string} path
 * @param {string} apiKey
 * @param {string} token
 * @param {Record<string, string>} [extraQuery]
 * @returns {string}
 */
function buildAuthenticatedUrl(path, apiKey, token, extraQuery = {}) {
  const url = new URL(`${TRELLO_API_BASE}${path}`);
  url.searchParams.set('key', apiKey);
  url.searchParams.set('token', token);
  for (const [key, value] of Object.entries(extraQuery)) {
    url.searchParams.set(key, value);
  }
  return url.toString();
}

/**
 * @param {string} event
 * @param {number} durationMs
 * @param {Record<string, unknown>} [extra]
 */
function logTrelloClientEvent(event, durationMs, extra = {}) {
  console.log(
    JSON.stringify({
      service: 'backend',
      component: 'trello-client',
      event,
      durationMs,
      ...extra,
    })
  );
}

/**
 * @param {unknown} payload
 * @returns {{ ok: true, items: Array<{ id: string, name: string }> } | { ok: false, code: 'TRELLO_ERROR' }}
 */
function sanitizeNamedDiscoveryRows(payload) {
  if (!Array.isArray(payload)) {
    return { ok: false, code: 'TRELLO_ERROR' };
  }

  /** @type {Array<{ id: string, name: string }>} */
  const items = [];
  for (const row of payload) {
    if (!row || typeof row !== 'object') continue;
    if (/** @type {{ closed?: boolean }} */ (row).closed === true) continue;
    const id = typeof row.id === 'string' ? row.id : '';
    const name = typeof row.name === 'string' ? row.name.trim() : '';
    if (!id || !name) continue;
    items.push({ id, name });
  }

  items.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));

  if (items.length > MAX_DISCOVERY_ITEMS) {
    items.length = MAX_DISCOVERY_ITEMS;
  }

  return { ok: true, items };
}

/**
 * @param {{
 *   apiKey: string,
 *   token: string,
 *   path: string,
 *   query?: Record<string, string>,
 *   notFoundCode?: 'TRELLO_LIST_NOT_FOUND' | 'TRELLO_BOARD_NOT_FOUND',
 *   successEvent: string,
 *   invalidResponseEvent: string,
 * }} options
 * @returns {Promise<
 *   | { ok: true, items: Array<{ id: string, name: string }> }
 *   | { ok: false, code: 'TRELLO_AUTH' | 'TRELLO_LIST_NOT_FOUND' | 'TRELLO_BOARD_NOT_FOUND' | 'TRELLO_RATE_LIMIT' | 'TRELLO_TIMEOUT' | 'TRELLO_ERROR' }
 * >}
 */
async function fetchTrelloDiscovery({
  apiKey,
  token,
  path,
  query = {},
  notFoundCode = 'TRELLO_LIST_NOT_FOUND',
  successEvent,
  invalidResponseEvent,
}) {
  const fetchFn = fetchFnOverride ?? fetch;
  const startedAt = Date.now();

  let response;
  try {
    response = await fetchFn(buildAuthenticatedUrl(path, apiKey, token, query), {
      method: 'GET',
      signal: AbortSignal.timeout(TRELLO_TIMEOUT_MS),
    });
  } catch (err) {
    const durationMs = Date.now() - startedAt;
    const isTimeout =
      err &&
      typeof err === 'object' &&
      'name' in err &&
      /** @type {{ name?: string }} */ (err).name === 'TimeoutError';

    logTrelloClientEvent(isTimeout ? 'trello_timeout' : 'trello_network_error', durationMs);

    return { ok: false, code: isTimeout ? 'TRELLO_TIMEOUT' : 'TRELLO_ERROR' };
  }

  const durationMs = Date.now() - startedAt;
  const httpStatus = response.status;

  if (response.ok) {
    let payload;
    try {
      payload = await response.json();
    } catch {
      logTrelloClientEvent(invalidResponseEvent, durationMs, { httpStatus });
      return { ok: false, code: 'TRELLO_ERROR' };
    }

    const sanitized = sanitizeNamedDiscoveryRows(payload);
    if (!sanitized.ok) {
      logTrelloClientEvent(invalidResponseEvent, durationMs, { httpStatus });
      return { ok: false, code: 'TRELLO_ERROR' };
    }

    logTrelloClientEvent(successEvent, durationMs, {
      httpStatus,
      count: sanitized.items.length,
    });

    return { ok: true, items: sanitized.items };
  }

  const code = mapHttpStatusToCode(httpStatus, notFoundCode);

  logTrelloClientEvent('trello_api_error', durationMs, {
    httpStatus,
    trelloErrorCode: code,
  });

  return { ok: false, code };
}

/**
 * @param {string} apiKey
 * @param {string} token
 * @param {string} listId
 * @returns {string}
 */
function buildCardsUrl(apiKey, token) {
  return buildAuthenticatedUrl('/cards', apiKey, token);
}

/**
 * @param {string} apiKey
 * @param {string} token
 * @param {string} listId
 * @param {string} name
 * @param {string} desc
 * @returns {Promise<
 *   | { ok: true, cardId: string }
 *   | { ok: false, code: 'TRELLO_AUTH' | 'TRELLO_LIST_NOT_FOUND' | 'TRELLO_RATE_LIMIT' | 'TRELLO_TIMEOUT' | 'TRELLO_ERROR' }
 * >}
 */
export async function createCard({ apiKey, token, listId, name, desc }) {
  const fetchFn = fetchFnOverride ?? fetch;
  const startedAt = Date.now();

  let response;
  try {
    response = await fetchFn(buildCardsUrl(apiKey, token), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, desc, idList: listId }),
      signal: AbortSignal.timeout(TRELLO_TIMEOUT_MS),
    });
  } catch (err) {
    const durationMs = Date.now() - startedAt;
    const isTimeout =
      err &&
      typeof err === 'object' &&
      'name' in err &&
      /** @type {{ name?: string }} */ (err).name === 'TimeoutError';

    logTrelloClientEvent(isTimeout ? 'trello_timeout' : 'trello_network_error', durationMs);

    return { ok: false, code: isTimeout ? 'TRELLO_TIMEOUT' : 'TRELLO_ERROR' };
  }

  const durationMs = Date.now() - startedAt;
  const httpStatus = response.status;

  if (response.ok) {
    let payload;
    try {
      payload = await response.json();
    } catch {
      logTrelloClientEvent('trello_invalid_response', durationMs, { httpStatus });
      return { ok: false, code: 'TRELLO_ERROR' };
    }

    if (!payload || typeof payload !== 'object' || typeof payload.id !== 'string') {
      logTrelloClientEvent('trello_missing_card_id', durationMs, { httpStatus });
      return { ok: false, code: 'TRELLO_ERROR' };
    }

    logTrelloClientEvent('trello_card_created', durationMs, { httpStatus });

    return { ok: true, cardId: payload.id };
  }

  const code = mapHttpStatusToCode(httpStatus, 'TRELLO_LIST_NOT_FOUND');

  logTrelloClientEvent('trello_api_error', durationMs, {
    httpStatus,
    trelloErrorCode: code,
  });

  return { ok: false, code };
}

/**
 * @param {{ apiKey: string, token: string }} credentials
 * @returns {Promise<
 *   | { ok: true, boards: Array<{ id: string, name: string }> }
 *   | { ok: false, code: 'TRELLO_AUTH' | 'TRELLO_RATE_LIMIT' | 'TRELLO_TIMEOUT' | 'TRELLO_ERROR' }
 * >}
 */
export async function getBoards({ apiKey, token }) {
  const result = await fetchTrelloDiscovery({
    apiKey,
    token,
    path: '/members/me/boards',
    query: { filter: 'open', fields: TRELLO_DISCOVERY_FIELDS },
    notFoundCode: 'TRELLO_LIST_NOT_FOUND',
    successEvent: 'trello_boards_loaded',
    invalidResponseEvent: 'trello_boards_invalid_response',
  });

  if (!result.ok) {
    return { ok: false, code: result.code };
  }

  return { ok: true, boards: result.items };
}

/**
 * @param {{ apiKey: string, token: string, boardId: string }} credentials
 * @returns {Promise<
 *   | { ok: true, lists: Array<{ id: string, name: string }> }
 *   | { ok: false, code: 'TRELLO_AUTH' | 'TRELLO_BOARD_NOT_FOUND' | 'TRELLO_RATE_LIMIT' | 'TRELLO_TIMEOUT' | 'TRELLO_ERROR' }
 * >}
 */
export async function getBoardLists({ apiKey, token, boardId }) {
  const result = await fetchTrelloDiscovery({
    apiKey,
    token,
    path: `/boards/${encodeURIComponent(boardId)}/lists`,
    query: { filter: 'open', fields: TRELLO_DISCOVERY_FIELDS },
    notFoundCode: 'TRELLO_BOARD_NOT_FOUND',
    successEvent: 'trello_board_lists_loaded',
    invalidResponseEvent: 'trello_board_lists_invalid_response',
  });

  if (!result.ok) {
    return { ok: false, code: result.code };
  }

  return { ok: true, lists: result.items };
}

/**
 * @param {{ apiKey: string, token: string }} credentials
 * @returns {Promise<
 *   | { ok: true, member: { id: string, username: string | null } }
 *   | { ok: false, code: 'TRELLO_AUTH' | 'TRELLO_RATE_LIMIT' | 'TRELLO_TIMEOUT' | 'TRELLO_ERROR' }
 * >}
 */
export async function getMemberMe({ apiKey, token }) {
  const fetchFn = fetchFnOverride ?? fetch;
  const startedAt = Date.now();

  let response;
  try {
    response = await fetchFn(
      buildAuthenticatedUrl('/members/me', apiKey, token, { fields: 'id,username' }),
      {
        method: 'GET',
        signal: AbortSignal.timeout(TRELLO_TIMEOUT_MS),
      }
    );
  } catch (err) {
    const durationMs = Date.now() - startedAt;
    const isTimeout =
      err &&
      typeof err === 'object' &&
      'name' in err &&
      /** @type {{ name?: string }} */ (err).name === 'TimeoutError';

    logTrelloClientEvent(isTimeout ? 'trello_timeout' : 'trello_network_error', durationMs);

    return { ok: false, code: isTimeout ? 'TRELLO_TIMEOUT' : 'TRELLO_ERROR' };
  }

  const durationMs = Date.now() - startedAt;
  const httpStatus = response.status;

  if (response.ok) {
    let payload;
    try {
      payload = await response.json();
    } catch {
      logTrelloClientEvent('trello_member_invalid_response', durationMs, { httpStatus });
      return { ok: false, code: 'TRELLO_ERROR' };
    }

    if (!payload || typeof payload !== 'object' || typeof payload.id !== 'string') {
      logTrelloClientEvent('trello_member_invalid_response', durationMs, { httpStatus });
      return { ok: false, code: 'TRELLO_ERROR' };
    }

    const username =
      typeof payload.username === 'string' && payload.username.trim()
        ? payload.username.trim()
        : null;

    logTrelloClientEvent('trello_member_loaded', durationMs, { httpStatus });

    return { ok: true, member: { id: payload.id, username } };
  }

  const code = mapHttpStatusToCode(httpStatus);

  logTrelloClientEvent('trello_api_error', durationMs, {
    httpStatus,
    trelloErrorCode: code,
  });

  return { ok: false, code };
}

/**
 * @param {{ apiKey: string, token: string }} credentials
 * @returns {Promise<
 *   | { ok: true }
 *   | { ok: false, code: 'TRELLO_AUTH' | 'TRELLO_RATE_LIMIT' | 'TRELLO_TIMEOUT' | 'TRELLO_ERROR' }
 * >}
 */
export async function deleteToken({ apiKey, token }) {
  const fetchFn = fetchFnOverride ?? fetch;
  const startedAt = Date.now();

  let response;
  try {
    response = await fetchFn(
      buildAuthenticatedUrl(`/tokens/${encodeURIComponent(token)}`, apiKey, token),
      {
        method: 'DELETE',
        signal: AbortSignal.timeout(TRELLO_TIMEOUT_MS),
      }
    );
  } catch (err) {
    const durationMs = Date.now() - startedAt;
    const isTimeout =
      err &&
      typeof err === 'object' &&
      'name' in err &&
      /** @type {{ name?: string }} */ (err).name === 'TimeoutError';

    logTrelloClientEvent(isTimeout ? 'trello_timeout' : 'trello_network_error', durationMs);

    return { ok: false, code: isTimeout ? 'TRELLO_TIMEOUT' : 'TRELLO_ERROR' };
  }

  const durationMs = Date.now() - startedAt;
  const httpStatus = response.status;

  if (response.ok) {
    logTrelloClientEvent('trello_token_deleted', durationMs, { httpStatus });
    return { ok: true };
  }

  const code = mapHttpStatusToCode(httpStatus);

  logTrelloClientEvent('trello_token_delete_failed', durationMs, {
    httpStatus,
    trelloErrorCode: code,
  });

  return { ok: false, code };
}
