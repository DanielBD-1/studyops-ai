import { describe, it, before, after, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { randomBytes } from 'node:crypto';
import { applyTestEnv } from '../helpers/testEnv.js';
import { resetEnvCacheForTests } from '../../src/config/env.js';
import { setSupabaseAdminClientForTests } from '../../src/config/supabase.js';
import { setTrelloFetchForTests } from '../../src/clients/trello.client.js';
import {
  createTrelloMockSupabaseClient,
  getMockTrelloConnections,
  resetMockTrelloConnections,
  TEST_USER_ID,
  assertNoTrelloCredentialsInValue,
} from '../helpers/mockSupabaseTrello.js';
import { assertNoPlaintextTrelloTokenInValue } from '../helpers/mockSupabaseTrelloConnection.js';
import { createTrelloOAuthState } from '../../src/modules/trello/trello-oauth-state.js';

const TEST_API_KEY = 'integration-trello-api-key';
const TEST_ENCRYPTION_KEY = randomBytes(32).toString('base64');
const CONNECT_TOKEN = 'ATTAsecretPlaintextTokenForIntegrationTests';
const OTHER_USER_ID = '22222222-2222-4222-8222-222222222222';

applyTestEnv();
process.env.TRELLO_API_KEY = TEST_API_KEY;
process.env.TRELLO_TOKEN_ENCRYPTION_KEY = TEST_ENCRYPTION_KEY;
resetEnvCacheForTests();
setSupabaseAdminClientForTests(createTrelloMockSupabaseClient());

const { default: app } = await import('../../src/app.js');

function listen(server) {
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

/**
 * @param {string} url
 * @param {import('node:http').RequestOptions & { body?: object }} options
 */
function request(url, options = {}) {
  const { body, method = 'GET', headers = {} } = options;
  const parsed = new URL(url);
  const payload = body !== undefined ? JSON.stringify(body) : undefined;

  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: parsed.hostname,
        port: parsed.port,
        path: parsed.pathname,
        method,
        headers: {
          ...(payload
            ? {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload),
              }
            : {}),
          ...headers,
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          resolve({ statusCode: res.statusCode, body: JSON.parse(data) });
        });
      }
    );
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

/**
 * @param {string} authorizeUrl
 * @returns {string}
 */
function extractStateFromAuthorizeUrl(authorizeUrl) {
  const url = new URL(authorizeUrl);
  const returnUrl = url.searchParams.get('return_url');
  assert.ok(returnUrl);
  const callbackUrl = new URL(returnUrl);
  const state = callbackUrl.searchParams.get('state');
  assert.ok(state);
  return state;
}

/**
 * @param {string} baseUrl
 * @param {Record<string, string>} headers
 */
async function fetchConnectState(baseUrl, headers) {
  const { statusCode, body } = await request(`${baseUrl}/api/trello/authorize-url`, {
    headers,
  });
  assert.equal(statusCode, 200);
  return extractStateFromAuthorizeUrl(body.data.authorizeUrl);
}

describe('trello connection API integration', () => {
  /** @type {import('node:http').Server} */
  let server;
  /** @type {number} */
  let port;
  /** @type {string | undefined} */
  let previousApiKey;
  /** @type {string | undefined} */
  let previousEncryptionKey;

  before(async () => {
    server = http.createServer(app);
    await listen(server);
    port = /** @type {import('node:net').AddressInfo} */ (server.address()).port;
  });

  after(() => new Promise((resolve) => server.close(resolve)));

  beforeEach(() => {
    previousApiKey = process.env.TRELLO_API_KEY;
    previousEncryptionKey = process.env.TRELLO_TOKEN_ENCRYPTION_KEY;
    process.env.TRELLO_API_KEY = TEST_API_KEY;
    process.env.TRELLO_TOKEN_ENCRYPTION_KEY = TEST_ENCRYPTION_KEY;
    resetEnvCacheForTests();
    resetMockTrelloConnections();
  });

  afterEach(() => {
    setTrelloFetchForTests(null);
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

  const base = () => `http://127.0.0.1:${port}`;
  const auth = { Authorization: 'Bearer valid-token' };

  it('GET /api/trello/connection returns 401 without Authorization', async () => {
    const { statusCode, body } = await request(`${base()}/api/trello/connection`);
    assert.equal(statusCode, 401);
    assert.equal(body.error.code, 'AUTH_REQUIRED');
  });

  it('GET /api/trello/authorize-url returns 401 without Authorization', async () => {
    const { statusCode, body } = await request(`${base()}/api/trello/authorize-url`);
    assert.equal(statusCode, 401);
    assert.equal(body.error.code, 'AUTH_REQUIRED');
  });

  it('POST /api/trello/connect/complete returns 401 without Authorization', async () => {
    const state = createTrelloOAuthState(TEST_USER_ID);
    const { statusCode, body } = await request(`${base()}/api/trello/connect/complete`, {
      method: 'POST',
      body: { token: CONNECT_TOKEN, state },
    });
    assert.equal(statusCode, 401);
    assert.equal(body.error.code, 'AUTH_REQUIRED');
  });

  it('POST /api/trello/disconnect returns 401 without Authorization', async () => {
    const { statusCode, body } = await request(`${base()}/api/trello/disconnect`, {
      method: 'POST',
      body: {},
    });
    assert.equal(statusCode, 401);
    assert.equal(body.error.code, 'AUTH_REQUIRED');
  });

  it('GET /api/trello/connection returns disconnected state', async () => {
    const { statusCode, body } = await request(`${base()}/api/trello/connection`, {
      headers: auth,
    });

    assert.equal(statusCode, 200);
    assert.equal(body.success, true);
    assert.deepEqual(body.data, { connected: false });
    assertNoPlaintextTrelloTokenInValue(body);
  });

  it('GET /api/trello/authorize-url returns authorizeUrl with state in return_url', async () => {
    const { statusCode, body } = await request(`${base()}/api/trello/authorize-url`, {
      headers: auth,
    });

    assert.equal(statusCode, 200);
    assert.equal(body.success, true);
    assert.ok(typeof body.data.authorizeUrl === 'string');
    assert.equal(body.data.state, undefined);

    const url = new URL(body.data.authorizeUrl);
    assert.equal(url.searchParams.get('response_type'), 'token');
    assert.equal(url.searchParams.get('callback_method'), 'fragment');
    assert.equal(url.searchParams.get('scope'), 'read,write');
    assert.equal(url.searchParams.get('expiration'), 'never');

    const returnUrl = url.searchParams.get('return_url');
    assert.ok(returnUrl);
    assert.ok(returnUrl.startsWith('http://localhost:5173/trello/connect/callback?state='));

    const state = extractStateFromAuthorizeUrl(body.data.authorizeUrl);
    assert.ok(state.length > 0);
    assert.equal(body.data.authorizeUrl.includes(CONNECT_TOKEN), false);
    assertNoPlaintextTrelloTokenInValue(body);
  });

  it('GET /api/trello/authorize-url returns 503 when TRELLO_API_KEY is missing', async () => {
    delete process.env.TRELLO_API_KEY;
    resetEnvCacheForTests();

    const { statusCode, body } = await request(`${base()}/api/trello/authorize-url`, {
      headers: auth,
    });

    assert.equal(statusCode, 503);
    assert.equal(body.error.code, 'SERVER_ERROR');
    assert.equal(body.error.message, 'Trello connect is not available');
    assertNoPlaintextTrelloTokenInValue(body);
  });

  it('POST /api/trello/connect/complete returns 503 when TRELLO_API_KEY is missing', async () => {
    const state = await fetchConnectState(base(), auth);
    delete process.env.TRELLO_API_KEY;
    resetEnvCacheForTests();

    const { statusCode, body } = await request(`${base()}/api/trello/connect/complete`, {
      method: 'POST',
      headers: auth,
      body: { token: CONNECT_TOKEN, state },
    });

    assert.equal(statusCode, 503);
    assert.equal(body.error.code, 'SERVER_ERROR');
    assert.equal(body.error.message, 'Trello connect is not available');
    assertNoPlaintextTrelloTokenInValue(body);
    assert.equal(getMockTrelloConnections().has(TEST_USER_ID), false);
  });

  it('POST /api/trello/connect/complete rejects token-only body', async () => {
    const { statusCode, body } = await request(`${base()}/api/trello/connect/complete`, {
      method: 'POST',
      headers: auth,
      body: { token: CONNECT_TOKEN },
    });

    assert.equal(statusCode, 400);
    assert.equal(body.error.code, 'VALIDATION_ERROR');
    assertNoPlaintextTrelloTokenInValue(body);
    assert.equal(getMockTrelloConnections().has(TEST_USER_ID), false);
  });

  it('POST /api/trello/connect/complete rejects empty token', async () => {
    const state = await fetchConnectState(base(), auth);
    const { statusCode, body } = await request(`${base()}/api/trello/connect/complete`, {
      method: 'POST',
      headers: auth,
      body: { token: '   ', state },
    });

    assert.equal(statusCode, 400);
    assert.equal(body.error.code, 'VALIDATION_ERROR');
    assertNoPlaintextTrelloTokenInValue(body);
  });

  it('POST /api/trello/connect/complete rejects empty state', async () => {
    const { statusCode, body } = await request(`${base()}/api/trello/connect/complete`, {
      method: 'POST',
      headers: auth,
      body: { token: CONNECT_TOKEN, state: '   ' },
    });

    assert.equal(statusCode, 400);
    assert.equal(body.error.code, 'VALIDATION_ERROR');
    assertNoPlaintextTrelloTokenInValue(body);
    assert.equal(getMockTrelloConnections().has(TEST_USER_ID), false);
  });

  it('POST /api/trello/connect/complete rejects unknown fields', async () => {
    const state = await fetchConnectState(base(), auth);
    const { statusCode, body } = await request(`${base()}/api/trello/connect/complete`, {
      method: 'POST',
      headers: auth,
      body: { token: CONNECT_TOKEN, state, apiKey: 'extra' },
    });

    assert.equal(statusCode, 400);
    assert.equal(body.error.code, 'VALIDATION_ERROR');
    assertNoPlaintextTrelloTokenInValue(body);
  });

  it('POST /api/trello/connect/complete rejects tampered state', async () => {
    let fetchCalled = false;

    setTrelloFetchForTests(async () => {
      fetchCalled = true;
      return {
        ok: true,
        status: 200,
        json: async () => ({ id: 'memberIntegration123', username: 'integration_user' }),
      };
    });

    const { statusCode, body } = await request(`${base()}/api/trello/connect/complete`, {
      method: 'POST',
      headers: auth,
      body: { token: CONNECT_TOKEN, state: 'tampered.state.value' },
    });

    assert.equal(statusCode, 400);
    assert.equal(body.error.code, 'TRELLO_OAUTH_STATE_INVALID');
    assert.equal(body.error.message, 'Invalid or expired connection request.');
    assert.equal(fetchCalled, false);
    assert.equal(getMockTrelloConnections().has(TEST_USER_ID), false);
    assertNoPlaintextTrelloTokenInValue(body);
    assert.equal(String(JSON.stringify(body)).includes(CONNECT_TOKEN), false);
    assert.equal(String(JSON.stringify(body)).includes('tampered.state.value'), false);
  });

  it('POST /api/trello/connect/complete rejects foreign user state (CSRF simulation)', async () => {
    let fetchCalled = false;
    const foreignState = createTrelloOAuthState(OTHER_USER_ID);

    setTrelloFetchForTests(async () => {
      fetchCalled = true;
      return {
        ok: true,
        status: 200,
        json: async () => ({ id: 'memberIntegration123', username: 'integration_user' }),
      };
    });

    const { statusCode, body } = await request(`${base()}/api/trello/connect/complete`, {
      method: 'POST',
      headers: auth,
      body: { token: CONNECT_TOKEN, state: foreignState },
    });

    assert.equal(statusCode, 400);
    assert.equal(body.error.code, 'TRELLO_OAUTH_STATE_INVALID');
    assert.equal(fetchCalled, false);
    assert.equal(getMockTrelloConnections().has(TEST_USER_ID), false);
    assertNoPlaintextTrelloTokenInValue(body);
  });

  it('POST /api/trello/disconnect rejects non-empty body', async () => {
    const { statusCode, body } = await request(`${base()}/api/trello/disconnect`, {
      method: 'POST',
      headers: auth,
      body: { force: true },
    });

    assert.equal(statusCode, 400);
    assert.equal(body.error.code, 'VALIDATION_ERROR');
    assertNoPlaintextTrelloTokenInValue(body);
  });

  it('POST /api/trello/connect/complete stores connection and returns metadata only', async () => {
    const state = await fetchConnectState(base(), auth);

    setTrelloFetchForTests(async (url) => {
      assert.ok(url.includes('/members/me'));
      return {
        ok: true,
        status: 200,
        json: async () => ({ id: 'memberIntegration123', username: 'integration_user' }),
      };
    });

    const { statusCode, body } = await request(`${base()}/api/trello/connect/complete`, {
      method: 'POST',
      headers: auth,
      body: { token: CONNECT_TOKEN, state },
    });

    assert.equal(statusCode, 200);
    assert.equal(body.success, true);
    assert.equal(body.data.connected, true);
    assert.equal(body.data.trelloMemberId, 'memberIntegration123');
    assert.equal(body.data.trelloUsername, 'integration_user');
    assert.equal(body.data.scopes, 'read,write');
    assertNoPlaintextTrelloTokenInValue(body);
    assertNoTrelloCredentialsInValue(body);

    assert.equal(getMockTrelloConnections().get(TEST_USER_ID)?.trello_member_id, 'memberIntegration123');
  });

  it('GET /api/trello/connection returns connected metadata only', async () => {
    const state = await fetchConnectState(base(), auth);

    setTrelloFetchForTests(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ id: 'memberIntegration123', username: 'integration_user' }),
    }));

    await request(`${base()}/api/trello/connect/complete`, {
      method: 'POST',
      headers: auth,
      body: { token: CONNECT_TOKEN, state },
    });

    const { statusCode, body } = await request(`${base()}/api/trello/connection`, {
      headers: auth,
    });

    assert.equal(statusCode, 200);
    assert.equal(body.data.connected, true);
    assert.equal(body.data.trelloMemberId, 'memberIntegration123');
    assert.equal(body.data.trelloUsername, 'integration_user');
    assertNoPlaintextTrelloTokenInValue(body);
  });

  it('POST /api/trello/connect/complete returns TRELLO_AUTH_ERROR for invalid token', async () => {
    const state = await fetchConnectState(base(), auth);

    setTrelloFetchForTests(async () => ({
      ok: false,
      status: 401,
      json: async () => ({ message: 'invalid token' }),
    }));

    const { statusCode, body } = await request(`${base()}/api/trello/connect/complete`, {
      method: 'POST',
      headers: auth,
      body: { token: CONNECT_TOKEN, state },
    });

    assert.equal(statusCode, 401);
    assert.equal(body.error.code, 'TRELLO_AUTH_ERROR');
    assertNoPlaintextTrelloTokenInValue(body);
  });

  it('POST /api/trello/connect/complete returns safe error when encryption key is missing', async () => {
    process.env.TRELLO_OAUTH_STATE_SECRET = randomBytes(32).toString('base64');
    resetEnvCacheForTests();
    const state = await fetchConnectState(base(), auth);

    delete process.env.TRELLO_TOKEN_ENCRYPTION_KEY;
    resetEnvCacheForTests();

    setTrelloFetchForTests(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ id: 'memberIntegration123', username: 'integration_user' }),
    }));

    const { statusCode, body } = await request(`${base()}/api/trello/connect/complete`, {
      method: 'POST',
      headers: auth,
      body: { token: CONNECT_TOKEN, state },
    });

    assert.equal(statusCode, 500);
    assert.equal(body.error.code, 'SERVER_ERROR');
    assert.equal(body.error.message, 'Trello connect is not available');
    assertNoPlaintextTrelloTokenInValue(body);
    assert.equal(getMockTrelloConnections().has(TEST_USER_ID), false);
  });

  it('POST /api/trello/connect/complete returns safe error when encryption key is malformed', async () => {
    process.env.TRELLO_OAUTH_STATE_SECRET = randomBytes(32).toString('base64');
    resetEnvCacheForTests();
    const state = await fetchConnectState(base(), auth);

    process.env.TRELLO_TOKEN_ENCRYPTION_KEY = 'not-valid-base64-key-material';
    resetEnvCacheForTests();

    setTrelloFetchForTests(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ id: 'memberIntegration123', username: 'integration_user' }),
    }));

    const { statusCode, body } = await request(`${base()}/api/trello/connect/complete`, {
      method: 'POST',
      headers: auth,
      body: { token: CONNECT_TOKEN, state },
    });

    assert.equal(statusCode, 500);
    assert.equal(body.error.code, 'SERVER_ERROR');
    assert.equal(body.error.message, 'Trello connect is not available');
    assert.equal(String(body.error.message).includes('base64'), false);
    assertNoPlaintextTrelloTokenInValue(body);
    assert.equal(getMockTrelloConnections().has(TEST_USER_ID), false);
  });

  it('POST /api/trello/disconnect removes connection and returns connected false', async () => {
    const state = await fetchConnectState(base(), auth);

    setTrelloFetchForTests(async (url, options) => {
      if (options?.method === 'DELETE') {
        return { ok: true, status: 200, json: async () => ({ _value: null }) };
      }
      return {
        ok: true,
        status: 200,
        json: async () => ({ id: 'memberIntegration123', username: 'integration_user' }),
      };
    });

    await request(`${base()}/api/trello/connect/complete`, {
      method: 'POST',
      headers: auth,
      body: { token: CONNECT_TOKEN, state },
    });

    const { statusCode, body } = await request(`${base()}/api/trello/disconnect`, {
      method: 'POST',
      headers: auth,
      body: {},
    });

    assert.equal(statusCode, 200);
    assert.deepEqual(body.data, { connected: false });
    assert.equal(getMockTrelloConnections().has(TEST_USER_ID), false);
    assertNoPlaintextTrelloTokenInValue(body);
  });

  it('POST /api/trello/disconnect is idempotent when not connected', async () => {
    const { statusCode, body } = await request(`${base()}/api/trello/disconnect`, {
      method: 'POST',
      headers: auth,
      body: {},
    });

    assert.equal(statusCode, 200);
    assert.deepEqual(body.data, { connected: false });
    assertNoPlaintextTrelloTokenInValue(body);
  });

  it('POST /api/trello/disconnect deletes local connection when revoke fails', async () => {
    const state = await fetchConnectState(base(), auth);

    setTrelloFetchForTests(async (url, options) => {
      if (options?.method === 'DELETE') {
        return { ok: false, status: 401, json: async () => ({ message: 'invalid token' }) };
      }
      return {
        ok: true,
        status: 200,
        json: async () => ({ id: 'memberIntegration123', username: 'integration_user' }),
      };
    });

    await request(`${base()}/api/trello/connect/complete`, {
      method: 'POST',
      headers: auth,
      body: { token: CONNECT_TOKEN, state },
    });

    const { statusCode, body } = await request(`${base()}/api/trello/disconnect`, {
      method: 'POST',
      headers: auth,
      body: {},
    });

    assert.equal(statusCode, 200);
    assert.deepEqual(body.data, { connected: false });
    assert.equal(getMockTrelloConnections().has(TEST_USER_ID), false);
  });

  it('PATCH /api/trello/connection/defaults returns 401 without Authorization', async () => {
    const { statusCode, body } = await request(`${base()}/api/trello/connection/defaults`, {
      method: 'PATCH',
      body: { boardId: 'board123', listId: 'list456' },
    });

    assert.equal(statusCode, 401);
    assert.equal(body.error.code, 'AUTH_REQUIRED');
  });

  it('PATCH /api/trello/connection/defaults returns TRELLO_NOT_CONNECTED when disconnected', async () => {
    const { statusCode, body } = await request(`${base()}/api/trello/connection/defaults`, {
      method: 'PATCH',
      headers: auth,
      body: { boardId: 'board123', listId: 'list456' },
    });

    assert.equal(statusCode, 400);
    assert.equal(body.error.code, 'TRELLO_NOT_CONNECTED');
    assertNoPlaintextTrelloTokenInValue(body);
    assertNoTrelloCredentialsInValue(body);
  });

  it('PATCH /api/trello/connection/defaults rejects invalid boardId', async () => {
    const { statusCode, body } = await request(`${base()}/api/trello/connection/defaults`, {
      method: 'PATCH',
      headers: auth,
      body: { boardId: 'bad-board!', listId: 'list456' },
    });

    assert.equal(statusCode, 400);
    assert.equal(body.error.code, 'VALIDATION_ERROR');
    assertNoPlaintextTrelloTokenInValue(body);
  });

  it('PATCH /api/trello/connection/defaults stores defaults for connected user', async () => {
    const state = await fetchConnectState(base(), auth);

    setTrelloFetchForTests(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ id: 'memberIntegration123', username: 'integration_user' }),
    }));

    await request(`${base()}/api/trello/connect/complete`, {
      method: 'POST',
      headers: auth,
      body: { token: CONNECT_TOKEN, state },
    });

    const { statusCode, body } = await request(`${base()}/api/trello/connection/defaults`, {
      method: 'PATCH',
      headers: auth,
      body: { boardId: 'boardSaved123', listId: 'listSaved456' },
    });

    assert.equal(statusCode, 200);
    assert.equal(body.data.connected, true);
    assert.equal(body.data.defaultBoardId, 'boardSaved123');
    assert.equal(body.data.defaultListId, 'listSaved456');
    assertNoPlaintextTrelloTokenInValue(body);
    assertNoTrelloCredentialsInValue(body);

    const stored = getMockTrelloConnections().get(TEST_USER_ID);
    assert.equal(stored?.default_board_id, 'boardSaved123');
    assert.equal(stored?.default_list_id, 'listSaved456');
  });

  it('PATCH /api/trello/connection/defaults preserves defaults after reconnect same member', async () => {
    const state = await fetchConnectState(base(), auth);

    setTrelloFetchForTests(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ id: 'memberIntegration123', username: 'integration_user' }),
    }));

    await request(`${base()}/api/trello/connect/complete`, {
      method: 'POST',
      headers: auth,
      body: { token: CONNECT_TOKEN, state },
    });

    await request(`${base()}/api/trello/connection/defaults`, {
      method: 'PATCH',
      headers: auth,
      body: { boardId: 'boardSaved123', listId: 'listSaved456' },
    });

    const secondState = await fetchConnectState(base(), auth);
    await request(`${base()}/api/trello/connect/complete`, {
      method: 'POST',
      headers: auth,
      body: { token: CONNECT_TOKEN, state: secondState },
    });

    const { statusCode, body } = await request(`${base()}/api/trello/connection`, {
      headers: auth,
    });

    assert.equal(statusCode, 200);
    assert.equal(body.data.defaultBoardId, 'boardSaved123');
    assert.equal(body.data.defaultListId, 'listSaved456');
    assertNoPlaintextTrelloTokenInValue(body);
  });

  it('PATCH /api/trello/connection/defaults clears defaults after reconnect different member', async () => {
    const state = await fetchConnectState(base(), auth);

    setTrelloFetchForTests(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ id: 'memberIntegration123', username: 'integration_user' }),
    }));

    await request(`${base()}/api/trello/connect/complete`, {
      method: 'POST',
      headers: auth,
      body: { token: CONNECT_TOKEN, state },
    });

    await request(`${base()}/api/trello/connection/defaults`, {
      method: 'PATCH',
      headers: auth,
      body: { boardId: 'boardSaved123', listId: 'listSaved456' },
    });

    setTrelloFetchForTests(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ id: 'otherMember999', username: 'other_user' }),
    }));

    const secondState = await fetchConnectState(base(), auth);
    await request(`${base()}/api/trello/connect/complete`, {
      method: 'POST',
      headers: auth,
      body: { token: CONNECT_TOKEN, state: secondState },
    });

    const { statusCode, body } = await request(`${base()}/api/trello/connection`, {
      headers: auth,
    });

    assert.equal(statusCode, 200);
    assert.equal(body.data.defaultBoardId, null);
    assert.equal(body.data.defaultListId, null);
    assertNoPlaintextTrelloTokenInValue(body);
  });
});
