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
  getMockGeneratedPlans,
  resetStudyMaterialsMockOverrides,
  setStudyMaterialsMockOverrides,
} from '../helpers/mockSupabaseStudyMaterials.js';
import {
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

describe('study material generated plan API', () => {
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
  const planUrl = (id) => `${base()}/api/study-materials/${id}/generated-plan`;
  const generateUrl = (id) => `${base()}/api/study-materials/${id}/generate`;

  async function persistPlanForOwnMaterial() {
    const { statusCode } = await request(generateUrl(OWN_MATERIAL_ID), {
      method: 'POST',
      headers: auth,
    });
    assert.equal(statusCode, 200);
  }

  it('GET returns 401 without Authorization', async () => {
    const { statusCode, body } = await request(planUrl(OWN_MATERIAL_ID));
    assert.equal(statusCode, 401);
    assert.equal(body.error.code, 'AUTH_REQUIRED');
  });

  it('GET returns 404 when no saved plan', async () => {
    const { statusCode, body } = await request(planUrl(OWN_MATERIAL_ID), {
      headers: auth,
    });

    assert.equal(statusCode, 404);
    assert.equal(body.error.code, 'NOT_FOUND');
    assert.equal(body.error.message, 'Generated plan not found');
  });

  it('GET returns saved plan after generate', async () => {
    await persistPlanForOwnMaterial();

    const { statusCode, body } = await request(planUrl(OWN_MATERIAL_ID), {
      headers: auth,
    });

    assert.equal(statusCode, 200);
    assert.equal(body.data.materialId, OWN_MATERIAL_ID);
    assert.equal(body.data.plan.difficulty, 'medium');
    assert.equal(body.data.savedAt, '2026-01-10T00:00:00.000Z');
  });

  it('GET returns 404 for wrong-owner material', async () => {
    await persistPlanForOwnMaterial();

    const { statusCode, body } = await request(planUrl(OTHER_USER_MATERIAL_ID), {
      headers: auth,
    });

    assert.equal(statusCode, 404);
    assert.equal(body.error.code, 'NOT_FOUND');
    assert.equal(body.error.message, 'Study material not found');
  });

  it('DELETE returns 401 without Authorization', async () => {
    const { statusCode, body } = await request(planUrl(OWN_MATERIAL_ID), {
      method: 'DELETE',
    });
    assert.equal(statusCode, 401);
    assert.equal(body.error.code, 'AUTH_REQUIRED');
  });

  it('DELETE returns 404 when no saved plan', async () => {
    const { statusCode, body } = await request(planUrl(OWN_MATERIAL_ID), {
      method: 'DELETE',
      headers: auth,
    });

    assert.equal(statusCode, 404);
    assert.equal(body.error.code, 'NOT_FOUND');
    assert.equal(body.error.message, 'Generated plan not found');
  });

  it('DELETE returns deleted true and removes plan', async () => {
    await persistPlanForOwnMaterial();

    const { statusCode, body } = await request(planUrl(OWN_MATERIAL_ID), {
      method: 'DELETE',
      headers: auth,
    });

    assert.equal(statusCode, 200);
    assert.equal(body.data.deleted, true);
    assert.equal(getMockGeneratedPlans().length, 0);
  });

  it('DELETE second time returns 404', async () => {
    await persistPlanForOwnMaterial();

    await request(planUrl(OWN_MATERIAL_ID), { method: 'DELETE', headers: auth });

    const { statusCode, body } = await request(planUrl(OWN_MATERIAL_ID), {
      method: 'DELETE',
      headers: auth,
    });

    assert.equal(statusCode, 404);
    assert.equal(body.error.code, 'NOT_FOUND');
  });

  it('DELETE returns 404 for wrong-owner material', async () => {
    await persistPlanForOwnMaterial();

    const { statusCode, body } = await request(planUrl(OTHER_USER_MATERIAL_ID), {
      method: 'DELETE',
      headers: auth,
    });

    assert.equal(statusCode, 404);
    assert.equal(body.error.message, 'Study material not found');
  });
});

describe('POST /generate persistence', () => {
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

  it('persists plan and returns savedAt', async () => {
    const { statusCode, body } = await request(generateUrl(OWN_MATERIAL_ID), {
      method: 'POST',
      headers: auth,
    });

    assert.equal(statusCode, 200);
    assert.equal(body.data.savedAt, '2026-01-10T00:00:00.000Z');
    assert.equal(getMockGeneratedPlans().length, 1);
    assert.equal(getMockGeneratedPlans()[0].study_material_id, OWN_MATERIAL_ID);
  });

  it('rejects plan in generate body', async () => {
    const { statusCode, body } = await request(generateUrl(OWN_MATERIAL_ID), {
      method: 'POST',
      headers: auth,
      body: { plan: MOCK_GEMINI_PLAN },
    });

    assert.equal(statusCode, 400);
    assert.equal(body.error.code, 'VALIDATION_ERROR');
    assert.equal(getMockGeneratedPlans().length, 0);
  });

  it('rejects userId in generate body', async () => {
    const { statusCode, body } = await request(generateUrl(OWN_MATERIAL_ID), {
      method: 'POST',
      headers: auth,
      body: { userId: '11111111-1111-4111-8111-111111111111' },
    });

    assert.equal(statusCode, 400);
    assert.equal(body.error.code, 'VALIDATION_ERROR');
  });

  it('does not persist invalid plan from document-service', async () => {
    setDocumentServiceFetchForTests(async () => ({
      ok: true,
      status: 200,
      json: async () =>
        documentServiceSuccessEnvelope({
          ...MOCK_GEMINI_PLAN,
          summary: 'too short',
        }),
    }));

    const { statusCode, body } = await request(generateUrl(OWN_MATERIAL_ID), {
      method: 'POST',
      headers: auth,
    });

    assert.equal(statusCode, 500);
    assert.equal(body.error.code, 'GEMINI_INVALID_RESPONSE');
    assert.equal(getMockGeneratedPlans().length, 0);
  });

  it('returns DATABASE_ERROR when upsert fails', async () => {
    setStudyMaterialsMockOverrides({
      generatedPlanUpsertError: { code: 'XX000', message: 'upsert failed' },
    });

    const { statusCode, body } = await request(generateUrl(OWN_MATERIAL_ID), {
      method: 'POST',
      headers: auth,
    });

    assert.equal(statusCode, 500);
    assert.equal(body.error.code, 'DATABASE_ERROR');
    assert.equal(getMockGeneratedPlans().length, 0);
  });
});
