import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { applyTestEnv } from '../helpers/testEnv.js';
import { setSupabaseAdminClientForTests } from '../../src/config/supabase.js';
import {
  createCoursesMockSupabaseClient,
  TEST_USER_ID,
  OWN_COURSE_ID,
  OTHER_USER_COURSE_ID,
} from '../helpers/mockSupabaseCourses.js';

applyTestEnv();
setSupabaseAdminClientForTests(createCoursesMockSupabaseClient());

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

describe('courses API integration', () => {
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

  it('GET /api/courses returns 401 without Authorization', async () => {
    const { statusCode, body } = await request(`http://127.0.0.1:${port}/api/courses`);
    assert.equal(statusCode, 401);
    assert.equal(body.error.code, 'AUTH_REQUIRED');
  });

  it('POST /api/courses rejects userId in body', async () => {
    const { statusCode, body } = await request(`http://127.0.0.1:${port}/api/courses`, {
      method: 'POST',
      headers: { Authorization: 'Bearer valid-token' },
      body: { title: 'Valid title', userId: TEST_USER_ID },
    });
    assert.equal(statusCode, 400);
    assert.equal(body.error.code, 'VALIDATION_ERROR');
  });

  it('GET /api/courses returns camelCase courses for authenticated user', async () => {
    const { statusCode, body } = await request(`http://127.0.0.1:${port}/api/courses`, {
      headers: { Authorization: 'Bearer valid-token' },
    });
    assert.equal(statusCode, 200);
    assert.equal(body.data.courses.length, 1);
    const course = body.data.courses[0];
    assert.equal(course.id, OWN_COURSE_ID);
    assert.equal(course.title, 'Own Course');
    assert.ok(course.createdAt);
    assert.ok(course.updatedAt);
    assert.equal(course.user_id, undefined);
    assert.equal(course.userId, undefined);
  });

  it('GET /api/courses/:id returns 404 for another users course', async () => {
    const { statusCode, body } = await request(
      `http://127.0.0.1:${port}/api/courses/${OTHER_USER_COURSE_ID}`,
      { headers: { Authorization: 'Bearer valid-token' } }
    );
    assert.equal(statusCode, 404);
    assert.equal(body.error.code, 'NOT_FOUND');
  });

  it('GET /api/courses/:id returns course and zero stats stub', async () => {
    const { statusCode, body } = await request(
      `http://127.0.0.1:${port}/api/courses/${OWN_COURSE_ID}`,
      { headers: { Authorization: 'Bearer valid-token' } }
    );
    assert.equal(statusCode, 200);
    assert.equal(body.data.course.id, OWN_COURSE_ID);
    assert.deepEqual(body.data.stats, {
      totalTasks: 0,
      completedTasks: 0,
      totalFlashcards: 0,
    });
  });

  it('POST /api/courses creates course with camelCase response', async () => {
    const { statusCode, body } = await request(`http://127.0.0.1:${port}/api/courses`, {
      method: 'POST',
      headers: { Authorization: 'Bearer valid-token' },
      body: { title: '  New Course  ' },
    });
    assert.equal(statusCode, 201);
    assert.equal(body.data.course.title, 'New Course');
    assert.ok(body.data.course.createdAt);
    assert.equal(body.data.course.userId, undefined);
  });
});
