import { describe, it, before, after, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { applyTestEnv } from '../helpers/testEnv.js';
import { setSupabaseAdminClientForTests } from '../../src/config/supabase.js';
import { setDocumentServiceFetchForTests } from '../../src/clients/document-service.client.js';
import {
  createStudyMaterialsMockSupabaseClient,
  OWN_MATERIAL_ID,
  OTHER_USER_MATERIAL_ID,
  resetStudyMaterialsMockOverrides,
} from '../helpers/mockSupabaseStudyMaterials.js';
import {
  documentServiceErrorEnvelope,
  documentServiceSuccessEnvelope,
  MOCK_GEMINI_PLAN,
} from '../helpers/mockDocumentService.js';

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

describe('POST /api/study-materials/:materialId/generate', () => {
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
    resetStudyMaterialsMockOverrides();
    setDocumentServiceFetchForTests(async () => ({
      ok: true,
      status: 200,
      json: async () => documentServiceSuccessEnvelope(MOCK_GEMINI_PLAN),
    }));
  });

  afterEach(() => {
    setDocumentServiceFetchForTests(null);
  });

  const base = () => `http://127.0.0.1:${port}`;
  const auth = { Authorization: 'Bearer valid-token' };
  const generateUrl = (id) => `${base()}/api/study-materials/${id}/generate`;

  it('returns 401 without Authorization', async () => {
    const { statusCode, body } = await request(generateUrl(OWN_MATERIAL_ID), {
      method: 'POST',
    });
    assert.equal(statusCode, 401);
    assert.equal(body.error.code, 'AUTH_REQUIRED');
  });

  it('returns 200 with materialId, courseId, and plan', async () => {
    const { statusCode, body } = await request(generateUrl(OWN_MATERIAL_ID), {
      method: 'POST',
      headers: auth,
    });

    assert.equal(statusCode, 200);
    assert.equal(body.success, true);
    assert.equal(body.data.materialId, OWN_MATERIAL_ID);
    assert.equal(body.data.plan.difficulty, 'medium');
    assert.ok(Array.isArray(body.data.plan.tasks));
  });

  it('returns 404 for wrong-owner material', async () => {
    const { statusCode, body } = await request(
      generateUrl(OTHER_USER_MATERIAL_ID),
      { method: 'POST', headers: auth }
    );

    assert.equal(statusCode, 404);
    assert.equal(body.error.code, 'NOT_FOUND');
    assert.equal(body.error.message, 'Study material not found');
  });

  it('returns 400 for invalid materialId', async () => {
    const { statusCode, body } = await request(generateUrl('not-a-uuid'), {
      method: 'POST',
      headers: auth,
    });

    assert.equal(statusCode, 400);
    assert.equal(body.error.code, 'VALIDATION_ERROR');
  });

  it('returns 400 when body includes studyText', async () => {
    const { statusCode, body } = await request(generateUrl(OWN_MATERIAL_ID), {
      method: 'POST',
      headers: auth,
      body: { studyText: 'x'.repeat(100) },
    });

    assert.equal(statusCode, 400);
    assert.equal(body.error.code, 'VALIDATION_ERROR');
  });

  it('returns 400 when body includes courseId', async () => {
    const { statusCode, body } = await request(generateUrl(OWN_MATERIAL_ID), {
      method: 'POST',
      headers: auth,
      body: { courseId: '33333333-3333-4333-8333-333333333333' },
    });

    assert.equal(statusCode, 400);
    assert.equal(body.error.code, 'VALIDATION_ERROR');
  });

  it('maps document-service GEMINI_TIMEOUT to 504', async () => {
    setDocumentServiceFetchForTests(async () => ({
      ok: true,
      status: 504,
      json: async () =>
        documentServiceErrorEnvelope(
          'GEMINI_TIMEOUT',
          'Request timed out, please try shorter text',
          504
        ),
    }));

    const { statusCode, body } = await request(generateUrl(OWN_MATERIAL_ID), {
      method: 'POST',
      headers: auth,
    });

    assert.equal(statusCode, 504);
    assert.equal(body.error.code, 'GEMINI_TIMEOUT');
  });

  it('maps document-service GEMINI_RATE_LIMIT to 429', async () => {
    setDocumentServiceFetchForTests(async () => ({
      ok: true,
      status: 429,
      json: async () =>
        documentServiceErrorEnvelope(
          'GEMINI_RATE_LIMIT',
          'Service temporarily unavailable, please wait 1 minute',
          429
        ),
    }));

    const { statusCode, body } = await request(generateUrl(OWN_MATERIAL_ID), {
      method: 'POST',
      headers: auth,
    });

    assert.equal(statusCode, 429);
    assert.equal(body.error.code, 'GEMINI_RATE_LIMIT');
  });

  it('maps document-service GEMINI_API_ERROR to 500', async () => {
    setDocumentServiceFetchForTests(async () => ({
      ok: true,
      status: 500,
      json: async () =>
        documentServiceErrorEnvelope(
          'GEMINI_API_ERROR',
          'AI processing failed, please try again',
          500
        ),
    }));

    const { statusCode, body } = await request(generateUrl(OWN_MATERIAL_ID), {
      method: 'POST',
      headers: auth,
    });

    assert.equal(statusCode, 500);
    assert.equal(body.error.code, 'GEMINI_API_ERROR');
  });

  it('maps document-service GEMINI_INVALID_RESPONSE to 500', async () => {
    setDocumentServiceFetchForTests(async () => ({
      ok: true,
      status: 500,
      json: async () =>
        documentServiceErrorEnvelope(
          'GEMINI_INVALID_RESPONSE',
          'Invalid response from AI, please try again',
          500
        ),
    }));

    const { statusCode, body } = await request(generateUrl(OWN_MATERIAL_ID), {
      method: 'POST',
      headers: auth,
    });

    assert.equal(statusCode, 500);
    assert.equal(body.error.code, 'GEMINI_INVALID_RESPONSE');
  });

  it('maps document-service unreachable to SERVER_ERROR 503', async () => {
    setDocumentServiceFetchForTests(async () => {
      throw new Error('fetch failed');
    });

    const { statusCode, body } = await request(generateUrl(OWN_MATERIAL_ID), {
      method: 'POST',
      headers: auth,
    });

    assert.equal(statusCode, 503);
    assert.equal(body.error.code, 'SERVER_ERROR');
    assert.match(body.error.message, /Processing service unavailable/);
  });
});
