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

const TEST_API_KEY = 'integration-trello-api-key';
const TEST_ENCRYPTION_KEY = randomBytes(32).toString('base64');
const CONNECT_TOKEN = 'ATTAsecretPlaintextTokenForIntegrationTests';

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
    const { statusCode, body } = await request(`${base()}/api/trello/connect/complete`, {
      method: 'POST',
      body: { token: CONNECT_TOKEN },
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

  it('GET /api/trello/authorize-url returns authorizeUrl', async () => {
    const { statusCode, body } = await request(`${base()}/api/trello/authorize-url`, {
      headers: auth,
    });

    assert.equal(statusCode, 200);
    assert.equal(body.success, true);
    assert.ok(typeof body.data.authorizeUrl === 'string');

    const url = new URL(body.data.authorizeUrl);
    assert.equal(url.searchParams.get('response_type'), 'token');
    assert.equal(url.searchParams.get('callback_method'), 'fragment');
    assert.equal(url.searchParams.get('scope'), 'read,write');
    assert.equal(url.searchParams.get('expiration'), 'never');
    assert.equal(
      url.searchParams.get('return_url'),
      'http://localhost:5173/trello/connect/callback'
    );
    assert.equal(body.data.authorizeUrl.includes(CONNECT_TOKEN), false);
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
    delete process.env.TRELLO_API_KEY;
    resetEnvCacheForTests();

    const { statusCode, body } = await request(`${base()}/api/trello/connect/complete`, {
      method: 'POST',
      headers: auth,
      body: { token: CONNECT_TOKEN },
    });

    assert.equal(statusCode, 503);
    assert.equal(body.error.code, 'SERVER_ERROR');
    assert.equal(body.error.message, 'Trello connect is not available');
    assertNoPlaintextTrelloTokenInValue(body);
    assert.equal(getMockTrelloConnections().has(TEST_USER_ID), false);
  });

  it('POST /api/trello/connect/complete rejects empty token', async () => {
    const { statusCode, body } = await request(`${base()}/api/trello/connect/complete`, {
      method: 'POST',
      headers: auth,
      body: { token: '   ' },
    });

    assert.equal(statusCode, 400);
    assert.equal(body.error.code, 'VALIDATION_ERROR');
    assertNoPlaintextTrelloTokenInValue(body);
  });

  it('POST /api/trello/connect/complete rejects unknown fields', async () => {
    const { statusCode, body } = await request(`${base()}/api/trello/connect/complete`, {
      method: 'POST',
      headers: auth,
      body: { token: CONNECT_TOKEN, apiKey: 'extra' },
    });

    assert.equal(statusCode, 400);
    assert.equal(body.error.code, 'VALIDATION_ERROR');
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
      body: { token: CONNECT_TOKEN },
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
    setTrelloFetchForTests(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ id: 'memberIntegration123', username: 'integration_user' }),
    }));

    await request(`${base()}/api/trello/connect/complete`, {
      method: 'POST',
      headers: auth,
      body: { token: CONNECT_TOKEN },
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
    setTrelloFetchForTests(async () => ({
      ok: false,
      status: 401,
      json: async () => ({ message: 'invalid token' }),
    }));

    const { statusCode, body } = await request(`${base()}/api/trello/connect/complete`, {
      method: 'POST',
      headers: auth,
      body: { token: CONNECT_TOKEN },
    });

    assert.equal(statusCode, 401);
    assert.equal(body.error.code, 'TRELLO_AUTH_ERROR');
    assertNoPlaintextTrelloTokenInValue(body);
  });

  it('POST /api/trello/connect/complete returns safe error when encryption key is missing', async () => {
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
      body: { token: CONNECT_TOKEN },
    });

    assert.equal(statusCode, 500);
    assert.equal(body.error.code, 'SERVER_ERROR');
    assert.equal(body.error.message, 'Trello connect is not available');
    assertNoPlaintextTrelloTokenInValue(body);
    assert.equal(getMockTrelloConnections().has(TEST_USER_ID), false);
  });

  it('POST /api/trello/connect/complete returns safe error when encryption key is malformed', async () => {
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
      body: { token: CONNECT_TOKEN },
    });

    assert.equal(statusCode, 500);
    assert.equal(body.error.code, 'SERVER_ERROR');
    assert.equal(body.error.message, 'Trello connect is not available');
    assert.equal(String(body.error.message).includes('base64'), false);
    assertNoPlaintextTrelloTokenInValue(body);
    assert.equal(getMockTrelloConnections().has(TEST_USER_ID), false);
  });

  it('POST /api/trello/disconnect removes connection and returns connected false', async () => {
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
      body: { token: CONNECT_TOKEN },
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
      body: { token: CONNECT_TOKEN },
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
});
