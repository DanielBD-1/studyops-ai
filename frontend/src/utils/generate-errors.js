import { ApiRequestError } from '../services/courses.service.js';

/** @type {Record<string, string>} */
const GENERATE_ERROR_MESSAGES = {
  GEMINI_TIMEOUT: 'Request timed out, please try shorter text',
  GEMINI_RATE_LIMIT: 'Service temporarily unavailable, please wait 1 minute',
  GEMINI_API_ERROR: 'AI processing failed, please try again',
  GEMINI_INVALID_RESPONSE: 'Invalid response from AI, please try again',
  SERVER_ERROR: 'Processing service unavailable, please try later',
  VALIDATION_ERROR: 'Study material must be between 100 and 50,000 characters',
};

const FALLBACK_MESSAGE = 'Failed to generate study plan';

/**
 * @param {unknown} err
 * @returns {string}
 */
export function formatGenerateError(err) {
  if (err instanceof ApiRequestError) {
    const mapped = GENERATE_ERROR_MESSAGES[err.code];
    if (mapped) return mapped;
  }

  return FALLBACK_MESSAGE;
}
