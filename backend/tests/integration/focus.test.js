import { describe, it, before, after, mock } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { applyTestEnv } from '../helpers/testEnv.js';
import { setSupabaseAdminClientForTests } from '../../src/config/supabase.js';
import {
  createFocusMockSupabaseClient,
  OWN_TASK_ID,
  OTHER_USER_TASK_ID,
  OWN_COMPLETED_TASK_ID,
  getMockFocusSessions,
  getMockTasks,
  resetMockFocusSessions,
  setNextFocusSessionStartedAt,
  clearNextFocusSessionStartedAt,
} from '../helpers/mockSupabaseFocus.js';

applyTestEnv();
setSupabaseAdminClientForTests(createFocusMockSupabaseClient());

const { default: app } = await import('../../src/app.js');

const OTHER_USER_ID = '99999999-9999-9999-9999-999999999999';
const MISSING_TASK_ID = '00000000-0000-4000-8000-000000000099';
const MISSING_SESSION_ID = '00000000-0000-4000-8000-000000000098';

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

/**
 * @param {unknown} value
 * @param {string} path
 */
function assertNoSensitiveContent(value, path = 'root') {
  if (value === null || value === undefined) return;
  if (typeof value !== 'object') return;
  assert.equal('content' in value, false, `content at ${path}`);
  assert.equal('plan' in value, false, `plan at ${path}`);
  assert.equal('description' in value, false, `description at ${path}`);
  for (const [key, child] of Object.entries(value)) {
    assertNoSensitiveContent(child, `${path}.${key}`);
  }
}

describe('focus API integration', () => {
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

  it('POST /api/focus returns 401 without Authorization', async () => {
    const { statusCode, body } = await request(`${base()}/api/focus`, {
      method: 'POST',
      body: { taskId: OWN_TASK_ID },
    });
    assert.equal(statusCode, 401);
    assert.equal(body.error.code, 'AUTH_REQUIRED');
  });

  it('POST /api/focus creates session for owned pending task', async () => {
    resetMockFocusSessions();
    const { statusCode, body } = await request(`${base()}/api/focus`, {
      method: 'POST',
      headers: auth,
      body: { taskId: OWN_TASK_ID, durationMinutes: 30 },
    });
    assert.equal(statusCode, 201);
    assert.equal(body.success, true);
    assertNoSensitiveContent(body.data);
    const session = body.data.session;
    assert.equal(session.taskId, OWN_TASK_ID);
    assert.equal(session.durationMinutes, 30);
    assert.equal(session.completedTask, false);
    assert.equal(session.endedAt, null);
    assert.equal('userId' in session, true);
  });

  it('POST /api/focus defaults durationMinutes to 25', async () => {
    resetMockFocusSessions();
    const { statusCode, body } = await request(`${base()}/api/focus`, {
      method: 'POST',
      headers: auth,
      body: { taskId: OWN_TASK_ID },
    });
    assert.equal(statusCode, 201);
    assert.equal(body.data.session.durationMinutes, 25);
  });

  it('POST /api/focus rejects invalid taskId', async () => {
    const { statusCode, body } = await request(`${base()}/api/focus`, {
      method: 'POST',
      headers: auth,
      body: { taskId: 'not-a-uuid' },
    });
    assert.equal(statusCode, 400);
    assert.equal(body.error.code, 'VALIDATION_ERROR');
  });

  it('POST /api/focus rejects durationMinutes below 5', async () => {
    const { statusCode, body } = await request(`${base()}/api/focus`, {
      method: 'POST',
      headers: auth,
      body: { taskId: OWN_TASK_ID, durationMinutes: 4 },
    });
    assert.equal(statusCode, 400);
    assert.equal(body.error.code, 'VALIDATION_ERROR');
  });

  it('POST /api/focus rejects durationMinutes above 120', async () => {
    const { statusCode, body } = await request(`${base()}/api/focus`, {
      method: 'POST',
      headers: auth,
      body: { taskId: OWN_TASK_ID, durationMinutes: 121 },
    });
    assert.equal(statusCode, 400);
    assert.equal(body.error.code, 'VALIDATION_ERROR');
  });

  it('POST /api/focus rejects unknown body fields', async () => {
    const { statusCode, body } = await request(`${base()}/api/focus`, {
      method: 'POST',
      headers: auth,
      body: { taskId: OWN_TASK_ID, elapsedMinutes: 10 },
    });
    assert.equal(statusCode, 400);
    assert.equal(body.error.code, 'VALIDATION_ERROR');
  });

  it('POST /api/focus returns 404 for missing task', async () => {
    const { statusCode, body } = await request(`${base()}/api/focus`, {
      method: 'POST',
      headers: auth,
      body: { taskId: MISSING_TASK_ID },
    });
    assert.equal(statusCode, 404);
    assert.equal(body.error.message, 'Task not found');
  });

  it('POST /api/focus returns 404 for other user task', async () => {
    const { statusCode, body } = await request(`${base()}/api/focus`, {
      method: 'POST',
      headers: auth,
      body: { taskId: OTHER_USER_TASK_ID },
    });
    assert.equal(statusCode, 404);
    assert.equal(body.error.message, 'Task not found');
  });

  it('POST /api/focus rejects completed task', async () => {
    const { statusCode, body } = await request(`${base()}/api/focus`, {
      method: 'POST',
      headers: auth,
      body: { taskId: OWN_COMPLETED_TASK_ID },
    });
    assert.equal(statusCode, 400);
    assert.equal(body.error.message, 'Cannot start focus on a completed task');
  });

  it('POST complete sets actual minutes and leaves task pending when completedTask false', async () => {
    resetMockFocusSessions();
    clearNextFocusSessionStartedAt();
    setNextFocusSessionStartedAt('2026-06-01T12:00:00.000Z');

    const startRes = await request(`${base()}/api/focus`, {
      method: 'POST',
      headers: auth,
      body: { taskId: OWN_TASK_ID, durationMinutes: 25 },
    });
    const sessionId = startRes.body.data.session.id;

    mock.timers.enable({ apis: ['Date'], now: new Date('2026-06-01T12:08:00.000Z') });
    try {
      const { statusCode, body } = await request(
        `${base()}/api/focus/${sessionId}/complete`,
        {
          method: 'POST',
          headers: auth,
          body: { completedTask: false },
        }
      );
      assert.equal(statusCode, 200);
      assert.equal(body.data.session.durationMinutes, 8);
      assert.notEqual(body.data.session.endedAt, null);
      assert.equal(body.data.task, undefined);

      const task = getMockTasks().find((t) => t.id === OWN_TASK_ID);
      assert.equal(task?.status, 'pending');
    } finally {
      mock.timers.reset();
    }
  });

  it('POST complete marks task completed when completedTask true', async () => {
    resetMockFocusSessions();
    setNextFocusSessionStartedAt('2026-06-01T12:00:00.000Z');

    const startRes = await request(`${base()}/api/focus`, {
      method: 'POST',
      headers: auth,
      body: { taskId: OWN_TASK_ID },
    });
    const sessionId = startRes.body.data.session.id;

    mock.timers.enable({ apis: ['Date'], now: new Date('2026-06-01T12:05:00.000Z') });
    try {
      const { statusCode, body } = await request(
        `${base()}/api/focus/${sessionId}/complete`,
        {
          method: 'POST',
          headers: auth,
          body: { completedTask: true },
        }
      );
      assert.equal(statusCode, 200);
      assert.equal(body.data.session.durationMinutes, 5);
      assert.equal(body.data.task.status, 'completed');
      assert.equal(body.data.task.id, OWN_TASK_ID);
    } finally {
      mock.timers.reset();
    }
  });

  it('POST complete rejects unknown body fields', async () => {
    resetMockFocusSessions();
    const startRes = await request(`${base()}/api/focus`, {
      method: 'POST',
      headers: auth,
      body: { taskId: OWN_TASK_ID },
    });
    const sessionId = startRes.body.data.session.id;

    const { statusCode, body } = await request(
      `${base()}/api/focus/${sessionId}/complete`,
      {
        method: 'POST',
        headers: auth,
        body: { completedTask: false, durationMinutes: 99 },
      }
    );
    assert.equal(statusCode, 400);
    assert.equal(body.error.code, 'VALIDATION_ERROR');
  });

  it('POST complete rejects missing completedTask', async () => {
    const { statusCode, body } = await request(
      `${base()}/api/focus/11111111-1111-4111-8111-000000000001/complete`,
      {
        method: 'POST',
        headers: auth,
        body: {},
      }
    );
    assert.equal(statusCode, 400);
    assert.equal(body.error.code, 'VALIDATION_ERROR');
  });

  it('POST complete rejects invalid sessionId', async () => {
    const { statusCode, body } = await request(`${base()}/api/focus/not-a-uuid/complete`, {
      method: 'POST',
      headers: auth,
      body: { completedTask: false },
    });
    assert.equal(statusCode, 400);
    assert.equal(body.error.code, 'VALIDATION_ERROR');
  });

  it('POST complete returns 404 for missing session', async () => {
    const { statusCode, body } = await request(
      `${base()}/api/focus/${MISSING_SESSION_ID}/complete`,
      {
        method: 'POST',
        headers: auth,
        body: { completedTask: false },
      }
    );
    assert.equal(statusCode, 404);
    assert.equal(body.error.message, 'Focus session not found');
  });

  it('POST complete returns 409 when session already completed', async () => {
    resetMockFocusSessions();
    const startRes = await request(`${base()}/api/focus`, {
      method: 'POST',
      headers: auth,
      body: { taskId: OWN_TASK_ID },
    });
    const sessionId = startRes.body.data.session.id;

    const first = await request(`${base()}/api/focus/${sessionId}/complete`, {
      method: 'POST',
      headers: auth,
      body: { completedTask: false },
    });
    assert.equal(first.statusCode, 200);

    const second = await request(`${base()}/api/focus/${sessionId}/complete`, {
      method: 'POST',
      headers: auth,
      body: { completedTask: false },
    });
    assert.equal(second.statusCode, 409);
    assert.equal(second.body.error.message, 'Focus session already completed');
  });

  it('early finish records actual minutes not planned ceiling', async () => {
    resetMockFocusSessions();
    setNextFocusSessionStartedAt('2026-06-01T12:00:00.000Z');

    const startRes = await request(`${base()}/api/focus`, {
      method: 'POST',
      headers: auth,
      body: { taskId: OWN_TASK_ID, durationMinutes: 25 },
    });
    const sessionId = startRes.body.data.session.id;

    mock.timers.enable({ apis: ['Date'], now: new Date('2026-06-01T12:03:00.000Z') });
    try {
      const { body } = await request(`${base()}/api/focus/${sessionId}/complete`, {
        method: 'POST',
        headers: auth,
        body: { completedTask: false },
      });
      assert.equal(body.data.session.durationMinutes, 3);
      assert.notEqual(body.data.session.durationMinutes, 25);
    } finally {
      mock.timers.reset();
    }
  });

  it('finish within first minute records 1 minute', async () => {
    resetMockFocusSessions();
    setNextFocusSessionStartedAt('2026-06-01T12:00:00.000Z');

    const startRes = await request(`${base()}/api/focus`, {
      method: 'POST',
      headers: auth,
      body: { taskId: OWN_TASK_ID },
    });
    const sessionId = startRes.body.data.session.id;

    mock.timers.enable({ apis: ['Date'], now: new Date('2026-06-01T12:00:30.000Z') });
    try {
      const { body } = await request(`${base()}/api/focus/${sessionId}/complete`, {
        method: 'POST',
        headers: auth,
        body: { completedTask: false },
      });
      assert.equal(body.data.session.durationMinutes, 1);
    } finally {
      mock.timers.reset();
    }
  });

  it('actual minutes cannot exceed session ceiling', async () => {
    resetMockFocusSessions();
    setNextFocusSessionStartedAt('2026-06-01T12:00:00.000Z');

    const startRes = await request(`${base()}/api/focus`, {
      method: 'POST',
      headers: auth,
      body: { taskId: OWN_TASK_ID, durationMinutes: 25 },
    });
    const sessionId = startRes.body.data.session.id;

    mock.timers.enable({ apis: ['Date'], now: new Date('2026-06-01T18:00:00.000Z') });
    try {
      const { body } = await request(`${base()}/api/focus/${sessionId}/complete`, {
        method: 'POST',
        headers: auth,
        body: { completedTask: false },
      });
      assert.equal(body.data.session.durationMinutes, 25);
    } finally {
      mock.timers.reset();
    }
  });

  it('actual minutes cannot exceed global 120', async () => {
    resetMockFocusSessions();
    setNextFocusSessionStartedAt('2026-06-01T12:00:00.000Z');

    const startRes = await request(`${base()}/api/focus`, {
      method: 'POST',
      headers: auth,
      body: { taskId: OWN_TASK_ID, durationMinutes: 120 },
    });
    const sessionId = startRes.body.data.session.id;

    mock.timers.enable({ apis: ['Date'], now: new Date('2026-06-02T12:00:00.000Z') });
    try {
      const { body } = await request(`${base()}/api/focus/${sessionId}/complete`, {
        method: 'POST',
        headers: auth,
        body: { completedTask: false },
      });
      assert.equal(body.data.session.durationMinutes, 120);
    } finally {
      mock.timers.reset();
    }
  });

  it('cross-user cannot complete another user session', async () => {
    resetMockFocusSessions();
    getMockFocusSessions().push({
      id: '22222222-2222-4222-8222-222222222222',
      user_id: OTHER_USER_ID,
      course_id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      task_id: OTHER_USER_TASK_ID,
      duration_minutes: 25,
      completed_task: false,
      started_at: '2026-06-01T12:00:00.000Z',
      ended_at: null,
    });

    const { statusCode, body } = await request(
      `${base()}/api/focus/22222222-2222-4222-8222-222222222222/complete`,
      {
        method: 'POST',
        headers: auth,
        body: { completedTask: false },
      }
    );
    assert.equal(statusCode, 404);
    assert.equal(body.error.message, 'Focus session not found');
  });
});
