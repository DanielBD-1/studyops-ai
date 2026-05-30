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

describe('generated plans history API', () => {
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

  /** @type {number} */
  let documentServiceCalls;

  beforeEach(() => {
    resetStudyMaterialsMockOverrides();
    documentServiceCalls = 0;
    setDocumentServiceFetchForTests(async () => {
      documentServiceCalls += 1;
      return {
        ok: true,
        status: 200,
        json: async () => documentServiceSuccessEnvelope(MOCK_GEMINI_PLAN),
      };
    });
  });

  afterEach(() => {
    setDocumentServiceFetchForTests(null);
  });

  const base = () => `http://127.0.0.1:${port}`;
  const auth = { Authorization: 'Bearer valid-token' };
  const listUrl = (id) => `${base()}/api/study-materials/${id}/generated-plans`;
  const planUrl = (materialId, planId) =>
    `${base()}/api/study-materials/${materialId}/generated-plans/${planId}`;
  const activateUrl = (materialId, planId) =>
    `${base()}/api/study-materials/${materialId}/generated-plans/${planId}/activate`;
  const generateUrl = (id) => `${base()}/api/study-materials/${id}/generate`;

  async function generateTwice() {
    await request(generateUrl(OWN_MATERIAL_ID), { method: 'POST', headers: auth });
    await request(generateUrl(OWN_MATERIAL_ID), { method: 'POST', headers: auth });
    documentServiceCalls = 0;
  }

  it('list returns metadata only, no plan JSON', async () => {
    await generateTwice();

    const { statusCode, body } = await request(listUrl(OWN_MATERIAL_ID), { headers: auth });

    assert.equal(statusCode, 200);
    assert.equal(body.data.plans.length, 2);
    for (const item of body.data.plans) {
      assert.equal(typeof item.planId, 'string');
      assert.equal(typeof item.savedAt, 'string');
      assert.equal(typeof item.createdAt, 'string');
      assert.equal(typeof item.updatedAt, 'string');
      assert.equal(typeof item.isActive, 'boolean');
      assert.equal('plan' in item, false);
    }
    assert.equal(JSON.stringify(body).includes('"summary"'), false);
  });

  it('list returns empty array for owned material with no history', async () => {
    const { statusCode, body } = await request(listUrl(OWN_MATERIAL_ID), { headers: auth });

    assert.equal(statusCode, 200);
    assert.deepEqual(body.data.plans, []);
    assert.equal(body.data.materialId, OWN_MATERIAL_ID);
  });

  it('list orders newest first', async () => {
    await generateTwice();

    const { body } = await request(listUrl(OWN_MATERIAL_ID), { headers: auth });
    const rows = getMockGeneratedPlans().filter((p) => p.study_material_id === OWN_MATERIAL_ID);
    const newest = rows.sort((a, b) => (a.created_at < b.created_at ? 1 : -1))[0];

    assert.equal(body.data.plans[0].planId, newest.id);
    assert.equal(body.data.plans[0].isActive, true);
  });

  it('get-by-id returns active and inactive owned plans', async () => {
    await generateTwice();
    const rows = getMockGeneratedPlans().filter((p) => p.study_material_id === OWN_MATERIAL_ID);
    const inactive = rows.find((p) => !p.is_active);
    const active = rows.find((p) => p.is_active);
    assert.ok(inactive);
    assert.ok(active);

    const inactiveRes = await request(planUrl(OWN_MATERIAL_ID, inactive.id), { headers: auth });
    assert.equal(inactiveRes.statusCode, 200);
    assert.equal(inactiveRes.body.data.planId, inactive.id);
    assert.equal(inactiveRes.body.data.plan.difficulty, 'medium');

    const activeRes = await request(planUrl(OWN_MATERIAL_ID, active.id), { headers: auth });
    assert.equal(activeRes.statusCode, 200);
    assert.equal(activeRes.body.data.planId, active.id);
  });

  it('get-by-id returns 404 for wrong material', async () => {
    await request(generateUrl(OWN_MATERIAL_ID), { method: 'POST', headers: auth });
    const planId = getMockGeneratedPlans()[0].id;

    const { statusCode, body } = await request(planUrl(OTHER_USER_MATERIAL_ID, planId), {
      headers: auth,
    });

    assert.equal(statusCode, 404);
    assert.equal(body.error.code, 'NOT_FOUND');
    assert.equal(body.error.message, 'Study material not found');
  });

  it('get-by-id returns 404 for wrong owner material', async () => {
    await request(generateUrl(OWN_MATERIAL_ID), { method: 'POST', headers: auth });
    const planId = getMockGeneratedPlans()[0].id;

    const { statusCode, body } = await request(planUrl(OTHER_USER_MATERIAL_ID, planId), {
      headers: auth,
    });

    assert.equal(statusCode, 404);
    assert.equal(body.error.message, 'Study material not found');
  });

  it('get-by-id returns 404 for missing plan', async () => {
    await request(generateUrl(OWN_MATERIAL_ID), { method: 'POST', headers: auth });

    const { statusCode, body } = await request(
      planUrl(OWN_MATERIAL_ID, 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee'),
      { headers: auth }
    );

    assert.equal(statusCode, 404);
    assert.equal(body.error.code, 'NOT_FOUND');
    assert.equal(body.error.message, 'Generated plan not found');
  });

  it('activate inactive plan succeeds and makes it the only active plan', async () => {
    await generateTwice();
    const beforeCount = getMockGeneratedPlans().length;
    const inactive = getMockGeneratedPlans().find(
      (p) => p.study_material_id === OWN_MATERIAL_ID && !p.is_active
    );
    assert.ok(inactive);

    const { statusCode, body } = await request(activateUrl(OWN_MATERIAL_ID, inactive.id), {
      method: 'POST',
      headers: auth,
      body: {},
    });

    assert.equal(statusCode, 200);
    assert.equal(body.data.planId, inactive.id);
    assert.equal(typeof body.data.plan, 'object');
    assert.equal(body.data.plan.difficulty, 'medium');
    assert.equal(typeof body.data.savedAt, 'string');
    assert.equal(documentServiceCalls, 0);
    assert.equal(getMockGeneratedPlans().length, beforeCount);

    const activeRows = getMockGeneratedPlans().filter(
      (p) => p.study_material_id === OWN_MATERIAL_ID && p.is_active
    );
    assert.equal(activeRows.length, 1);
    assert.equal(activeRows[0].id, inactive.id);
  });

  it('activate already-active plan is idempotent 200', async () => {
    await request(generateUrl(OWN_MATERIAL_ID), { method: 'POST', headers: auth });
    const active = getMockGeneratedPlans().find((p) => p.is_active);
    assert.ok(active);

    const { statusCode, body } = await request(activateUrl(OWN_MATERIAL_ID, active.id), {
      method: 'POST',
      headers: auth,
      body: {},
    });

    assert.equal(statusCode, 200);
    assert.equal(body.data.planId, active.id);
    assert.equal(typeof body.data.plan, 'object');
    assert.equal(body.data.plan.difficulty, 'medium');
    assert.equal(getMockGeneratedPlans().filter((p) => p.is_active).length, 1);
  });

  it('activate rejects non-empty body', async () => {
    await request(generateUrl(OWN_MATERIAL_ID), { method: 'POST', headers: auth });
    const planId = getMockGeneratedPlans()[0].id;

    const { statusCode, body } = await request(activateUrl(OWN_MATERIAL_ID, planId), {
      method: 'POST',
      headers: auth,
      body: { plan: MOCK_GEMINI_PLAN },
    });

    assert.equal(statusCode, 400);
    assert.equal(body.error.code, 'VALIDATION_ERROR');
  });

  it('activate does not insert a new row', async () => {
    await generateTwice();
    const countBefore = getMockGeneratedPlans().length;
    const inactive = getMockGeneratedPlans().find((p) => !p.is_active);
    assert.ok(inactive);

    await request(activateUrl(OWN_MATERIAL_ID, inactive.id), {
      method: 'POST',
      headers: auth,
      body: {},
    });

    assert.equal(getMockGeneratedPlans().length, countBefore);
  });

  it('delete inactive plan succeeds', async () => {
    await generateTwice();
    const inactive = getMockGeneratedPlans().find((p) => !p.is_active);
    assert.ok(inactive);
    const countBefore = getMockGeneratedPlans().length;

    const { statusCode, body } = await request(planUrl(OWN_MATERIAL_ID, inactive.id), {
      method: 'DELETE',
      headers: auth,
    });

    assert.equal(statusCode, 200);
    assert.equal(body.data.deleted, true);
    assert.equal(body.data.planId, inactive.id);
    assert.equal(getMockGeneratedPlans().length, countBefore - 1);
    assert.equal(
      getMockGeneratedPlans().some((p) => p.id === inactive.id),
      false
    );
  });

  it('delete active plan returns 409', async () => {
    await request(generateUrl(OWN_MATERIAL_ID), { method: 'POST', headers: auth });
    const active = getMockGeneratedPlans().find((p) => p.is_active);
    assert.ok(active);

    const { statusCode, body } = await request(planUrl(OWN_MATERIAL_ID, active.id), {
      method: 'DELETE',
      headers: auth,
    });

    assert.equal(statusCode, 409);
    assert.equal(body.error.code, 'CONFLICT');
    assert.equal(getMockGeneratedPlans().some((p) => p.id === active.id), true);
  });

  it('second delete returns 404', async () => {
    await generateTwice();
    const inactive = getMockGeneratedPlans().find((p) => !p.is_active);
    assert.ok(inactive);

    await request(planUrl(OWN_MATERIAL_ID, inactive.id), { method: 'DELETE', headers: auth });

    const { statusCode, body } = await request(planUrl(OWN_MATERIAL_ID, inactive.id), {
      method: 'DELETE',
      headers: auth,
    });

    assert.equal(statusCode, 404);
    assert.equal(body.error.code, 'NOT_FOUND');
  });
});
