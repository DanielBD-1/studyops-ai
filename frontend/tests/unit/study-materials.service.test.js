import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { ApiRequestError } from '../../src/services/courses.service.js';
import {
  listMaterials,
  createMaterial,
  getMaterial,
  updateMaterial,
  deleteMaterial,
  generateMaterial,
  __setApiFetchForTests,
  __setAccessTokenForTests,
} from '../../src/services/study-materials.service.js';

const COURSE_ID = '33333333-3333-4333-8333-333333333333';
const MATERIAL_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const TOKEN = 'test-access-token';
const VALID_CONTENT = 'a'.repeat(100);

const MOCK_PLAN = {
  summary: 'a'.repeat(50),
  keyTopics: ['Topic A'],
  difficulty: 'medium',
  tasks: [
    {
      title: 'Read chapter 1',
      description: 'Focus on definitions',
      priority: 'high',
      estimatedMinutes: 30,
      difficulty: 'medium',
      tags: ['chapter-1'],
    },
  ],
  flashcards: [
    {
      question: 'What is the main idea?',
      answer: 'The main idea is explained in the introduction.',
      tags: ['basics'],
    },
  ],
};

/** @type {Array<{ path: string, init: RequestInit, token?: string }>} */
let calls = [];

beforeEach(() => {
  calls = [];
  __setAccessTokenForTests(TOKEN);
  __setApiFetchForTests(async (path, init, accessToken) => {
    calls.push({ path, init, token: accessToken });
    return {
      success: true,
      data: {},
      meta: { timestamp: new Date().toISOString() },
    };
  });
});

afterEach(() => {
  __setApiFetchForTests(null);
  __setAccessTokenForTests(null);
});

describe('study-materials.service', () => {
  it('listMaterials calls GET /api/courses/:id/materials with Bearer token', async () => {
    __setApiFetchForTests(async (path, init, accessToken) => {
      calls.push({ path, init, token: accessToken });
      return {
        success: true,
        data: { materials: [] },
        meta: { timestamp: new Date().toISOString() },
      };
    });

    const data = await listMaterials(COURSE_ID);
    assert.deepEqual(data, { materials: [] });
    assert.equal(calls.length, 1);
    assert.equal(calls[0].path, `/api/courses/${COURSE_ID}/materials`);
    assert.equal(calls[0].init.method, 'GET');
    assert.equal(calls[0].token, TOKEN);
  });

  it('createMaterial POSTs title, content, and sourceType only', async () => {
    __setApiFetchForTests(async (path, init, accessToken) => {
      calls.push({ path, init, token: accessToken });
      return {
        success: true,
        data: {
          material: {
            id: MATERIAL_ID,
            courseId: COURSE_ID,
            title: 'Chapter 1',
            content: VALID_CONTENT,
            sourceType: 'paste',
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-01T00:00:00.000Z',
          },
        },
        meta: { timestamp: new Date().toISOString() },
      };
    });

    await createMaterial(COURSE_ID, {
      title: 'Chapter 1',
      content: VALID_CONTENT,
      sourceType: 'paste',
    });
    assert.equal(calls[0].path, `/api/courses/${COURSE_ID}/materials`);
    assert.equal(calls[0].init.method, 'POST');
    assert.equal(
      calls[0].init.body,
      JSON.stringify({
        title: 'Chapter 1',
        content: VALID_CONTENT,
        sourceType: 'paste',
      })
    );
    const body = JSON.parse(/** @type {string} */ (calls[0].init.body));
    assert.equal(body.courseId, undefined);
    assert.equal(body.course_id, undefined);
    assert.equal(body.userId, undefined);
  });

  it('getMaterial calls GET /api/study-materials/:materialId', async () => {
    __setApiFetchForTests(async (path, init, accessToken) => {
      calls.push({ path, init, token: accessToken });
      return {
        success: true,
        data: {
          material: {
            id: MATERIAL_ID,
            courseId: COURSE_ID,
            title: 'Chapter 1',
            content: VALID_CONTENT,
            sourceType: 'manual',
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-01T00:00:00.000Z',
          },
        },
        meta: { timestamp: new Date().toISOString() },
      };
    });

    await getMaterial(MATERIAL_ID);
    assert.equal(calls[0].path, `/api/study-materials/${MATERIAL_ID}`);
    assert.equal(calls[0].init.method, 'GET');
  });

  it('updateMaterial PATCHes only allowed fields', async () => {
    __setApiFetchForTests(async (path, init, accessToken) => {
      calls.push({ path, init, token: accessToken });
      return {
        success: true,
        data: {
          material: {
            id: MATERIAL_ID,
            courseId: COURSE_ID,
            title: 'Updated title here',
            content: VALID_CONTENT,
            sourceType: 'manual',
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-02T00:00:00.000Z',
          },
        },
        meta: { timestamp: new Date().toISOString() },
      };
    });

    await updateMaterial(MATERIAL_ID, { title: 'Updated title here' });
    assert.equal(calls[0].path, `/api/study-materials/${MATERIAL_ID}`);
    assert.equal(calls[0].init.method, 'PATCH');
    assert.equal(calls[0].init.body, JSON.stringify({ title: 'Updated title here' }));
  });

  it('deleteMaterial calls DELETE /api/study-materials/:materialId', async () => {
    __setApiFetchForTests(async (path, init, accessToken) => {
      calls.push({ path, init, token: accessToken });
      return {
        success: true,
        data: { deleted: true },
        meta: { timestamp: new Date().toISOString() },
      };
    });

    const data = await deleteMaterial(MATERIAL_ID);
    assert.equal(data.deleted, true);
    assert.equal(calls[0].path, `/api/study-materials/${MATERIAL_ID}`);
    assert.equal(calls[0].init.method, 'DELETE');
  });

  it('generateMaterial POSTs to /api/study-materials/:materialId/generate with empty body', async () => {
    __setApiFetchForTests(async (path, init, accessToken) => {
      calls.push({ path, init, token: accessToken });
      return {
        success: true,
        data: {
          materialId: MATERIAL_ID,
          courseId: COURSE_ID,
          plan: MOCK_PLAN,
        },
        meta: { timestamp: new Date().toISOString() },
      };
    });

    const data = await generateMaterial(MATERIAL_ID);
    assert.deepEqual(data, {
      materialId: MATERIAL_ID,
      courseId: COURSE_ID,
      plan: MOCK_PLAN,
    });
    assert.equal(calls.length, 1);
    assert.equal(calls[0].path, `/api/study-materials/${MATERIAL_ID}/generate`);
    assert.equal(calls[0].init.method, 'POST');
    assert.equal(calls[0].token, TOKEN);
    assert.equal(calls[0].init.body, JSON.stringify({}));

    const body = JSON.parse(/** @type {string} */ (calls[0].init.body));
    assert.deepEqual(body, {});
    assert.equal(body.studyText, undefined);
    assert.equal(body.content, undefined);
    assert.equal(body.courseId, undefined);
    assert.equal(body.course_id, undefined);
    assert.equal(body.userId, undefined);
    assert.equal(body.user_id, undefined);
  });

  it('generateMaterial propagates ApiRequestError for backend failures', async () => {
    __setApiFetchForTests(async () => ({
      success: false,
      error: {
        code: 'GEMINI_TIMEOUT',
        message: 'Request timed out, please try shorter text',
      },
      meta: { timestamp: new Date().toISOString() },
    }));

    await assert.rejects(
      () => generateMaterial(MATERIAL_ID),
      (err) => {
        assert.ok(err instanceof ApiRequestError);
        assert.equal(err.code, 'GEMINI_TIMEOUT');
        assert.equal(err.message, 'Request timed out, please try shorter text');
        return true;
      }
    );
  });

  it('throws ApiRequestError when API returns failure', async () => {
    __setApiFetchForTests(async () => ({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Study material not found' },
      meta: { timestamp: new Date().toISOString() },
    }));

    await assert.rejects(
      () => getMaterial(MATERIAL_ID),
      (err) => {
        assert.ok(err instanceof ApiRequestError);
        assert.equal(err.code, 'NOT_FOUND');
        assert.equal(err.message, 'Study material not found');
        return true;
      }
    );
  });
});
