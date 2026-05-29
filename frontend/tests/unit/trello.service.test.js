import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  syncTasksToTrello,
  fetchTrelloBoards,
  fetchTrelloBoardLists,
  __setApiFetchForTests,
  __setAccessTokenForTests,
  ApiRequestError,
} from '../../src/services/trello.service.js';

const TASK_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const TOKEN = 'test-access-token';
const FAKE_API_KEY = 'fake-api-key';
const FAKE_TRELLO_TOKEN = 'fake-trello-token';
const FAKE_LIST_ID = 'fake-list-id';
const FAKE_BOARD_ID = 'board-abc123';

const MOCK_SYNC_RESPONSE = {
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

    if (path === '/api/trello/boards') {
      return {
        success: true,
        data: { boards: [{ id: FAKE_BOARD_ID, name: 'My Board' }] },
        meta: { timestamp: new Date().toISOString() },
      };
    }

    if (path === `/api/trello/boards/${FAKE_BOARD_ID}/lists`) {
      return {
        success: true,
        data: { lists: [{ id: FAKE_LIST_ID, name: 'To Do' }] },
        meta: { timestamp: new Date().toISOString() },
      };
    }

    return {
      success: true,
      data: MOCK_SYNC_RESPONSE,
      meta: { timestamp: new Date().toISOString() },
    };
  });
});

afterEach(() => {
  __setApiFetchForTests(null);
  __setAccessTokenForTests(null);
});

describe('trello.service', () => {
  it('fetchTrelloBoards sends POST to /api/trello/boards with Bearer token', async () => {
    const data = await fetchTrelloBoards({
      apiKey: FAKE_API_KEY,
      token: FAKE_TRELLO_TOKEN,
    });

    const boardCall = calls.find((c) => c.path === '/api/trello/boards');
    assert.ok(boardCall);
    assert.equal(boardCall.init.method, 'POST');
    assert.equal(boardCall.token, TOKEN);

    const body = JSON.parse(String(boardCall.init.body));
    assert.equal(body.apiKey, FAKE_API_KEY);
    assert.equal(body.token, FAKE_TRELLO_TOKEN);
    assert.equal(body.listId, undefined);

    assert.deepEqual(data.boards, [{ id: FAKE_BOARD_ID, name: 'My Board' }]);
  });

  it('fetchTrelloBoardLists posts to /api/trello/boards/:boardId/lists with credentials in body only', async () => {
    const data = await fetchTrelloBoardLists({
      apiKey: FAKE_API_KEY,
      token: FAKE_TRELLO_TOKEN,
      boardId: FAKE_BOARD_ID,
    });

    const listsCall = calls.find((c) => c.path === `/api/trello/boards/${FAKE_BOARD_ID}/lists`);
    assert.ok(listsCall);
    assert.equal(listsCall.init.method, 'POST');
    assert.equal(listsCall.token, TOKEN);

    const body = JSON.parse(String(listsCall.init.body));
    assert.equal(body.apiKey, FAKE_API_KEY);
    assert.equal(body.token, FAKE_TRELLO_TOKEN);
    assert.equal(body.boardId, undefined);

    assert.deepEqual(data.lists, [{ id: FAKE_LIST_ID, name: 'To Do' }]);
  });

  it('syncTasksToTrello sends POST to /api/trello/sync with Bearer token', async () => {
    const data = await syncTasksToTrello({
      apiKey: FAKE_API_KEY,
      token: FAKE_TRELLO_TOKEN,
      listId: FAKE_LIST_ID,
      taskIds: [TASK_ID],
    });

    const syncCall = calls.find((c) => c.path === '/api/trello/sync');
    assert.ok(syncCall);
    assert.equal(syncCall.init.method, 'POST');
    assert.equal(syncCall.token, TOKEN);

    const body = JSON.parse(String(syncCall.init.body));
    assert.equal(body.apiKey, FAKE_API_KEY);
    assert.equal(body.token, FAKE_TRELLO_TOKEN);
    assert.equal(body.listId, FAKE_LIST_ID);
    assert.deepEqual(body.taskIds, [TASK_ID]);

    assert.deepEqual(data.summary, MOCK_SYNC_RESPONSE.summary);
    assert.equal(data.results.length, 1);
    assert.equal(data.results[0].status, 'success');
  });

  it('does not call api.trello.com', async () => {
    await fetchTrelloBoards({ apiKey: FAKE_API_KEY, token: FAKE_TRELLO_TOKEN });
    await fetchTrelloBoardLists({
      apiKey: FAKE_API_KEY,
      token: FAKE_TRELLO_TOKEN,
      boardId: FAKE_BOARD_ID,
    });
    await syncTasksToTrello({
      apiKey: FAKE_API_KEY,
      token: FAKE_TRELLO_TOKEN,
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
          token: FAKE_TRELLO_TOKEN,
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
