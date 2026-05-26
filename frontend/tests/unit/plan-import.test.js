import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  mapPlanTaskToCreateBody,
  buildValidatedImportBodies,
  importPlanTasksSequentially,
  PLAN_IMPORT_VALIDATION_ERROR,
} from '../../src/utils/plan-import.js';

const MATERIAL_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const COURSE_ID = '33333333-3333-4333-8333-333333333333';

const VALID_PLAN_TASK = {
  title: 'Read chapter 1',
  description: 'Focus on definitions',
  priority: 'high',
  estimatedMinutes: 30,
  difficulty: 'medium',
  tags: ['reading'],
};

const VALID_PLAN = {
  summary: 'A'.repeat(50),
  keyTopics: ['Topic one'],
  difficulty: 'medium',
  tasks: [VALID_PLAN_TASK],
  flashcards: [
    {
      question: 'What is the main idea?',
      answer: 'The main idea is explained in the summary above.',
      tags: [],
    },
  ],
};

describe('plan-import mapPlanTaskToCreateBody', () => {
  it('maps plan task to create body with title, estimatedMinutes, description, priority, materialId', () => {
    const body = mapPlanTaskToCreateBody(VALID_PLAN_TASK, MATERIAL_ID);
    assert.equal(body.title, 'Read chapter 1');
    assert.equal(body.estimatedMinutes, 30);
    assert.equal(body.description, 'Focus on definitions');
    assert.equal(body.priority, 'high');
    assert.equal(body.materialId, MATERIAL_ID);
    assert.equal(body.difficulty, undefined);
    assert.equal(body.tags, undefined);
    assert.equal(body.source, undefined);
    assert.equal(body.status, undefined);
    assert.equal(body.courseId, undefined);
    assert.equal(body.userId, undefined);
  });

  it('omits empty description', () => {
    const body = mapPlanTaskToCreateBody(
      { ...VALID_PLAN_TASK, description: '   ' },
      MATERIAL_ID
    );
    assert.equal(body.description, undefined);
  });

  it('omits invalid priority', () => {
    const body = mapPlanTaskToCreateBody(
      { ...VALID_PLAN_TASK, priority: 'urgent' },
      MATERIAL_ID
    );
    assert.equal(body.priority, undefined);
  });
});

describe('plan-import buildValidatedImportBodies', () => {
  it('validates all tasks before import and returns bodies', () => {
    const result = buildValidatedImportBodies(VALID_PLAN, MATERIAL_ID);
    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.bodies.length, 1);
      assert.equal(result.bodies[0].materialId, MATERIAL_ID);
    }
  });

  it('aborts with zero bodies if any mapped task is invalid', () => {
    const result = buildValidatedImportBodies(
      {
        ...VALID_PLAN,
        tasks: [{ ...VALID_PLAN_TASK, title: 'ab' }],
      },
      MATERIAL_ID
    );
    assert.equal(result.success, false);
    if (!result.success) {
      assert.equal(result.error, PLAN_IMPORT_VALIDATION_ERROR);
    }
  });

  it('fails when plan has no tasks', () => {
    const result = buildValidatedImportBodies({ ...VALID_PLAN, tasks: [] }, MATERIAL_ID);
    assert.equal(result.success, false);
  });
});

describe('plan-import importPlanTasksSequentially', () => {
  it('imports all tasks sequentially on success', async () => {
    /** @type {Array<{ courseId: string, body: unknown }>} */
    const calls = [];
    const bodies = [
      { title: 'Task one', estimatedMinutes: 30, materialId: MATERIAL_ID },
      { title: 'Task two', estimatedMinutes: 45, materialId: MATERIAL_ID },
    ];

    const result = await importPlanTasksSequentially(
      COURSE_ID,
      bodies,
      async (courseId, body) => {
        calls.push({ courseId, body });
      }
    );

    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.imported, 2);
    }
    assert.equal(calls.length, 2);
    assert.equal(calls[0].courseId, COURSE_ID);
    assert.equal(calls[1].courseId, COURSE_ID);
  });

  it('stops on first createCourseTask failure and reports partial count', async () => {
    const bodies = [
      { title: 'Task one', estimatedMinutes: 30, materialId: MATERIAL_ID },
      { title: 'Task two', estimatedMinutes: 45, materialId: MATERIAL_ID },
      { title: 'Task three', estimatedMinutes: 60, materialId: MATERIAL_ID },
    ];

    let callCount = 0;
    const result = await importPlanTasksSequentially(COURSE_ID, bodies, async () => {
      callCount += 1;
      if (callCount === 2) {
        throw new Error('Server error');
      }
    });

    assert.equal(result.success, false);
    if (!result.success) {
      assert.equal(result.imported, 1);
      assert.equal(result.total, 3);
      assert.ok(result.error instanceof Error);
      assert.equal(result.error.message, 'Server error');
    }
    assert.equal(callCount, 2);
  });
});
