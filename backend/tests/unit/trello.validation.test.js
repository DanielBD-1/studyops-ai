import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  trelloBoardIdParamSchema,
  trelloBoardListsBodySchema,
  trelloBoardsBodySchema,
  trelloConnectCompleteBodySchema,
  trelloDisconnectBodySchema,
  trelloSyncBodySchema,
} from '../../src/shared/validation/trello.schema.js';

const VALID_CREDENTIALS = {
  apiKey: 'key',
  token: 'token',
};

const VALID_BODY = {
  ...VALID_CREDENTIALS,
  listId: 'list123',
  taskIds: ['11111111-1111-4111-8111-111111111111'],
};

describe('trello.validation', () => {
  it('boards schema accepts valid credentials', () => {
    const parsed = trelloBoardsBodySchema.safeParse(VALID_CREDENTIALS);
    assert.equal(parsed.success, true);
  });

  it('boards schema rejects missing apiKey', () => {
    const parsed = trelloBoardsBodySchema.safeParse({ token: 'token' });
    assert.equal(parsed.success, false);
  });

  it('boards schema rejects empty credentials', () => {
    const parsed = trelloBoardsBodySchema.safeParse({ apiKey: '  ', token: '' });
    assert.equal(parsed.success, false);
  });

  it('boards schema rejects unknown fields', () => {
    const parsed = trelloBoardsBodySchema.safeParse({
      ...VALID_CREDENTIALS,
      listId: 'list',
    });
    assert.equal(parsed.success, false);
  });

  it('board lists body schema rejects unknown fields', () => {
    const parsed = trelloBoardListsBodySchema.safeParse({
      ...VALID_CREDENTIALS,
      boardId: 'board1',
    });
    assert.equal(parsed.success, false);
  });

  it('boardId param schema rejects empty boardId', () => {
    const parsed = trelloBoardIdParamSchema.safeParse({ boardId: '   ' });
    assert.equal(parsed.success, false);
  });

  it('boardId param schema rejects too-long boardId', () => {
    const parsed = trelloBoardIdParamSchema.safeParse({
      boardId: 'a'.repeat(65),
    });
    assert.equal(parsed.success, false);
  });

  it('boardId param schema rejects invalid characters', () => {
    const parsed = trelloBoardIdParamSchema.safeParse({ boardId: 'board-id!' });
    assert.equal(parsed.success, false);
  });

  it('boardId param schema accepts valid boardId', () => {
    const parsed = trelloBoardIdParamSchema.safeParse({ boardId: 'abc123XYZ' });
    assert.equal(parsed.success, true);
  });

  it('accepts valid sync body', () => {
    const parsed = trelloSyncBodySchema.safeParse(VALID_BODY);
    assert.equal(parsed.success, true);
  });

  it('rejects empty apiKey', () => {
    const parsed = trelloSyncBodySchema.safeParse({ ...VALID_BODY, apiKey: '   ' });
    assert.equal(parsed.success, false);
  });

  it('rejects empty token', () => {
    const parsed = trelloSyncBodySchema.safeParse({ ...VALID_BODY, token: '' });
    assert.equal(parsed.success, false);
  });

  it('rejects empty taskIds', () => {
    const parsed = trelloSyncBodySchema.safeParse({ ...VALID_BODY, taskIds: [] });
    assert.equal(parsed.success, false);
  });

  it('rejects duplicate taskIds', () => {
    const id = '11111111-1111-4111-8111-111111111111';
    const parsed = trelloSyncBodySchema.safeParse({
      ...VALID_BODY,
      taskIds: [id, id],
    });
    assert.equal(parsed.success, false);
  });

  it('rejects non-uuid taskIds', () => {
    const parsed = trelloSyncBodySchema.safeParse({
      ...VALID_BODY,
      taskIds: ['not-a-uuid'],
    });
    assert.equal(parsed.success, false);
  });

  it('rejects unknown fields', () => {
    const parsed = trelloSyncBodySchema.safeParse({
      ...VALID_BODY,
      extra: true,
    });
    assert.equal(parsed.success, false);
  });

  it('connect complete schema accepts valid token', () => {
    const parsed = trelloConnectCompleteBodySchema.safeParse({ token: 'valid-token' });
    assert.equal(parsed.success, true);
  });

  it('connect complete schema rejects empty token', () => {
    const parsed = trelloConnectCompleteBodySchema.safeParse({ token: '   ' });
    assert.equal(parsed.success, false);
  });

  it('connect complete schema rejects unknown fields', () => {
    const parsed = trelloConnectCompleteBodySchema.safeParse({
      token: 'valid-token',
      apiKey: 'extra',
    });
    assert.equal(parsed.success, false);
  });

  it('disconnect schema accepts empty object', () => {
    const parsed = trelloDisconnectBodySchema.safeParse({});
    assert.equal(parsed.success, true);
  });

  it('disconnect schema rejects non-empty body', () => {
    const parsed = trelloDisconnectBodySchema.safeParse({ force: true });
    assert.equal(parsed.success, false);
  });
});
