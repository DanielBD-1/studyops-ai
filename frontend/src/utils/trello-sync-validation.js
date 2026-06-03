export const TRELLO_SYNC_MAX_TASKS = 50;

/** @typedef {'connected' | 'manual' | 'loading'} TrelloSyncCredentialMode */

/**
 * @param {string} apiKey
 * @param {string} token
 * @param {TrelloSyncCredentialMode} [mode]
 * @returns {{ valid: true } | { valid: false, message: string }}
 */
export function validateTrelloLoadBoards(apiKey, token, mode = 'manual') {
  if (mode === 'connected' || mode === 'loading') {
    return { valid: true };
  }
  if (!apiKey.trim()) {
    return { valid: false, message: 'API key is required' };
  }
  if (!token.trim()) {
    return { valid: false, message: 'Token is required' };
  }
  return { valid: true };
}

/**
 * @param {string} listId
 * @param {string[]} selectedTaskIds
 * @returns {{ valid: true } | { valid: false, message: string }}
 */
function validateTrelloSyncTargets(listId, selectedTaskIds) {
  if (!listId.trim()) {
    return { valid: false, message: 'Select a Trello list' };
  }
  if (selectedTaskIds.length === 0) {
    return { valid: false, message: 'Select at least one task' };
  }
  if (selectedTaskIds.length > TRELLO_SYNC_MAX_TASKS) {
    return { valid: false, message: `Select at most ${TRELLO_SYNC_MAX_TASKS} tasks` };
  }
  return { valid: true };
}

/**
 * @param {string} apiKey
 * @param {string} token
 * @param {string} listId
 * @param {string[]} selectedTaskIds
 * @param {TrelloSyncCredentialMode} [mode]
 * @returns {{ valid: true } | { valid: false, message: string }}
 */
export function validateTrelloSyncForm(apiKey, token, listId, selectedTaskIds, mode = 'manual') {
  if (mode !== 'connected' && mode !== 'loading') {
    const credentials = validateTrelloLoadBoards(apiKey, token, 'manual');
    if (!credentials.valid) {
      return credentials;
    }
  }
  return validateTrelloSyncTargets(listId, selectedTaskIds);
}

/**
 * @param {string} apiKey
 * @param {string} token
 * @param {string} listId
 * @param {string[]} selectedTaskIds
 * @param {boolean} syncing
 * @param {TrelloSyncCredentialMode} [mode]
 */
export function isTrelloSyncSubmitDisabled(
  apiKey,
  token,
  listId,
  selectedTaskIds,
  syncing,
  mode = 'manual'
) {
  if (syncing || mode === 'loading') {
    return true;
  }
  return validateTrelloSyncForm(apiKey, token, listId, selectedTaskIds, mode).valid !== true;
}
