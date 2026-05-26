import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  listFlashcards,
  createCourseFlashcard,
  updateFlashcard,
  deleteFlashcard,
  __setApiFetchForTests,
  __setAccessTokenForTests,
  ApiRequestError,
} from '../../src/services/flashcards.service.js';

const COURSE_ID = '33333333-3333-4333-8333-333333333333';
const MATERIAL_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const FLASHCARD_ID = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
const TOKEN = 'test-access-token';

const MOCK_FLASHCARD = {
  id: FLASHCARD_ID,
  courseId: COURSE_ID,
  materialId: MATERIAL_ID,
  question: 'What is integration?',
  answer: 'Integration is the inverse of differentiation.',
  tags: ['calculus'],
  source: 'manual',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
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

describe('flashcards.service', () => {
  it('listFlashcards calls GET /api/flashcards with Bearer token', async () => {
    __setApiFetchForTests(async (path, init, accessToken) => {
      calls.push({ path, init, token: accessToken });
      return {
        success: true,
        data: { flashcards: [MOCK_FLASHCARD] },
        meta: { timestamp: new Date().toISOString() },
      };
    });

    const data = await listFlashcards();
    assert.equal(data.flashcards.length, 1);
    assert.equal(calls[0].path, '/api/flashcards');
    assert.equal(calls[0].init.method, 'GET');
    assert.equal(calls[0].token, TOKEN);
    assert.equal('userId' in data.flashcards[0], false);
  });

  it('listFlashcards with materialId sends ?materialId=', async () => {
    __setApiFetchForTests(async (path, init, accessToken) => {
      calls.push({ path, init, token: accessToken });
      return {
        success: true,
        data: { flashcards: [] },
        meta: { timestamp: new Date().toISOString() },
      };
    });

    await listFlashcards({ materialId: MATERIAL_ID });
    assert.equal(calls[0].path, `/api/flashcards?materialId=${MATERIAL_ID}`);
    assert.equal(calls[0].init.method, 'GET');
    assert.equal(calls[0].token, TOKEN);
  });

  it('listFlashcards with courseId sends ?courseId=', async () => {
    __setApiFetchForTests(async (path, init, accessToken) => {
      calls.push({ path, init, token: accessToken });
      return {
        success: true,
        data: { flashcards: [] },
        meta: { timestamp: new Date().toISOString() },
      };
    });

    await listFlashcards({ courseId: COURSE_ID });
    assert.equal(calls[0].path, `/api/flashcards?courseId=${COURSE_ID}`);
    assert.equal(calls[0].token, TOKEN);
  });

  it('listFlashcards with courseId and materialId sends both query params', async () => {
    __setApiFetchForTests(async (path, init, accessToken) => {
      calls.push({ path, init, token: accessToken });
      return {
        success: true,
        data: { flashcards: [] },
        meta: { timestamp: new Date().toISOString() },
      };
    });

    await listFlashcards({ courseId: COURSE_ID, materialId: MATERIAL_ID });
    assert.equal(
      calls[0].path,
      `/api/flashcards?courseId=${COURSE_ID}&materialId=${MATERIAL_ID}`
    );
  });

  it('createCourseFlashcard POSTs allowed fields only', async () => {
    __setApiFetchForTests(async (path, init, accessToken) => {
      calls.push({ path, init, token: accessToken });
      return {
        success: true,
        data: { flashcard: MOCK_FLASHCARD },
        meta: { timestamp: new Date().toISOString() },
      };
    });

    const data = await createCourseFlashcard(COURSE_ID, {
      question: 'What is integration?',
      answer: 'Integration is the inverse of differentiation.',
      tags: ['calculus'],
      materialId: MATERIAL_ID,
    });
    assert.equal(data.flashcard.question, 'What is integration?');
    assert.equal(calls[0].path, `/api/courses/${COURSE_ID}/flashcards`);
    assert.equal(calls[0].init.method, 'POST');
    const body = JSON.parse(String(calls[0].init.body));
    assert.equal(body.question, 'What is integration?');
    assert.equal(body.materialId, MATERIAL_ID);
    assert.equal(body.userId, undefined);
    assert.equal(body.courseId, undefined);
    assert.equal(body.source, undefined);
  });

  it('updateFlashcard PATCHes allowed fields only', async () => {
    __setApiFetchForTests(async (path, init, accessToken) => {
      calls.push({ path, init, token: accessToken });
      return {
        success: true,
        data: { flashcard: { ...MOCK_FLASHCARD, question: 'Updated question text?' } },
        meta: { timestamp: new Date().toISOString() },
      };
    });

    await updateFlashcard(FLASHCARD_ID, {
      question: 'Updated question text?',
    });
    assert.equal(calls[0].path, `/api/flashcards/${FLASHCARD_ID}`);
    assert.equal(calls[0].init.method, 'PATCH');
    const body = JSON.parse(String(calls[0].init.body));
    assert.equal(body.question, 'Updated question text?');
    assert.equal(body.userId, undefined);
    assert.equal(body.courseId, undefined);
  });

  it('deleteFlashcard calls DELETE with Bearer token', async () => {
    __setApiFetchForTests(async (path, init, accessToken) => {
      calls.push({ path, init, token: accessToken });
      return {
        success: true,
        data: { deleted: true },
        meta: { timestamp: new Date().toISOString() },
      };
    });

    const data = await deleteFlashcard(FLASHCARD_ID);
    assert.equal(data.deleted, true);
    assert.equal(calls[0].path, `/api/flashcards/${FLASHCARD_ID}`);
    assert.equal(calls[0].init.method, 'DELETE');
    assert.equal(calls[0].token, TOKEN);
  });

  it('propagates ApiRequestError on API failure envelope', async () => {
    __setApiFetchForTests(async () => ({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Flashcard not found' },
      meta: { timestamp: new Date().toISOString() },
    }));

    await assert.rejects(
      () => deleteFlashcard(FLASHCARD_ID),
      (err) => {
        assert.ok(err instanceof ApiRequestError);
        assert.equal(err.code, 'NOT_FOUND');
        assert.equal(err.message, 'Flashcard not found');
        return true;
      }
    );
  });
});
