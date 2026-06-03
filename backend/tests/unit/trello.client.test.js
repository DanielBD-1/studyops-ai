import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { applyTestEnv } from '../helpers/testEnv.js';
import {
  createCard,
  deleteToken,
  getBoardLists,
  getBoards,
  getMemberMe,
  setTrelloFetchForTests,
  trelloClientErrorMessage,
} from '../../src/clients/trello.client.js';

applyTestEnv();

describe('trello.client', () => {
  afterEach(() => {
    setTrelloFetchForTests(null);
  });

  it('returns cardId on success', async () => {
    /** @type {string | undefined} */
    let requestUrl;
    setTrelloFetchForTests(async (url) => {
      requestUrl = url;
      return {
        ok: true,
        status: 200,
        json: async () => ({ id: 'trelloCardABC' }),
      };
    });

    const result = await createCard({
      apiKey: 'secret-api-key',
      token: 'secret-token',
      listId: 'list123',
      name: 'Task title',
      desc: 'Task description',
    });

    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.cardId, 'trelloCardABC');
    }
    assert.ok(requestUrl?.includes('api.trello.com/1/cards'));
    assert.ok(requestUrl?.includes('key=secret-api-key'));
  });

  it('maps 401 to TRELLO_AUTH', async () => {
    setTrelloFetchForTests(async () => ({
      ok: false,
      status: 401,
      json: async () => ({ message: 'invalid key' }),
    }));

    const result = await createCard({
      apiKey: 'k',
      token: 't',
      listId: 'list',
      name: 'N',
      desc: 'D',
    });

    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.code, 'TRELLO_AUTH');
      assert.equal(trelloClientErrorMessage(result.code), 'Trello authentication failed');
    }
  });

  it('maps 404 to TRELLO_LIST_NOT_FOUND', async () => {
    setTrelloFetchForTests(async () => ({
      ok: false,
      status: 404,
      json: async () => ({}),
    }));

    const result = await createCard({
      apiKey: 'k',
      token: 't',
      listId: 'list',
      name: 'N',
      desc: 'D',
    });

    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.code, 'TRELLO_LIST_NOT_FOUND');
    }
  });

  it('maps 429 to TRELLO_RATE_LIMIT', async () => {
    setTrelloFetchForTests(async () => ({
      ok: false,
      status: 429,
      json: async () => ({}),
    }));

    const result = await createCard({
      apiKey: 'k',
      token: 't',
      listId: 'list',
      name: 'N',
      desc: 'D',
    });

    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.code, 'TRELLO_RATE_LIMIT');
      assert.equal(trelloClientErrorMessage(result.code), 'Trello rate limit reached');
    }
  });

  it('maps network failure to TRELLO_ERROR', async () => {
    setTrelloFetchForTests(async () => {
      throw new Error('network down');
    });

    const result = await createCard({
      apiKey: 'k',
      token: 't',
      listId: 'list',
      name: 'N',
      desc: 'D',
    });

    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.code, 'TRELLO_ERROR');
    }
  });

  it('getBoards returns sanitized open boards sorted by name', async () => {
    /** @type {string | undefined} */
    let requestUrl;
    setTrelloFetchForTests(async (url) => {
      requestUrl = url;
      return {
        ok: true,
        status: 200,
        json: async () => [
          { id: 'b2', name: 'Zebra Board', closed: false },
          { id: 'b1', name: 'Alpha Board', closed: false },
          { id: 'b3', name: 'Closed Board', closed: true },
          { id: 'b4', name: '', closed: false },
        ],
      };
    });

    const result = await getBoards({
      apiKey: 'secret-api-key',
      token: 'secret-token',
    });

    assert.equal(result.ok, true);
    if (result.ok) {
      assert.deepEqual(result.boards, [
        { id: 'b1', name: 'Alpha Board' },
        { id: 'b2', name: 'Zebra Board' },
      ]);
    }
    assert.ok(requestUrl?.includes('/members/me/boards'));
    assert.ok(requestUrl?.includes('filter=open'));
    assert.ok(requestUrl?.includes('fields=id%2Cname%2Cclosed'));
    assert.equal(JSON.stringify(result).includes('secret-api-key'), false);
    assert.equal(JSON.stringify(result).includes('secret-token'), false);
  });

  it('getBoardLists returns sanitized open lists sorted by name', async () => {
    setTrelloFetchForTests(async (url) => {
      assert.ok(url.includes('/boards/boardABC/lists'));
      return {
        ok: true,
        status: 200,
        json: async () => [
          { id: 'l2', name: 'Done', closed: false },
          { id: 'l1', name: 'Backlog', closed: false },
        ],
      };
    });

    const result = await getBoardLists({
      apiKey: 'k',
      token: 't',
      boardId: 'boardABC',
    });

    assert.equal(result.ok, true);
    if (result.ok) {
      assert.deepEqual(result.lists, [
        { id: 'l1', name: 'Backlog' },
        { id: 'l2', name: 'Done' },
      ]);
    }
  });

  it('getBoards maps 401 to TRELLO_AUTH without credentials in result', async () => {
    setTrelloFetchForTests(async () => ({
      ok: false,
      status: 401,
      json: async () => ({ message: 'invalid key' }),
    }));

    const result = await getBoards({ apiKey: 'k', token: 't' });
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.code, 'TRELLO_AUTH');
      assert.equal(
        trelloClientErrorMessage(result.code, 'boards'),
        'Trello authentication failed'
      );
      assert.equal(JSON.stringify(result).includes('invalid key'), false);
    }
  });

  it('getBoardLists maps 404 to TRELLO_BOARD_NOT_FOUND', async () => {
    setTrelloFetchForTests(async () => ({
      ok: false,
      status: 404,
      json: async () => ({}),
    }));

    const result = await getBoardLists({
      apiKey: 'k',
      token: 't',
      boardId: 'missing',
    });

    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.code, 'TRELLO_BOARD_NOT_FOUND');
      assert.equal(
        trelloClientErrorMessage(result.code, 'lists'),
        'Trello board not found'
      );
    }
  });

  it('getBoards maps 429 to TRELLO_RATE_LIMIT', async () => {
    setTrelloFetchForTests(async () => ({
      ok: false,
      status: 429,
      json: async () => ({}),
    }));

    const result = await getBoards({ apiKey: 'k', token: 't' });
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.code, 'TRELLO_RATE_LIMIT');
    }
  });

  it('getBoards maps timeout to TRELLO_TIMEOUT with boards message', async () => {
    setTrelloFetchForTests(async () => {
      const err = new Error('timeout');
      err.name = 'TimeoutError';
      throw err;
    });

    const result = await getBoards({ apiKey: 'k', token: 't' });
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.code, 'TRELLO_TIMEOUT');
      assert.equal(
        trelloClientErrorMessage(result.code, 'boards'),
        'Failed to load Trello boards'
      );
    }
  });

  it('getBoardLists maps malformed payload to TRELLO_ERROR', async () => {
    setTrelloFetchForTests(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ not: 'array' }),
    }));

    const result = await getBoardLists({
      apiKey: 'k',
      token: 't',
      boardId: 'board1',
    });

    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.code, 'TRELLO_ERROR');
      assert.equal(
        trelloClientErrorMessage(result.code, 'lists'),
        'Failed to load Trello lists'
      );
    }
  });

  it('getMemberMe returns member id and username on success', async () => {
    /** @type {string | undefined} */
    let requestUrl;
    setTrelloFetchForTests(async (url) => {
      requestUrl = url;
      return {
        ok: true,
        status: 200,
        json: async () => ({ id: 'member123', username: 'trello_user' }),
      };
    });

    const result = await getMemberMe({ apiKey: 'secret-api-key', token: 'secret-token' });

    assert.equal(result.ok, true);
    if (result.ok) {
      assert.deepEqual(result.member, { id: 'member123', username: 'trello_user' });
    }
    assert.ok(requestUrl?.includes('/members/me'));
    assert.ok(requestUrl?.includes('fields=id%2Cusername'));
    assert.equal(JSON.stringify(result).includes('secret-token'), false);
  });

  it('getMemberMe maps 401 to TRELLO_AUTH without raw Trello body', async () => {
    setTrelloFetchForTests(async () => ({
      ok: false,
      status: 401,
      json: async () => ({ message: 'invalid token' }),
    }));

    const result = await getMemberMe({ apiKey: 'k', token: 't' });
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.code, 'TRELLO_AUTH');
      assert.equal(
        trelloClientErrorMessage(result.code, 'member'),
        'Trello authentication failed'
      );
      assert.equal(JSON.stringify(result).includes('invalid token'), false);
    }
  });

  it('getMemberMe maps malformed payload to TRELLO_ERROR', async () => {
    setTrelloFetchForTests(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ username: 'missing-id' }),
    }));

    const result = await getMemberMe({ apiKey: 'k', token: 't' });
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.code, 'TRELLO_ERROR');
    }
  });

  it('deleteToken succeeds on 200 response', async () => {
    /** @type {string | undefined} */
    let requestUrl;
    setTrelloFetchForTests(async (url, options) => {
      requestUrl = url;
      assert.equal(options?.method, 'DELETE');
      return { ok: true, status: 200, json: async () => ({ _value: null }) };
    });

    const result = await deleteToken({ apiKey: 'secret-api-key', token: 'secret-token' });
    assert.equal(result.ok, true);
    assert.ok(requestUrl?.includes('/tokens/'));
    assert.equal(JSON.stringify(result).includes('secret-token'), false);
  });

  it('deleteToken maps 401 to TRELLO_AUTH without failing caller contract', async () => {
    setTrelloFetchForTests(async () => ({
      ok: false,
      status: 401,
      json: async () => ({ message: 'invalid token' }),
    }));

    const result = await deleteToken({ apiKey: 'k', token: 't' });
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.code, 'TRELLO_AUTH');
    }
  });
});
