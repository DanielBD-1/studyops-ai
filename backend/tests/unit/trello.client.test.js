import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { applyTestEnv } from '../helpers/testEnv.js';
import {
  createCard,
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
});
