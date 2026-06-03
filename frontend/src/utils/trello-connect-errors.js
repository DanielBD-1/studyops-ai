import { ApiRequestError } from '../services/courses.service.js';

const GENERIC_CONNECT_ERROR = 'Could not connect Trello account. Please try again.';
const GENERIC_CALLBACK_ERROR = 'Could not complete Trello connection. Please try again.';

/**
 * @param {unknown} error
 * @param {{ context?: 'callback' | 'panel' }} [options]
 * @returns {string}
 */
export function mapTrelloConnectError(error, options = {}) {
  const fallback =
    options.context === 'callback' ? GENERIC_CALLBACK_ERROR : GENERIC_CONNECT_ERROR;

  if (error instanceof ApiRequestError) {
    if (error.code === 'TRELLO_OAUTH_STATE_INVALID') {
      return 'Connection request expired or invalid. Please try again.';
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
