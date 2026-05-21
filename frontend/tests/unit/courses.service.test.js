import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  listCourses,
  createCourse,
  getCourse,
  updateCourse,
  deleteCourse,
  __setApiFetchForTests,
  __setAccessTokenForTests,
} from '../../src/services/courses.service.js';

const COURSE_ID = '33333333-3333-4333-8333-333333333333';
const TOKEN = 'test-access-token';

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

describe('courses.service', () => {
  it('listCourses calls GET /api/courses with Bearer token', async () => {
    __setApiFetchForTests(async (path, init, accessToken) => {
      calls.push({ path, init, token: accessToken });
      return {
        success: true,
        data: { courses: [] },
        meta: { timestamp: new Date().toISOString() },
      };
    });

    const data = await listCourses();
    assert.deepEqual(data, { courses: [] });
    assert.equal(calls.length, 1);
    assert.equal(calls[0].path, '/api/courses');
    assert.equal(calls[0].init.method, 'GET');
    assert.equal(calls[0].token, TOKEN);
  });

  it('createCourse POSTs title only', async () => {
    __setApiFetchForTests(async (path, init, accessToken) => {
      calls.push({ path, init, token: accessToken });
      return {
        success: true,
        data: {
          course: {
            id: COURSE_ID,
            title: 'Physics',
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-01T00:00:00.000Z',
          },
        },
        meta: { timestamp: new Date().toISOString() },
      };
    });

    const data = await createCourse({ title: 'Physics' });
    assert.equal(data.course.title, 'Physics');
    assert.equal(calls[0].path, '/api/courses');
    assert.equal(calls[0].init.method, 'POST');
    assert.equal(calls[0].init.body, JSON.stringify({ title: 'Physics' }));
  });

  it('getCourse calls GET /api/courses/:id', async () => {
    __setApiFetchForTests(async (path, init, accessToken) => {
      calls.push({ path, init, token: accessToken });
      return {
        success: true,
        data: {
          course: {
            id: COURSE_ID,
            title: 'Physics',
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-01T00:00:00.000Z',
          },
          stats: { totalTasks: 0, completedTasks: 0, totalFlashcards: 0 },
        },
        meta: { timestamp: new Date().toISOString() },
      };
    });

    await getCourse(COURSE_ID);
    assert.equal(calls[0].path, `/api/courses/${COURSE_ID}`);
    assert.equal(calls[0].init.method, 'GET');
  });

  it('updateCourse PATCHes title only', async () => {
    __setApiFetchForTests(async (path, init, accessToken) => {
      calls.push({ path, init, token: accessToken });
      return {
        success: true,
        data: {
          course: {
            id: COURSE_ID,
            title: 'Physics II',
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-02T00:00:00.000Z',
          },
        },
        meta: { timestamp: new Date().toISOString() },
      };
    });

    await updateCourse(COURSE_ID, { title: 'Physics II' });
    assert.equal(calls[0].path, `/api/courses/${COURSE_ID}`);
    assert.equal(calls[0].init.method, 'PATCH');
    assert.equal(calls[0].init.body, JSON.stringify({ title: 'Physics II' }));
  });

  it('deleteCourse calls DELETE /api/courses/:id', async () => {
    __setApiFetchForTests(async (path, init, accessToken) => {
      calls.push({ path, init, token: accessToken });
      return {
        success: true,
        data: { deleted: true },
        meta: { timestamp: new Date().toISOString() },
      };
    });

    const data = await deleteCourse(COURSE_ID);
    assert.equal(data.deleted, true);
    assert.equal(calls[0].path, `/api/courses/${COURSE_ID}`);
    assert.equal(calls[0].init.method, 'DELETE');
  });

  it('throws ApiRequestError when API returns failure', async () => {
    __setApiFetchForTests(async () => ({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Course not found' },
      meta: { timestamp: new Date().toISOString() },
    }));

    await assert.rejects(
      () => getCourse(COURSE_ID),
      (err) => {
        assert.equal(err.code, 'NOT_FOUND');
        assert.equal(err.message, 'Course not found');
        return true;
      }
    );
  });
});
