import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateTrelloSyncForm,
  TRELLO_SYNC_MAX_TASKS,
} from '../../src/utils/trello-sync-validation.js';

const TASK_IDS = Array.from({ length: TRELLO_SYNC_MAX_TASKS }, (_, i) =>
  `00000000-0000-4000-8000-${String(i).padStart(12, '0')}`
);

describe('validateTrelloSyncForm', () => {
  it('rejects empty apiKey', () => {
    const result = validateTrelloSyncForm('  ', 'token', 'list', ['task-id']);
    assert.equal(result.valid, false);
    assert.match(result.message, /API key/i);
  });

  it('rejects empty token', () => {
    const result = validateTrelloSyncForm('key', '  ', 'list', ['task-id']);
    assert.equal(result.valid, false);
    assert.match(result.message, /Token/i);
  });

  it('rejects empty listId', () => {
    const result = validateTrelloSyncForm('key', 'token', '  ', ['task-id']);
    assert.equal(result.valid, false);
    assert.match(result.message, /List ID/i);
  });

  it('rejects zero taskIds', () => {
    const result = validateTrelloSyncForm('key', 'token', 'list', []);
    assert.equal(result.valid, false);
    assert.match(result.message, /at least one task/i);
  });

  it('rejects more than 50 taskIds', () => {
    const tooMany = [...TASK_IDS, '11111111-1111-4111-8111-111111111111'];
    const result = validateTrelloSyncForm('key', 'token', 'list', tooMany);
    assert.equal(result.valid, false);
    assert.match(result.message, /50/);
  });

  it('accepts valid payload', () => {
    const result = validateTrelloSyncForm('key', 'token', 'list', [TASK_IDS[0]]);
    assert.deepEqual(result, { valid: true });
  });
});
