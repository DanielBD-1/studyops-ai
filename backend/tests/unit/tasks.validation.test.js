import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  createTaskBodySchema,
  updateTaskBodySchema,
  listTasksQuerySchema,
  completeTaskBodySchema,
} from '../../src/shared/validation/task.schema.js';

describe('tasks.validation createTaskBodySchema', () => {
  it('accepts valid create payload', () => {
    const parsed = createTaskBodySchema.safeParse({
      title: 'Read chapter 3',
      description: 'Focus on graphs',
      priority: 'high',
      estimatedMinutes: 45,
      materialId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    });
    assert.equal(parsed.success, true);
  });

  it('rejects title too short', () => {
    const parsed = createTaskBodySchema.safeParse({
      title: 'ab',
      estimatedMinutes: 30,
    });
    assert.equal(parsed.success, false);
  });

  it('rejects description too long', () => {
    const parsed = createTaskBodySchema.safeParse({
      title: 'Valid title here',
      description: 'x'.repeat(1001),
      estimatedMinutes: 30,
    });
    assert.equal(parsed.success, false);
  });

  it('rejects estimatedMinutes out of range', () => {
    assert.equal(
      createTaskBodySchema.safeParse({ title: 'Valid title', estimatedMinutes: 4 }).success,
      false
    );
    assert.equal(
      createTaskBodySchema.safeParse({ title: 'Valid title', estimatedMinutes: 481 }).success,
      false
    );
    assert.equal(
      createTaskBodySchema.safeParse({ title: 'Valid title', estimatedMinutes: 30.5 }).success,
      false
    );
  });

  it('rejects forbidden fields on create', () => {
    for (const field of [
      'userId',
      'user_id',
      'courseId',
      'difficulty',
      'tags',
      'status',
      'trelloCardId',
    ]) {
      const parsed = createTaskBodySchema.safeParse({
        title: 'Valid title',
        estimatedMinutes: 30,
        [field]: 'nope',
      });
      assert.equal(parsed.success, false, `expected reject for ${field}`);
    }
  });
});

describe('tasks.validation updateTaskBodySchema', () => {
  it('accepts partial update with materialId null', () => {
    const parsed = updateTaskBodySchema.safeParse({ materialId: null });
    assert.equal(parsed.success, true);
  });

  it('rejects empty PATCH body', () => {
    const parsed = updateTaskBodySchema.safeParse({});
    assert.equal(parsed.success, false);
  });

  it('rejects status on PATCH', () => {
    const parsed = updateTaskBodySchema.safeParse({ status: 'completed' });
    assert.equal(parsed.success, false);
  });
});

describe('tasks.validation listTasksQuerySchema', () => {
  it('accepts courseId and status filters', () => {
    const parsed = listTasksQuerySchema.safeParse({
      courseId: '33333333-3333-4333-8333-333333333333',
      status: 'pending',
    });
    assert.equal(parsed.success, true);
  });

  it('rejects invalid status filter', () => {
    const parsed = listTasksQuerySchema.safeParse({ status: 'in_progress' });
    assert.equal(parsed.success, false);
  });
});

describe('tasks.validation completeTaskBodySchema', () => {
  it('accepts empty object', () => {
    assert.equal(completeTaskBodySchema.safeParse({}).success, true);
  });

  it('rejects non-empty complete body', () => {
    assert.equal(completeTaskBodySchema.safeParse({ force: true }).success, false);
  });
});
