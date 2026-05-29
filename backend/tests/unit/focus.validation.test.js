import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  startFocusBodySchema,
  completeFocusBodySchema,
  completeFocusParamsSchema,
} from '../../src/shared/validation/focus.schema.js';

const TASK_ID = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';
const SESSION_ID = '11111111-1111-4111-8111-000000000001';

describe('focus.validation startFocusBodySchema', () => {
  it('defaults durationMinutes to 25', () => {
    const parsed = startFocusBodySchema.safeParse({ taskId: TASK_ID });
    assert.equal(parsed.success, true);
    if (parsed.success) {
      assert.equal(parsed.data.durationMinutes, 25);
    }
  });

  it('accepts custom durationMinutes', () => {
    const parsed = startFocusBodySchema.safeParse({
      taskId: TASK_ID,
      durationMinutes: 45,
    });
    assert.equal(parsed.success, true);
  });

  it('rejects durationMinutes below 5', () => {
    const parsed = startFocusBodySchema.safeParse({
      taskId: TASK_ID,
      durationMinutes: 4,
    });
    assert.equal(parsed.success, false);
  });

  it('rejects durationMinutes above 120', () => {
    const parsed = startFocusBodySchema.safeParse({
      taskId: TASK_ID,
      durationMinutes: 121,
    });
    assert.equal(parsed.success, false);
  });

  it('rejects unknown fields', () => {
    const parsed = startFocusBodySchema.safeParse({
      taskId: TASK_ID,
      userId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    });
    assert.equal(parsed.success, false);
  });
});

describe('focus.validation completeFocusBodySchema', () => {
  it('requires completedTask boolean', () => {
    assert.equal(completeFocusBodySchema.safeParse({}).success, false);
    assert.equal(
      completeFocusBodySchema.safeParse({ completedTask: true }).success,
      true
    );
  });

  it('rejects unknown fields', () => {
    const parsed = completeFocusBodySchema.safeParse({
      completedTask: false,
      durationMinutes: 10,
    });
    assert.equal(parsed.success, false);
  });
});

describe('focus.validation completeFocusParamsSchema', () => {
  it('requires sessionId uuid', () => {
    assert.equal(
      completeFocusParamsSchema.safeParse({ sessionId: SESSION_ID }).success,
      true
    );
    assert.equal(
      completeFocusParamsSchema.safeParse({ sessionId: 'not-a-uuid' }).success,
      false
    );
  });
});
