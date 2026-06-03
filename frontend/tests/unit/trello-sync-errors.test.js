import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ApiRequestError } from '../../src/services/courses.service.js';
import { mapTrelloSyncError } from '../../src/utils/trello-sync-errors.js';

describe('mapTrelloSyncError', () => {
  it('maps TRELLO_NOT_CONNECTED', () => {
    const message = mapTrelloSyncError(
      new ApiRequestError('TRELLO_NOT_CONNECTED', 'Connect your Trello account or provide API credentials.'),
      { mode: 'connected', context: 'boards' }
    );
    assert.equal(message, 'Connect your Trello account, or use manual credentials.');
  });

  it('maps TRELLO_AUTH_ERROR in connected mode', () => {
    const message = mapTrelloSyncError(
      new ApiRequestError('TRELLO_AUTH_ERROR', 'Trello authorization failed.'),
      { mode: 'connected', context: 'sync' }
    );
    assert.equal(
      message,
      'Your Trello connection expired or is invalid. Disconnect and connect again.'
    );
  });

  it('maps TRELLO_AUTH_ERROR in manual mode using backend message', () => {
    const message = mapTrelloSyncError(
      new ApiRequestError('TRELLO_AUTH_ERROR', 'Invalid Trello token.'),
      { mode: 'manual', context: 'boards' }
    );
    assert.equal(message, 'Invalid Trello token.');
  });

  it('maps SERVER_ERROR', () => {
    const message = mapTrelloSyncError(
      new ApiRequestError('SERVER_ERROR', 'Trello integration is not available.'),
      { mode: 'connected', context: 'lists' }
    );
    assert.equal(message, 'Trello integration is not available right now.');
  });

  it('maps VALIDATION_ERROR to safe message', () => {
    const message = mapTrelloSyncError(
      new ApiRequestError('VALIDATION_ERROR', 'Invalid request data'),
      { mode: 'manual', context: 'sync' }
    );
    assert.equal(message, 'Invalid request data');
  });

  it('maps unknown errors to context-specific retry messages', () => {
    assert.equal(
      mapTrelloSyncError(new Error('network'), { mode: 'manual', context: 'boards' }),
      'Failed to load Trello boards. Please try again.'
    );
    assert.equal(
      mapTrelloSyncError(new Error('network'), { mode: 'connected', context: 'lists' }),
      'Failed to load Trello lists. Please try again.'
    );
    assert.equal(
      mapTrelloSyncError(new Error('network'), { mode: 'connected', context: 'sync' }),
      'Sync failed. Please try again.'
    );
  });
});
