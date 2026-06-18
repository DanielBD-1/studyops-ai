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
  OWN_TASK_ID,
  TEST_USER_ID,
  OTHER_USER_ID,
  OTHER_USER_COURSE_ID,
  getMockFlashcards,
  getMockFocusSessions,
  getMockTasks,
} from '../helpers/mockSupabaseDashboard.js';
import { computeLast7DaysThresholdIso } from '../../src/modules/dashboard/dashboard.service.js';
import { getUtcTodayIsoCalendarDate } from '../../src/shared/validation/calendar-date.js';

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
    'started_at',
    'ended_at',
    'task_id',
    'taskId',
    'sessionId',
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
      overduePendingTasks: 0,
      dueTodayPendingTasks: 0,
      deadlineReferenceDate: getUtcTodayIsoCalendarDate(),
      totalFlashcards: 0,
      dueFlashcardsCount: 0,
      totalFocusMinutes: 0,
      completedFocusSessions: 0,
      focusMinutesLast7Days: 0,
      completedFocusSessionsLast7Days: 0,
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
    assert.equal(typeof data.focusMinutesLast7Days, 'number');
    assert.equal(typeof data.completedFocusSessionsLast7Days, 'number');
    assert.equal(data.trelloSyncedTasks, 1);
    assert.equal(typeof data.overduePendingTasks, 'number');
    assert.equal(typeof data.dueTodayPendingTasks, 'number');
    assert.equal(data.deadlineReferenceDate, getUtcTodayIsoCalendarDate());
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

  it('aggregates last-seven-days focus from completed sessions in rolling window only', async () => {
    const now = new Date();
    const thresholdIso = computeLast7DaysThresholdIso(now);
    const inWindow = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString();
    const outWindow = new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString();
    const atThreshold = new Date(new Date(thresholdIso).getTime() + 1000).toISOString();

    getMockFocusSessions().length = 0;
    getMockFocusSessions().push(
      {
        id: 'focus-in-window-1111-4111-8111-111111111111',
        user_id: TEST_USER_ID,
        course_id: OWN_COURSE_ID,
        task_id: OWN_TASK_ID,
        duration_minutes: 20,
        completed_task: false,
        started_at: inWindow,
        ended_at: inWindow,
      },
      {
        id: 'focus-out-window-2222-4222-8222-222222222222',
        user_id: TEST_USER_ID,
        course_id: OWN_COURSE_ID,
        task_id: OWN_TASK_ID,
        duration_minutes: 40,
        completed_task: false,
        started_at: outWindow,
        ended_at: outWindow,
      },
      {
        id: 'focus-at-threshold-3333-4333-8333-333333333333',
        user_id: TEST_USER_ID,
        course_id: OWN_COURSE_ID,
        task_id: OWN_TASK_ID,
        duration_minutes: 15,
        completed_task: false,
        started_at: thresholdIso,
        ended_at: atThreshold,
      },
      {
        id: 'focus-in-progress-4444-4444-8444-444444444444',
        user_id: TEST_USER_ID,
        course_id: OWN_COURSE_ID,
        task_id: OWN_TASK_ID,
        duration_minutes: 25,
        completed_task: false,
        started_at: inWindow,
        ended_at: null,
      },
      {
        id: 'focus-other-user-5555-5555-8555-555555555555',
        user_id: OTHER_USER_ID,
        course_id: OTHER_USER_COURSE_ID,
        task_id: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
        duration_minutes: 60,
        completed_task: false,
        started_at: inWindow,
        ended_at: inWindow,
      }
    );

    const res = await request(`http://127.0.0.1:${port}/api/dashboard/stats`, {
      headers: { Authorization: 'Bearer valid-token' },
    });

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.data.focusMinutesLast7Days, 35);
    assert.equal(res.body.data.completedFocusSessionsLast7Days, 2);
    assert.equal(res.body.data.totalFocusMinutes, 75);
    assert.equal(res.body.data.completedFocusSessions, 3);
    assertNoSensitiveFields(res.body.data);
  });
});

describe('dashboard stats referenceDate query', () => {
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

  it('returns 400 VALIDATION_ERROR for empty referenceDate', async () => {
    const res = await request(
      `http://127.0.0.1:${port}/api/dashboard/stats?referenceDate=`,
      { headers: { Authorization: 'Bearer valid-token' } }
    );

    assert.equal(res.statusCode, 400);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'VALIDATION_ERROR');
  });

  it('returns 400 VALIDATION_ERROR for malformed referenceDate', async () => {
    const res = await request(
      `http://127.0.0.1:${port}/api/dashboard/stats?referenceDate=2026-06-18T00:00:00.000Z`,
      { headers: { Authorization: 'Bearer valid-token' } }
    );

    assert.equal(res.statusCode, 400);
    assert.equal(res.body.error.code, 'VALIDATION_ERROR');
  });

  it('returns 400 VALIDATION_ERROR for impossible referenceDate', async () => {
    const res = await request(
      `http://127.0.0.1:${port}/api/dashboard/stats?referenceDate=2026-02-30`,
      { headers: { Authorization: 'Bearer valid-token' } }
    );

    assert.equal(res.statusCode, 400);
    assert.equal(res.body.error.code, 'VALIDATION_ERROR');
  });

  it('accepts valid referenceDate and echoes it in deadlineReferenceDate', async () => {
    const res = await request(
      `http://127.0.0.1:${port}/api/dashboard/stats?referenceDate=2026-06-18`,
      { headers: { Authorization: 'Bearer valid-token' } }
    );

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.data.deadlineReferenceDate, '2026-06-18');
  });
});

describe('dashboard deadline task aggregates', () => {
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

  it('counts overdue, due-today, and excludes other cases', async () => {
    getMockTasks().push(
      {
        id: '11111111-1111-4111-8111-111111111111',
        user_id: TEST_USER_ID,
        course_id: OWN_COURSE_ID,
        material_id: null,
        title: 'Overdue pending task',
        description: 'Sensitive',
        priority: 'medium',
        estimated_minutes: 20,
        difficulty: 'medium',
        tags: [],
        status: 'pending',
        source: 'manual',
        due_date: '2026-06-10',
        trello_card_id: null,
        created_at: '2026-01-01T00:00:00.000Z',
        updated_at: '2026-01-01T00:00:00.000Z',
      },
      {
        id: '22222222-2222-4222-8222-222222222222',
        user_id: TEST_USER_ID,
        course_id: OWN_COURSE_ID,
        material_id: null,
        title: 'Due today pending task',
        description: 'Sensitive',
        priority: 'medium',
        estimated_minutes: 20,
        difficulty: 'medium',
        tags: [],
        status: 'pending',
        source: 'manual',
        due_date: '2026-06-18',
        trello_card_id: null,
        created_at: '2026-01-01T00:00:00.000Z',
        updated_at: '2026-01-01T00:00:00.000Z',
      },
      {
        id: '33333333-3333-4333-8333-333333333333',
        user_id: TEST_USER_ID,
        course_id: OWN_COURSE_ID,
        material_id: null,
        title: 'Future pending task',
        description: 'Sensitive',
        priority: 'medium',
        estimated_minutes: 20,
        difficulty: 'medium',
        tags: [],
        status: 'pending',
        source: 'manual',
        due_date: '2026-06-25',
        trello_card_id: null,
        created_at: '2026-01-01T00:00:00.000Z',
        updated_at: '2026-01-01T00:00:00.000Z',
      },
      {
        id: '44444444-4444-4444-8444-444444444444',
        user_id: TEST_USER_ID,
        course_id: OWN_COURSE_ID,
        material_id: null,
        title: 'Completed overdue task',
        description: 'Sensitive',
        priority: 'medium',
        estimated_minutes: 20,
        difficulty: 'medium',
        tags: [],
        status: 'completed',
        source: 'manual',
        due_date: '2026-06-01',
        trello_card_id: null,
        created_at: '2026-01-01T00:00:00.000Z',
        updated_at: '2026-01-01T00:00:00.000Z',
      },
      {
        id: '55555555-5555-4555-8555-555555555555',
        user_id: OTHER_USER_ID,
        course_id: OTHER_USER_COURSE_ID,
        material_id: null,
        title: 'Other user overdue task',
        description: 'Sensitive',
        priority: 'medium',
        estimated_minutes: 20,
        difficulty: 'medium',
        tags: [],
        status: 'pending',
        source: 'manual',
        due_date: '2026-06-01',
        trello_card_id: null,
        created_at: '2026-01-01T00:00:00.000Z',
        updated_at: '2026-01-01T00:00:00.000Z',
      }
    );

    const res = await request(
      `http://127.0.0.1:${port}/api/dashboard/stats?referenceDate=2026-06-18`,
      { headers: { Authorization: 'Bearer valid-token' } }
    );

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.data.deadlineReferenceDate, '2026-06-18');
    assert.equal(res.body.data.overduePendingTasks, 1);
    assert.equal(res.body.data.dueTodayPendingTasks, 1);
    assert.ok(res.body.data.overduePendingTasks <= res.body.data.pendingTasks);
    assert.ok(res.body.data.dueTodayPendingTasks <= res.body.data.pendingTasks);
    assertNoSensitiveFields(res.body.data);
  });

  it('returns zero deadline counts for empty user', async () => {
    seedDashboardEmptyUserData();

    const res = await request(
      `http://127.0.0.1:${port}/api/dashboard/stats?referenceDate=2026-06-18`,
      { headers: { Authorization: 'Bearer empty-user-token' } }
    );

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.data.overduePendingTasks, 0);
    assert.equal(res.body.data.dueTodayPendingTasks, 0);
    assert.equal(res.body.data.deadlineReferenceDate, '2026-06-18');
  });
});
