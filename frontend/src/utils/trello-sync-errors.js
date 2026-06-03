import { ApiRequestError } from '../services/courses.service.js';

const NOT_CONNECTED_MESSAGE = 'Connect your Trello account, or use manual credentials.';
const CONNECTED_AUTH_MESSAGE =
  'Your Trello connection expired or is invalid. Disconnect and connect again.';
const INTEGRATION_UNAVAILABLE_MESSAGE = 'Trello integration is not available right now.';
const VALIDATION_MESSAGE = 'Invalid request data';
const GENERIC_BOARDS_MESSAGE = 'Failed to load Trello boards. Please try again.';
const GENERIC_LISTS_MESSAGE = 'Failed to load Trello lists. Please try again.';
const GENERIC_SYNC_MESSAGE = 'Sync failed. Please try again.';

/** @typedef {'connected' | 'manual'} TrelloSyncErrorMode */

/**
 * @param {unknown} error
 * @param {{ mode?: TrelloSyncErrorMode, context?: 'boards' | 'lists' | 'sync' }} [options]
 * @returns {string}
 */
export function mapTrelloSyncError(error, options = {}) {
  const { mode = 'manual', context = 'sync' } = options;
  const fallback =
    context === 'boards'
      ? GENERIC_BOARDS_MESSAGE
      : context === 'lists'
        ? GENERIC_LISTS_MESSAGE
        : GENERIC_SYNC_MESSAGE;

  if (error instanceof ApiRequestError) {
    if (error.code === 'TRELLO_NOT_CONNECTED') {
      return NOT_CONNECTED_MESSAGE;
    }

    if (error.code === 'TRELLO_AUTH_ERROR') {
      if (mode === 'connected') {
        return CONNECTED_AUTH_MESSAGE;
      }
      if (error.message.trim().length > 0) {
        return error.message;
      }
    }

    if (error.code === 'SERVER_ERROR') {
      return INTEGRATION_UNAVAILABLE_MESSAGE;
    }

    if (error.code === 'VALIDATION_ERROR') {
      if (error.message.trim().length > 0) {
        return error.message;
      }
      return VALIDATION_MESSAGE;
    }

    if (error.code === 'AUTH_REQUIRED') {
      return error.message;
    }

    if (error.message.trim().length > 0) {
      return error.message;
    }
  }

  return fallback;
}
