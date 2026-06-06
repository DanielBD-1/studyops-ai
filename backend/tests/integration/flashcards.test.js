import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { applyTestEnv } from '../helpers/testEnv.js';
import { setSupabaseAdminClientForTests } from '../../src/config/supabase.js';
import {
  createFlashcardsMockSupabaseClient,
  OWN_COURSE_ID,
  OTHER_USER_COURSE_ID,
  OWN_MATERIAL_ID,
  OTHER_USER_MATERIAL_ID,
  OWN_FLASHCARD_ID,
  OWN_COURSE_LEVEL_FLASHCARD_ID,
  OTHER_USER_FLASHCARD_ID,
} from '../helpers/mockSupabaseFlashcards.js';

applyTestEnv();
setSupabaseAdminClientForTests(createFlashcardsMockSupabaseClient());

const { default: app } = await import('../../src/app.js');

const MISSING_COURSE_ID = '00000000-0000-4000-8000-000000000001';
const MISSING_MATERIAL_ID = '00000000-0000-4000-8000-000000000002';

const VALID_QUESTION = 'What is integration testing?';
const VALID_ANSWER = 'Integration testing verifies modules work together.';

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
      },
    );
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

describe('flashcards API integration', () => {
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

  it('GET /api/flashcards returns 401 without Authorization', async () => {
    const { statusCode, body } = await request(`${base()}/api/flashcards`);
    assert.equal(statusCode, 401);
    assert.equal(body.error.code, 'AUTH_REQUIRED');
  });

  it('GET /api/flashcards lists only own flashcards', async () => {
    const { statusCode, body } = await request(`${base()}/api/flashcards`, { headers: auth });
    assert.equal(statusCode, 200);
    assert.ok(Array.isArray(body.data.flashcards));
    for (const card of body.data.flashcards) {
      assert.equal(card.courseId, OWN_COURSE_ID);
      assert.equal('userId' in card, false);
      assert.equal('nextReviewAt' in card, true);
      assert.equal('reviewIntervalDays' in card, true);
    }
  });

  it('GET /api/flashcards?courseId returns flashcards for owned course', async () => {
    const { statusCode, body } = await request(
      `${base()}/api/flashcards?courseId=${OWN_COURSE_ID}`,
      { headers: auth },
    );
    assert.equal(statusCode, 200);
    assert.ok(body.data.flashcards.length >= 1);
    for (const card of body.data.flashcards) {
      assert.equal(card.courseId, OWN_COURSE_ID);
    }
  });

  it('GET /api/flashcards?courseId returns 404 for wrong-owner course', async () => {
    const { statusCode, body } = await request(
      `${base()}/api/flashcards?courseId=${OTHER_USER_COURSE_ID}`,
      { headers: auth },
    );
    assert.equal(statusCode, 404);
    assert.equal(body.error.message, 'Course not found');
  });

  it('GET /api/flashcards?courseId returns 404 for missing course', async () => {
    const { statusCode, body } = await request(
      `${base()}/api/flashcards?courseId=${MISSING_COURSE_ID}`,
      { headers: auth },
    );
    assert.equal(statusCode, 404);
    assert.equal(body.error.message, 'Course not found');
  });

  it('GET /api/flashcards?materialId returns flashcards for owned material', async () => {
    const { statusCode, body } = await request(
      `${base()}/api/flashcards?materialId=${OWN_MATERIAL_ID}`,
      { headers: auth },
    );
    assert.equal(statusCode, 200);
    assert.ok(body.data.flashcards.length >= 1);
    for (const card of body.data.flashcards) {
      assert.equal(card.materialId, OWN_MATERIAL_ID);
    }
  });

  it('GET /api/flashcards?materialId returns 404 for wrong-owner material', async () => {
    const { statusCode, body } = await request(
      `${base()}/api/flashcards?materialId=${OTHER_USER_MATERIAL_ID}`,
      { headers: auth },
    );
    assert.equal(statusCode, 404);
    assert.equal(body.error.message, 'Study material not found');
  });

  it('GET /api/flashcards?materialId returns 404 for missing material', async () => {
    const { statusCode, body } = await request(
      `${base()}/api/flashcards?materialId=${MISSING_MATERIAL_ID}`,
      { headers: auth },
    );
    assert.equal(statusCode, 404);
    assert.equal(body.error.message, 'Study material not found');
  });

  it('GET with courseId and material from another course returns 404 Study material not found', async () => {
    const { statusCode, body } = await request(
      `${base()}/api/flashcards?courseId=${OWN_COURSE_ID}&materialId=${OTHER_USER_MATERIAL_ID}`,
      { headers: auth },
    );
    assert.equal(statusCode, 404);
    assert.equal(body.error.message, 'Study material not found');
  });

  it('GET /api/flashcards?courseId&materialId returns flashcards for owned material', async () => {
    const { statusCode, body } = await request(
      `${base()}/api/flashcards?courseId=${OWN_COURSE_ID}&materialId=${OWN_MATERIAL_ID}`,
      { headers: auth },
    );
    assert.equal(statusCode, 200);
    assert.ok(body.data.flashcards.length >= 1);
    for (const card of body.data.flashcards) {
      assert.equal(card.courseId, OWN_COURSE_ID);
      assert.equal(card.materialId, OWN_MATERIAL_ID);
    }
  });

  it('POST /api/courses/:courseId/flashcards creates flashcard for owned course', async () => {
    const createRes = await request(`${base()}/api/courses/${OWN_COURSE_ID}/flashcards`, {
      method: 'POST',
      headers: auth,
      body: {
        question: VALID_QUESTION,
        answer: VALID_ANSWER,
        materialId: OWN_MATERIAL_ID,
        tags: ['calculus', 'integration'],
      },
    });
    assert.equal(createRes.statusCode, 201);
    const card = createRes.body.data.flashcard;
    assert.equal(card.courseId, OWN_COURSE_ID);
    assert.equal(card.materialId, OWN_MATERIAL_ID);
    assert.equal(card.question, VALID_QUESTION);
    assert.equal('userId' in card, false);
  });

  it('POST /api/flashcards/courses/:id is not the approved create route', async () => {
    const parsed = new URL(`${base()}/api/flashcards/courses/${OWN_COURSE_ID}`);
    const payload = JSON.stringify({ question: VALID_QUESTION, answer: VALID_ANSWER });
    const statusCode = await new Promise((resolve, reject) => {
      const req = http.request(
        {
          hostname: parsed.hostname,
          port: parsed.port,
          path: parsed.pathname,
          method: 'POST',
          headers: {
            ...auth,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload),
          },
        },
        (res) => {
          res.resume();
          res.on('end', () => resolve(res.statusCode));
        },
      );
      req.on('error', reject);
      req.write(payload);
      req.end();
    });
    assert.equal(statusCode, 404);
  });

  it('POST rejects short question', async () => {
    const { statusCode, body } = await request(`${base()}/api/courses/${OWN_COURSE_ID}/flashcards`, {
      method: 'POST',
      headers: auth,
      body: { question: 'short', answer: VALID_ANSWER },
    });
    assert.equal(statusCode, 400);
    assert.equal(body.error.code, 'VALIDATION_ERROR');
  });

  it('POST rejects short answer', async () => {
    const { statusCode, body } = await request(`${base()}/api/courses/${OWN_COURSE_ID}/flashcards`, {
      method: 'POST',
      headers: auth,
      body: { question: VALID_QUESTION, answer: 'short' },
    });
    assert.equal(statusCode, 400);
    assert.equal(body.error.code, 'VALIDATION_ERROR');
  });

  it('POST rejects too many tags', async () => {
    const { statusCode, body } = await request(`${base()}/api/courses/${OWN_COURSE_ID}/flashcards`, {
      method: 'POST',
      headers: auth,
      body: {
        question: VALID_QUESTION,
        answer: VALID_ANSWER,
        tags: ['one', 'two', 'three', 'four', 'five', 'six'],
      },
    });
    assert.equal(statusCode, 400);
    assert.equal(body.error.code, 'VALIDATION_ERROR');
  });

  it('POST rejects tag longer than 50 characters', async () => {
    const { statusCode, body } = await request(`${base()}/api/courses/${OWN_COURSE_ID}/flashcards`, {
      method: 'POST',
      headers: auth,
      body: {
        question: VALID_QUESTION,
        answer: VALID_ANSWER,
        tags: ['a'.repeat(51)],
      },
    });
    assert.equal(statusCode, 400);
    assert.equal(body.error.code, 'VALIDATION_ERROR');
  });

  it('POST rejects forbidden body fields', async () => {
    for (const forbidden of [
      'userId',
      'courseId',
      'source',
      'createdAt',
      'updatedAt',
      'nextReviewAt',
      'reviewIntervalDays',
      'mastery',
      'reviewCount',
    ]) {
      const { statusCode, body } = await request(
        `${base()}/api/courses/${OWN_COURSE_ID}/flashcards`,
        {
          method: 'POST',
          headers: auth,
          body: {
            question: VALID_QUESTION,
            answer: VALID_ANSWER,
            [forbidden]: 'forbidden',
          },
        },
      );
      assert.equal(statusCode, 400, `expected 400 for forbidden field ${forbidden}`);
      assert.equal(body.error.code, 'VALIDATION_ERROR');
    }
  });

  it('PATCH requires at least one allowed field', async () => {
    const { statusCode, body } = await request(`${base()}/api/flashcards/${OWN_FLASHCARD_ID}`, {
      method: 'PATCH',
      headers: auth,
      body: {},
    });
    assert.equal(statusCode, 400);
    assert.equal(body.error.code, 'VALIDATION_ERROR');
  });

  it('POST /api/flashcards/:flashcardId/review returns 401 without Authorization', async () => {
    const { statusCode, body } = await request(
      `${base()}/api/flashcards/${OWN_COURSE_LEVEL_FLASHCARD_ID}/review`,
      {
        method: 'POST',
        body: { outcome: 'known' },
      },
    );
    assert.equal(statusCode, 401);
    assert.equal(body.error.code, 'AUTH_REQUIRED');
  });

  it('POST review rejects invalid outcome', async () => {
    const { statusCode, body } = await request(
      `${base()}/api/flashcards/${OWN_COURSE_LEVEL_FLASHCARD_ID}/review`,
      {
        method: 'POST',
        headers: auth,
        body: { outcome: 'maybe' },
      },
    );
    assert.equal(statusCode, 400);
    assert.equal(body.error.code, 'VALIDATION_ERROR');
  });

  it('POST review rejects forbidden body fields', async () => {
    for (const forbidden of [
      'mastery',
      'reviewCount',
      'knownCount',
      'unknownCount',
      'userId',
      'lastReviewedAt',
      'nextReviewAt',
      'reviewIntervalDays',
    ]) {
      const { statusCode, body } = await request(
        `${base()}/api/flashcards/${OWN_COURSE_LEVEL_FLASHCARD_ID}/review`,
        {
          method: 'POST',
          headers: auth,
          body: {
            outcome: 'known',
            [forbidden]: 'forbidden',
          },
        },
      );
      assert.equal(statusCode, 400, `expected 400 for forbidden field ${forbidden}`);
      assert.equal(body.error.code, 'VALIDATION_ERROR');
    }
  });

  it('POST review returns 404 for wrong-owner flashcard', async () => {
    const { statusCode, body } = await request(
      `${base()}/api/flashcards/${OTHER_USER_FLASHCARD_ID}/review`,
      {
        method: 'POST',
        headers: auth,
        body: { outcome: 'known' },
      },
    );
    assert.equal(statusCode, 404);
    assert.equal(body.error.message, 'Flashcard not found');
  });

  it('POST review with known outcome returns updated flashcard with scheduling', async () => {
    const { statusCode, body } = await request(
      `${base()}/api/flashcards/${OWN_COURSE_LEVEL_FLASHCARD_ID}/review`,
      {
        method: 'POST',
        headers: auth,
        body: { outcome: 'known' },
      },
    );
    assert.equal(statusCode, 200);
    const card = body.data.flashcard;
    assert.equal(card.mastery, 'known');
    assert.equal(card.reviewCount, 1);
    assert.equal(card.knownCount, 1);
    assert.equal(card.unknownCount, 0);
    assert.ok(card.lastReviewedAt);
    assert.equal(card.reviewIntervalDays, 1);
    assert.ok(card.nextReviewAt);
    assert.equal('userId' in card, false);
  });

  it('POST review with unknown outcome returns learning mastery and resets scheduling', async () => {
    const { statusCode, body } = await request(
      `${base()}/api/flashcards/${OWN_COURSE_LEVEL_FLASHCARD_ID}/review`,
      {
        method: 'POST',
        headers: auth,
        body: { outcome: 'unknown' },
      },
    );
    assert.equal(statusCode, 200);
    const card = body.data.flashcard;
    assert.equal(card.mastery, 'learning');
    assert.equal(card.reviewCount, 2);
    assert.equal(card.knownCount, 1);
    assert.equal(card.unknownCount, 1);
    assert.equal(card.reviewIntervalDays, 0);
    assert.ok(card.nextReviewAt);
  });

  it('PATCH rejects forbidden scheduling and review state fields', async () => {
    for (const forbidden of [
      'nextReviewAt',
      'reviewIntervalDays',
      'mastery',
      'reviewCount',
      'knownCount',
      'unknownCount',
      'lastReviewedAt',
    ]) {
      const { statusCode, body } = await request(
        `${base()}/api/flashcards/${OWN_COURSE_LEVEL_FLASHCARD_ID}`,
        {
          method: 'PATCH',
          headers: auth,
          body: {
            question: 'Should not update scheduling?',
            [forbidden]: 'forbidden',
          },
        },
      );
      assert.equal(statusCode, 400, `expected 400 for forbidden field ${forbidden}`);
      assert.equal(body.error.code, 'VALIDATION_ERROR');
    }
  });

  it('returns 404 for wrong-owner flashcard on PATCH', async () => {
    const { statusCode, body } = await request(
      `${base()}/api/flashcards/${OTHER_USER_FLASHCARD_ID}`,
      {
        method: 'PATCH',
        headers: auth,
        body: {
          question: 'Should not update?',
        },
      },
    );
    assert.equal(statusCode, 404);
    assert.equal(body.error.message, 'Flashcard not found');
  });

  it('returns 404 for wrong-owner flashcard on DELETE', async () => {
    const { statusCode, body } = await request(
      `${base()}/api/flashcards/${OTHER_USER_FLASHCARD_ID}`,
      {
        method: 'DELETE',
        headers: auth,
      },
    );
    assert.equal(statusCode, 404);
    assert.equal(body.error.message, 'Flashcard not found');
  });

  it('PATCH and DELETE flashcard happy path', async () => {
    const patchRes = await request(`${base()}/api/flashcards/${OWN_FLASHCARD_ID}`, {
      method: 'PATCH',
      headers: auth,
      body: {
        question: 'Updated question text?',
      },
    });
    assert.equal(patchRes.statusCode, 200);
    assert.equal(patchRes.body.data.flashcard.question, 'Updated question text?');
    assert.equal('userId' in patchRes.body.data.flashcard, false);

    const deleteRes = await request(`${base()}/api/flashcards/${OWN_FLASHCARD_ID}`, {
      method: 'DELETE',
      headers: auth,
    });
    assert.equal(deleteRes.statusCode, 200);
    assert.equal(deleteRes.body.data.deleted, true);
  });
});
