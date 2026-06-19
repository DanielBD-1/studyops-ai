import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { applyTestEnv } from '../helpers/testEnv.js';
import { setSupabaseAdminClientForTests } from '../../src/config/supabase.js';
import {
  createTasksMockSupabaseClient,
  getMockTasks,
  OWN_COURSE_ID,
  OTHER_USER_COURSE_ID,
  OWN_MATERIAL_ID,
  OWN_TASK_ID,
  OTHER_USER_TASK_ID,
} from '../helpers/mockSupabaseTasks.js';
import { TEST_USER_ID } from '../helpers/mockSupabaseStudyMaterials.js';

applyTestEnv();
setSupabaseAdminClientForTests(createTasksMockSupabaseClient());

const { default: app } = await import('../../src/app.js');

function listen(server) {
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

/**
 * @param {string} url
 * @param {import('node:http').RequestOptions & { body?: object }} options
 */
function request(url, options = {}) {
  const { body, method = 'GET', headers = {} } = options;
  const parsed = new URL(url);
  const payload = body !== undefined ? JSON.stringify(body) : undefined;

  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: parsed.hostname,
        port: parsed.port,
        path: parsed.pathname + parsed.search,
        method,
        headers: {
          ...(payload
            ? {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload),
              }
            : {}),
          ...headers,
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          resolve({ statusCode: res.statusCode, body: JSON.parse(data) });
        });
      }
    );
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

function assertNoContentOrPlan(value, path = 'root') {
  if (value === null || value === undefined) return;
  if (typeof value !== 'object') return;
  assert.equal('content' in value, false, `content at ${path}`);
  assert.equal('plan' in value, false, `plan at ${path}`);
  for (const [key, child] of Object.entries(value)) {
    assertNoContentOrPlan(child, `${path}.${key}`);
  }
}

describe('tasks API integration', () => {
  /** @type {import('node:http').Server} */
  let server;
  /** @type {number} */
  let port;

  before(async () => {
    server = http.createServer(app);
    await listen(server);
    port = /** @type {import('node:net').AddressInfo} */ (server.address()).port;
  });

  after(() => new Promise((resolve) => server.close(resolve)));

  const base = () => `http://127.0.0.1:${port}`;
  const auth = { Authorization: 'Bearer valid-token' };

  it('GET /api/tasks returns 401 without Authorization', async () => {
    const { statusCode, body } = await request(`${base()}/api/tasks`);
    assert.equal(statusCode, 401);
    assert.equal(body.error.code, 'AUTH_REQUIRED');
  });

  it('course task create and list happy path', async () => {
    const createRes = await request(`${base()}/api/courses/${OWN_COURSE_ID}/tasks`, {
      method: 'POST',
      headers: auth,
      body: {
        title: 'Integration task title',
        estimatedMinutes: 20,
        materialId: OWN_MATERIAL_ID,
      },
    });
    assert.equal(createRes.statusCode, 201);
    assertNoContentOrPlan(createRes.body.data);
    const task = createRes.body.data.task;
    assert.equal(task.status, 'pending');
    assert.equal(task.difficulty, 'medium');
    assert.equal(task.dueDate, null);
    assert.deepEqual(task.tags, []);
    assert.equal('userId' in task, false);

    const listRes = await request(`${base()}/api/courses/${OWN_COURSE_ID}/tasks`, {
      headers: auth,
    });
    assert.equal(listRes.statusCode, 200);
    assert.ok(listRes.body.data.tasks.length >= 1);
    assertNoContentOrPlan(listRes.body.data);
  });

  it('GET /api/tasks global list happy path', async () => {
    const { statusCode, body } = await request(`${base()}/api/tasks`, { headers: auth });
    assert.equal(statusCode, 200);
    assert.ok(Array.isArray(body.data.tasks));
    assertNoContentOrPlan(body.data);
  });

  it('PATCH, complete, and DELETE happy path', async () => {
    const patchRes = await request(`${base()}/api/tasks/${OWN_TASK_ID}`, {
      method: 'PATCH',
      headers: auth,
      body: { title: 'Updated task title name' },
    });
    assert.equal(patchRes.statusCode, 200);
    assert.equal(patchRes.body.data.task.title, 'Updated task title name');

    const completeRes = await request(`${base()}/api/tasks/${OWN_TASK_ID}/complete`, {
      method: 'POST',
      headers: auth,
      body: {},
    });
    assert.equal(completeRes.statusCode, 200);
    assert.equal(completeRes.body.data.task.status, 'completed');

    const completeAgain = await request(`${base()}/api/tasks/${OWN_TASK_ID}/complete`, {
      method: 'POST',
      headers: auth,
      body: {},
    });
    assert.equal(completeAgain.statusCode, 200);
    assert.equal(completeAgain.body.data.task.status, 'completed');

    const deleteRes = await request(`${base()}/api/tasks/${OWN_TASK_ID}`, {
      method: 'DELETE',
      headers: auth,
    });
    assert.equal(deleteRes.statusCode, 200);
    assert.equal(deleteRes.body.data.deleted, true);
  });

  it('returns 404 for wrong-owner task', async () => {
    const { statusCode, body } = await request(`${base()}/api/tasks/${OTHER_USER_TASK_ID}`, {
      method: 'PATCH',
      headers: auth,
      body: { title: 'Should not apply' },
    });
    assert.equal(statusCode, 404);
    assert.equal(body.error.message, 'Task not found');
  });

  it('returns 404 for another users course task list', async () => {
    const { statusCode, body } = await request(
      `${base()}/api/courses/${OTHER_USER_COURSE_ID}/tasks`,
      { headers: auth }
    );
    assert.equal(statusCode, 404);
    assert.equal(body.error.message, 'Course not found');
  });

  it('rejects forbidden fields on create', async () => {
    const { statusCode, body } = await request(`${base()}/api/courses/${OWN_COURSE_ID}/tasks`, {
      method: 'POST',
      headers: auth,
      body: {
        title: 'Forbidden field task',
        estimatedMinutes: 15,
        status: 'completed',
      },
    });
    assert.equal(statusCode, 400);
    assert.equal(body.error.code, 'VALIDATION_ERROR');
  });

  it('rejects PATCH status field', async () => {
    const createRes = await request(`${base()}/api/courses/${OWN_COURSE_ID}/tasks`, {
      method: 'POST',
      headers: auth,
      body: { title: 'Task for status patch', estimatedMinutes: 10 },
    });
    const taskId = createRes.body.data.task.id;

    const { statusCode, body } = await request(`${base()}/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: auth,
      body: { status: 'completed' },
    });
    assert.equal(statusCode, 400);
    assert.equal(body.error.code, 'VALIDATION_ERROR');
  });

  it('create with due date returns dueDate', async () => {
    const createRes = await request(`${base()}/api/courses/${OWN_COURSE_ID}/tasks`, {
      method: 'POST',
      headers: auth,
      body: {
        title: 'Task with due date integration',
        estimatedMinutes: 15,
        dueDate: '2026-07-04',
      },
    });
    assert.equal(createRes.statusCode, 201);
    assert.equal(createRes.body.data.task.dueDate, '2026-07-04');
  });

  it('create without due date returns dueDate null', async () => {
    const createRes = await request(`${base()}/api/courses/${OWN_COURSE_ID}/tasks`, {
      method: 'POST',
      headers: auth,
      body: {
        title: 'Task without due date integration',
        estimatedMinutes: 15,
      },
    });
    assert.equal(createRes.statusCode, 201);
    assert.equal(createRes.body.data.task.dueDate, null);
  });

  it('PATCH sets due date', async () => {
    const createRes = await request(`${base()}/api/courses/${OWN_COURSE_ID}/tasks`, {
      method: 'POST',
      headers: auth,
      body: { title: 'Task to set due date', estimatedMinutes: 20 },
    });
    const taskId = createRes.body.data.task.id;

    const patchRes = await request(`${base()}/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: auth,
      body: { dueDate: '2026-10-01' },
    });
    assert.equal(patchRes.statusCode, 200);
    assert.equal(patchRes.body.data.task.dueDate, '2026-10-01');
  });

  it('PATCH omits dueDate and preserves existing due date', async () => {
    const originalDueDate = '2026-08-15';
    const createRes = await request(`${base()}/api/courses/${OWN_COURSE_ID}/tasks`, {
      method: 'POST',
      headers: auth,
      body: {
        title: 'Task with due date to preserve',
        estimatedMinutes: 20,
        dueDate: originalDueDate,
      },
    });
    const taskId = createRes.body.data.task.id;
    assert.equal(createRes.body.data.task.dueDate, originalDueDate);

    const patchRes = await request(`${base()}/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: auth,
      body: { title: 'Renamed without touching due date' },
    });
    assert.equal(patchRes.statusCode, 200);
    assert.equal(patchRes.body.data.task.title, 'Renamed without touching due date');
    assert.equal(patchRes.body.data.task.dueDate, originalDueDate);

    const stored = getMockTasks().find((t) => t.id === taskId);
    assert.ok(stored);
    assert.equal(stored.due_date, originalDueDate);
  });

  it('PATCH clears due date with null', async () => {
    const createRes = await request(`${base()}/api/courses/${OWN_COURSE_ID}/tasks`, {
      method: 'POST',
      headers: auth,
      body: {
        title: 'Task to clear due date',
        estimatedMinutes: 20,
        dueDate: '2026-10-01',
      },
    });
    const taskId = createRes.body.data.task.id;

    const patchRes = await request(`${base()}/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: auth,
      body: { dueDate: null },
    });
    assert.equal(patchRes.statusCode, 200);
    assert.equal(patchRes.body.data.task.dueDate, null);
  });

  it('rejects invalid due date with 400', async () => {
    const { statusCode, body } = await request(`${base()}/api/courses/${OWN_COURSE_ID}/tasks`, {
      method: 'POST',
      headers: auth,
      body: {
        title: 'Invalid due date task',
        estimatedMinutes: 20,
        dueDate: '2026-02-30',
      },
    });
    assert.equal(statusCode, 400);
    assert.equal(body.error.code, 'VALIDATION_ERROR');
  });

  it('rejects empty string due date with 400', async () => {
    const { statusCode, body } = await request(`${base()}/api/courses/${OWN_COURSE_ID}/tasks`, {
      method: 'POST',
      headers: auth,
      body: {
        title: 'Empty due date task',
        estimatedMinutes: 20,
        dueDate: '',
      },
    });
    assert.equal(statusCode, 400);
    assert.equal(body.error.code, 'VALIDATION_ERROR');
  });

  it('accepts past due date on create', async () => {
    const createRes = await request(`${base()}/api/courses/${OWN_COURSE_ID}/tasks`, {
      method: 'POST',
      headers: auth,
      body: {
        title: 'Past due date task',
        estimatedMinutes: 20,
        dueDate: '1999-05-05',
      },
    });
    assert.equal(createRes.statusCode, 201);
    assert.equal(createRes.body.data.task.dueDate, '1999-05-05');
  });
});

describe('tasks API deadline filters', () => {
  /** @type {import('node:http').Server} */
  let server;
  /** @type {number} */
  let port;

  const REFERENCE_DATE = '2026-06-18';

  before(async () => {
    server = http.createServer(app);
    await listen(server);
    port = /** @type {import('node:net').AddressInfo} */ (server.address()).port;
  });

  after(() => new Promise((resolve) => server.close(resolve)));

  const base = () => `http://127.0.0.1:${port}`;
  const auth = { Authorization: 'Bearer valid-token' };

  function seedDeadlineTasks() {
    const existing = getMockTasks();
    existing.length = 0;
    existing.push(
      {
        id: '11111111-1111-4111-8111-111111111111',
        user_id: TEST_USER_ID,
        course_id: OWN_COURSE_ID,
        material_id: null,
        title: 'Past pending task',
        description: '',
        priority: 'medium',
        estimated_minutes: 20,
        difficulty: 'medium',
        tags: [],
        status: 'pending',
        source: 'manual',
        due_date: '2026-06-10',
        created_at: '2026-01-01T00:00:00.000Z',
        updated_at: '2026-01-01T00:00:00.000Z',
      },
      {
        id: '22222222-2222-4222-8222-222222222222',
        user_id: TEST_USER_ID,
        course_id: OWN_COURSE_ID,
        material_id: null,
        title: 'Due today pending task',
        description: '',
        priority: 'medium',
        estimated_minutes: 20,
        difficulty: 'medium',
        tags: [],
        status: 'pending',
        source: 'manual',
        due_date: REFERENCE_DATE,
        created_at: '2026-01-02T00:00:00.000Z',
        updated_at: '2026-01-02T00:00:00.000Z',
      },
      {
        id: '33333333-3333-4333-8333-333333333333',
        user_id: TEST_USER_ID,
        course_id: OWN_COURSE_ID,
        material_id: null,
        title: 'Future pending task',
        description: '',
        priority: 'medium',
        estimated_minutes: 20,
        difficulty: 'medium',
        tags: [],
        status: 'pending',
        source: 'manual',
        due_date: '2026-06-25',
        created_at: '2026-01-03T00:00:00.000Z',
        updated_at: '2026-01-03T00:00:00.000Z',
      },
      {
        id: '44444444-4444-4444-8444-444444444444',
        user_id: TEST_USER_ID,
        course_id: OWN_COURSE_ID,
        material_id: null,
        title: 'Null due pending task',
        description: '',
        priority: 'medium',
        estimated_minutes: 20,
        difficulty: 'medium',
        tags: [],
        status: 'pending',
        source: 'manual',
        due_date: null,
        created_at: '2026-01-04T00:00:00.000Z',
        updated_at: '2026-01-04T00:00:00.000Z',
      },
      {
        id: '55555555-5555-4555-8555-555555555555',
        user_id: TEST_USER_ID,
        course_id: OWN_COURSE_ID,
        material_id: null,
        title: 'Completed past task',
        description: '',
        priority: 'medium',
        estimated_minutes: 20,
        difficulty: 'medium',
        tags: [],
        status: 'completed',
        source: 'manual',
        due_date: '2026-06-10',
        created_at: '2026-01-05T00:00:00.000Z',
        updated_at: '2026-01-05T00:00:00.000Z',
      },
      {
        id: '66666666-6666-4666-8666-666666666666',
        user_id: TEST_USER_ID,
        course_id: OWN_COURSE_ID,
        material_id: null,
        title: 'Completed due today task',
        description: '',
        priority: 'medium',
        estimated_minutes: 20,
        difficulty: 'medium',
        tags: [],
        status: 'completed',
        source: 'manual',
        due_date: REFERENCE_DATE,
        created_at: '2026-01-06T00:00:00.000Z',
        updated_at: '2026-01-06T00:00:00.000Z',
      },
      {
        id: OTHER_USER_TASK_ID,
        user_id: '99999999-9999-9999-9999-999999999999',
        course_id: OTHER_USER_COURSE_ID,
        material_id: null,
        title: 'Other user overdue task',
        description: '',
        priority: 'medium',
        estimated_minutes: 20,
        difficulty: 'medium',
        tags: [],
        status: 'pending',
        source: 'manual',
        due_date: '2026-06-10',
        created_at: '2026-01-07T00:00:00.000Z',
        updated_at: '2026-01-07T00:00:00.000Z',
      }
    );
  }

  beforeEach(() => {
    seedDeadlineTasks();
  });

  it('returns overdue pending tasks for explicit referenceDate', async () => {
    const { statusCode, body } = await request(
      `${base()}/api/tasks?deadline=overdue&referenceDate=${REFERENCE_DATE}`,
      { headers: auth }
    );
    assert.equal(statusCode, 200);
    assert.equal(body.data.tasks.length, 1);
    assert.equal(body.data.tasks[0].title, 'Past pending task');
    assert.equal(body.data.tasks[0].status, 'pending');
    assertNoContentOrPlan(body.data);
  });

  it('returns due-today pending tasks for explicit referenceDate', async () => {
    const { statusCode, body } = await request(
      `${base()}/api/tasks?deadline=due_today&referenceDate=${REFERENCE_DATE}`,
      { headers: auth }
    );
    assert.equal(statusCode, 200);
    assert.equal(body.data.tasks.length, 1);
    assert.equal(body.data.tasks[0].title, 'Due today pending task');
  });

  it('overdue and due-today sets are disjoint', async () => {
    const overdueRes = await request(
      `${base()}/api/tasks?deadline=overdue&referenceDate=${REFERENCE_DATE}`,
      { headers: auth }
    );
    const dueTodayRes = await request(
      `${base()}/api/tasks?deadline=due_today&referenceDate=${REFERENCE_DATE}`,
      { headers: auth }
    );
    const overdueIds = overdueRes.body.data.tasks.map((task) => task.id);
    const dueTodayIds = dueTodayRes.body.data.tasks.map((task) => task.id);
    assert.deepEqual(
      overdueIds.filter((id) => dueTodayIds.includes(id)),
      []
    );
  });

  it('accepts omitted status with deadline as pending-only results', async () => {
    const { statusCode, body } = await request(
      `${base()}/api/tasks?deadline=overdue&referenceDate=${REFERENCE_DATE}`,
      { headers: auth }
    );
    assert.equal(statusCode, 200);
    assert.ok(body.data.tasks.every((task) => task.status === 'pending'));
  });

  it('filters global list by courseId and deadline', async () => {
    const { statusCode, body } = await request(
      `${base()}/api/tasks?courseId=${OWN_COURSE_ID}&deadline=overdue&referenceDate=${REFERENCE_DATE}`,
      { headers: auth }
    );
    assert.equal(statusCode, 200);
    assert.equal(body.data.tasks.length, 1);
    assert.equal(body.data.tasks[0].courseId, OWN_COURSE_ID);
  });

  it('filters course route tasks by deadline', async () => {
    const { statusCode, body } = await request(
      `${base()}/api/courses/${OWN_COURSE_ID}/tasks?deadline=due_today&referenceDate=${REFERENCE_DATE}`,
      { headers: auth }
    );
    assert.equal(statusCode, 200);
    assert.equal(body.data.tasks.length, 1);
    assert.equal(body.data.tasks[0].title, 'Due today pending task');
  });

  it('returns 404 for wrong-owner course with deadline filter', async () => {
    const { statusCode, body } = await request(
      `${base()}/api/courses/${OTHER_USER_COURSE_ID}/tasks?deadline=overdue&referenceDate=${REFERENCE_DATE}`,
      { headers: auth }
    );
    assert.equal(statusCode, 404);
    assert.equal(body.error.message, 'Course not found');
  });

  it('preserves status-only list behavior without deadline', async () => {
    const { statusCode, body } = await request(`${base()}/api/tasks?status=completed`, {
      headers: auth,
    });
    assert.equal(statusCode, 200);
    assert.equal(body.data.tasks.length, 2);
    assert.ok(body.data.tasks.every((task) => task.status === 'completed'));
  });

  it('returns camelCase task fields without sensitive data', async () => {
    const { statusCode, body } = await request(
      `${base()}/api/tasks?deadline=overdue&referenceDate=${REFERENCE_DATE}`,
      { headers: auth }
    );
    assert.equal(statusCode, 200);
    const task = body.data.tasks[0];
    assert.equal(typeof task.courseId, 'string');
    assert.equal('userId' in task, false);
    assertNoContentOrPlan(body.data);
  });

  it('returns 400 for invalid deadline', async () => {
    const { statusCode, body } = await request(
      `${base()}/api/tasks?deadline=due_soon&referenceDate=${REFERENCE_DATE}`,
      { headers: auth }
    );
    assert.equal(statusCode, 400);
    assert.equal(body.error.code, 'VALIDATION_ERROR');
  });

  it('returns 400 for referenceDate without deadline', async () => {
    const { statusCode, body } = await request(
      `${base()}/api/tasks?referenceDate=${REFERENCE_DATE}`,
      { headers: auth }
    );
    assert.equal(statusCode, 400);
    assert.equal(body.error.code, 'VALIDATION_ERROR');
  });

  it('returns 400 for completed status with deadline', async () => {
    const { statusCode, body } = await request(
      `${base()}/api/tasks?status=completed&deadline=overdue&referenceDate=${REFERENCE_DATE}`,
      { headers: auth }
    );
    assert.equal(statusCode, 400);
    assert.equal(body.error.code, 'VALIDATION_ERROR');
  });

  it('returns 400 for empty referenceDate', async () => {
    const { statusCode, body } = await request(
      `${base()}/api/tasks?deadline=overdue&referenceDate=`,
      { headers: auth }
    );
    assert.equal(statusCode, 400);
    assert.equal(body.error.code, 'VALIDATION_ERROR');
  });

  it('returns 400 for malformed referenceDate', async () => {
    const { statusCode, body } = await request(
      `${base()}/api/tasks?deadline=overdue&referenceDate=2026-06-18T00:00:00.000Z`,
      { headers: auth }
    );
    assert.equal(statusCode, 400);
    assert.equal(body.error.code, 'VALIDATION_ERROR');
  });

  it('returns 400 for impossible referenceDate', async () => {
    const { statusCode, body } = await request(
      `${base()}/api/tasks?deadline=overdue&referenceDate=2026-02-30`,
      { headers: auth }
    );
    assert.equal(statusCode, 400);
    assert.equal(body.error.code, 'VALIDATION_ERROR');
  });

  it('returns 400 for repeated deadline query values', async () => {
    const { statusCode, body } = await request(
      `${base()}/api/tasks?deadline=overdue&deadline=due_today&referenceDate=${REFERENCE_DATE}`,
      { headers: auth }
    );
    assert.equal(statusCode, 400);
    assert.equal(body.error.code, 'VALIDATION_ERROR');
  });

  it('uses UTC fallback when referenceDate omitted with deadline', async () => {
    const { statusCode } = await request(`${base()}/api/tasks?deadline=overdue`, {
      headers: auth,
    });
    assert.equal(statusCode, 200);
  });
});

describe('tasks API list ordering', () => {
  /** @type {import('node:http').Server} */
  let server;
  /** @type {number} */
  let port;

  const REFERENCE_DATE = '2026-06-18';

  const ID_OVERDUE_OLDEST = '11111111-1111-4111-8111-111111111111';
  const ID_OVERDUE_NEWER = '22222222-2222-4222-8222-222222222222';
  const ID_DUE_TODAY = '33333333-3333-4333-8333-333333333333';
  const ID_FUTURE_EARLIER = '44444444-4444-4444-8444-444444444444';
  const ID_FUTURE_LATER = '55555555-5555-4555-8555-555555555555';
  const ID_NULL_DUE = '66666666-6666-4666-8666-666666666666';
  const ID_TIE_OLDER_CREATED = '77777777-7777-4777-8777-777777777771';
  const ID_TIE_NEWER_CREATED = '77777777-7777-4777-8777-777777777772';
  const ID_TIE_ID_A = '88888888-8888-4888-8888-888888888881';
  const ID_TIE_ID_B = '88888888-8888-4888-8888-888888888882';
  const ID_COMPLETED_NEWER = '99999999-9999-4999-8999-999999999991';
  const ID_COMPLETED_OLDER = '99999999-9999-4999-8999-999999999992';
  const ID_ALL_RECENT_PENDING = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
  const ID_ALL_OLDER_COMPLETED = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

  before(async () => {
    server = http.createServer(app);
    await listen(server);
    port = /** @type {import('node:net').AddressInfo} */ (server.address()).port;
  });

  after(() => new Promise((resolve) => server.close(resolve)));

  const base = () => `http://127.0.0.1:${port}`;
  const auth = { Authorization: 'Bearer valid-token' };

  function seedOrderingTasks() {
    const existing = getMockTasks();
    existing.length = 0;
    existing.push(
      {
        id: ID_OVERDUE_OLDEST,
        user_id: TEST_USER_ID,
        course_id: OWN_COURSE_ID,
        material_id: null,
        title: 'Oldest overdue',
        description: '',
        priority: 'medium',
        estimated_minutes: 20,
        difficulty: 'medium',
        tags: [],
        status: 'pending',
        source: 'manual',
        due_date: '2026-06-01',
        created_at: '2026-01-01T00:00:00.000Z',
        updated_at: '2026-01-01T00:00:00.000Z',
      },
      {
        id: ID_OVERDUE_NEWER,
        user_id: TEST_USER_ID,
        course_id: OWN_COURSE_ID,
        material_id: null,
        title: 'Newer overdue',
        description: '',
        priority: 'medium',
        estimated_minutes: 20,
        difficulty: 'medium',
        tags: [],
        status: 'pending',
        source: 'manual',
        due_date: '2026-06-10',
        created_at: '2026-01-02T00:00:00.000Z',
        updated_at: '2026-01-02T00:00:00.000Z',
      },
      {
        id: ID_DUE_TODAY,
        user_id: TEST_USER_ID,
        course_id: OWN_COURSE_ID,
        material_id: null,
        title: 'Due today',
        description: '',
        priority: 'medium',
        estimated_minutes: 20,
        difficulty: 'medium',
        tags: [],
        status: 'pending',
        source: 'manual',
        due_date: REFERENCE_DATE,
        created_at: '2026-01-03T00:00:00.000Z',
        updated_at: '2026-01-03T00:00:00.000Z',
      },
      {
        id: ID_FUTURE_EARLIER,
        user_id: TEST_USER_ID,
        course_id: OWN_COURSE_ID,
        material_id: null,
        title: 'Earlier future',
        description: '',
        priority: 'medium',
        estimated_minutes: 20,
        difficulty: 'medium',
        tags: [],
        status: 'pending',
        source: 'manual',
        due_date: '2026-06-20',
        created_at: '2026-01-04T00:00:00.000Z',
        updated_at: '2026-01-04T00:00:00.000Z',
      },
      {
        id: ID_FUTURE_LATER,
        user_id: TEST_USER_ID,
        course_id: OWN_COURSE_ID,
        material_id: null,
        title: 'Later future',
        description: '',
        priority: 'medium',
        estimated_minutes: 20,
        difficulty: 'medium',
        tags: [],
        status: 'pending',
        source: 'manual',
        due_date: '2026-06-25',
        created_at: '2026-01-05T00:00:00.000Z',
        updated_at: '2026-01-05T00:00:00.000Z',
      },
      {
        id: ID_NULL_DUE,
        user_id: TEST_USER_ID,
        course_id: OWN_COURSE_ID,
        material_id: null,
        title: 'No due date',
        description: '',
        priority: 'medium',
        estimated_minutes: 20,
        difficulty: 'medium',
        tags: [],
        status: 'pending',
        source: 'manual',
        due_date: null,
        created_at: '2026-01-06T00:00:00.000Z',
        updated_at: '2026-01-06T00:00:00.000Z',
      },
      {
        id: ID_TIE_OLDER_CREATED,
        user_id: TEST_USER_ID,
        course_id: OWN_COURSE_ID,
        material_id: null,
        title: 'Same due older created',
        description: '',
        priority: 'medium',
        estimated_minutes: 20,
        difficulty: 'medium',
        tags: [],
        status: 'pending',
        source: 'manual',
        due_date: '2026-07-01',
        created_at: '2026-01-07T00:00:00.000Z',
        updated_at: '2026-01-07T00:00:00.000Z',
      },
      {
        id: ID_TIE_NEWER_CREATED,
        user_id: TEST_USER_ID,
        course_id: OWN_COURSE_ID,
        material_id: null,
        title: 'Same due newer created',
        description: '',
        priority: 'medium',
        estimated_minutes: 20,
        difficulty: 'medium',
        tags: [],
        status: 'pending',
        source: 'manual',
        due_date: '2026-07-01',
        created_at: '2026-01-08T00:00:00.000Z',
        updated_at: '2026-01-08T00:00:00.000Z',
      },
      {
        id: ID_TIE_ID_A,
        user_id: TEST_USER_ID,
        course_id: OWN_COURSE_ID,
        material_id: null,
        title: 'Same due and created A',
        description: '',
        priority: 'medium',
        estimated_minutes: 20,
        difficulty: 'medium',
        tags: [],
        status: 'pending',
        source: 'manual',
        due_date: '2026-07-02',
        created_at: '2026-01-09T00:00:00.000Z',
        updated_at: '2026-01-09T00:00:00.000Z',
      },
      {
        id: ID_TIE_ID_B,
        user_id: TEST_USER_ID,
        course_id: OWN_COURSE_ID,
        material_id: null,
        title: 'Same due and created B',
        description: '',
        priority: 'medium',
        estimated_minutes: 20,
        difficulty: 'medium',
        tags: [],
        status: 'pending',
        source: 'manual',
        due_date: '2026-07-02',
        created_at: '2026-01-09T00:00:00.000Z',
        updated_at: '2026-01-09T00:00:00.000Z',
      },
      {
        id: ID_COMPLETED_NEWER,
        user_id: TEST_USER_ID,
        course_id: OWN_COURSE_ID,
        material_id: null,
        title: 'Completed newer',
        description: '',
        priority: 'medium',
        estimated_minutes: 20,
        difficulty: 'medium',
        tags: [],
        status: 'completed',
        source: 'manual',
        due_date: '2026-05-01',
        created_at: '2026-02-02T00:00:00.000Z',
        updated_at: '2026-02-02T00:00:00.000Z',
      },
      {
        id: ID_COMPLETED_OLDER,
        user_id: TEST_USER_ID,
        course_id: OWN_COURSE_ID,
        material_id: null,
        title: 'Completed older',
        description: '',
        priority: 'medium',
        estimated_minutes: 20,
        difficulty: 'medium',
        tags: [],
        status: 'completed',
        source: 'manual',
        due_date: '2026-05-15',
        created_at: '2026-02-01T00:00:00.000Z',
        updated_at: '2026-02-01T00:00:00.000Z',
      },
      {
        id: ID_ALL_RECENT_PENDING,
        user_id: TEST_USER_ID,
        course_id: OWN_COURSE_ID,
        material_id: null,
        title: 'Recent pending for all-status',
        description: '',
        priority: 'medium',
        estimated_minutes: 20,
        difficulty: 'medium',
        tags: [],
        status: 'pending',
        source: 'manual',
        due_date: '2026-12-01',
        created_at: '2026-03-01T00:00:00.000Z',
        updated_at: '2026-03-01T00:00:00.000Z',
      },
      {
        id: ID_ALL_OLDER_COMPLETED,
        user_id: TEST_USER_ID,
        course_id: OWN_COURSE_ID,
        material_id: null,
        title: 'Older completed for all-status',
        description: '',
        priority: 'medium',
        estimated_minutes: 20,
        difficulty: 'medium',
        tags: [],
        status: 'completed',
        source: 'manual',
        due_date: null,
        created_at: '2026-03-10T00:00:00.000Z',
        updated_at: '2026-03-10T00:00:00.000Z',
      },
      {
        id: OTHER_USER_TASK_ID,
        user_id: '99999999-9999-9999-9999-999999999999',
        course_id: OTHER_USER_COURSE_ID,
        material_id: null,
        title: 'Other user overdue task',
        description: '',
        priority: 'medium',
        estimated_minutes: 20,
        difficulty: 'medium',
        tags: [],
        status: 'pending',
        source: 'manual',
        due_date: '2026-06-01',
        created_at: '2026-01-10T00:00:00.000Z',
        updated_at: '2026-01-10T00:00:00.000Z',
      }
    );
  }

  beforeEach(() => {
    seedOrderingTasks();
  });

  it('orders global pending tasks by due date ascending with null due dates last', async () => {
    const { statusCode, body } = await request(`${base()}/api/tasks?status=pending`, {
      headers: auth,
    });
    assert.equal(statusCode, 200);
    assert.deepEqual(
      body.data.tasks.map((task) => task.id),
      [
        ID_OVERDUE_OLDEST,
        ID_OVERDUE_NEWER,
        ID_DUE_TODAY,
        ID_FUTURE_EARLIER,
        ID_FUTURE_LATER,
        ID_TIE_NEWER_CREATED,
        ID_TIE_OLDER_CREATED,
        ID_TIE_ID_A,
        ID_TIE_ID_B,
        ID_ALL_RECENT_PENDING,
        ID_NULL_DUE,
      ]
    );
    assertNoContentOrPlan(body.data);
  });

  it('breaks equal due dates by created_at descending', async () => {
    const { statusCode, body } = await request(`${base()}/api/tasks?status=pending`, {
      headers: auth,
    });
    assert.equal(statusCode, 200);
    const tieIds = body.data.tasks
      .filter((task) => task.dueDate === '2026-07-01')
      .map((task) => task.id);
    assert.deepEqual(tieIds, [ID_TIE_NEWER_CREATED, ID_TIE_OLDER_CREATED]);
  });

  it('breaks equal due date and created_at by id ascending', async () => {
    const { statusCode, body } = await request(`${base()}/api/tasks?status=pending`, {
      headers: auth,
    });
    assert.equal(statusCode, 200);
    const tieIds = body.data.tasks
      .filter((task) => task.dueDate === '2026-07-02')
      .map((task) => task.id);
    assert.deepEqual(tieIds, [ID_TIE_ID_A, ID_TIE_ID_B]);
  });

  it('orders overdue filter with oldest missed deadline first', async () => {
    const { statusCode, body } = await request(
      `${base()}/api/tasks?deadline=overdue&referenceDate=${REFERENCE_DATE}`,
      { headers: auth }
    );
    assert.equal(statusCode, 200);
    assert.deepEqual(
      body.data.tasks.map((task) => task.id),
      [ID_OVERDUE_OLDEST, ID_OVERDUE_NEWER]
    );
  });

  it('orders due-today filter by created_at desc then id asc', async () => {
    const extraDueTodayOlder = 'aaaaaaa1-aaaa-4aaa-8aaa-aaaaaaaaaaa1';
    const extraDueTodayNewer = 'aaaaaaa2-aaaa-4aaa-8aaa-aaaaaaaaaaa2';
    getMockTasks().push(
      {
        id: extraDueTodayOlder,
        user_id: TEST_USER_ID,
        course_id: OWN_COURSE_ID,
        material_id: null,
        title: 'Due today older created',
        description: '',
        priority: 'medium',
        estimated_minutes: 20,
        difficulty: 'medium',
        tags: [],
        status: 'pending',
        source: 'manual',
        due_date: REFERENCE_DATE,
        created_at: '2026-01-01T00:00:00.000Z',
        updated_at: '2026-01-01T00:00:00.000Z',
      },
      {
        id: extraDueTodayNewer,
        user_id: TEST_USER_ID,
        course_id: OWN_COURSE_ID,
        material_id: null,
        title: 'Due today newer created',
        description: '',
        priority: 'medium',
        estimated_minutes: 20,
        difficulty: 'medium',
        tags: [],
        status: 'pending',
        source: 'manual',
        due_date: REFERENCE_DATE,
        created_at: '2026-01-09T00:00:00.000Z',
        updated_at: '2026-01-09T00:00:00.000Z',
      }
    );

    const { statusCode, body } = await request(
      `${base()}/api/tasks?deadline=due_today&referenceDate=${REFERENCE_DATE}`,
      { headers: auth }
    );
    assert.equal(statusCode, 200);
    assert.deepEqual(
      body.data.tasks.map((task) => task.id),
      [extraDueTodayNewer, ID_DUE_TODAY, extraDueTodayOlder]
    );
  });

  it('applies the same pending ordering on the course task list route', async () => {
    const { statusCode, body } = await request(
      `${base()}/api/courses/${OWN_COURSE_ID}/tasks?status=pending`,
      { headers: auth }
    );
    assert.equal(statusCode, 200);
    assert.deepEqual(
      body.data.tasks.map((task) => task.id),
      [
        ID_OVERDUE_OLDEST,
        ID_OVERDUE_NEWER,
        ID_DUE_TODAY,
        ID_FUTURE_EARLIER,
        ID_FUTURE_LATER,
        ID_TIE_NEWER_CREATED,
        ID_TIE_OLDER_CREATED,
        ID_TIE_ID_A,
        ID_TIE_ID_B,
        ID_ALL_RECENT_PENDING,
        ID_NULL_DUE,
      ]
    );
  });

  it('orders course overdue filter with oldest missed deadline first', async () => {
    const { statusCode, body } = await request(
      `${base()}/api/courses/${OWN_COURSE_ID}/tasks?deadline=overdue&referenceDate=${REFERENCE_DATE}`,
      { headers: auth }
    );
    assert.equal(statusCode, 200);
    assert.deepEqual(
      body.data.tasks.map((task) => task.id),
      [ID_OVERDUE_OLDEST, ID_OVERDUE_NEWER]
    );
  });

  it('keeps completed lists on created_at desc then id asc', async () => {
    const { statusCode, body } = await request(`${base()}/api/tasks?status=completed`, {
      headers: auth,
    });
    assert.equal(statusCode, 200);
    assert.deepEqual(
      body.data.tasks.map((task) => task.id),
      [ID_ALL_OLDER_COMPLETED, ID_COMPLETED_NEWER, ID_COMPLETED_OLDER]
    );
  });

  it('keeps all-status lists on created_at desc then id asc', async () => {
    const { statusCode, body } = await request(`${base()}/api/tasks`, { headers: auth });
    assert.equal(statusCode, 200);
    assert.equal(body.data.tasks[0].id, ID_ALL_OLDER_COMPLETED);
    assert.equal(body.data.tasks[1].id, ID_ALL_RECENT_PENDING);
    assert.ok(body.data.tasks.every((task) => task.courseId === OWN_COURSE_ID || task.id));
    assert.equal('userId' in body.data.tasks[0], false);
  });

  it('returns stable ordering for repeated identical requests', async () => {
    const url = `${base()}/api/tasks?status=pending`;
    const first = await request(url, { headers: auth });
    const second = await request(url, { headers: auth });
    assert.equal(first.statusCode, 200);
    assert.equal(second.statusCode, 200);
    assert.deepEqual(
      first.body.data.tasks.map((task) => task.id),
      second.body.data.tasks.map((task) => task.id)
    );
  });

  it('returns 404 for wrong-owner course on ordered course list', async () => {
    const { statusCode, body } = await request(
      `${base()}/api/courses/${OTHER_USER_COURSE_ID}/tasks?status=pending`,
      { headers: auth }
    );
    assert.equal(statusCode, 404);
    assert.equal(body.error.message, 'Course not found');
  });
});
