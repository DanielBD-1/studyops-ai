import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { trelloSyncBodySchema } from '../../src/shared/validation/trello.schema.js';

const VALID_BODY = {
  apiKey: 'key',
  token: 'token',
  listId: 'list123',
  taskIds: ['11111111-1111-4111-8111-111111111111'],
};

describe('trello.validation', () => {
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
});
