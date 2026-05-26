import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  listCourseTasks,
  createCourseTask,
  updateTask,
  completeTask,
  deleteTask,
  __setApiFetchForTests,
  __setAccessTokenForTests,
} from '../../src/services/tasks.service.js';

const COURSE_ID = '33333333-3333-4333-8333-333333333333';
const TASK_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const MATERIAL_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const TOKEN = 'test-access-token';

const MOCK_TASK = {
  id: TASK_ID,
  courseId: COURSE_ID,
  materialId: null,
  title: 'Read chapter 1',
  description: 'Focus on definitions',
  priority: 'medium',
  estimatedMinutes: 30,
  difficulty: 'medium',
  tags: [],
  status: 'pending',
  source: 'manual',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

/** @type {Array<{ path: string, init: RequestInit, token?: string }>} */
let calls = [];

beforeEach(() => {
  calls = [];
  __setAccessTokenForTests(TOKEN);
  __setApiFetchForTests(async (path, init, accessToken) => {
    calls.push({ path, init, token: accessToken });
    return {
      success: true,
      data: {},
      meta: { timestamp: new Date().toISOString() },
    };
  });
});

afterEach(() => {
  __setApiFetchForTests(null);
  __setAccessTokenForTests(null);
});

describe('tasks.service', () => {
  it('listCourseTasks calls GET /api/courses/:id/tasks with Bearer token', async () => {
    __setApiFetchForTests(async (path, init, accessToken) => {
      calls.push({ path, init, token: accessToken });
      return {
        success: true,
        data: { tasks: [MOCK_TASK] },
        meta: { timestamp: new Date().toISOString() },
      };
    });

    const data = await listCourseTasks(COURSE_ID);
    assert.equal(data.tasks.length, 1);
    assert.equal(calls.length, 1);
    assert.equal(calls[0].path, `/api/courses/${COURSE_ID}/tasks`);
    assert.equal(calls[0].init.method, 'GET');
    assert.equal(calls[0].token, TOKEN);
  });

  it('listCourseTasks with status=pending sends ?status=pending', async () => {
    __setApiFetchForTests(async (path, init, accessToken) => {
      calls.push({ path, init, token: accessToken });
      return {
        success: true,
        data: { tasks: [] },
        meta: { timestamp: new Date().toISOString() },
      };
    });

    await listCourseTasks(COURSE_ID, 'pending');
    assert.equal(calls[0].path, `/api/courses/${COURSE_ID}/tasks?status=pending`);
    assert.equal(calls[0].init.method, 'GET');
  });

  it('listCourseTasks with status=completed sends ?status=completed', async () => {
    __setApiFetchForTests(async (path, init, accessToken) => {
      calls.push({ path, init, token: accessToken });
      return {
        success: true,
        data: { tasks: [] },
        meta: { timestamp: new Date().toISOString() },
      };
    });

    await listCourseTasks(COURSE_ID, 'completed');
    assert.equal(calls[0].path, `/api/courses/${COURSE_ID}/tasks?status=completed`);
    assert.equal(calls[0].init.method, 'GET');
  });

  it('listCourseTasks with undefined status sends no query string', async () => {
    __setApiFetchForTests(async (path, init, accessToken) => {
      calls.push({ path, init, token: accessToken });
      return {
        success: true,
        data: { tasks: [] },
        meta: { timestamp: new Date().toISOString() },
      };
    });

    await listCourseTasks(COURSE_ID, undefined);
    assert.equal(calls[0].path, `/api/courses/${COURSE_ID}/tasks`);
  });

  it('createCourseTask POSTs allowed fields only', async () => {
    __setApiFetchForTests(async (path, init, accessToken) => {
      calls.push({ path, init, token: accessToken });
      return {
        success: true,
        data: { task: MOCK_TASK },
        meta: { timestamp: new Date().toISOString() },
      };
    });

    const data = await createCourseTask(COURSE_ID, {
      title: 'Read chapter 1',
      estimatedMinutes: 30,
      description: 'Focus on definitions',
      priority: 'high',
    });
    assert.equal(data.task.title, 'Read chapter 1');
    assert.equal(calls[0].path, `/api/courses/${COURSE_ID}/tasks`);
    assert.equal(calls[0].init.method, 'POST');
    assert.equal(
      calls[0].init.body,
      JSON.stringify({
        title: 'Read chapter 1',
        estimatedMinutes: 30,
        description: 'Focus on definitions',
        priority: 'high',
      })
    );
  });

  it('createCourseTask includes materialId when provided', async () => {
    __setApiFetchForTests(async (path, init, accessToken) => {
      calls.push({ path, init, token: accessToken });
      return {
        success: true,
        data: { task: MOCK_TASK },
        meta: { timestamp: new Date().toISOString() },
      };
    });

    const data = await createCourseTask(COURSE_ID, {
      title: 'Read chapter 1',
      estimatedMinutes: 30,
      description: 'Focus on definitions',
      priority: 'high',
      materialId: MATERIAL_ID,
    });
    assert.equal(data.task.title, 'Read chapter 1');
    assert.equal(calls[0].path, `/api/courses/${COURSE_ID}/tasks`);
    assert.equal(calls[0].init.method, 'POST');
    assert.equal(
      calls[0].init.body,
      JSON.stringify({
        title: 'Read chapter 1',
        estimatedMinutes: 30,
        description: 'Focus on definitions',
        priority: 'high',
        materialId: MATERIAL_ID,
      })
    );
  });

  it('updateTask PATCHes allowed fields only', async () => {
    __setApiFetchForTests(async (path, init, accessToken) => {
      calls.push({ path, init, token: accessToken });
      return {
        success: true,
        data: { task: { ...MOCK_TASK, title: 'Updated task title name' } },
        meta: { timestamp: new Date().toISOString() },
      };
    });

    const data = await updateTask(TASK_ID, {
      title: 'Updated task title name',
      estimatedMinutes: 45,
      description: 'Revised notes',
      priority: 'high',
    });
    assert.equal(data.task.title, 'Updated task title name');
    assert.equal(calls[0].path, `/api/tasks/${TASK_ID}`);
    assert.equal(calls[0].init.method, 'PATCH');
    assert.equal(
      calls[0].init.body,
      JSON.stringify({
        title: 'Updated task title name',
        estimatedMinutes: 45,
        description: 'Revised notes',
        priority: 'high',
      })
    );
  });

  it('updateTask PATCHes materialId when provided', async () => {
    __setApiFetchForTests(async (path, init, accessToken) => {
      calls.push({ path, init, token: accessToken });
      return {
        success: true,
        data: { task: { ...MOCK_TASK, materialId: MATERIAL_ID } },
        meta: { timestamp: new Date().toISOString() },
      };
    });

    const data = await updateTask(TASK_ID, {
      title: 'Updated task title name',
      estimatedMinutes: 45,
      description: 'Revised notes',
      priority: 'high',
      materialId: MATERIAL_ID,
    });

    assert.equal(data.task.materialId, MATERIAL_ID);
    assert.equal(calls[0].path, `/api/tasks/${TASK_ID}`);
    assert.equal(calls[0].init.method, 'PATCH');
    assert.equal(
      calls[0].init.body,
      JSON.stringify({
        title: 'Updated task title name',
        estimatedMinutes: 45,
        description: 'Revised notes',
        priority: 'high',
        materialId: MATERIAL_ID,
      })
    );
  });

  it('updateTask PATCHes materialId:null to unlink', async () => {
    __setApiFetchForTests(async (path, init, accessToken) => {
      calls.push({ path, init, token: accessToken });
      return {
        success: true,
        data: { task: { ...MOCK_TASK, materialId: null } },
        meta: { timestamp: new Date().toISOString() },
      };
    });

    const data = await updateTask(TASK_ID, {
      title: 'Updated task title name',
      estimatedMinutes: 45,
      description: 'Revised notes',
      priority: 'high',
      materialId: null,
    });

    assert.equal(data.task.materialId, null);
    assert.equal(calls[0].path, `/api/tasks/${TASK_ID}`);
    assert.equal(calls[0].init.method, 'PATCH');
    assert.equal(
      calls[0].init.body,
      JSON.stringify({
        title: 'Updated task title name',
        estimatedMinutes: 45,
        description: 'Revised notes',
        priority: 'high',
        materialId: null,
      })
    );
  });

  it('completeTask POSTs empty body to /api/tasks/:id/complete', async () => {
    __setApiFetchForTests(async (path, init, accessToken) => {
      calls.push({ path, init, token: accessToken });
      return {
        success: true,
        data: { task: { ...MOCK_TASK, status: 'completed' } },
        meta: { timestamp: new Date().toISOString() },
      };
    });

    const data = await completeTask(TASK_ID);
    assert.equal(data.task.status, 'completed');
    assert.equal(calls[0].path, `/api/tasks/${TASK_ID}/complete`);
    assert.equal(calls[0].init.method, 'POST');
    assert.equal(calls[0].init.body, JSON.stringify({}));
  });

  it('deleteTask calls DELETE /api/tasks/:id', async () => {
    __setApiFetchForTests(async (path, init, accessToken) => {
      calls.push({ path, init, token: accessToken });
      return {
        success: true,
        data: { deleted: true },
        meta: { timestamp: new Date().toISOString() },
      };
    });

    const data = await deleteTask(TASK_ID);
    assert.equal(data.deleted, true);
    assert.equal(calls[0].path, `/api/tasks/${TASK_ID}`);
    assert.equal(calls[0].init.method, 'DELETE');
  });

  it('surfaces API error codes', async () => {
    __setApiFetchForTests(async () => ({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Task not found' },
      meta: { timestamp: new Date().toISOString() },
    }));

    await assert.rejects(
      () => deleteTask(TASK_ID),
      (err) => {
        assert.equal(err.code, 'NOT_FOUND');
        assert.equal(err.message, 'Task not found');
        return true;
      }
    );
  });
});
