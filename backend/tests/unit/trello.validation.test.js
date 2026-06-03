import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  classifyTrelloCredentialMode,
  trelloBoardIdParamSchema,
  trelloBoardListsBodySchema,
  trelloBoardListsStoredBodySchema,
  trelloBoardsBodySchema,
  trelloBoardsStoredBodySchema,
  trelloConnectCompleteBodySchema,
  trelloDisconnectBodySchema,
  trelloSyncBodySchema,
  trelloSyncStoredBodySchema,
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

  it('connect complete schema accepts valid token and state', () => {
    const parsed = trelloConnectCompleteBodySchema.safeParse({
      token: 'valid-token',
      state: 'valid-state',
    });
    assert.equal(parsed.success, true);
  });

  it('connect complete schema rejects missing state', () => {
    const parsed = trelloConnectCompleteBodySchema.safeParse({ token: 'valid-token' });
    assert.equal(parsed.success, false);
  });

  it('connect complete schema rejects missing token', () => {
    const parsed = trelloConnectCompleteBodySchema.safeParse({ state: 'valid-state' });
    assert.equal(parsed.success, false);
  });

  it('connect complete schema rejects empty token', () => {
    const parsed = trelloConnectCompleteBodySchema.safeParse({
      token: '   ',
      state: 'valid-state',
    });
    assert.equal(parsed.success, false);
  });

  it('connect complete schema rejects empty state', () => {
    const parsed = trelloConnectCompleteBodySchema.safeParse({
      token: 'valid-token',
      state: '   ',
    });
    assert.equal(parsed.success, false);
  });

  it('connect complete schema rejects unknown fields', () => {
    const parsed = trelloConnectCompleteBodySchema.safeParse({
      token: 'valid-token',
      state: 'valid-state',
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

  it('classifyTrelloCredentialMode returns stored when credential keys are absent', () => {
    assert.equal(classifyTrelloCredentialMode({}), 'stored');
    assert.equal(
      classifyTrelloCredentialMode({
        listId: 'list123',
        taskIds: ['11111111-1111-4111-8111-111111111111'],
      }),
      'stored'
    );
  });

  it('classifyTrelloCredentialMode returns manual when both credential keys are present', () => {
    assert.equal(classifyTrelloCredentialMode(VALID_CREDENTIALS), 'manual');
  });

  it('classifyTrelloCredentialMode returns partial when only one credential key is present', () => {
    assert.equal(classifyTrelloCredentialMode({ apiKey: 'key' }), 'partial');
    assert.equal(classifyTrelloCredentialMode({ token: 'token' }), 'partial');
  });

  it('stored boards schema accepts empty object', () => {
    const parsed = trelloBoardsStoredBodySchema.safeParse({});
    assert.equal(parsed.success, true);
  });

  it('stored boards schema rejects unknown fields', () => {
    const parsed = trelloBoardsStoredBodySchema.safeParse({ apiKey: 'key' });
    assert.equal(parsed.success, false);
  });

  it('stored board lists schema accepts empty object', () => {
    const parsed = trelloBoardListsStoredBodySchema.safeParse({});
    assert.equal(parsed.success, true);
  });

  it('stored sync schema accepts listId and taskIds only', () => {
    const parsed = trelloSyncStoredBodySchema.safeParse({
      listId: 'list123',
      taskIds: ['11111111-1111-4111-8111-111111111111'],
    });
    assert.equal(parsed.success, true);
  });

  it('stored sync schema rejects credential fields', () => {
    const parsed = trelloSyncStoredBodySchema.safeParse(VALID_BODY);
    assert.equal(parsed.success, false);
  });

  it('stored sync schema rejects duplicate taskIds', () => {
    const id = '11111111-1111-4111-8111-111111111111';
    const parsed = trelloSyncStoredBodySchema.safeParse({
      listId: 'list123',
      taskIds: [id, id],
    });
    assert.equal(parsed.success, false);
  });
});
