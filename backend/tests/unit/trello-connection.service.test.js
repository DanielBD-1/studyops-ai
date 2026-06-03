import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { applyTestEnv } from '../helpers/testEnv.js';
import { resetEnvCacheForTests } from '../../src/config/env.js';
import { setSupabaseAdminClientForTests, resetSupabaseClientsForTests } from '../../src/config/supabase.js';
import { setTrelloFetchForTests } from '../../src/clients/trello.client.js';
import {
  createTrelloConnectionMockSupabaseClient,
  resetMockTrelloConnections,
  getMockTrelloConnections,
  assertNoPlaintextTrelloTokenInValue,
} from '../helpers/mockSupabaseTrelloConnection.js';
import {
  buildAuthorizeUrl,
  completeConnection,
  disconnectConnection,
  getConnectionStatus,
} from '../../src/modules/trello/trello-connection.service.js';

const TEST_USER_ID = '11111111-1111-4111-8111-111111111111';
const TEST_API_KEY = 'test-trello-api-key';
const TEST_ENCRYPTION_KEY = randomBytes(32).toString('base64');
const PLAINTEXT_TOKEN = 'ATTAsecretPlaintextTokenForUnitTestsOnly';

applyTestEnv();

describe('trello-connection.service', () => {
  /** @type {string | undefined} */
  let previousApiKey;
  /** @type {string | undefined} */
  let previousEncryptionKey;

  beforeEach(() => {
    previousApiKey = process.env.TRELLO_API_KEY;
    previousEncryptionKey = process.env.TRELLO_TOKEN_ENCRYPTION_KEY;
    process.env.TRELLO_API_KEY = TEST_API_KEY;
    process.env.TRELLO_TOKEN_ENCRYPTION_KEY = TEST_ENCRYPTION_KEY;
    resetEnvCacheForTests();
    resetMockTrelloConnections();
    setSupabaseAdminClientForTests(createTrelloConnectionMockSupabaseClient());
  });

  afterEach(() => {
    setTrelloFetchForTests(null);
    resetSupabaseClientsForTests();
    if (previousApiKey === undefined) {
      delete process.env.TRELLO_API_KEY;
    } else {
      process.env.TRELLO_API_KEY = previousApiKey;
    }
    if (previousEncryptionKey === undefined) {
      delete process.env.TRELLO_TOKEN_ENCRYPTION_KEY;
    } else {
      process.env.TRELLO_TOKEN_ENCRYPTION_KEY = previousEncryptionKey;
    }
    resetEnvCacheForTests();
  });

  it('getConnectionStatus returns disconnected when no row exists', async () => {
    const result = await getConnectionStatus(TEST_USER_ID);
    assert.deepEqual(result, { connected: false });
  });

  it('buildAuthorizeUrl includes required query parameters', () => {
    const { authorizeUrl } = buildAuthorizeUrl();
    const url = new URL(authorizeUrl);

    assert.equal(url.origin + url.pathname, 'https://trello.com/1/authorize');
    assert.equal(url.searchParams.get('key'), TEST_API_KEY);
    assert.equal(url.searchParams.get('response_type'), 'token');
    assert.equal(url.searchParams.get('callback_method'), 'fragment');
    assert.equal(url.searchParams.get('scope'), 'read,write');
    assert.equal(url.searchParams.get('expiration'), 'never');
    assert.equal(url.searchParams.get('name'), 'StudyOps');
    assert.equal(
      url.searchParams.get('return_url'),
      'http://localhost:5173/trello/connect/callback'
    );
    assert.equal(authorizeUrl.includes(PLAINTEXT_TOKEN), false);
  });

  it('buildAuthorizeUrl throws when TRELLO_API_KEY is missing', () => {
    delete process.env.TRELLO_API_KEY;
    resetEnvCacheForTests();

    assert.throws(() => buildAuthorizeUrl(), (err) => {
      assert.equal(err.code, 'SERVER_ERROR');
      assert.equal(err.status, 503);
      assert.equal(err.message, 'Trello connect is not available');
      return true;
    });
  });

  it('completeConnection throws when TRELLO_API_KEY is missing', async () => {
    delete process.env.TRELLO_API_KEY;
    resetEnvCacheForTests();

    await assert.rejects(
      () => completeConnection(TEST_USER_ID, PLAINTEXT_TOKEN),
      (err) => {
        assert.equal(err.code, 'SERVER_ERROR');
        assert.equal(err.status, 503);
        assert.equal(err.message, 'Trello connect is not available');
        return true;
      }
    );
  });

  it('completeConnection validates token and stores encrypted connection', async () => {
    setTrelloFetchForTests(async (url) => {
      assert.ok(url.includes('/members/me'));
      return {
        ok: true,
        status: 200,
        json: async () => ({ id: 'trelloMember123', username: 'studyops_user' }),
      };
    });

    const result = await completeConnection(TEST_USER_ID, PLAINTEXT_TOKEN);

    assert.equal(result.connected, true);
    assert.equal(result.trelloMemberId, 'trelloMember123');
    assert.equal(result.trelloUsername, 'studyops_user');
    assert.equal(result.scopes, 'read,write');
    assert.equal(result.expirationPolicy, 'never');
    assert.equal(result.expiresAt, null);
    assertNoPlaintextTrelloTokenInValue(result);

    const stored = getMockTrelloConnections().get(TEST_USER_ID);
    assert.ok(stored);
    assert.equal(String(stored.token_ciphertext).includes(PLAINTEXT_TOKEN), false);
  });

  it('completeConnection rejects invalid token', async () => {
    setTrelloFetchForTests(async () => ({
      ok: false,
      status: 401,
      json: async () => ({ message: 'invalid token' }),
    }));

    await assert.rejects(
      () => completeConnection(TEST_USER_ID, PLAINTEXT_TOKEN),
      (err) => {
        assert.equal(err.code, 'TRELLO_AUTH_ERROR');
        assert.equal(err.status, 401);
        return true;
      }
    );
    assert.equal(getMockTrelloConnections().has(TEST_USER_ID), false);
  });

  it('completeConnection returns safe error when encryption key is missing', async () => {
    delete process.env.TRELLO_TOKEN_ENCRYPTION_KEY;
    resetEnvCacheForTests();

    setTrelloFetchForTests(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ id: 'trelloMember123', username: 'studyops_user' }),
    }));

    await assert.rejects(
      () => completeConnection(TEST_USER_ID, PLAINTEXT_TOKEN),
      (err) => {
        assert.equal(err.code, 'SERVER_ERROR');
        assert.equal(err.status, 500);
        assert.equal(err.message, 'Trello connect is not available');
        return true;
      }
    );
  });

  it('completeConnection returns safe error when encryption key is malformed', async () => {
    process.env.TRELLO_TOKEN_ENCRYPTION_KEY = 'not-valid-base64-key-material';
    resetEnvCacheForTests();

    setTrelloFetchForTests(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ id: 'trelloMember123', username: 'studyops_user' }),
    }));

    await assert.rejects(
      () => completeConnection(TEST_USER_ID, PLAINTEXT_TOKEN),
      (err) => {
        assert.equal(err.code, 'SERVER_ERROR');
        assert.equal(err.status, 500);
        assert.equal(err.message, 'Trello connect is not available');
        assert.equal(String(err.message).includes('base64'), false);
        assert.equal(String(err.message).includes('32 bytes'), false);
        return true;
      }
    );
    assert.equal(getMockTrelloConnections().has(TEST_USER_ID), false);
  });

  it('disconnectConnection revokes token and deletes local row', async () => {
    /** @type {string | undefined} */
    let deleteRequestUrl;

    setTrelloFetchForTests(async (url, options) => {
      if (options?.method === 'DELETE') {
        deleteRequestUrl = url;
        return { ok: true, status: 200, json: async () => ({ _value: null }) };
      }
      return {
        ok: true,
        status: 200,
        json: async () => ({ id: 'trelloMember123', username: 'studyops_user' }),
      };
    });

    await completeConnection(TEST_USER_ID, PLAINTEXT_TOKEN);
    const result = await disconnectConnection(TEST_USER_ID);

    assert.deepEqual(result, { connected: false });
    assert.equal(getMockTrelloConnections().has(TEST_USER_ID), false);
    assert.ok(deleteRequestUrl?.includes('/tokens/'));
    assert.ok(deleteRequestUrl?.includes('key=test-trello-api-key'));
  });

  it('disconnectConnection is idempotent when not connected', async () => {
    const result = await disconnectConnection(TEST_USER_ID);
    assert.deepEqual(result, { connected: false });
  });

  it('disconnectConnection deletes local row when revoke fails', async () => {
    setTrelloFetchForTests(async (url, options) => {
      if (options?.method === 'DELETE') {
        return { ok: false, status: 401, json: async () => ({ message: 'invalid token' }) };
      }
      return {
        ok: true,
        status: 200,
        json: async () => ({ id: 'trelloMember123', username: 'studyops_user' }),
      };
    });

    await completeConnection(TEST_USER_ID, PLAINTEXT_TOKEN);
    const result = await disconnectConnection(TEST_USER_ID);

    assert.deepEqual(result, { connected: false });
    assert.equal(getMockTrelloConnections().has(TEST_USER_ID), false);
  });
});
