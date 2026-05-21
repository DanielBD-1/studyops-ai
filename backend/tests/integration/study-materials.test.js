import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { applyTestEnv } from '../helpers/testEnv.js';
import { setSupabaseAdminClientForTests } from '../../src/config/supabase.js';
import {
  createStudyMaterialsMockSupabaseClient,
  OWN_COURSE_ID,
  OTHER_USER_COURSE_ID,
  OWN_MATERIAL_ID,
  OTHER_USER_MATERIAL_ID,
  VALID_STUDY_CONTENT,
} from '../helpers/mockSupabaseStudyMaterials.js';

applyTestEnv();
setSupabaseAdminClientForTests(createStudyMaterialsMockSupabaseClient());

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

describe('study materials API integration', () => {
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

  const base = () => `http://127.0.0.1:${port}`;
  const auth = { Authorization: 'Bearer valid-token' };

  it('GET /api/courses/:id/materials returns 401 without Authorization', async () => {
    const { statusCode, body } = await request(
      `${base()}/api/courses/${OWN_COURSE_ID}/materials`
    );
    assert.equal(statusCode, 401);
    assert.equal(body.error.code, 'AUTH_REQUIRED');
  });

  it('GET /api/study-materials/:materialId returns 401 without Authorization', async () => {
    const { statusCode, body } = await request(
      `${base()}/api/study-materials/${OWN_MATERIAL_ID}`
    );
    assert.equal(statusCode, 401);
    assert.equal(body.error.code, 'AUTH_REQUIRED');
  });

  it('GET list returns metadata only without content', async () => {
    const { statusCode, body } = await request(
      `${base()}/api/courses/${OWN_COURSE_ID}/materials`,
      { headers: auth }
    );
    assert.equal(statusCode, 200);
    assert.equal(body.data.materials.length, 1);
    const item = body.data.materials[0];
    assert.equal(item.id, OWN_MATERIAL_ID);
    assert.equal(item.courseId, OWN_COURSE_ID);
    assert.equal('content' in item, false);
    assert.equal(item.course_id, undefined);
    assert.equal(item.source_type, undefined);
  });

  it('GET list returns 404 for another users course', async () => {
    const { statusCode, body } = await request(
      `${base()}/api/courses/${OTHER_USER_COURSE_ID}/materials`,
      { headers: auth }
    );
    assert.equal(statusCode, 404);
    assert.equal(body.error.code, 'NOT_FOUND');
    assert.equal(body.error.message, 'Course not found');
  });

  it('POST create rejects courseId in body', async () => {
    const { statusCode, body } = await request(
      `${base()}/api/courses/${OWN_COURSE_ID}/materials`,
      {
        method: 'POST',
        headers: auth,
        body: {
          title: 'Valid material title',
          content: VALID_STUDY_CONTENT,
          courseId: OTHER_USER_COURSE_ID,
        },
      }
    );
    assert.equal(statusCode, 400);
    assert.equal(body.error.code, 'VALIDATION_ERROR');
  });

  it('POST create returns MaterialDetail with content', async () => {
    const { statusCode, body } = await request(
      `${base()}/api/courses/${OWN_COURSE_ID}/materials`,
      {
        method: 'POST',
        headers: auth,
        body: {
          title: '  Posted Material  ',
          content: VALID_STUDY_CONTENT,
          sourceType: 'paste',
        },
      }
    );
    assert.equal(statusCode, 201);
    assert.equal(body.data.material.title, 'Posted Material');
    assert.equal(body.data.material.content, VALID_STUDY_CONTENT);
    assert.equal(body.data.material.sourceType, 'paste');
    assert.equal(body.data.material.courseId, OWN_COURSE_ID);
    assert.equal(body.data.material.userId, undefined);
  });

  it('GET detail includes content for owned material', async () => {
    const { statusCode, body } = await request(
      `${base()}/api/study-materials/${OWN_MATERIAL_ID}`,
      { headers: auth }
    );
    assert.equal(statusCode, 200);
    assert.equal(body.data.material.content, VALID_STUDY_CONTENT);
    assert.equal(body.data.material.courses, undefined);
  });

  it('GET detail returns 404 for another users material', async () => {
    const { statusCode, body } = await request(
      `${base()}/api/study-materials/${OTHER_USER_MATERIAL_ID}`,
      { headers: auth }
    );
    assert.equal(statusCode, 404);
    assert.equal(body.error.message, 'Study material not found');
  });

  it('PATCH updates owned material', async () => {
    const { statusCode, body } = await request(
      `${base()}/api/study-materials/${OWN_MATERIAL_ID}`,
      {
        method: 'PATCH',
        headers: auth,
        body: { title: 'Patched material title' },
      }
    );
    assert.equal(statusCode, 200);
    assert.equal(body.data.material.title, 'Patched material title');
  });

  it('PATCH returns 404 for another users material', async () => {
    const { statusCode, body } = await request(
      `${base()}/api/study-materials/${OTHER_USER_MATERIAL_ID}`,
      {
        method: 'PATCH',
        headers: auth,
        body: { title: 'Should not apply' },
      }
    );
    assert.equal(statusCode, 404);
    assert.equal(body.error.message, 'Study material not found');
  });

  it('DELETE returns deleted true for owned material', async () => {
    const created = await request(`${base()}/api/courses/${OWN_COURSE_ID}/materials`, {
      method: 'POST',
      headers: auth,
      body: {
        title: 'Material to delete',
        content: VALID_STUDY_CONTENT,
      },
    });
    const materialId = created.body.data.material.id;

    const { statusCode, body } = await request(
      `${base()}/api/study-materials/${materialId}`,
      { method: 'DELETE', headers: auth }
    );
    assert.equal(statusCode, 200);
    assert.equal(body.data.deleted, true);

    const gone = await request(`${base()}/api/study-materials/${materialId}`, {
      headers: auth,
    });
    assert.equal(gone.statusCode, 404);
  });

  it('POST rejects Gemini fields in body', async () => {
    const { statusCode, body } = await request(
      `${base()}/api/courses/${OWN_COURSE_ID}/materials`,
      {
        method: 'POST',
        headers: auth,
        body: {
          title: 'Valid material title',
          content: VALID_STUDY_CONTENT,
          summary: 'x'.repeat(100),
        },
      }
    );
    assert.equal(statusCode, 400);
    assert.equal(body.error.code, 'VALIDATION_ERROR');
  });
});
