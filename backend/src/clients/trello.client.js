const TRELLO_API_BASE = 'https://api.trello.com/1';
const TRELLO_TIMEOUT_MS = 15_000;

/** @type {typeof fetch | null} */
let fetchFnOverride = null;

/**
 * @param {typeof fetch | null} fn
 */
export function setTrelloFetchForTests(fn) {
  fetchFnOverride = fn;
}

/**
 * @param {'TRELLO_AUTH' | 'TRELLO_LIST_NOT_FOUND' | 'TRELLO_RATE_LIMIT' | 'TRELLO_TIMEOUT' | 'TRELLO_ERROR'} code
 * @returns {string}
 */
export function trelloClientErrorMessage(code) {
  switch (code) {
    case 'TRELLO_AUTH':
      return 'Trello authentication failed';
    case 'TRELLO_LIST_NOT_FOUND':
      return 'Trello list not found';
    case 'TRELLO_RATE_LIMIT':
      return 'Trello rate limit reached';
    case 'TRELLO_TIMEOUT':
      return 'Failed to create Trello card';
    default:
      return 'Failed to create Trello card';
  }
}

/**
 * @param {number} status
 * @returns {'TRELLO_AUTH' | 'TRELLO_LIST_NOT_FOUND' | 'TRELLO_RATE_LIMIT' | 'TRELLO_ERROR'}
 */
function mapHttpStatusToCode(status) {
  if (status === 401) return 'TRELLO_AUTH';
  if (status === 404) return 'TRELLO_LIST_NOT_FOUND';
  if (status === 429) return 'TRELLO_RATE_LIMIT';
  return 'TRELLO_ERROR';
}

/**
 * @param {string} apiKey
 * @param {string} token
 * @param {string} listId
 * @returns {string}
 */
function buildCardsUrl(apiKey, token) {
  const url = new URL(`${TRELLO_API_BASE}/cards`);
  url.searchParams.set('key', apiKey);
  url.searchParams.set('token', token);
  return url.toString();
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

    console.log(
      JSON.stringify({
        service: 'backend',
        component: 'trello-client',
        event: isTimeout ? 'trello_timeout' : 'trello_network_error',
        durationMs,
      })
    );

    return { ok: false, code: isTimeout ? 'TRELLO_TIMEOUT' : 'TRELLO_ERROR' };
  }

  const durationMs = Date.now() - startedAt;
  const httpStatus = response.status;

  if (response.ok) {
    let payload;
    try {
      payload = await response.json();
    } catch {
      console.log(
        JSON.stringify({
          service: 'backend',
          component: 'trello-client',
          event: 'trello_invalid_response',
          durationMs,
          httpStatus,
        })
      );
      return { ok: false, code: 'TRELLO_ERROR' };
    }

    if (!payload || typeof payload !== 'object' || typeof payload.id !== 'string') {
      console.log(
        JSON.stringify({
          service: 'backend',
          component: 'trello-client',
          event: 'trello_missing_card_id',
          durationMs,
          httpStatus,
        })
      );
      return { ok: false, code: 'TRELLO_ERROR' };
    }

    console.log(
      JSON.stringify({
        service: 'backend',
        component: 'trello-client',
        event: 'trello_card_created',
        durationMs,
        httpStatus,
      })
    );

    return { ok: true, cardId: payload.id };
  }

  const code = mapHttpStatusToCode(httpStatus);

  console.log(
    JSON.stringify({
      service: 'backend',
      component: 'trello-client',
      event: 'trello_api_error',
      durationMs,
      httpStatus,
      trelloErrorCode: code,
    })
  );

  return { ok: false, code };
}
