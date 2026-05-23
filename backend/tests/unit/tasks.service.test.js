import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { applyTestEnv } from '../helpers/testEnv.js';
import { setSupabaseAdminClientForTests } from '../../src/config/supabase.js';
import {
  createTasksMockSupabaseClient,
  getLastStudyMaterialsSelectColumns,
  getLastStudyTasksSelectColumns,
  resetTasksMockTelemetry,
  setTasksMockOverrides,
  resetTasksMockOverrides,
  TEST_USER_ID,
  OWN_COURSE_ID,
  OWN_MATERIAL_ID,
  OWN_TASK_ID,
  OTHER_USER_TASK_ID,
  OTHER_USER_MATERIAL_ID,
} from '../helpers/mockSupabaseTasks.js';
import { ApiError } from '../../src/shared/errors/ApiError.js';
import {
  mapTask,
  taskCheckValidationMessageFromError,
  assertMaterialBelongsToOwnedCourse,
  createTask,
  updateTask,
  completeTask,
  getOwnedTaskOrThrow,
} from '../../src/modules/tasks/tasks.service.js';

applyTestEnv();
setSupabaseAdminClientForTests(createTasksMockSupabaseClient());

describe('tasks.service', () => {
  beforeEach(() => {
    resetTasksMockTelemetry();
    resetTasksMockOverrides();
  });

  it('mapTask omits userId and trelloCardId', () => {
    const mapped = mapTask({
      id: OWN_TASK_ID,
      user_id: TEST_USER_ID,
      course_id: OWN_COURSE_ID,
      material_id: null,
      title: 'T',
      description: '',
      priority: 'medium',
      estimated_minutes: 30,
      difficulty: 'medium',
      tags: [],
      status: 'pending',
      source: 'manual',
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
    });
    assert.equal('userId' in mapped, false);
    assert.equal('user_id' in mapped, false);
    assert.equal('trelloCardId' in mapped, false);
    assert.equal(mapped.courseId, OWN_COURSE_ID);
  });

  it('maps study_tasks_title_length constraint message', () => {
    const message = taskCheckValidationMessageFromError({
      message: 'violates check constraint "study_tasks_title_length"',
    });
    assert.equal(message, 'Task title must be between 3 and 200 characters');
  });

  it('createTask sets server defaults and user_id', async () => {
    resetTasksMockTelemetry();
    const task = await createTask(TEST_USER_ID, OWN_COURSE_ID, {
      title: 'New study task',
      estimatedMinutes: 25,
    });
    assert.equal(task.difficulty, 'medium');
    assert.deepEqual(task.tags, []);
    assert.equal(task.source, 'manual');
    assert.equal(task.status, 'pending');
    const select = getLastStudyTasksSelectColumns();
    assert.ok(select);
    assert.equal(select.includes('user_id'), false);
    assert.equal(select.includes('content'), false);
    assert.equal(select.includes('plan'), false);
  });

  it('assertMaterialBelongsToOwnedCourse selects minimal material columns', async () => {
    resetTasksMockTelemetry();
    await assertMaterialBelongsToOwnedCourse(TEST_USER_ID, OWN_COURSE_ID, OWN_MATERIAL_ID);
    const select = getLastStudyMaterialsSelectColumns();
    assert.ok(select);
    assert.equal(select.includes('content'), false);
    assert.equal(select.includes('plan'), false);
    assert.ok(select.includes('courses!inner'));
  });

  it('createTask with cross-course material returns 404', async () => {
    await assert.rejects(
      () =>
        createTask(TEST_USER_ID, OWN_COURSE_ID, {
          title: 'Bad material link',
          estimatedMinutes: 20,
          materialId: OTHER_USER_MATERIAL_ID,
        }),
      (err) => {
        assert.ok(err instanceof ApiError);
        assert.equal(err.status, 404);
        assert.equal(err.message, 'Study material not found');
        return true;
      }
    );
  });

  it('getOwnedTaskOrThrow returns 404 for another users task', async () => {
    await assert.rejects(
      () => getOwnedTaskOrThrow(TEST_USER_ID, OTHER_USER_TASK_ID),
      (err) => {
        assert.ok(err instanceof ApiError);
        assert.equal(err.status, 404);
        assert.equal(err.message, 'Task not found');
        return true;
      }
    );
  });

  it('updateTask clears materialId with null', async () => {
    const task = await updateTask(TEST_USER_ID, OWN_TASK_ID, { materialId: null });
    assert.equal(task.materialId, null);
  });

  it('completeTask is idempotent when already completed', async () => {
    await completeTask(TEST_USER_ID, OWN_TASK_ID);
    const again = await completeTask(TEST_USER_ID, OWN_TASK_ID);
    assert.equal(again.status, 'completed');
  });

  it('createTask maps DB check errors to validation', async () => {
    setTasksMockOverrides({
      taskInsertError: {
        code: '23514',
        message: 'violates check constraint "study_tasks_estimated_minutes_range"',
      },
    });
    await assert.rejects(
      () =>
        createTask(TEST_USER_ID, OWN_COURSE_ID, {
          title: 'Range fail task',
          estimatedMinutes: 30,
        }),
      (err) => {
        assert.ok(err instanceof ApiError);
        assert.equal(err.status, 400);
        assert.equal(err.code, 'VALIDATION_ERROR');
        return true;
      }
    );
  });
});
