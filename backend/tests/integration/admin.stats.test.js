import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { applyTestEnv } from '../helpers/testEnv.js';
import { setSupabaseAdminClientForTests } from '../../src/config/supabase.js';
import {
  createAdminStatsMockSupabaseClient,
  seedAdminStatsEmptyPlatform,
  seedAdminStatsPopulatedPlatform,
  setAdminStatsDbFailure,
  POPULATED_ADMIN_STATS,
} from '../helpers/mockSupabaseAdminStats.js';

applyTestEnv();
setSupabaseAdminClientForTests(createAdminStatsMockSupabaseClient());

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

const EMPTY_ADMIN_STATS = {
  totalUsers: 0,
  totalCourses: 0,
  totalStudyMaterials: 0,
  totalGeneratedPlans: 0,
  totalTasks: 0,
  pendingTasks: 0,
  completedTasks: 0,
  totalFlashcards: 0,
  totalFocusMinutes: 0,
  completedFocusSessions: 0,
  trelloSyncedTasks: 0,
  trelloSyncAttemptsToday: 0,
  trelloSyncSucceededToday: 0,
  trelloSyncFailedToday: 0,
  trelloSyncSkippedToday: 0,
  systemHealth: {
    backend: 'ok',
  },
};

/**
 * @param {unknown} value
 * @param {string} [path]
 */
function assertNoSensitiveAdminStatsFields(value, path = 'root') {
  if (value === null || value === undefined) return;
  if (typeof value !== 'object') return;

  const obj = /** @type {Record<string, unknown>} */ (value);
  const forbidden = [
    'email',
    'userId',
    'user_id',
    'profile',
    'profiles',
    'users',
    'courseName',
    'title',
    'content',
    'plan',
    'generated_plan',
    'description',
    'question',
    'answer',
    'trello_card_id',
    'trelloCardId',
    'apiKey',
    'token',
    'secret',
    'Authorization',
    'error_message',
  ];

  for (const key of forbidden) {
    assert.equal(key in obj, false, `${key} at ${path}`);
  }

  if ('id' in obj && path !== 'root') {
    assert.fail(`unexpected id at ${path}`);
  }

  for (const [key, child] of Object.entries(obj)) {
    assertNoSensitiveAdminStatsFields(child, `${path}.${key}`);
  }
}

describe('admin stats API integration', () => {
  /** @type {import('node:http').Server} */
  let server;
  /** @type {number} */
  let port;

  before(async () => {
    server = http.createServer(app);
    await listen(server);
    port = /** @type {import('node:net').AddressInfo} */ (server.address()).port;
  });

  after(async () => {
    await new Promise((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve(undefined)));
    });
  });

  beforeEach(() => {
    seedAdminStatsPopulatedPlatform();
  });

  it('GET /api/admin/stats without token returns 401 AUTH_REQUIRED', async () => {
    const res = await request(`http://127.0.0.1:${port}/api/admin/stats`);
    assert.equal(res.statusCode, 401);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'AUTH_REQUIRED');
  });

  it('GET /api/admin/stats with student token returns 403 FORBIDDEN', async () => {
    const res = await request(`http://127.0.0.1:${port}/api/admin/stats`, {
      headers: { Authorization: 'Bearer student-token' },
    });
    assert.equal(res.statusCode, 403);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'FORBIDDEN');
    assert.equal(res.body.error.message, 'Admin access required');
  });

  it('GET /api/admin/stats with admin token returns 200', async () => {
    const res = await request(`http://127.0.0.1:${port}/api/admin/stats`, {
      headers: { Authorization: 'Bearer admin-token' },
    });
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.equal(typeof res.body.meta.timestamp, 'string');
  });

  it('empty platform seed returns all numeric fields 0 and systemHealth.backend ok', async () => {
    seedAdminStatsEmptyPlatform();

    const res = await request(`http://127.0.0.1:${port}/api/admin/stats`, {
      headers: { Authorization: 'Bearer admin-token' },
    });

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.deepEqual(res.body.data, EMPTY_ADMIN_STATS);
  });

  it('populated multi-user platform seed returns expected platform-wide aggregates', async () => {
    const res = await request(`http://127.0.0.1:${port}/api/admin/stats`, {
      headers: { Authorization: 'Bearer admin-token' },
    });

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.deepEqual(res.body.data, POPULATED_ADMIN_STATS);
  });

  it('response does not include sensitive fields or raw rows', async () => {
    const res = await request(`http://127.0.0.1:${port}/api/admin/stats`, {
      headers: { Authorization: 'Bearer admin-token' },
    });

    assert.equal(res.statusCode, 200);
    assertNoSensitiveAdminStatsFields(res.body);
    assertNoSensitiveAdminStatsFields(res.body.data);
  });

  it('database failure returns 500 DATABASE_ERROR with generic message', async () => {
    setAdminStatsDbFailure(true);

    const res = await request(`http://127.0.0.1:${port}/api/admin/stats`, {
      headers: { Authorization: 'Bearer admin-token' },
    });

    assert.equal(res.statusCode, 500);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'DATABASE_ERROR');
    assert.equal(res.body.error.message, 'Failed to load admin stats');
  });
});
