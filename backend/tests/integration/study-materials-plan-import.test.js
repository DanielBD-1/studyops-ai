import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { applyTestEnv } from '../helpers/testEnv.js';
import { setSupabaseAdminClientForTests } from '../../src/config/supabase.js';
import {
  createPlanImportMockSupabaseClient,
  OWN_COURSE_ID,
  OTHER_USER_MATERIAL_ID,
  OWN_MATERIAL_ID,
  TEST_USER_ID,
  getMockTasks,
  getMockFlashcards,
} from '../helpers/mockSupabasePlanImport.js';

applyTestEnv();
setSupabaseAdminClientForTests(createPlanImportMockSupabaseClient());

const { default: app } = await import('../../src/app.js');

const VALID_TASK = {
  title: 'Plan import task title',
  description: 'Read the chapter carefully',
  priority: 'high',
  estimatedMinutes: 30,
};

const VALID_FLASHCARD = {
  question: 'What is plan import testing?',
  answer: 'Plan import testing verifies dedupe behavior.',
  tags: ['testing'],
};

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
      }
    );
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

describe('POST /api/study-materials/:materialId/import/tasks', () => {
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
  const importTasksUrl = (id) => `${base()}/api/study-materials/${id}/import/tasks`;

  it('returns 401 without Authorization', async () => {
    const { statusCode, body } = await request(importTasksUrl(OWN_MATERIAL_ID), {
      method: 'POST',
      body: { tasks: [VALID_TASK] },
    });
    assert.equal(statusCode, 401);
    assert.equal(body.error.code, 'AUTH_REQUIRED');
  });

  it('importing new plan tasks creates source=plan', async () => {
    const { statusCode, body } = await request(importTasksUrl(OWN_MATERIAL_ID), {
      method: 'POST',
      headers: auth,
      body: { tasks: [VALID_TASK] },
    });
    assert.equal(statusCode, 200);
    assert.equal(body.success, true);
    assert.equal(body.data.summary.imported, 1);
    assert.equal(body.data.summary.skipped, 0);
    assert.equal(body.data.summary.failed, 0);
    assert.equal(body.data.summary.total, 1);

    const created = getMockTasks().find(
      (t) =>
        t.user_id === TEST_USER_ID &&
        t.material_id === OWN_MATERIAL_ID &&
        t.title === VALID_TASK.title &&
        t.source === 'plan'
    );
    assert.ok(created);
  });

  it('re-importing same tasks skips duplicates', async () => {
    const { statusCode, body } = await request(importTasksUrl(OWN_MATERIAL_ID), {
      method: 'POST',
      headers: auth,
      body: { tasks: [VALID_TASK] },
    });
    assert.equal(statusCode, 200);
    assert.equal(body.data.summary.imported, 0);
    assert.equal(body.data.summary.skipped, 1);
    assert.equal(body.data.summary.total, 1);
  });

  it('mixed duplicate/new import returns correct counts', async () => {
    const newTask = {
      title: 'Another plan import task',
      estimatedMinutes: 45,
    };
    const { statusCode, body } = await request(importTasksUrl(OWN_MATERIAL_ID), {
      method: 'POST',
      headers: auth,
      body: { tasks: [VALID_TASK, newTask] },
    });
    assert.equal(statusCode, 200);
    assert.equal(body.data.summary.imported, 1);
    assert.equal(body.data.summary.skipped, 1);
    assert.equal(body.data.summary.failed, 0);
    assert.equal(body.data.summary.total, 2);
  });

  it('manual create with same title still succeeds', async () => {
    const { statusCode, body } = await request(`${base()}/api/courses/${OWN_COURSE_ID}/tasks`, {
      method: 'POST',
      headers: auth,
      body: {
        title: VALID_TASK.title,
        estimatedMinutes: 20,
        materialId: OWN_MATERIAL_ID,
      },
    });
    assert.equal(statusCode, 201);
    assert.equal(body.data.task.source, 'manual');
  });

  it('wrong-owner material returns neutral not-found', async () => {
    const { statusCode, body } = await request(importTasksUrl(OTHER_USER_MATERIAL_ID), {
      method: 'POST',
      headers: auth,
      body: { tasks: [VALID_TASK] },
    });
    assert.equal(statusCode, 404);
    assert.equal(body.error.code, 'NOT_FOUND');
  });

  it('strict body rejects source/userId/courseId', async () => {
    for (const extra of [
      { source: 'plan' },
      { userId: TEST_USER_ID },
      { courseId: OWN_COURSE_ID },
    ]) {
      const { statusCode, body } = await request(importTasksUrl(OWN_MATERIAL_ID), {
        method: 'POST',
        headers: auth,
        body: { tasks: [VALID_TASK], ...extra },
      });
      assert.equal(statusCode, 400);
      assert.equal(body.error.code, 'VALIDATION_ERROR');
    }
  });
});

describe('POST /api/study-materials/:materialId/import/flashcards', () => {
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
  const importFlashcardsUrl = (id) => `${base()}/api/study-materials/${id}/import/flashcards`;

  it('returns 401 without Authorization', async () => {
    const { statusCode, body } = await request(importFlashcardsUrl(OWN_MATERIAL_ID), {
      method: 'POST',
      body: { flashcards: [VALID_FLASHCARD] },
    });
    assert.equal(statusCode, 401);
    assert.equal(body.error.code, 'AUTH_REQUIRED');
  });

  it('importing new plan flashcards creates source=plan', async () => {
    const { statusCode, body } = await request(importFlashcardsUrl(OWN_MATERIAL_ID), {
      method: 'POST',
      headers: auth,
      body: { flashcards: [VALID_FLASHCARD] },
    });
    assert.equal(statusCode, 200);
    assert.equal(body.data.summary.imported, 1);
    assert.equal(body.data.summary.skipped, 0);

    const created = getMockFlashcards().find(
      (f) =>
        f.user_id === TEST_USER_ID &&
        f.material_id === OWN_MATERIAL_ID &&
        f.question === VALID_FLASHCARD.question &&
        f.source === 'plan'
    );
    assert.ok(created);
  });

  it('re-importing same flashcards skips duplicates', async () => {
    const { statusCode, body } = await request(importFlashcardsUrl(OWN_MATERIAL_ID), {
      method: 'POST',
      headers: auth,
      body: { flashcards: [VALID_FLASHCARD] },
    });
    assert.equal(statusCode, 200);
    assert.equal(body.data.summary.imported, 0);
    assert.equal(body.data.summary.skipped, 1);
  });

  it('mixed duplicate/new import returns correct counts', async () => {
    const newFlashcard = {
      question: 'What is dedupe for flashcards?',
      answer: 'Duplicate plan flashcards are skipped on re-import.',
    };
    const { statusCode, body } = await request(importFlashcardsUrl(OWN_MATERIAL_ID), {
      method: 'POST',
      headers: auth,
      body: { flashcards: [VALID_FLASHCARD, newFlashcard] },
    });
    assert.equal(statusCode, 200);
    assert.equal(body.data.summary.imported, 1);
    assert.equal(body.data.summary.skipped, 1);
    assert.equal(body.data.summary.total, 2);
  });

  it('manual create with same question still succeeds', async () => {
    const { statusCode, body } = await request(
      `${base()}/api/courses/${OWN_COURSE_ID}/flashcards`,
      {
        method: 'POST',
        headers: auth,
        body: {
          question: VALID_FLASHCARD.question,
          answer: VALID_FLASHCARD.answer,
          materialId: OWN_MATERIAL_ID,
        },
      }
    );
    assert.equal(statusCode, 201);
    assert.equal(body.data.flashcard.source, 'manual');
  });

  it('wrong-owner material returns neutral not-found', async () => {
    const { statusCode, body } = await request(importFlashcardsUrl(OTHER_USER_MATERIAL_ID), {
      method: 'POST',
      headers: auth,
      body: { flashcards: [VALID_FLASHCARD] },
    });
    assert.equal(statusCode, 404);
    assert.equal(body.error.code, 'NOT_FOUND');
  });

  it('strict body rejects source/userId/courseId', async () => {
    for (const extra of [
      { source: 'plan' },
      { userId: TEST_USER_ID },
      { courseId: OWN_COURSE_ID },
    ]) {
      const { statusCode, body } = await request(importFlashcardsUrl(OWN_MATERIAL_ID), {
        method: 'POST',
        headers: auth,
        body: { flashcards: [VALID_FLASHCARD], ...extra },
      });
      assert.equal(statusCode, 400);
      assert.equal(body.error.code, 'VALIDATION_ERROR');
    }
  });
});
