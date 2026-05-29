export const TRELLO_SYNC_MAX_TASKS = 50;

/**
 * @param {string} apiKey
 * @param {string} token
 * @returns {{ valid: true } | { valid: false, message: string }}
 */
export function validateTrelloLoadBoards(apiKey, token) {
  if (!apiKey.trim()) {
    return { valid: false, message: 'API key is required' };
  }
  if (!token.trim()) {
    return { valid: false, message: 'Token is required' };
  }
  return { valid: true };
}

/**
 * @param {string} apiKey
 * @param {string} token
 * @param {string} listId
 * @param {string[]} selectedTaskIds
 * @returns {{ valid: true } | { valid: false, message: string }}
 */
export function validateTrelloSyncForm(apiKey, token, listId, selectedTaskIds) {
  const credentials = validateTrelloLoadBoards(apiKey, token);
  if (!credentials.valid) {
    return credentials;
  }
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
 * @param {boolean} syncing
 */
export function isTrelloSyncSubmitDisabled(apiKey, token, listId, selectedTaskIds, syncing) {
  if (syncing) {
    return true;
  }
  return validateTrelloSyncForm(apiKey, token, listId, selectedTaskIds).valid !== true;
}
