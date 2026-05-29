import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { applyTestEnv } from '../helpers/testEnv.js';
import { setSupabaseAdminClientForTests } from '../../src/config/supabase.js';
import { createAdminMockSupabaseClient } from '../helpers/mockSupabaseAdmin.js';

applyTestEnv();
setSupabaseAdminClientForTests(createAdminMockSupabaseClient());

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
        path: parsed.pathname + parsed.search,
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
 * @param {unknown} value
 * @param {string} [path]
 */
function assertNoPrivateAdminFields(value, path = 'root') {
  if (value === null || value === undefined) return;
  if (typeof value !== 'object') return;

  const obj = /** @type {Record<string, unknown>} */ (value);
  const forbidden = [
    'email',
    'userId',
    'user_id',
    'profile',
    'access_token',
    'refresh_token',
    'token',
    'users',
    'content',
    'plan',
    'description',
    'apiKey',
    'trelloCardId',
    'trello_card_id',
  ];

  for (const key of forbidden) {
    assert.equal(key in obj, false, `${key} at ${path}`);
  }

  if ('id' in obj && path !== 'root') {
    assert.fail(`unexpected id at ${path}`);
  }

  for (const [key, child] of Object.entries(obj)) {
    assertNoPrivateAdminFields(child, `${path}.${key}`);
  }
}

describe('admin API integration', () => {
  /** @type {import('node:http').Server} */
  let server;
  /** @type {number} */
  let port;

  before(async () => {
    server = http.createServer(app);
    await listen(server);
    port = /** @type {import('node:net').AddressInfo} */ (server.address()).port;
  });

  after(async () => {
    await new Promise((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve(undefined)));
    });
  });

  it('GET /api/admin/access-check without token returns 401 AUTH_REQUIRED', async () => {
    const res = await request(`http://127.0.0.1:${port}/api/admin/access-check`);
    assert.equal(res.statusCode, 401);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'AUTH_REQUIRED');
  });

  it('GET /api/admin/access-check with student token returns 403 FORBIDDEN', async () => {
    const res = await request(`http://127.0.0.1:${port}/api/admin/access-check`, {
      headers: { Authorization: 'Bearer student-token' },
    });
    assert.equal(res.statusCode, 403);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'FORBIDDEN');
    assert.equal(res.body.error.message, 'Admin access required');
  });

  it('GET /api/admin/access-check with admin token returns 200 and minimal payload', async () => {
    const res = await request(`http://127.0.0.1:${port}/api/admin/access-check`, {
      headers: { Authorization: 'Bearer admin-token' },
    });
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.deepEqual(res.body.data, { admin: true });
    assert.equal(typeof res.body.meta.timestamp, 'string');
    assertNoPrivateAdminFields(res.body);
  });
});
