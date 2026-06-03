/**
 * @param {string | null | undefined} value
 * @returns {string | null}
 */
function normalizeOAuthValue(value) {
  if (value == null) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/**
 * @param {string} search
 * @param {string} hash
 * @returns {{ state: string | null, token: string | null }}
 */
export function parseTrelloOAuthCallback(search, hash) {
  const queryParams = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  const state = normalizeOAuthValue(queryParams.get('state'));

  const hashBody = hash.startsWith('#') ? hash.slice(1) : hash;
  const hashParams = new URLSearchParams(hashBody);
  const token = normalizeOAuthValue(hashParams.get('token'));

  return { state, token };
}

/**
 * @param {string} pathname
 * @param {{ replaceState: (data: unknown, unused: string, url: string) => void }} historyLike
 */
export function sanitizeOAuthCallbackUrl(pathname, historyLike) {
  historyLike.replaceState(null, '', pathname);
}
