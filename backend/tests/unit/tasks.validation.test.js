import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  createTaskBodySchema,
  updateTaskBodySchema,
  listTasksQuerySchema,
  listCourseTasksQuerySchema,
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
      'due_date',
    ]) {
      const parsed = createTaskBodySchema.safeParse({
        title: 'Valid title',
        estimatedMinutes: 30,
        [field]: 'nope',
      });
      assert.equal(parsed.success, false, `expected reject for ${field}`);
    }
  });

  it('accepts valid dueDate on create', () => {
    const parsed = createTaskBodySchema.safeParse({
      title: 'Valid title',
      estimatedMinutes: 30,
      dueDate: '2026-06-24',
    });
    assert.equal(parsed.success, true);
  });

  it('accepts omitted dueDate on create', () => {
    const parsed = createTaskBodySchema.safeParse({
      title: 'Valid title',
      estimatedMinutes: 30,
    });
    assert.equal(parsed.success, true);
  });

  it('accepts dueDate null on create', () => {
    const parsed = createTaskBodySchema.safeParse({
      title: 'Valid title',
      estimatedMinutes: 30,
      dueDate: null,
    });
    assert.equal(parsed.success, true);
  });

  it('accepts past dueDate on create', () => {
    const parsed = createTaskBodySchema.safeParse({
      title: 'Valid title',
      estimatedMinutes: 30,
      dueDate: '1990-01-15',
    });
    assert.equal(parsed.success, true);
  });

  it('rejects impossible dueDate on create', () => {
    const parsed = createTaskBodySchema.safeParse({
      title: 'Valid title',
      estimatedMinutes: 30,
      dueDate: '2026-02-30',
    });
    assert.equal(parsed.success, false);
  });

  it('rejects invalid dueDate format on create', () => {
    const parsed = createTaskBodySchema.safeParse({
      title: 'Valid title',
      estimatedMinutes: 30,
      dueDate: '06/24/2026',
    });
    assert.equal(parsed.success, false);
  });

  it('rejects empty string dueDate on create', () => {
    const parsed = createTaskBodySchema.safeParse({
      title: 'Valid title',
      estimatedMinutes: 30,
      dueDate: '',
    });
    assert.equal(parsed.success, false);
  });

  it('rejects non-string dueDate on create', () => {
    const parsed = createTaskBodySchema.safeParse({
      title: 'Valid title',
      estimatedMinutes: 30,
      dueDate: 20260624,
    });
    assert.equal(parsed.success, false);
  });

  it('rejects year 0000 dueDate on create', () => {
    const parsed = createTaskBodySchema.safeParse({
      title: 'Valid title',
      estimatedMinutes: 30,
      dueDate: '0000-06-01',
    });
    assert.equal(parsed.success, false);
  });

  it('accepts years 0001–0099 on create', () => {
    const parsed = createTaskBodySchema.safeParse({
      title: 'Valid title',
      estimatedMinutes: 30,
      dueDate: '0042-03-05',
    });
    assert.equal(parsed.success, true);
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

  it('accepts valid dueDate on update', () => {
    const parsed = updateTaskBodySchema.safeParse({ dueDate: '2026-12-01' });
    assert.equal(parsed.success, true);
  });

  it('accepts dueDate null on update', () => {
    const parsed = updateTaskBodySchema.safeParse({ dueDate: null });
    assert.equal(parsed.success, true);
  });

  it('rejects invalid dueDate on update', () => {
    const parsed = updateTaskBodySchema.safeParse({ dueDate: '2026-13-40' });
    assert.equal(parsed.success, false);
  });

  it('rejects unknown fields on update', () => {
    const parsed = updateTaskBodySchema.safeParse({ due_date: '2026-06-01' });
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

  it('accepts deadline filters with optional referenceDate', () => {
    const parsed = listTasksQuerySchema.safeParse({
      deadline: 'overdue',
      referenceDate: '2026-06-18',
    });
    assert.equal(parsed.success, true);
  });

  it('accepts deadline without referenceDate', () => {
    const parsed = listTasksQuerySchema.safeParse({ deadline: 'due_today' });
    assert.equal(parsed.success, true);
  });

  it('rejects invalid status filter', () => {
    const parsed = listTasksQuerySchema.safeParse({ status: 'in_progress' });
    assert.equal(parsed.success, false);
  });

  it('rejects invalid deadline filter', () => {
    const parsed = listTasksQuerySchema.safeParse({ deadline: 'due_soon' });
    assert.equal(parsed.success, false);
  });

  it('rejects referenceDate without deadline', () => {
    const parsed = listTasksQuerySchema.safeParse({ referenceDate: '2026-06-18' });
    assert.equal(parsed.success, false);
  });

  it('rejects completed status with deadline', () => {
    const parsed = listTasksQuerySchema.safeParse({
      status: 'completed',
      deadline: 'overdue',
    });
    assert.equal(parsed.success, false);
  });

  it('rejects empty referenceDate', () => {
    const parsed = listTasksQuerySchema.safeParse({
      deadline: 'overdue',
      referenceDate: '',
    });
    assert.equal(parsed.success, false);
  });

  it('rejects malformed referenceDate', () => {
    const parsed = listTasksQuerySchema.safeParse({
      deadline: 'overdue',
      referenceDate: '2026-06-18T00:00:00.000Z',
    });
    assert.equal(parsed.success, false);
  });

  it('rejects impossible referenceDate', () => {
    const parsed = listTasksQuerySchema.safeParse({
      deadline: 'overdue',
      referenceDate: '2026-02-30',
    });
    assert.equal(parsed.success, false);
  });

  it('rejects repeated deadline query values', () => {
    const parsed = listTasksQuerySchema.safeParse({ deadline: ['overdue', 'due_today'] });
    assert.equal(parsed.success, false);
  });

  it('rejects repeated referenceDate query values', () => {
    const parsed = listTasksQuerySchema.safeParse({
      deadline: 'overdue',
      referenceDate: ['2026-06-18', '2026-06-19'],
    });
    assert.equal(parsed.success, false);
  });
});

describe('tasks.validation listCourseTasksQuerySchema', () => {
  it('accepts deadline filter on course task list', () => {
    const parsed = listCourseTasksQuerySchema.safeParse({
      deadline: 'due_today',
      referenceDate: '2026-06-18',
    });
    assert.equal(parsed.success, true);
  });

  it('rejects completed status with deadline on course task list', () => {
    const parsed = listCourseTasksQuerySchema.safeParse({
      status: 'completed',
      deadline: 'due_today',
    });
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
