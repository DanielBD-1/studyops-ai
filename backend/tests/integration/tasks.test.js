import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { applyTestEnv } from '../helpers/testEnv.js';
import { setSupabaseAdminClientForTests } from '../../src/config/supabase.js';
import {
  createTasksMockSupabaseClient,
  OWN_COURSE_ID,
  OTHER_USER_COURSE_ID,
  OWN_MATERIAL_ID,
  OWN_TASK_ID,
  OTHER_USER_TASK_ID,
} from '../helpers/mockSupabaseTasks.js';

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
});
