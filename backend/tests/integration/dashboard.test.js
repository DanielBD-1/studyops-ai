import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { applyTestEnv } from '../helpers/testEnv.js';
import { setSupabaseAdminClientForTests } from '../../src/config/supabase.js';
import {
  createDashboardMockSupabaseClient,
  seedDashboardMixedData,
  seedDashboardEmptyUserData,
  OWN_COURSE_ID,
  OWN_MATERIAL_ID,
  TEST_USER_ID,
  getMockFlashcards,
} from '../helpers/mockSupabaseDashboard.js';

applyTestEnv();
setSupabaseAdminClientForTests(createDashboardMockSupabaseClient());

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

/**
 * @param {unknown} value
 * @param {string} [path]
 */
function assertNoSensitiveFields(value, path = 'root') {
  if (value === null || value === undefined) return;
  if (typeof value !== 'object') return;

  const obj = /** @type {Record<string, unknown>} */ (value);
  const forbidden = [
    'content',
    'plan',
    'description',
    'question',
    'answer',
    'apiKey',
    'token',
    'trelloCardId',
    'trello_card_id',
  ];

  for (const key of forbidden) {
    assert.equal(key in obj, false, `${key} at ${path}`);
  }

  for (const [key, child] of Object.entries(obj)) {
    assertNoSensitiveFields(child, `${path}.${key}`);
  }
}

describe('dashboard API integration', () => {
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
    seedDashboardMixedData();
  });

  it('GET /api/dashboard/stats without auth returns 401', async () => {
    const res = await request(`http://127.0.0.1:${port}/api/dashboard/stats`);
    assert.equal(res.statusCode, 401);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'AUTH_REQUIRED');
  });

  it('empty account returns all zeros and courseStats: []', async () => {
    seedDashboardEmptyUserData();

    const res = await request(`http://127.0.0.1:${port}/api/dashboard/stats`, {
      headers: { Authorization: 'Bearer empty-user-token' },
    });

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.deepEqual(res.body.data, {
      totalCourses: 0,
      totalStudyMaterials: 0,
      totalGeneratedPlans: 0,
      totalTasks: 0,
      pendingTasks: 0,
      completedTasks: 0,
      totalFlashcards: 0,
      dueFlashcardsCount: 0,
      totalFocusMinutes: 0,
      completedFocusSessions: 0,
      trelloSyncedTasks: 0,
      courseStats: [],
    });
  });

  it('excludes other user data from caller stats', async () => {
    const res = await request(`http://127.0.0.1:${port}/api/dashboard/stats`, {
      headers: { Authorization: 'Bearer valid-token' },
    });

    assert.equal(res.statusCode, 200);
    const { data } = res.body;

    assert.equal(data.totalCourses, 1);
    assert.equal(data.totalStudyMaterials, 1);
    assert.equal(data.totalGeneratedPlans, 1);
    assert.equal(data.totalTasks, 3);
    assert.equal(data.totalFlashcards, 1);
    assert.equal(data.dueFlashcardsCount, 1);
    assert.equal(data.completedFocusSessions, 2);
    assert.equal(data.totalFocusMinutes, 30);
    assert.equal(data.trelloSyncedTasks, 1);
  });

  it('returns correct task counts', async () => {
    const res = await request(`http://127.0.0.1:${port}/api/dashboard/stats`, {
      headers: { Authorization: 'Bearer valid-token' },
    });

    assert.equal(res.body.data.totalTasks, 3);
    assert.equal(res.body.data.pendingTasks, 2);
    assert.equal(res.body.data.completedTasks, 1);
  });

  it('sums completed focus minutes and excludes in-progress sessions', async () => {
    const res = await request(`http://127.0.0.1:${port}/api/dashboard/stats`, {
      headers: { Authorization: 'Bearer valid-token' },
    });

    assert.equal(res.body.data.totalFocusMinutes, 30);
    assert.equal(res.body.data.completedFocusSessions, 2);
  });

  it('counts owned generated plans only', async () => {
    const res = await request(`http://127.0.0.1:${port}/api/dashboard/stats`, {
      headers: { Authorization: 'Bearer valid-token' },
    });

    assert.equal(res.body.data.totalGeneratedPlans, 1);
    assertNoSensitiveFields(res.body.data);
  });

  it('counts own trello_card_id tasks only', async () => {
    const res = await request(`http://127.0.0.1:${port}/api/dashboard/stats`, {
      headers: { Authorization: 'Bearer valid-token' },
    });

    assert.equal(res.body.data.trelloSyncedTasks, 1);
  });

  it('returns per-course task and flashcard counts', async () => {
    const res = await request(`http://127.0.0.1:${port}/api/dashboard/stats`, {
      headers: { Authorization: 'Bearer valid-token' },
    });

    assert.deepEqual(res.body.data.courseStats, [
      {
        courseId: OWN_COURSE_ID,
        courseName: 'Own Course',
        totalTasks: 3,
        completedTasks: 1,
        totalFlashcards: 1,
      },
    ]);
  });

  it('counts dueFlashcardsCount for null and past next_review_at and excludes future and other users', async () => {
    getMockFlashcards().push(
      {
        id: 'ffffffff-ffff-4fff-8fff-ffffffffffff',
        user_id: TEST_USER_ID,
        course_id: OWN_COURSE_ID,
        material_id: OWN_MATERIAL_ID,
        question: 'Past due question?',
        answer: 'Past due answer.',
        tags: [],
        source: 'manual',
        next_review_at: '2020-01-01T00:00:00.000Z',
        created_at: '2026-01-10T00:00:00.000Z',
        updated_at: '2026-01-10T00:00:00.000Z',
      },
      {
        id: '11111111-1111-4111-8111-111111111112',
        user_id: TEST_USER_ID,
        course_id: OWN_COURSE_ID,
        material_id: null,
        question: 'Future due question?',
        answer: 'Future due answer.',
        tags: [],
        source: 'manual',
        next_review_at: '2099-01-01T00:00:00.000Z',
        created_at: '2026-01-10T00:00:00.000Z',
        updated_at: '2026-01-10T00:00:00.000Z',
      }
    );

    const res = await request(`http://127.0.0.1:${port}/api/dashboard/stats`, {
      headers: { Authorization: 'Bearer valid-token' },
    });

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.data.totalFlashcards, 3);
    assert.equal(res.body.data.dueFlashcardsCount, 2);
    assert.equal(typeof res.body.data.dueFlashcardsCount, 'number');
    assertNoSensitiveFields(res.body.data);
  });

  it('response data contains no sensitive fields', async () => {
    const res = await request(`http://127.0.0.1:${port}/api/dashboard/stats`, {
      headers: { Authorization: 'Bearer valid-token' },
    });

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.equal(typeof res.body.data.totalCourses, 'number');
    assert.equal(typeof res.body.meta.timestamp, 'string');
    assertNoSensitiveFields(res.body);
  });
});
