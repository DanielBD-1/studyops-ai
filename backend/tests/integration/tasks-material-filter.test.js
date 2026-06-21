import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { applyTestEnv } from '../helpers/testEnv.js';
import { setSupabaseAdminClientForTests } from '../../src/config/supabase.js';
import {
  createTasksMockSupabaseClient,
  getMockTasks,
  getLastStudyTasksSelectColumns,
  resetTasksMockTelemetry,
  OWN_COURSE_ID,
  OTHER_USER_COURSE_ID,
  OWN_MATERIAL_ID,
  OTHER_USER_MATERIAL_ID,
  OWN_TASK_ID,
  OTHER_USER_TASK_ID,
} from '../helpers/mockSupabaseTasks.js';
import { TEST_USER_ID } from '../helpers/mockSupabaseStudyMaterials.js';

applyTestEnv();
setSupabaseAdminClientForTests(createTasksMockSupabaseClient());

const { default: app } = await import('../../src/app.js');

const MISSING_MATERIAL_ID = '00000000-0000-4000-8000-000000000002';
const REFERENCE_DATE = '2026-06-19';

const ID_UNLINKED_OWN = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa01';
const ID_UNLINKED_OTHER = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa02';
const ID_LINKED_OWN = OWN_TASK_ID;
const ID_COMPLETED_LINKED = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa03';
const ID_OVERDUE_LINKED = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa04';
const ID_DUE_TODAY_LINKED = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa05';
const ID_NEXT7_LINKED = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa06';

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

function seedMaterialFilterTasks() {
  const rows = getMockTasks();
  rows.length = 0;
  rows.push(
    {
      id: ID_LINKED_OWN,
      user_id: TEST_USER_ID,
      course_id: OWN_COURSE_ID,
      material_id: OWN_MATERIAL_ID,
      title: 'Linked pending task',
      description: '',
      priority: 'medium',
      estimated_minutes: 30,
      difficulty: 'medium',
      tags: [],
      status: 'pending',
      source: 'manual',
      due_date: null,
      created_at: '2026-01-10T00:00:00.000Z',
      updated_at: '2026-01-10T00:00:00.000Z',
    },
    {
      id: ID_UNLINKED_OWN,
      user_id: TEST_USER_ID,
      course_id: OWN_COURSE_ID,
      material_id: null,
      title: 'Unlinked own course task',
      description: '',
      priority: 'medium',
      estimated_minutes: 20,
      difficulty: 'medium',
      tags: [],
      status: 'pending',
      source: 'manual',
      due_date: null,
      created_at: '2026-01-09T00:00:00.000Z',
      updated_at: '2026-01-09T00:00:00.000Z',
    },
    {
      id: ID_COMPLETED_LINKED,
      user_id: TEST_USER_ID,
      course_id: OWN_COURSE_ID,
      material_id: OWN_MATERIAL_ID,
      title: 'Linked completed task',
      description: '',
      priority: 'medium',
      estimated_minutes: 25,
      difficulty: 'medium',
      tags: [],
      status: 'completed',
      source: 'manual',
      due_date: null,
      created_at: '2026-01-08T00:00:00.000Z',
      updated_at: '2026-01-08T00:00:00.000Z',
    },
    {
      id: ID_OVERDUE_LINKED,
      user_id: TEST_USER_ID,
      course_id: OWN_COURSE_ID,
      material_id: OWN_MATERIAL_ID,
      title: 'Linked overdue task',
      description: '',
      priority: 'medium',
      estimated_minutes: 20,
      difficulty: 'medium',
      tags: [],
      status: 'pending',
      source: 'manual',
      due_date: '2026-06-01',
      created_at: '2026-01-07T00:00:00.000Z',
      updated_at: '2026-01-07T00:00:00.000Z',
    },
    {
      id: ID_DUE_TODAY_LINKED,
      user_id: TEST_USER_ID,
      course_id: OWN_COURSE_ID,
      material_id: OWN_MATERIAL_ID,
      title: 'Linked due today task',
      description: '',
      priority: 'medium',
      estimated_minutes: 20,
      difficulty: 'medium',
      tags: [],
      status: 'pending',
      source: 'manual',
      due_date: REFERENCE_DATE,
      created_at: '2026-01-06T00:00:00.000Z',
      updated_at: '2026-01-06T00:00:00.000Z',
    },
    {
      id: ID_NEXT7_LINKED,
      user_id: TEST_USER_ID,
      course_id: OWN_COURSE_ID,
      material_id: OWN_MATERIAL_ID,
      title: 'Linked next week task',
      description: '',
      priority: 'medium',
      estimated_minutes: 20,
      difficulty: 'medium',
      tags: [],
      status: 'pending',
      source: 'manual',
      due_date: '2026-06-22',
      created_at: '2026-01-05T00:00:00.000Z',
      updated_at: '2026-01-05T00:00:00.000Z',
    },
    {
      id: OTHER_USER_TASK_ID,
      user_id: '99999999-9999-9999-9999-999999999999',
      course_id: OTHER_USER_COURSE_ID,
      material_id: null,
      title: 'Other user unlinked task',
      description: '',
      priority: 'low',
      estimated_minutes: 15,
      difficulty: 'medium',
      tags: [],
      status: 'pending',
      source: 'manual',
      due_date: null,
      created_at: '2026-01-04T00:00:00.000Z',
      updated_at: '2026-01-04T00:00:00.000Z',
    },
    {
      id: ID_UNLINKED_OTHER,
      user_id: TEST_USER_ID,
      course_id: OTHER_USER_COURSE_ID,
      material_id: null,
      title: 'Unlinked other course task',
      description: '',
      priority: 'medium',
      estimated_minutes: 15,
      difficulty: 'medium',
      tags: [],
      status: 'pending',
      source: 'manual',
      due_date: null,
      created_at: '2026-01-03T00:00:00.000Z',
      updated_at: '2026-01-03T00:00:00.000Z',
    }
  );
}

describe('tasks API materialId filter', () => {
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

  beforeEach(() => {
    resetTasksMockTelemetry();
    seedMaterialFilterTasks();
  });

  const base = () => `http://127.0.0.1:${port}`;
  const auth = { Authorization: 'Bearer valid-token' };

  it('GET /api/tasks?materialId=<uuid> returns only linked tasks on global route', async () => {
    const { statusCode, body } = await request(
      `${base()}/api/tasks?materialId=${OWN_MATERIAL_ID}`,
      { headers: auth }
    );
    assert.equal(statusCode, 200);
    assert.deepEqual(
      body.data.tasks.map((task) => task.id).sort(),
      [ID_COMPLETED_LINKED, ID_DUE_TODAY_LINKED, ID_LINKED_OWN, ID_NEXT7_LINKED, ID_OVERDUE_LINKED].sort()
    );
    assert.ok(body.data.tasks.every((task) => task.materialId === OWN_MATERIAL_ID));
  });

  it('GET /api/courses/:courseId/tasks?materialId=<uuid> returns course linked tasks', async () => {
    const { statusCode, body } = await request(
      `${base()}/api/courses/${OWN_COURSE_ID}/tasks?materialId=${OWN_MATERIAL_ID}`,
      { headers: auth }
    );
    assert.equal(statusCode, 200);
    assert.deepEqual(
      body.data.tasks.map((task) => task.id).sort(),
      [ID_COMPLETED_LINKED, ID_DUE_TODAY_LINKED, ID_LINKED_OWN, ID_NEXT7_LINKED, ID_OVERDUE_LINKED].sort()
    );
  });

  it('global courseId + materialId matches course route parity', async () => {
    const globalRes = await request(
      `${base()}/api/tasks?courseId=${OWN_COURSE_ID}&materialId=${OWN_MATERIAL_ID}`,
      { headers: auth }
    );
    const courseRes = await request(
      `${base()}/api/courses/${OWN_COURSE_ID}/tasks?materialId=${OWN_MATERIAL_ID}`,
      { headers: auth }
    );
    assert.equal(globalRes.statusCode, 200);
    assert.equal(courseRes.statusCode, 200);
    assert.deepEqual(
      globalRes.body.data.tasks.map((task) => task.id),
      courseRes.body.data.tasks.map((task) => task.id)
    );
  });

  it('excludes unlinked tasks from UUID material filter', async () => {
    const { body } = await request(
      `${base()}/api/courses/${OWN_COURSE_ID}/tasks?materialId=${OWN_MATERIAL_ID}`,
      { headers: auth }
    );
    assert.ok(!body.data.tasks.some((task) => task.id === ID_UNLINKED_OWN));
  });

  it('returns 404 for nonexistent material UUID', async () => {
    const { statusCode, body } = await request(
      `${base()}/api/tasks?materialId=${MISSING_MATERIAL_ID}`,
      { headers: auth }
    );
    assert.equal(statusCode, 404);
    assert.equal(body.error.message, 'Study material not found');
  });

  it('returns 404 for wrong-owner material UUID', async () => {
    const { statusCode, body } = await request(
      `${base()}/api/tasks?materialId=${OTHER_USER_MATERIAL_ID}`,
      { headers: auth }
    );
    assert.equal(statusCode, 404);
    assert.equal(body.error.message, 'Study material not found');
  });

  it('returns 404 for course/material mismatch', async () => {
    const { statusCode, body } = await request(
      `${base()}/api/courses/${OWN_COURSE_ID}/tasks?materialId=${OTHER_USER_MATERIAL_ID}`,
      { headers: auth }
    );
    assert.equal(statusCode, 404);
    assert.equal(body.error.message, 'Study material not found');
  });

  it('returns 200 empty array for owned material with no linked tasks', async () => {
    const rows = getMockTasks();
    rows.length = 0;
    rows.push({
      id: ID_UNLINKED_OWN,
      user_id: TEST_USER_ID,
      course_id: OWN_COURSE_ID,
      material_id: null,
      title: 'Only unlinked',
      description: '',
      priority: 'medium',
      estimated_minutes: 20,
      difficulty: 'medium',
      tags: [],
      status: 'pending',
      source: 'manual',
      due_date: null,
      created_at: '2026-01-09T00:00:00.000Z',
      updated_at: '2026-01-09T00:00:00.000Z',
    });

    const { statusCode, body } = await request(
      `${base()}/api/courses/${OWN_COURSE_ID}/tasks?materialId=${OWN_MATERIAL_ID}`,
      { headers: auth }
    );
    assert.equal(statusCode, 200);
    assert.deepEqual(body.data.tasks, []);
  });

  it('GET /api/tasks?materialId=none returns authenticated user unlinked tasks', async () => {
    const { statusCode, body } = await request(`${base()}/api/tasks?materialId=none`, {
      headers: auth,
    });
    assert.equal(statusCode, 200);
    assert.deepEqual(
      body.data.tasks.map((task) => task.id).sort(),
      [ID_UNLINKED_OTHER, ID_UNLINKED_OWN].sort()
    );
    assert.ok(body.data.tasks.every((task) => task.materialId == null));
  });

  it('GET /api/tasks?courseId&materialId=none returns course unlinked tasks only', async () => {
    const { statusCode, body } = await request(
      `${base()}/api/tasks?courseId=${OWN_COURSE_ID}&materialId=none`,
      { headers: auth }
    );
    assert.equal(statusCode, 200);
    assert.deepEqual(body.data.tasks.map((task) => task.id), [ID_UNLINKED_OWN]);
  });

  it('GET /api/courses/:courseId/tasks?materialId=none matches global course parity', async () => {
    const globalRes = await request(
      `${base()}/api/tasks?courseId=${OWN_COURSE_ID}&materialId=none`,
      { headers: auth }
    );
    const courseRes = await request(
      `${base()}/api/courses/${OWN_COURSE_ID}/tasks?materialId=none`,
      { headers: auth }
    );
    assert.deepEqual(
      globalRes.body.data.tasks.map((task) => task.id),
      courseRes.body.data.tasks.map((task) => task.id)
    );
  });

  it('excludes linked tasks from materialId=none', async () => {
    const { body } = await request(
      `${base()}/api/courses/${OWN_COURSE_ID}/tasks?materialId=none`,
      { headers: auth }
    );
    assert.ok(!body.data.tasks.some((task) => task.materialId === OWN_MATERIAL_ID));
  });

  it('excludes other-user unlinked tasks from materialId=none', async () => {
    const { body } = await request(`${base()}/api/tasks?materialId=none`, { headers: auth });
    assert.ok(!body.data.tasks.some((task) => task.id === OTHER_USER_TASK_ID));
  });

  it('omitted materialId returns unfiltered membership', async () => {
    const { statusCode, body } = await request(`${base()}/api/tasks`, { headers: auth });
    assert.equal(statusCode, 200);
    assert.equal(body.data.tasks.length, 7);
  });

  it('returns 400 for malformed materialId', async () => {
    const { statusCode, body } = await request(`${base()}/api/tasks?materialId=not-a-uuid`, {
      headers: auth,
    });
    assert.equal(statusCode, 400);
    assert.equal(body.error.code, 'VALIDATION_ERROR');
  });

  it('returns 400 for unsupported materialId string', async () => {
    const { statusCode, body } = await request(`${base()}/api/tasks?materialId=all`, {
      headers: auth,
    });
    assert.equal(statusCode, 400);
    assert.equal(body.error.code, 'VALIDATION_ERROR');
  });

  it('returns 400 for repeated materialId query values', async () => {
    const { statusCode, body } = await request(
      `${base()}/api/tasks?materialId=${OWN_MATERIAL_ID}&materialId=none`,
      { headers: auth }
    );
    assert.equal(statusCode, 400);
    assert.equal(body.error.code, 'VALIDATION_ERROR');
  });

  it('accepts literal none on course route', async () => {
    const { statusCode } = await request(
      `${base()}/api/courses/${OWN_COURSE_ID}/tasks?materialId=none`,
      { headers: auth }
    );
    assert.equal(statusCode, 200);
  });

  it('returns 401 without Authorization for materialId filter', async () => {
    const { statusCode, body } = await request(
      `${base()}/api/tasks?materialId=${OWN_MATERIAL_ID}`
    );
    assert.equal(statusCode, 401);
    assert.equal(body.error.code, 'AUTH_REQUIRED');
  });

  it('returns 404 for wrong-owner course with materialId filter', async () => {
    const { statusCode, body } = await request(
      `${base()}/api/courses/${OTHER_USER_COURSE_ID}/tasks?materialId=none`,
      { headers: auth }
    );
    assert.equal(statusCode, 404);
    assert.equal(body.error.message, 'Course not found');
  });

  it('UUID + status=pending filters linked pending tasks', async () => {
    const { body } = await request(
      `${base()}/api/courses/${OWN_COURSE_ID}/tasks?materialId=${OWN_MATERIAL_ID}&status=pending`,
      { headers: auth }
    );
    assert.deepEqual(
      body.data.tasks.map((task) => task.id).sort(),
      [ID_DUE_TODAY_LINKED, ID_LINKED_OWN, ID_NEXT7_LINKED, ID_OVERDUE_LINKED].sort()
    );
  });

  it('UUID + status=completed filters linked completed tasks', async () => {
    const { body } = await request(
      `${base()}/api/courses/${OWN_COURSE_ID}/tasks?materialId=${OWN_MATERIAL_ID}&status=completed`,
      { headers: auth }
    );
    assert.deepEqual(body.data.tasks.map((task) => task.id), [ID_COMPLETED_LINKED]);
  });

  it('none + status=pending filters unlinked pending tasks', async () => {
    const { body } = await request(
      `${base()}/api/courses/${OWN_COURSE_ID}/tasks?materialId=none&status=pending`,
      { headers: auth }
    );
    assert.deepEqual(body.data.tasks.map((task) => task.id), [ID_UNLINKED_OWN]);
  });

  it('UUID + deadline=overdue returns linked overdue task', async () => {
    const { body } = await request(
      `${base()}/api/courses/${OWN_COURSE_ID}/tasks?materialId=${OWN_MATERIAL_ID}&deadline=overdue&referenceDate=${REFERENCE_DATE}`,
      { headers: auth }
    );
    assert.deepEqual(body.data.tasks.map((task) => task.id), [ID_OVERDUE_LINKED]);
  });

  it('none + deadline=overdue excludes linked overdue tasks', async () => {
    const { body } = await request(
      `${base()}/api/courses/${OWN_COURSE_ID}/tasks?materialId=none&deadline=overdue&referenceDate=${REFERENCE_DATE}`,
      { headers: auth }
    );
    assert.deepEqual(body.data.tasks, []);
  });

  it('UUID + deadline=due_today returns linked due-today task', async () => {
    const { body } = await request(
      `${base()}/api/courses/${OWN_COURSE_ID}/tasks?materialId=${OWN_MATERIAL_ID}&deadline=due_today&referenceDate=${REFERENCE_DATE}`,
      { headers: auth }
    );
    assert.deepEqual(body.data.tasks.map((task) => task.id), [ID_DUE_TODAY_LINKED]);
  });

  it('UUID + deadline=next_7_days returns linked in-window task ordered first', async () => {
    const { body } = await request(
      `${base()}/api/courses/${OWN_COURSE_ID}/tasks?materialId=${OWN_MATERIAL_ID}&deadline=next_7_days&referenceDate=${REFERENCE_DATE}`,
      { headers: auth }
    );
    assert.deepEqual(body.data.tasks.map((task) => task.id), [ID_NEXT7_LINKED]);
  });

  it('returns 400 for UUID materialId with completed status and deadline', async () => {
    const { statusCode, body } = await request(
      `${base()}/api/tasks?materialId=${OWN_MATERIAL_ID}&status=completed&deadline=overdue&referenceDate=${REFERENCE_DATE}`,
      { headers: auth }
    );
    assert.equal(statusCode, 400);
    assert.equal(body.error.code, 'VALIDATION_ERROR');
  });

  it('returns 400 for materialId with referenceDate without deadline', async () => {
    const { statusCode, body } = await request(
      `${base()}/api/tasks?materialId=none&referenceDate=${REFERENCE_DATE}`,
      { headers: auth }
    );
    assert.equal(statusCode, 400);
    assert.equal(body.error.code, 'VALIDATION_ERROR');
  });

  it('UUID all-status list uses created_at DESC order', async () => {
    const { body } = await request(
      `${base()}/api/courses/${OWN_COURSE_ID}/tasks?materialId=${OWN_MATERIAL_ID}`,
      { headers: auth }
    );
    assert.deepEqual(body.data.tasks.map((task) => task.id), [
      ID_LINKED_OWN,
      ID_COMPLETED_LINKED,
      ID_OVERDUE_LINKED,
      ID_DUE_TODAY_LINKED,
      ID_NEXT7_LINKED,
    ]);
  });

  it('UUID pending deadline list uses due_date ASC NULLS LAST order', async () => {
    const rows = getMockTasks();
    rows.push({
      id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa07',
      user_id: TEST_USER_ID,
      course_id: OWN_COURSE_ID,
      material_id: OWN_MATERIAL_ID,
      title: 'Linked null due',
      description: '',
      priority: 'medium',
      estimated_minutes: 20,
      difficulty: 'medium',
      tags: [],
      status: 'pending',
      source: 'manual',
      due_date: null,
      created_at: '2026-01-11T00:00:00.000Z',
      updated_at: '2026-01-11T00:00:00.000Z',
    });

    const { body } = await request(
      `${base()}/api/courses/${OWN_COURSE_ID}/tasks?materialId=${OWN_MATERIAL_ID}&status=pending`,
      { headers: auth }
    );
    assert.deepEqual(body.data.tasks.map((task) => task.id), [
      ID_OVERDUE_LINKED,
      ID_DUE_TODAY_LINKED,
      ID_NEXT7_LINKED,
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa07',
      ID_LINKED_OWN,
    ]);
  });

  it('returns camelCase tasks without userId in material filter response', async () => {
    resetTasksMockTelemetry();
    const { body } = await request(
      `${base()}/api/tasks?materialId=${OWN_MATERIAL_ID}`,
      { headers: auth }
    );
    const select = getLastStudyTasksSelectColumns();
    assert.ok(select);
    assert.equal(select.includes('user_id'), false);
    assert.equal('userId' in body.data.tasks[0], false);
  });
});
