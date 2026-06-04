import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ApiRequestError } from '../../src/services/courses.service.js';
import { formatGenerateError } from '../../src/utils/generate-errors.js';

describe('generate-errors', () => {
  it('maps known Gemini and service error codes', () => {
    assert.equal(
      formatGenerateError(new ApiRequestError('GEMINI_TIMEOUT', 'ignored')),
      'Request timed out, please try shorter text'
    );
    assert.equal(
      formatGenerateError(new ApiRequestError('GEMINI_RATE_LIMIT', 'ignored')),
      'Service temporarily unavailable, please wait 1 minute'
    );
    assert.equal(
      formatGenerateError(new ApiRequestError('GEMINI_API_ERROR', 'ignored')),
      'AI processing failed, please try again'
    );
    assert.equal(
      formatGenerateError(new ApiRequestError('GEMINI_INVALID_RESPONSE', 'ignored')),
      'Invalid response from AI, please try again'
    );
    assert.equal(
      formatGenerateError(new ApiRequestError('SERVER_ERROR', 'ignored')),
      'Processing service unavailable, please try later'
    );
    assert.equal(
      formatGenerateError(new ApiRequestError('VALIDATION_ERROR', 'ignored')),
      'Study material must be between 100 and 50,000 characters'
    );
  });

  it('returns fallback for unknown ApiRequestError codes', () => {
    assert.equal(
      formatGenerateError(new ApiRequestError('DATABASE_ERROR', 'Internal DB failure')),
      'Failed to generate study plan'
    );
  });

  it('returns fallback for non-ApiRequestError values', () => {
    assert.equal(formatGenerateError(new Error('Network stack trace at http://localhost')), 'Failed to generate study plan');
    assert.equal(formatGenerateError(null), 'Failed to generate study plan');
    assert.equal(formatGenerateError(undefined), 'Failed to generate study plan');
  });
});
