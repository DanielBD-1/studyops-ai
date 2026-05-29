import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  startFocusSession,
  completeFocusSession,
  __setApiFetchForTests,
  __setAccessTokenForTests,
  ApiRequestError,
} from '../../src/services/focus.service.js';

const TASK_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const SESSION_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const TOKEN = 'test-access-token';

const MOCK_SESSION = {
  id: SESSION_ID,
  userId: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
  courseId: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
  taskId: TASK_ID,
  durationMinutes: 25,
  completedTask: false,
  startedAt: '2026-05-29T12:00:00.000Z',
  endedAt: null,
};

const MOCK_COMPLETED_SESSION = {
  ...MOCK_SESSION,
  durationMinutes: 18,
  completedTask: true,
  endedAt: '2026-05-29T12:18:00.000Z',
};

/** @type {Array<{ path: string, init: RequestInit, token?: string }>} */
let calls = [];

beforeEach(() => {
  calls = [];
  __setAccessTokenForTests(TOKEN);
  __setApiFetchForTests(async (path, init, accessToken) => {
    calls.push({ path, init, token: accessToken });

    if (path === '/api/focus' && init.method === 'POST') {
      return {
        success: true,
        data: { session: MOCK_SESSION },
        meta: { timestamp: new Date().toISOString() },
      };
    }

    if (path === `/api/focus/${SESSION_ID}/complete` && init.method === 'POST') {
      return {
        success: true,
        data: { session: MOCK_COMPLETED_SESSION },
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

describe('focus.service', () => {
  it('startFocusSession sends POST /api/focus with taskId and durationMinutes 25', async () => {
    const data = await startFocusSession(TASK_ID);

    const startCall = calls.find((c) => c.path === '/api/focus');
    assert.ok(startCall);
    assert.equal(startCall.init.method, 'POST');
    assert.equal(startCall.token, TOKEN);

    const body = JSON.parse(String(startCall.init.body));
    assert.equal(body.taskId, TASK_ID);
    assert.equal(body.durationMinutes, 25);
    assert.equal(Object.keys(body).length, 2);

    assert.equal(data.session.id, SESSION_ID);
    assert.equal(data.session.durationMinutes, 25);
  });

  it('completeFocusSession sends POST with exactly { completedTask }', async () => {
    const data = await completeFocusSession(SESSION_ID, true);

    const completeCall = calls.find((c) => c.path === `/api/focus/${SESSION_ID}/complete`);
    assert.ok(completeCall);
    assert.equal(completeCall.init.method, 'POST');
    assert.equal(completeCall.token, TOKEN);

    const body = JSON.parse(String(completeCall.init.body));
    assert.deepEqual(body, { completedTask: true });
    assert.equal(body.elapsedMinutes, undefined);
    assert.equal(body.durationMinutes, undefined);
    assert.equal(body.endedAt, undefined);
    assert.equal(body.startedAt, undefined);

    assert.equal(data.session.durationMinutes, 18);
  });

  it('completeFocusSession with completedTask false sends only completedTask', async () => {
    await completeFocusSession(SESSION_ID, false);

    const completeCall = calls.find((c) => c.path === `/api/focus/${SESSION_ID}/complete`);
    assert.ok(completeCall);
    const body = JSON.parse(String(completeCall.init.body));
    assert.deepEqual(body, { completedTask: false });
  });

  it('propagates ApiRequestError on API failure envelope', async () => {
    __setApiFetchForTests(async () => ({
      success: false,
      error: { code: 'CONFLICT', message: 'Focus session already completed' },
      meta: { timestamp: new Date().toISOString() },
    }));

    await assert.rejects(
      () => completeFocusSession(SESSION_ID, false),
      (err) => {
        assert.ok(err instanceof ApiRequestError);
        assert.equal(err.code, 'CONFLICT');
        assert.equal(err.message, 'Focus session already completed');
        return true;
      }
    );
  });
});
