import { describe, it, before, after, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { applyTestEnv } from '../helpers/testEnv.js';
import { setSupabaseAdminClientForTests } from '../../src/config/supabase.js';
import { setTrelloFetchForTests } from '../../src/clients/trello.client.js';
import {
  createTrelloMockSupabaseClient,
  getMockTasks,
  getMockTrelloSyncLogs,
  resetMockTrelloSyncLogs,
  assertNoTrelloCredentialsInValue,
  OWN_TASK_ID,
  OWN_SYNCED_TASK_ID,
  MISSING_TASK_ID,
} from '../helpers/mockSupabaseTrello.js';

applyTestEnv();
setSupabaseAdminClientForTests(createTrelloMockSupabaseClient());

const { default: app } = await import('../../src/app.js');

const SYNC_BODY = {
  apiKey: 'secret-api-key',
  token: 'secret-token',
  listId: 'manual-list-123',
  taskIds: [OWN_TASK_ID],
};

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

describe('trello API integration', () => {
  /** @type {import('node:http').Server} */
  let server;
  /** @type {number} */
  let port;

  before(async () => {
    server = http.createServer(app);
    await listen(server);
    port = /** @type {import('node:net').AddressInfo} */ (server.address()).port;
  });

  after(() => new Promise((resolve) => server.close(resolve)));

  beforeEach(() => {
    resetMockTrelloSyncLogs();
    const own = getMockTasks().find((t) => t.id === OWN_TASK_ID);
    if (own) {
      own.trello_card_id = null;
    }
  });

  afterEach(() => {
    setTrelloFetchForTests(null);
  });

  const base = () => `http://127.0.0.1:${port}`;
  const auth = { Authorization: 'Bearer valid-token' };

  it('POST /api/trello/sync returns 401 without Authorization', async () => {
    const { statusCode, body } = await request(`${base()}/api/trello/sync`, {
      method: 'POST',
      body: SYNC_BODY,
    });
    assert.equal(statusCode, 401);
    assert.equal(body.error.code, 'AUTH_REQUIRED');
  });

  it('POST /api/trello/sync rejects invalid body', async () => {
    const { statusCode, body } = await request(`${base()}/api/trello/sync`, {
      method: 'POST',
      headers: auth,
      body: { ...SYNC_BODY, taskIds: [] },
    });
    assert.equal(statusCode, 400);
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'VALIDATION_ERROR');
  });

  it('POST /api/trello/sync rejects unknown fields', async () => {
    const { statusCode, body } = await request(`${base()}/api/trello/sync`, {
      method: 'POST',
      headers: auth,
      body: { ...SYNC_BODY, unknown: true },
    });
    assert.equal(statusCode, 400);
    assert.equal(body.error.code, 'VALIDATION_ERROR');
  });

  it('POST /api/trello/sync returns failed result for unknown task without log insert', async () => {
    setTrelloFetchForTests(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ id: 'card' }),
    }));

    const { statusCode, body } = await request(`${base()}/api/trello/sync`, {
      method: 'POST',
      headers: auth,
      body: { ...SYNC_BODY, taskIds: [MISSING_TASK_ID] },
    });

    assert.equal(statusCode, 200);
    assert.equal(body.success, true);
    assert.equal(body.data.results[0].status, 'failed');
    assert.equal(body.data.results[0].error, 'Task not found');
    assert.equal(getMockTrelloSyncLogs().length, 0);
    assertNoTrelloCredentialsInValue(body);
  });

  it('POST /api/trello/sync succeeds for owned unsynced task', async () => {
    setTrelloFetchForTests(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ id: 'integrationCardId' }),
    }));

    const { statusCode, body } = await request(`${base()}/api/trello/sync`, {
      method: 'POST',
      headers: auth,
      body: SYNC_BODY,
    });

    assert.equal(statusCode, 200);
    assert.equal(body.data.results[0].status, 'success');
    assert.equal(body.data.results[0].trelloCardId, 'integrationCardId');
    assert.equal(getMockTasks().find((t) => t.id === OWN_TASK_ID)?.trello_card_id, 'integrationCardId');
    assert.equal(getMockTrelloSyncLogs().length, 1);
    assert.equal(getMockTrelloSyncLogs()[0].status, 'success');
    assertNoTrelloCredentialsInValue(body);
  });

  it('POST /api/trello/sync skips already synced task without Trello call', async () => {
    let fetchCalls = 0;
    setTrelloFetchForTests(async () => {
      fetchCalls += 1;
      return { ok: true, status: 200, json: async () => ({ id: 'x' }) };
    });

    const { statusCode, body } = await request(`${base()}/api/trello/sync`, {
      method: 'POST',
      headers: auth,
      body: { ...SYNC_BODY, taskIds: [OWN_SYNCED_TASK_ID] },
    });

    assert.equal(statusCode, 200);
    assert.equal(fetchCalls, 0);
    assert.equal(body.data.results[0].status, 'skipped');
    assert.equal(getMockTrelloSyncLogs()[0].status, 'skipped');
  });

  it('POST /api/trello/sync returns mixed summary', async () => {
    setTrelloFetchForTests(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ id: 'mixedCard' }),
    }));

    const { statusCode, body } = await request(`${base()}/api/trello/sync`, {
      method: 'POST',
      headers: auth,
      body: {
        ...SYNC_BODY,
        taskIds: [OWN_TASK_ID, OWN_SYNCED_TASK_ID, MISSING_TASK_ID],
      },
    });

    assert.equal(statusCode, 200);
    assert.equal(body.data.summary.total, 3);
    assert.equal(body.data.summary.success, 1);
    assert.equal(body.data.summary.skipped, 1);
    assert.equal(body.data.summary.failed, 1);
    assert.equal(getMockTrelloSyncLogs().length, 2);
    assertNoTrelloCredentialsInValue(body);
  });

  it('POST /api/trello/sync maps Trello 401 to sanitized error', async () => {
    setTrelloFetchForTests(async () => ({
      ok: false,
      status: 401,
      json: async () => ({ message: 'invalid key' }),
    }));

    const { statusCode, body } = await request(`${base()}/api/trello/sync`, {
      method: 'POST',
      headers: auth,
      body: SYNC_BODY,
    });

    assert.equal(statusCode, 200);
    assert.equal(body.data.results[0].error, 'Trello authentication failed');
    assert.equal(getMockTrelloSyncLogs()[0].error_message, 'Trello authentication failed');
    assertNoTrelloCredentialsInValue(body);
    assert.equal(JSON.stringify(body).includes('invalid key'), false);
  });

  it('POST /api/trello/sync maps Trello 404 to list not found', async () => {
    setTrelloFetchForTests(async () => ({
      ok: false,
      status: 404,
      json: async () => ({}),
    }));

    const { statusCode, body } = await request(`${base()}/api/trello/sync`, {
      method: 'POST',
      headers: auth,
      body: SYNC_BODY,
    });

    assert.equal(statusCode, 200);
    assert.equal(body.data.results[0].error, 'Trello list not found');
  });

  it('POST /api/trello/sync maps Trello 429 to rate limit message', async () => {
    setTrelloFetchForTests(async () => ({
      ok: false,
      status: 429,
      json: async () => ({}),
    }));

    const { statusCode, body } = await request(`${base()}/api/trello/sync`, {
      method: 'POST',
      headers: auth,
      body: SYNC_BODY,
    });

    assert.equal(statusCode, 200);
    assert.equal(body.data.results[0].error, 'Trello rate limit reached');
    const logJson = JSON.stringify(getMockTrelloSyncLogs());
    assert.equal(logJson.includes('secret-api-key'), false);
    assert.equal(logJson.includes('secret-token'), false);
  });
});
