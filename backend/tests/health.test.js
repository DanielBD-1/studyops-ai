import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import app from '../src/app.js';

function listen(server) {
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

function get(url) {
  return new Promise((resolve, reject) => {
    http
      .get(url, (res) => {
        let body = '';
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => {
          resolve({ statusCode: res.statusCode, body });
        });
      })
      .on('error', reject);
  });
}

describe('backend health', () => {
  /** @type {import('node:http').Server} */
  let server;
  /** @type {number} */
  let port;

  before(async () => {
    server = http.createServer(app);
    await listen(server);
    port = /** @type {import('node:net').AddressInfo} */ (server.address()).port;
  });

  after(() => {
    return new Promise((resolve) => server.close(resolve));
  });

  it('GET /health returns 200 and service name', async () => {
    const { statusCode, body } = await get(`http://127.0.0.1:${port}/health`);
    assert.equal(statusCode, 200);
    const json = JSON.parse(body);
    assert.equal(json.status, 'ok');
    assert.equal(json.service, 'backend');
  });
});
