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
  getMockTasks,
  getMockTrelloSyncLogs,
  resetMockTrelloSyncLogs,
  assertNoTrelloCredentialsInValue,
  OWN_TASK_ID,
  TEST_USER_ID,
} from '../helpers/mockSupabaseTrello.js';
import {
  getMockTrelloConnections,
  resetMockTrelloConnections,
  assertNoPlaintextTrelloTokenInValue,
} from '../helpers/mockSupabaseTrelloConnection.js';
import { createTrelloOAuthState } from '../../src/modules/trello/trello-oauth-state.js';

const TEST_API_KEY = 'integration-stored-trello-api-key';
const TEST_ENCRYPTION_KEY = randomBytes(32).toString('base64');
const CONNECT_TOKEN = 'ATTAsecretPlaintextTokenForIntegrationTests';
const MANUAL_API_KEY = 'secret-api-key';
const MANUAL_TOKEN = 'secret-token';
const BOARD_ID = 'boardABC123';
const STORED_LIST_ID = 'stored-list-456';

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
async function seedStoredConnection(baseUrl, headers) {
  const { statusCode, body } = await request(`${baseUrl}/api/trello/authorize-url`, {
    headers,
  });
  assert.equal(statusCode, 200);
  const state = extractStateFromAuthorizeUrl(body.data.authorizeUrl);

  setTrelloFetchForTests(async (url) => {
    assert.ok(url.includes('/members/me'));
    return {
      ok: true,
      status: 200,
      json: async () => ({ id: 'memberStored123', username: 'stored_user' }),
    };
  });

  const complete = await request(`${baseUrl}/api/trello/connect/complete`, {
    method: 'POST',
    headers,
    body: { token: CONNECT_TOKEN, state },
  });

  assert.equal(complete.statusCode, 200);
  assert.equal(getMockTrelloConnections().has(TEST_USER_ID), true);
}

describe('trello stored credentials API integration', () => {
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
    resetMockTrelloSyncLogs();
    resetMockTrelloConnections();
    const own = getMockTasks().find((t) => t.id === OWN_TASK_ID);
    if (own) {
      own.trello_card_id = null;
    }
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

  it('POST /api/trello/boards with stored mode uses server key and decrypted token', async () => {
    await seedStoredConnection(base(), auth);

    setTrelloFetchForTests(async (url) => {
      assert.ok(url.includes(`key=${TEST_API_KEY}`));
      assert.ok(url.includes(`token=${encodeURIComponent(CONNECT_TOKEN)}`));
      assert.equal(url.includes(MANUAL_API_KEY), false);
      assert.equal(url.includes(MANUAL_TOKEN), false);
      return {
        ok: true,
        status: 200,
        json: async () => [{ id: 'b1', name: 'Alpha', closed: false }],
      };
    });

    const { statusCode, body } = await request(`${base()}/api/trello/boards`, {
      method: 'POST',
      headers: auth,
      body: {},
    });

    assert.equal(statusCode, 200);
    assert.deepEqual(body.data.boards, [{ id: 'b1', name: 'Alpha' }]);
    assertNoTrelloCredentialsInValue(body);
    assertNoPlaintextTrelloTokenInValue(body);
  });

  it('POST /api/trello/boards/:boardId/lists with stored mode uses stored token', async () => {
    await seedStoredConnection(base(), auth);

    setTrelloFetchForTests(async (url) => {
      assert.ok(url.includes(`token=${encodeURIComponent(CONNECT_TOKEN)}`));
      return {
        ok: true,
        status: 200,
        json: async () => [{ id: 'l1', name: 'To Do', closed: false }],
      };
    });

    const { statusCode, body } = await request(
      `${base()}/api/trello/boards/${BOARD_ID}/lists`,
      {
        method: 'POST',
        headers: auth,
        body: {},
      }
    );

    assert.equal(statusCode, 200);
    assert.deepEqual(body.data.lists, [{ id: 'l1', name: 'To Do' }]);
    assertNoPlaintextTrelloTokenInValue(body);
  });

  it('POST /api/trello/sync with stored mode succeeds and logs without credentials', async () => {
    await seedStoredConnection(base(), auth);

    setTrelloFetchForTests(async (url) => {
      assert.ok(url.includes(`token=${encodeURIComponent(CONNECT_TOKEN)}`));
      return {
        ok: true,
        status: 200,
        json: async () => ({ id: 'storedSyncCardId' }),
      };
    });

    const { statusCode, body } = await request(`${base()}/api/trello/sync`, {
      method: 'POST',
      headers: auth,
      body: { listId: STORED_LIST_ID, taskIds: [OWN_TASK_ID] },
    });

    assert.equal(statusCode, 200);
    assert.equal(body.data.results[0].status, 'success');
    assert.equal(body.data.results[0].trelloCardId, 'storedSyncCardId');
    assert.equal(getMockTrelloSyncLogs().length, 1);
    assert.equal(JSON.stringify(getMockTrelloSyncLogs()).includes(CONNECT_TOKEN), false);
    assertNoPlaintextTrelloTokenInValue(body);
  });

  it('POST /api/trello/boards with stored mode returns TRELLO_NOT_CONNECTED when disconnected', async () => {
    const { statusCode, body } = await request(`${base()}/api/trello/boards`, {
      method: 'POST',
      headers: auth,
      body: {},
    });

    assert.equal(statusCode, 400);
    assert.equal(body.error.code, 'TRELLO_NOT_CONNECTED');
    assertNoPlaintextTrelloTokenInValue(body);
  });

  it('POST /api/trello/sync with stored mode returns TRELLO_NOT_CONNECTED when disconnected', async () => {
    const { statusCode, body } = await request(`${base()}/api/trello/sync`, {
      method: 'POST',
      headers: auth,
      body: { listId: STORED_LIST_ID, taskIds: [OWN_TASK_ID] },
    });

    assert.equal(statusCode, 400);
    assert.equal(body.error.code, 'TRELLO_NOT_CONNECTED');
  });

  it('POST /api/trello/boards rejects partial credentials', async () => {
    const { statusCode, body } = await request(`${base()}/api/trello/boards`, {
      method: 'POST',
      headers: auth,
      body: { apiKey: MANUAL_API_KEY },
    });

    assert.equal(statusCode, 400);
    assert.equal(body.error.code, 'VALIDATION_ERROR');
  });

  it('POST /api/trello/boards with manual body still works when user is connected', async () => {
    await seedStoredConnection(base(), auth);

    setTrelloFetchForTests(async (url) => {
      assert.ok(url.includes(`key=${MANUAL_API_KEY}`));
      assert.ok(url.includes(`token=${encodeURIComponent(MANUAL_TOKEN)}`));
      assert.equal(url.includes(CONNECT_TOKEN), false);
      return {
        ok: true,
        status: 200,
        json: async () => [{ id: 'b2', name: 'Manual', closed: false }],
      };
    });

    const { statusCode, body } = await request(`${base()}/api/trello/boards`, {
      method: 'POST',
      headers: auth,
      body: { apiKey: MANUAL_API_KEY, token: MANUAL_TOKEN },
    });

    assert.equal(statusCode, 200);
    assert.deepEqual(body.data.boards, [{ id: 'b2', name: 'Manual' }]);
  });

  it('POST /api/trello/boards stored mode maps revoked token to TRELLO_AUTH_ERROR', async () => {
    await seedStoredConnection(base(), auth);

    setTrelloFetchForTests(async () => ({
      ok: false,
      status: 401,
      json: async () => ({ message: 'invalid token' }),
    }));

    const { statusCode, body } = await request(`${base()}/api/trello/boards`, {
      method: 'POST',
      headers: auth,
      body: {},
    });

    assert.equal(statusCode, 401);
    assert.equal(body.error.code, 'TRELLO_AUTH_ERROR');
    assert.equal(JSON.stringify(body).includes('invalid token'), false);
  });

  it('OAuth state helper remains importable for connect seed flow', () => {
    const state = createTrelloOAuthState(TEST_USER_ID);
    assert.ok(state.length > 0);
  });
});
