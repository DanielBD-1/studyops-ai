import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ApiRequestError } from '../../src/services/courses.service.js';
import { mapTrelloConnectError } from '../../src/utils/trello-connect-errors.js';

describe('trello-connect-errors', () => {
  it('maps TRELLO_OAUTH_STATE_INVALID to the required message', () => {
    const message = mapTrelloConnectError(
      new ApiRequestError(
        'TRELLO_OAUTH_STATE_INVALID',
        'Invalid or expired connection request.'
      ),
      { context: 'callback' }
    );

    assert.equal(message, 'Connection request expired or invalid. Please try again.');
  });

  it('uses ApiRequestError message for other backend codes', () => {
    const message = mapTrelloConnectError(
      new ApiRequestError('TRELLO_AUTH_ERROR', 'Trello authorization failed.'),
      { context: 'panel' }
    );

    assert.equal(message, 'Trello authorization failed.');
  });

  it('returns callback fallback for unknown errors', () => {
    const message = mapTrelloConnectError(new Error('boom'), { context: 'callback' });

    assert.equal(message, 'Could not complete Trello connection. Please try again.');
  });

  it('returns panel fallback for unknown errors', () => {
    const message = mapTrelloConnectError(new Error('boom'), { context: 'panel' });

    assert.equal(message, 'Could not connect Trello account. Please try again.');
  });
});
