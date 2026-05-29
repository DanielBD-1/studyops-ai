import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  getDashboardStats,
  __setApiFetchForTests,
  __setAccessTokenForTests,
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
  totalFlashcards: 8,
  totalFocusMinutes: 90,
  completedFocusSessions: 3,
  trelloSyncedTasks: 2,
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
  __setApiFetchForTests(async (path, init, accessToken) => {
    calls.push({ path, init, token: accessToken });

    if (path === '/api/dashboard/stats' && init.method === 'GET') {
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
});

describe('dashboard.service', () => {
  it('getDashboardStats calls GET /api/dashboard/stats with Bearer token and no body', async () => {
    const data = await getDashboardStats();

    assert.equal(calls.length, 1);
    assert.equal(calls[0].path, '/api/dashboard/stats');
    assert.equal(calls[0].init.method, 'GET');
    assert.equal(calls[0].token, TOKEN);
    assert.equal(calls[0].init.body, undefined);

    assert.deepEqual(data, MOCK_STATS);
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
