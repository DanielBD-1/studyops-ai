import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  syncTasksToTrello,
  __setApiFetchForTests,
  __setAccessTokenForTests,
  ApiRequestError,
} from '../../src/services/trello.service.js';

const TASK_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const TOKEN = 'test-access-token';
const FAKE_API_KEY = 'fake-api-key';
const FAKE_TOKEN = 'fake-trello-token';
const FAKE_LIST_ID = 'fake-list-id';

const MOCK_RESPONSE = {
  results: [
    {
      taskId: TASK_ID,
      status: 'success',
      trelloCardId: 'card-123',
      error: null,
    },
  ],
  summary: {
    total: 1,
    success: 1,
    skipped: 0,
    failed: 0,
  },
};

/** @type {Array<{ path: string, init: RequestInit, token?: string }>} */
let calls = [];

beforeEach(() => {
  calls = [];
  __setAccessTokenForTests(TOKEN);
  __setApiFetchForTests(async (path, init, accessToken) => {
    calls.push({ path, init, token: accessToken });
    return {
      success: true,
      data: MOCK_RESPONSE,
      meta: { timestamp: new Date().toISOString() },
    };
  });
});

afterEach(() => {
  __setApiFetchForTests(null);
  __setAccessTokenForTests(null);
});

describe('trello.service', () => {
  it('syncTasksToTrello sends POST to /api/trello/sync with Bearer token', async () => {
    const data = await syncTasksToTrello({
      apiKey: FAKE_API_KEY,
      token: FAKE_TOKEN,
      listId: FAKE_LIST_ID,
      taskIds: [TASK_ID],
    });

    assert.equal(calls.length, 1);
    assert.equal(calls[0].path, '/api/trello/sync');
    assert.equal(calls[0].init.method, 'POST');
    assert.equal(calls[0].token, TOKEN);

    const body = JSON.parse(String(calls[0].init.body));
    assert.equal(body.apiKey, FAKE_API_KEY);
    assert.equal(body.token, FAKE_TOKEN);
    assert.equal(body.listId, FAKE_LIST_ID);
    assert.deepEqual(body.taskIds, [TASK_ID]);

    assert.deepEqual(data.summary, MOCK_RESPONSE.summary);
    assert.equal(data.results.length, 1);
    assert.equal(data.results[0].status, 'success');
  });

  it('does not call api.trello.com', async () => {
    await syncTasksToTrello({
      apiKey: FAKE_API_KEY,
      token: FAKE_TOKEN,
      listId: FAKE_LIST_ID,
      taskIds: [TASK_ID],
    });

    for (const call of calls) {
      assert.equal(String(call.path).includes('api.trello.com'), false);
    }
  });

  it('propagates ApiRequestError on API failure envelope', async () => {
    __setApiFetchForTests(async () => ({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Invalid request' },
      meta: { timestamp: new Date().toISOString() },
    }));

    await assert.rejects(
      () =>
        syncTasksToTrello({
          apiKey: FAKE_API_KEY,
          token: FAKE_TOKEN,
          listId: FAKE_LIST_ID,
          taskIds: [TASK_ID],
        }),
      (err) => {
        assert.ok(err instanceof ApiRequestError);
        assert.equal(err.code, 'VALIDATION_ERROR');
        assert.equal(err.message, 'Invalid request');
        return true;
      }
    );
  });
});
