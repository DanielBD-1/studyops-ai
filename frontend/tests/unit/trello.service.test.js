import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  syncTasksToTrello,
  fetchTrelloBoards,
  fetchTrelloBoardLists,
  fetchTrelloConnection,
  fetchTrelloAuthorizeUrl,
  completeTrelloConnection,
  disconnectTrello,
  saveTrelloConnectionDefaults,
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
const FAKE_OAUTH_STATE = 'signed-state-value';
const FAKE_COMPLETE_TOKEN = 'complete-token-value';

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

    if (path === '/api/trello/connection') {
      return {
        success: true,
        data: { connected: false },
        meta: { timestamp: new Date().toISOString() },
      };
    }

    if (path === '/api/trello/authorize-url') {
      return {
        success: true,
        data: { authorizeUrl: 'https://trello.com/1/authorize?response_type=token' },
        meta: { timestamp: new Date().toISOString() },
      };
    }

    if (path === '/api/trello/connect/complete') {
      return {
        success: true,
        data: {
          connected: true,
          trelloMemberId: 'member-123',
          trelloUsername: 'studyops_user',
          scopes: 'read,write',
          expirationPolicy: 'never',
          expiresAt: null,
          defaultBoardId: null,
          defaultListId: null,
          connectedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        meta: { timestamp: new Date().toISOString() },
      };
    }

    if (path === '/api/trello/disconnect') {
      return {
        success: true,
        data: { connected: false },
        meta: { timestamp: new Date().toISOString() },
      };
    }

    if (path === '/api/trello/connection/defaults') {
      return {
        success: true,
        data: {
          connected: true,
          trelloMemberId: 'member-123',
          trelloUsername: 'studyops_user',
          scopes: 'read,write',
          expirationPolicy: 'never',
          expiresAt: null,
          defaultBoardId: FAKE_BOARD_ID,
          defaultListId: FAKE_LIST_ID,
          connectedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
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
  it('fetchTrelloBoards in connected mode sends POST body {} without credential keys', async () => {
    const data = await fetchTrelloBoards();

    const boardCall = calls.find((c) => c.path === '/api/trello/boards');
    assert.ok(boardCall);
    assert.equal(boardCall.init.method, 'POST');
    assert.equal(boardCall.token, TOKEN);

    const body = JSON.parse(String(boardCall.init.body));
    assert.deepEqual(body, {});
    assert.equal('apiKey' in body, false);
    assert.equal('token' in body, false);

    assert.deepEqual(data.boards, [{ id: FAKE_BOARD_ID, name: 'My Board' }]);
  });

  it('fetchTrelloBoardLists in connected mode sends POST body {} without credential keys', async () => {
    const data = await fetchTrelloBoardLists({ boardId: FAKE_BOARD_ID });

    const listsCall = calls.find((c) => c.path === `/api/trello/boards/${FAKE_BOARD_ID}/lists`);
    assert.ok(listsCall);
    assert.equal(listsCall.init.method, 'POST');
    assert.equal(listsCall.token, TOKEN);

    const body = JSON.parse(String(listsCall.init.body));
    assert.deepEqual(body, {});
    assert.equal('apiKey' in body, false);
    assert.equal('token' in body, false);

    assert.deepEqual(data.lists, [{ id: FAKE_LIST_ID, name: 'To Do' }]);
  });

  it('syncTasksToTrello in connected mode sends listId and taskIds only', async () => {
    const data = await syncTasksToTrello({
      listId: FAKE_LIST_ID,
      taskIds: [TASK_ID],
    });

    const syncCall = calls.find((c) => c.path === '/api/trello/sync');
    assert.ok(syncCall);
    assert.equal(syncCall.init.method, 'POST');
    assert.equal(syncCall.token, TOKEN);

    const body = JSON.parse(String(syncCall.init.body));
    assert.equal(body.listId, FAKE_LIST_ID);
    assert.deepEqual(body.taskIds, [TASK_ID]);
    assert.equal('apiKey' in body, false);
    assert.equal('token' in body, false);

    assert.deepEqual(data.summary, MOCK_SYNC_RESPONSE.summary);
    assert.equal(data.results.length, 1);
    assert.equal(data.results[0].status, 'success');
  });

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
    await fetchTrelloBoards();
    await fetchTrelloBoardLists({ boardId: FAKE_BOARD_ID });
    await syncTasksToTrello({ listId: FAKE_LIST_ID, taskIds: [TASK_ID] });
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

  it('fetchTrelloConnection uses GET /api/trello/connection with Bearer token', async () => {
    const data = await fetchTrelloConnection();

    const connectionCall = calls.find((c) => c.path === '/api/trello/connection');
    assert.ok(connectionCall);
    assert.equal(connectionCall.init.method, undefined);
    assert.equal(connectionCall.token, TOKEN);
    assert.equal(data.connected, false);
  });

  it('fetchTrelloAuthorizeUrl uses GET /api/trello/authorize-url with Bearer token', async () => {
    const data = await fetchTrelloAuthorizeUrl();

    const authorizeCall = calls.find((c) => c.path === '/api/trello/authorize-url');
    assert.ok(authorizeCall);
    assert.equal(authorizeCall.init.method, undefined);
    assert.equal(authorizeCall.token, TOKEN);
    assert.equal(data.authorizeUrl.includes('trello.com/1/authorize'), true);
  });

  it('completeTrelloConnection sends POST body { token, state }', async () => {
    const data = await completeTrelloConnection({
      token: FAKE_COMPLETE_TOKEN,
      state: FAKE_OAUTH_STATE,
    });

    const completeCall = calls.find((c) => c.path === '/api/trello/connect/complete');
    assert.ok(completeCall);
    assert.equal(completeCall.init.method, 'POST');
    assert.equal(completeCall.token, TOKEN);

    const body = JSON.parse(String(completeCall.init.body));
    assert.equal(body.token, FAKE_COMPLETE_TOKEN);
    assert.equal(body.state, FAKE_OAUTH_STATE);
    assert.equal(data.connected, true);
    assert.equal(data.trelloUsername, 'studyops_user');
  });

  it('completeTrelloConnection does not put token or state in URL', async () => {
    await completeTrelloConnection({
      token: FAKE_COMPLETE_TOKEN,
      state: FAKE_OAUTH_STATE,
    });

    const completeCall = calls.find((c) => c.path === '/api/trello/connect/complete');
    assert.ok(completeCall);
    assert.equal(completeCall.path.includes(FAKE_COMPLETE_TOKEN), false);
    assert.equal(completeCall.path.includes(FAKE_OAUTH_STATE), false);
    assert.equal(String(completeCall.path).includes('?'), false);
  });

  it('disconnectTrello sends POST {} to /api/trello/disconnect', async () => {
    const data = await disconnectTrello();

    const disconnectCall = calls.find((c) => c.path === '/api/trello/disconnect');
    assert.ok(disconnectCall);
    assert.equal(disconnectCall.init.method, 'POST');
    assert.equal(disconnectCall.token, TOKEN);

    const body = JSON.parse(String(disconnectCall.init.body));
    assert.deepEqual(body, {});
    assert.equal(data.connected, false);
  });

  it('saveTrelloConnectionDefaults sends PATCH with boardId and listId', async () => {
    const data = await saveTrelloConnectionDefaults({
      boardId: FAKE_BOARD_ID,
      listId: FAKE_LIST_ID,
    });

    const defaultsCall = calls.find((c) => c.path === '/api/trello/connection/defaults');
    assert.ok(defaultsCall);
    assert.equal(defaultsCall.init.method, 'PATCH');
    assert.equal(defaultsCall.token, TOKEN);

    const body = JSON.parse(String(defaultsCall.init.body));
    assert.equal(body.boardId, FAKE_BOARD_ID);
    assert.equal(body.listId, FAKE_LIST_ID);
    assert.equal('apiKey' in body, false);
    assert.equal('token' in body, false);

    assert.equal(data.connected, true);
    assert.equal(data.defaultBoardId, FAKE_BOARD_ID);
    assert.equal(data.defaultListId, FAKE_LIST_ID);
  });
});
