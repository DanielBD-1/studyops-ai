import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  getDashboardStats,
  normalizeDashboardStats,
  __setApiFetchForTests,
  __setAccessTokenForTests,
  __setReferenceDateForTests,
  ApiRequestError,
} from '../../src/services/dashboard.service.js';

const TOKEN = 'test-access-token';

const MOCK_STATS = {
  totalCourses: 2,
  totalStudyMaterials: 5,
  totalGeneratedPlans: 3,
  totalTasks: 10,
  pendingTasks: 4,
  completedTasks: 6,
  overduePendingTasks: 1,
  dueTodayPendingTasks: 2,
  dueNext7DaysPendingTasks: 3,
  deadlineReferenceDate: '2026-06-18',
  totalFlashcards: 8,
  dueFlashcardsCount: 3,
  totalFocusMinutes: 90,
  completedFocusSessions: 3,
  focusMinutesLast7Days: 25,
  completedFocusSessionsLast7Days: 1,
  trelloSyncedTasks: 2,
  materialsWithPendingTasks: 2,
  topMaterialsByPendingTasks: [
    {
      materialId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      courseId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      materialTitle: 'Beta Notes',
      pendingTasks: 3,
    },
    {
      materialId: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
      courseId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      materialTitle: 'Alpha Notes',
      pendingTasks: 1,
    },
  ],
  courseStats: [
    {
      courseId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      courseName: 'Physics',
      totalTasks: 6,
      completedTasks: 4,
      totalFlashcards: 5,
    },
  ],
};

/** @type {Array<{ path: string, init: RequestInit, token?: string }>} */
let calls = [];

beforeEach(() => {
  calls = [];
  __setAccessTokenForTests(TOKEN);
  __setReferenceDateForTests(() => '2026-06-18');
  __setApiFetchForTests(async (path, init, accessToken) => {
    calls.push({ path, init, token: accessToken });

    if (path.startsWith('/api/dashboard/stats?') && init.method === 'GET') {
      return {
        success: true,
        data: MOCK_STATS,
        meta: { timestamp: new Date().toISOString() },
      };
    }

    return {
      success: false,
      error: { code: 'NOT_FOUND', message: 'Not found' },
      meta: { timestamp: new Date().toISOString() },
    };
  });
});

afterEach(() => {
  __setApiFetchForTests(null);
  __setAccessTokenForTests(null);
  __setReferenceDateForTests(null);
});

describe('dashboard.service', () => {
  it('getDashboardStats calls GET /api/dashboard/stats with referenceDate query and Bearer token', async () => {
    const data = await getDashboardStats();

    assert.equal(calls.length, 1);
    const url = new URL(`http://localhost${calls[0].path}`);
    assert.equal(url.pathname, '/api/dashboard/stats');
    assert.equal(url.searchParams.get('referenceDate'), '2026-06-18');
    assert.equal(calls[0].init.method, 'GET');
    assert.equal(calls[0].token, TOKEN);
    assert.equal(calls[0].init.body, undefined);

    assert.deepEqual(data, MOCK_STATS);
  });

  it('returns deadline task fields from the dashboard stats contract', async () => {
    const data = await getDashboardStats();

    assert.equal(data.overduePendingTasks, 1);
    assert.equal(data.dueTodayPendingTasks, 2);
    assert.equal(data.dueNext7DaysPendingTasks, 3);
    assert.equal(data.deadlineReferenceDate, '2026-06-18');
  });

  it('returns last-seven-days focus fields from the dashboard stats contract', async () => {
    const data = await getDashboardStats();

    assert.equal(data.focusMinutesLast7Days, 25);
    assert.equal(data.completedFocusSessionsLast7Days, 1);
  });

  it('propagates ApiRequestError on API failure envelope', async () => {
    __setApiFetchForTests(async () => ({
      success: false,
      error: { code: 'DATABASE_ERROR', message: 'Failed to load dashboard stats' },
      meta: { timestamp: new Date().toISOString() },
    }));

    await assert.rejects(
      () => getDashboardStats(),
      (err) => {
        assert.ok(err instanceof ApiRequestError);
        assert.equal(err.code, 'DATABASE_ERROR');
        assert.equal(err.message, 'Failed to load dashboard stats');
        return true;
      }
    );
  });
});

describe('dashboard.service normalizeDashboardStats', () => {
  it('returns material pending fields from a full valid response', async () => {
    const data = await getDashboardStats();

    assert.equal(data.materialsWithPendingTasks, 2);
    assert.equal(data.topMaterialsByPendingTasks.length, 2);
    assert.equal(data.topMaterialsByPendingTasks[0].materialTitle, 'Beta Notes');
    assert.equal(data.totalCourses, 2);
  });

  it('defaults missing material pending fields', async () => {
    __setApiFetchForTests(async () => ({
      success: true,
      data: { ...MOCK_STATS, materialsWithPendingTasks: undefined, topMaterialsByPendingTasks: undefined },
      meta: { timestamp: new Date().toISOString() },
    }));

    const data = await getDashboardStats();
    assert.equal(data.materialsWithPendingTasks, 0);
    assert.deepEqual(data.topMaterialsByPendingTasks, []);
    assert.equal(data.totalCourses, 2);
  });

  it('defaults non-array topMaterialsByPendingTasks to an empty list', async () => {
    __setApiFetchForTests(async () => ({
      success: true,
      data: { ...MOCK_STATS, topMaterialsByPendingTasks: 'invalid' },
      meta: { timestamp: new Date().toISOString() },
    }));

    const data = await getDashboardStats();
    assert.deepEqual(data.topMaterialsByPendingTasks, []);
  });

  it('drops malformed entries individually', async () => {
    const data = normalizeDashboardStats({
      ...MOCK_STATS,
      topMaterialsByPendingTasks: [
        {
          materialId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
          courseId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
          materialTitle: 'Valid Material',
          pendingTasks: 2,
        },
        {
          materialId: '',
          courseId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
          materialTitle: 'Missing ID',
          pendingTasks: 2,
        },
        {
          materialId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
          courseId: '',
          materialTitle: 'Missing course',
          pendingTasks: 2,
        },
        {
          materialId: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
          courseId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
          materialTitle: '   ',
          pendingTasks: 2,
        },
        {
          materialId: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
          courseId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
          materialTitle: 'Zero pending',
          pendingTasks: 0,
        },
        {
          materialId: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
          courseId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
          materialTitle: 'Negative pending',
          pendingTasks: -1,
        },
      ],
    });

    assert.equal(data.topMaterialsByPendingTasks.length, 1);
    assert.equal(data.topMaterialsByPendingTasks[0].materialTitle, 'Valid Material');
  });

  it('defaults invalid materialsWithPendingTasks counts to zero', () => {
    const data = normalizeDashboardStats({
      ...MOCK_STATS,
      materialsWithPendingTasks: Number.NaN,
    });

    assert.equal(data.materialsWithPendingTasks, 0);
  });
});
