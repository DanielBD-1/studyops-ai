import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  getAdminStats,
  __setApiFetchForTests,
  __setAccessTokenForTests,
  ApiRequestError,
} from '../../src/services/admin.service.js';

const TOKEN = 'test-access-token';

const MOCK_STATS = {
  totalUsers: 12,
  totalCourses: 25,
  totalStudyMaterials: 40,
  totalGeneratedPlans: 18,
  totalTasks: 100,
  pendingTasks: 35,
  completedTasks: 65,
  totalFlashcards: 50,
  totalFocusMinutes: 240,
  completedFocusSessions: 10,
  trelloSyncedTasks: 8,
  trelloSyncAttemptsToday: 5,
  trelloSyncSucceededToday: 3,
  trelloSyncFailedToday: 1,
  trelloSyncSkippedToday: 1,
  systemHealth: {
    backend: 'ok',
  },
};

/** @type {Array<{ path: string, init: RequestInit, token?: string }>} */
let calls = [];

beforeEach(() => {
  calls = [];
  __setAccessTokenForTests(TOKEN);
  __setApiFetchForTests(async (path, init, accessToken) => {
    calls.push({ path, init, token: accessToken });

    if (path === '/api/admin/stats' && init.method === 'GET') {
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

describe('admin.service', () => {
  it('getAdminStats calls GET /api/admin/stats with Bearer token and no body', async () => {
    const data = await getAdminStats();

    assert.equal(calls.length, 1);
    assert.equal(calls[0].path, '/api/admin/stats');
    assert.equal(calls[0].init.method, 'GET');
    assert.equal(calls[0].token, TOKEN);
    assert.equal(calls[0].init.body, undefined);

    assert.deepEqual(data, MOCK_STATS);
  });

  it('propagates ApiRequestError FORBIDDEN on 403 envelope', async () => {
    __setApiFetchForTests(async () => ({
      success: false,
      error: { code: 'FORBIDDEN', message: 'Admin access required' },
      meta: { timestamp: new Date().toISOString() },
    }));

    await assert.rejects(
      () => getAdminStats(),
      (err) => {
        assert.ok(err instanceof ApiRequestError);
        assert.equal(err.code, 'FORBIDDEN');
        assert.equal(err.message, 'Admin access required');
        return true;
      }
    );
  });

  it('propagates ApiRequestError DATABASE_ERROR on API failure envelope', async () => {
    __setApiFetchForTests(async () => ({
      success: false,
      error: { code: 'DATABASE_ERROR', message: 'Failed to load admin stats' },
      meta: { timestamp: new Date().toISOString() },
    }));

    await assert.rejects(
      () => getAdminStats(),
      (err) => {
        assert.ok(err instanceof ApiRequestError);
        assert.equal(err.code, 'DATABASE_ERROR');
        assert.equal(err.message, 'Failed to load admin stats');
        return true;
      }
    );
  });

  it('propagates ApiRequestError AUTH_REQUIRED on 401 envelope', async () => {
    __setApiFetchForTests(async () => ({
      success: false,
      error: { code: 'AUTH_REQUIRED', message: 'Authentication required' },
      meta: { timestamp: new Date().toISOString() },
    }));

    await assert.rejects(
      () => getAdminStats(),
      (err) => {
        assert.ok(err instanceof ApiRequestError);
        assert.equal(err.code, 'AUTH_REQUIRED');
        assert.equal(err.message, 'Authentication required');
        return true;
      }
    );
  });
});
