import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateTrelloLoadBoards,
  validateTrelloSyncForm,
  isTrelloSyncSubmitDisabled,
  TRELLO_SYNC_MAX_TASKS,
} from '../../src/utils/trello-sync-validation.js';

const TASK_IDS = Array.from({ length: TRELLO_SYNC_MAX_TASKS }, (_, i) =>
  `00000000-0000-4000-8000-${String(i).padStart(12, '0')}`
);

describe('validateTrelloLoadBoards', () => {
  it('rejects missing apiKey', () => {
    const result = validateTrelloLoadBoards('  ', 'token');
    assert.equal(result.valid, false);
    assert.match(result.message, /API key/i);
  });

  it('rejects missing token', () => {
    const result = validateTrelloLoadBoards('key', '');
    assert.equal(result.valid, false);
    assert.match(result.message, /Token/i);
  });

  it('accepts valid credentials', () => {
    const result = validateTrelloLoadBoards('key', 'token');
    assert.deepEqual(result, { valid: true });
  });

  it('connected mode skips credential requirement for load boards', () => {
    const result = validateTrelloLoadBoards('', '', 'connected');
    assert.deepEqual(result, { valid: true });
  });
});

describe('validateTrelloSyncForm', () => {
  it('rejects empty apiKey', () => {
    const result = validateTrelloSyncForm('  ', 'token', 'list-id', ['task-id']);
    assert.equal(result.valid, false);
    assert.match(result.message, /API key/i);
  });

  it('rejects empty token', () => {
    const result = validateTrelloSyncForm('key', '  ', 'list-id', ['task-id']);
    assert.equal(result.valid, false);
    assert.match(result.message, /Token/i);
  });

  it('rejects missing selected list', () => {
    const result = validateTrelloSyncForm('key', 'token', '  ', ['task-id']);
    assert.equal(result.valid, false);
    assert.match(result.message, /Select a Trello list/i);
  });

  it('rejects zero taskIds', () => {
    const result = validateTrelloSyncForm('key', 'token', 'list-id', []);
    assert.equal(result.valid, false);
    assert.match(result.message, /at least one task/i);
  });

  it('rejects more than 50 taskIds', () => {
    const tooMany = [...TASK_IDS, '11111111-1111-4111-8111-111111111111'];
    const result = validateTrelloSyncForm('key', 'token', 'list-id', tooMany);
    assert.equal(result.valid, false);
    assert.match(result.message, /50/);
  });

  it('accepts valid picker-based sync payload', () => {
    const result = validateTrelloSyncForm('key', 'token', 'list-from-picker', [TASK_IDS[0]]);
    assert.deepEqual(result, { valid: true });
  });

  it('connected mode skips credential requirement when list and tasks are valid', () => {
    const result = validateTrelloSyncForm('', '', 'list-from-picker', [TASK_IDS[0]], 'connected');
    assert.deepEqual(result, { valid: true });
  });

  it('connected mode still requires list and tasks', () => {
    const result = validateTrelloSyncForm('', '', '  ', [], 'connected');
    assert.equal(result.valid, false);
    assert.match(result.message, /Select a Trello list/i);
  });
});

describe('isTrelloSyncSubmitDisabled', () => {
  it('connected mode disables submit when list or tasks are missing', () => {
    assert.equal(isTrelloSyncSubmitDisabled('', '', '', [], false, 'connected'), true);
    assert.equal(
      isTrelloSyncSubmitDisabled('', '', 'list-id', [TASK_IDS[0]], false, 'connected'),
      false
    );
  });

  it('loading mode always disables submit', () => {
    assert.equal(
      isTrelloSyncSubmitDisabled('key', 'token', 'list-id', [TASK_IDS[0]], false, 'loading'),
      true
    );
  });

  it('manual mode keeps credential requirements', () => {
    assert.equal(isTrelloSyncSubmitDisabled('', 'token', 'list-id', [TASK_IDS[0]], false, 'manual'), true);
    assert.equal(
      isTrelloSyncSubmitDisabled('key', 'token', 'list-id', [TASK_IDS[0]], false, 'manual'),
      false
    );
  });
});
