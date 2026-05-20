import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { applyTestEnv } from '../helpers/testEnv.js';
import { setSupabaseAdminClientForTests } from '../../src/config/supabase.js';

applyTestEnv();

setSupabaseAdminClientForTests({
  auth: {
    getUser: async () => ({
      data: { user: null },
      error: { message: 'Invalid JWT' },
    }),
  },
});

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
  const payload = body ? JSON.stringify(body) : undefined;

  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: parsed.hostname,
        port: parsed.port,
        path: parsed.pathname,
        method,
        headers: {
          ...(payload ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) } : {}),
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

describe('auth API integration', () => {
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

  it('POST /api/auth/register rejects invalid email', async () => {
    const { statusCode, body } = await request(`http://127.0.0.1:${port}/api/auth/register`, {
      method: 'POST',
      body: { email: 'not-an-email', password: 'secret12' },
    });
    assert.equal(statusCode, 400);
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'VALIDATION_ERROR');
  });

  it('POST /api/auth/login rejects missing password', async () => {
    const { statusCode, body } = await request(`http://127.0.0.1:${port}/api/auth/login`, {
      method: 'POST',
      body: { email: 'student@example.com' },
    });
    assert.equal(statusCode, 400);
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'VALIDATION_ERROR');
  });

  it('GET /api/auth/me returns 401 without Authorization header', async () => {
    const { statusCode, body } = await request(`http://127.0.0.1:${port}/api/auth/me`);
    assert.equal(statusCode, 401);
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'AUTH_REQUIRED');
  });

  it('GET /api/auth/me returns 401 with invalid bearer token', async () => {
    const { statusCode, body } = await request(`http://127.0.0.1:${port}/api/auth/me`, {
      headers: { Authorization: 'Bearer invalid-token' },
    });
    assert.equal(statusCode, 401);
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'AUTH_REQUIRED');
  });
});
