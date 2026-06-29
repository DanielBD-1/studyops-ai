import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { act } from 'react';
import {
  __setAccessTokenForTests as setTasksToken,
  __setApiFetchForTests as setTasksApiFetch,
} from '../../src/services/tasks.service.js';
import {
  __setAccessTokenForTests as setMaterialsToken,
  __setApiFetchForTests as setMaterialsApiFetch,
} from '../../src/services/study-materials.service.js';
import { ApiRequestError } from '../../src/services/courses.service.js';
import { waitFor, flushUpdates } from '../helpers/minimal-browser.js';
import { renderGlobalTasksSection } from '../helpers/render-global-tasks-section.jsx';
import {
  COURSE_A,
  COURSE_B,
  MATERIAL_A,
  MATERIAL_B,
  MATERIAL_B_COURSE_B,
  UNKNOWN_MATERIAL,
  TEST_TOKEN,
  coursesFixture,
  materialsCourseAFixture,
  materialsCourseBFixture,
  tasksCourseAFixture,
  makeStudyTask,
} from '../helpers/course-tasks-test-fixtures.js';

/** @type {string[]} */
let listTaskPaths = [];

/** @type {import('../../src/services/tasks.service.js').StudyTask[]} */
let tasksResponse = tasksCourseAFixture;

/**
 * @typedef {{
 *   resolve: (materials: import('../../src/services/study-materials.service.js').MaterialSummary[]) => void,
 *   reject: (err: Error) => void,
 * }} MaterialsDeferred
 */

/** @type {Map<string, MaterialsDeferred[]>} */
const pendingMaterialsByCourse = new Map();

/**
 * @param {string} courseId
 * @param {import('../../src/services/study-materials.service.js').MaterialSummary[]} materials
 */
async function resolveMaterialsForCourse(courseId, materials) {
  const queue = pendingMaterialsByCourse.get(courseId) ?? [];
  const entry = queue.shift();
  if (!entry) {
    throw new Error(`No pending materials request for ${courseId}`);
  }
  await act(async () => {
    entry.resolve(materials);
  });
  await flushUpdates();
  await flushUpdates();
}

/**
 * @param {string} courseId
 * @param {string} code
 * @param {string} message
 */
async function rejectMaterialsForCourse(courseId, code, message) {
  const queue = pendingMaterialsByCourse.get(courseId) ?? [];
  const entry = queue.shift();
  if (!entry) {
    throw new Error(`No pending materials request for ${courseId}`);
  }
  await act(async () => {
    entry.reject(new ApiRequestError(code, message));
  });
  await flushUpdates();
  await flushUpdates();
}

/**
 * @param {string} path
 */
async function materialsApiHandler(path) {
  const match = path.match(/^\/api\/courses\/([^/]+)\/materials$/);
  if (!match) {
    return {
      success: true,
      data: {},
      meta: { timestamp: '2026-06-21T00:00:00.000Z' },
    };
  }

  const courseId = match[1];
  return new Promise((resolve, reject) => {
    if (!pendingMaterialsByCourse.has(courseId)) {
      pendingMaterialsByCourse.set(courseId, []);
    }
    pendingMaterialsByCourse.get(courseId).push({
      resolve: (materials) => {
        resolve({
          success: true,
          data: { materials },
          meta: { timestamp: '2026-06-21T00:00:00.000Z' },
        });
      },
      reject,
    });
  });
}

/**
 * @param {string} path
 * @param {RequestInit} [init]
 */
async function tasksApiHandler(path, init) {
  if (path.match(/^\/api\/tasks(?:\?.*)?$/)) {
    listTaskPaths.push(path);
    return {
      success: true,
      data: { tasks: tasksResponse },
      meta: { timestamp: '2026-06-21T00:00:00.000Z' },
    };
  }

  if (path.match(/^\/api\/tasks\/[^/]+\/complete$/) && init?.method === 'POST') {
    return {
      success: true,
      data: { task: makeStudyTask({ status: 'completed' }) },
      meta: { timestamp: '2026-06-21T00:00:00.000Z' },
    };
  }

  return {
    success: true,
    data: {},
    meta: { timestamp: '2026-06-21T00:00:00.000Z' },
  };
}

beforeEach(() => {
  listTaskPaths = [];
  tasksResponse = tasksCourseAFixture;
  pendingMaterialsByCourse.clear();

  setTasksToken(TEST_TOKEN);
  setMaterialsToken(TEST_TOKEN);
  setTasksApiFetch(tasksApiHandler);
  setMaterialsApiFetch(materialsApiHandler);
});

afterEach(() => {
  setTasksApiFetch(null);
  setMaterialsApiFetch(null);
  setTasksToken(null);
  setMaterialsToken(null);
  pendingMaterialsByCourse.clear();
});

describe('GlobalTasksSection URL filter synchronization', () => {
  describe('deep-link initialization', () => {
    it('initializes course and material filters from URL and fetches with both', async () => {
      tasksResponse = [tasksCourseAFixture[0]];

      const view = await renderGlobalTasksSection({
        initialEntry: `/tasks?courseId=${COURSE_A}&materialId=${MATERIAL_A}`,
        courses: coursesFixture,
      });

      try {
        assert.equal(view.getCourseFilterValue(), COURSE_A);
        assert.equal(view.getMaterialFilterValue(), MATERIAL_A);
        assert.match(view.getSearchString(), new RegExp(`materialId=${MATERIAL_A}`));

        await waitFor(() =>
          listTaskPaths.some(
            (path) => path.includes(`courseId=${COURSE_A}`) && path.includes(`materialId=${MATERIAL_A}`)
          )
        );
        assert.ok(!listTaskPaths.some((path) => path === '/api/tasks'));
        assert.ok(!listTaskPaths.some((path) => path === `/api/tasks?courseId=${COURSE_A}`));

        await resolveMaterialsForCourse(COURSE_A, materialsCourseAFixture);
        await waitFor(() => view.getSearchString().includes(`materialId=${MATERIAL_A}`));
        await waitFor(() => view.query('.task-card__title')?.textContent === 'Review chapter');
        assert.equal(view.getMaterialFilterValue(), MATERIAL_A);
      } finally {
        await view.unmount();
      }
    });

    it('initializes materialId=none from the URL and fetches with none', async () => {
      const noneTasks = [
        makeStudyTask({
          id: 'ffffffff-ffff-4fff-8fff-ffffffffffff',
          title: 'Unlinked only',
          materialId: null,
          status: 'pending',
        }),
      ];
      tasksResponse = noneTasks;

      const view = await renderGlobalTasksSection({
        initialEntry: `/tasks?courseId=${COURSE_A}&materialId=none`,
        courses: coursesFixture,
      });

      try {
        assert.equal(view.getMaterialFilterValue(), 'none');
        await waitFor(() => view.getSearchString().includes('materialId=none'));
        await waitFor(() =>
          listTaskPaths.some(
            (path) => path.includes(`courseId=${COURSE_A}`) && path.includes('materialId=none')
          )
        );
        await waitFor(() => view.query('.task-card__title')?.textContent === 'Unlinked only');
      } finally {
        await view.unmount();
      }
    });
  });

  describe('premature hydration regression', () => {
    it('never strips materialId while materials are unresolved', async () => {
      const view = await renderGlobalTasksSection({
        initialEntry: `/tasks?courseId=${COURSE_A}&materialId=${MATERIAL_A}`,
        courses: coursesFixture,
      });

      try {
        assert.equal(view.getMaterialFilterValue(), MATERIAL_A);
        assert.match(view.getSearchString(), new RegExp(`materialId=${MATERIAL_A}`));

        await waitFor(() =>
          listTaskPaths.some((path) => path.includes(`materialId=${MATERIAL_A}`))
        );
        assert.match(view.getSearchString(), new RegExp(`materialId=${MATERIAL_A}`));

        await resolveMaterialsForCourse(COURSE_A, materialsCourseAFixture);
        await waitFor(() => view.getSearchString().includes(`materialId=${MATERIAL_A}`));
        assert.equal(view.getMaterialFilterValue(), MATERIAL_A);
      } finally {
        await view.unmount();
      }
    });
  });

  describe('same-mount course change via selects', () => {
    it('loads Course B material-scoped tasks after course and material select changes', async () => {
      tasksResponse = [tasksCourseAFixture[0]];

      const view = await renderGlobalTasksSection({
        initialEntry: `/tasks?courseId=${COURSE_A}&materialId=${MATERIAL_A}`,
        courses: coursesFixture,
      });

      try {
        await resolveMaterialsForCourse(COURSE_A, materialsCourseAFixture);
        await waitFor(() => view.getMaterialFilterValue() === MATERIAL_A);

        listTaskPaths = [];
        tasksResponse = [
          makeStudyTask({
            id: '99999999-9999-4999-8999-999999999999',
            courseId: COURSE_B,
            materialId: MATERIAL_B_COURSE_B,
            title: 'Course B lab task',
            status: 'pending',
          }),
        ];

        await view.changeSelect('#global-tasks-course-filter', COURSE_B);
        await waitFor(() => view.getCourseFilterValue() === COURSE_B);
        await waitFor(() => (pendingMaterialsByCourse.get(COURSE_B)?.length ?? 0) > 0);
        await resolveMaterialsForCourse(COURSE_B, materialsCourseBFixture);
        await view.changeSelect('#global-tasks-material-filter', MATERIAL_B_COURSE_B);

        assert.equal(view.getCourseFilterValue(), COURSE_B);
        assert.equal(view.getMaterialFilterValue(), MATERIAL_B_COURSE_B);
        assert.match(view.getSearchString(), new RegExp(`materialId=${MATERIAL_B_COURSE_B}`));

        await waitFor(() =>
          listTaskPaths.some(
            (path) =>
              path.includes(`courseId=${COURSE_B}`) && path.includes(`materialId=${MATERIAL_B_COURSE_B}`)
          )
        );

        await resolveMaterialsForCourse(COURSE_B, materialsCourseBFixture);
        await waitFor(() => view.query('.task-card__title')?.textContent === 'Course B lab task');
        assert.equal(view.getMaterialFilterValue(), MATERIAL_B_COURSE_B);
      } finally {
        await view.unmount();
      }
    });
  });

  describe('same-mount URL navigation', () => {
    it('preserves provisional Material B when URL changes course and material without remount', async () => {
      const courseATask = tasksCourseAFixture[0];
      const courseBTask = makeStudyTask({
        id: '99999999-9999-4999-8999-999999999999',
        courseId: COURSE_B,
        materialId: MATERIAL_B_COURSE_B,
        title: 'Course B lab task',
        status: 'pending',
      });

      tasksResponse = [courseATask];

      const view = await renderGlobalTasksSection({
        initialEntry: `/tasks?courseId=${COURSE_A}&materialId=${MATERIAL_A}`,
        courses: coursesFixture,
      });

      try {
        await resolveMaterialsForCourse(COURSE_A, materialsCourseAFixture);
        await waitFor(() => view.getMaterialFilterValue() === MATERIAL_A);
        await waitFor(() => view.query('.task-card__title')?.textContent === 'Review chapter');

        assert.match(view.getSearchString(), new RegExp(`courseId=${COURSE_A}`));
        assert.match(view.getSearchString(), new RegExp(`materialId=${MATERIAL_A}`));
        assert.equal(view.getCourseFilterValue(), COURSE_A);
        assert.equal(view.getMaterialFilterValue(), MATERIAL_A);
        assert.ok(
          listTaskPaths.some(
            (path) =>
              path.includes(`courseId=${COURSE_A}`) && path.includes(`materialId=${MATERIAL_A}`)
          )
        );

        listTaskPaths = [];
        tasksResponse = [courseBTask];

        await view.navigateTo(
          `/tasks?courseId=${COURSE_B}&materialId=${MATERIAL_B_COURSE_B}`
        );

        await waitFor(() => view.getSearchString().includes(`courseId=${COURSE_B}`));
        await waitFor(() => view.getSearchString().includes(`materialId=${MATERIAL_B_COURSE_B}`));
        await waitFor(() => (pendingMaterialsByCourse.get(COURSE_B)?.length ?? 0) > 0);

        assert.equal(view.getCourseFilterValue(), COURSE_B);
        assert.equal(view.getMaterialFilterValue(), MATERIAL_B_COURSE_B);
        assert.notEqual(view.getMaterialFilterValue(), 'all');
        assert.match(view.getSearchString(), new RegExp(`courseId=${COURSE_B}`));
        assert.match(view.getSearchString(), new RegExp(`materialId=${MATERIAL_B_COURSE_B}`));

        await waitFor(() =>
          listTaskPaths.some(
            (path) =>
              path.includes(`courseId=${COURSE_B}`) &&
              path.includes(`materialId=${MATERIAL_B_COURSE_B}`)
          )
        );

        const courseBOnlyPaths = listTaskPaths.filter(
          (path) => path.includes(`courseId=${COURSE_B}`) && !path.includes('materialId=')
        );
        assert.equal(
          courseBOnlyPaths.length,
          0,
          `expected no course-only Course B task request, got: ${courseBOnlyPaths.join(', ')}`
        );

        const materialSelect = view.query('#global-tasks-material-filter');
        assert.ok(materialSelect);
        const provisionalOption = [...materialSelect.options].find(
          (opt) => opt.value === MATERIAL_B_COURSE_B
        );
        assert.ok(provisionalOption);
        assert.match(provisionalOption.textContent, /loading/i);

        await resolveMaterialsForCourse(COURSE_B, materialsCourseBFixture);
        await waitFor(() => view.query('.task-card__title')?.textContent === 'Course B lab task');

        assert.match(view.getSearchString(), new RegExp(`courseId=${COURSE_B}`));
        assert.match(view.getSearchString(), new RegExp(`materialId=${MATERIAL_B_COURSE_B}`));
        assert.equal(view.getCourseFilterValue(), COURSE_B);
        assert.equal(view.getMaterialFilterValue(), MATERIAL_B_COURSE_B);

        const titles = [...view.container.querySelectorAll('.task-card__title')].map((el) =>
          el.textContent.trim()
        );
        assert.ok(titles.includes('Course B lab task'));
        assert.ok(!titles.includes('Review chapter'));
      } finally {
        await view.unmount();
      }
    });
  });

  describe('successful empty materials hydration', () => {
    it('removes stale materialId only after successful empty hydration', async () => {
      const view = await renderGlobalTasksSection({
        initialEntry: `/tasks?courseId=${COURSE_A}&materialId=${UNKNOWN_MATERIAL}`,
        courses: coursesFixture,
      });

      try {
        assert.match(view.getSearchString(), new RegExp(`materialId=${UNKNOWN_MATERIAL}`));
        await waitFor(() =>
          listTaskPaths.some((path) => path.includes(`materialId=${UNKNOWN_MATERIAL}`))
        );

        await resolveMaterialsForCourse(COURSE_A, []);
        await waitFor(() => !view.getSearchString().includes('materialId='));
        assert.equal(view.getMaterialFilterValue(), 'all');
        assert.ok(
          listTaskPaths.some(
            (path) => path.includes(`courseId=${COURSE_A}`) && !path.includes('materialId=')
          )
        );
      } finally {
        await view.unmount();
      }
    });
  });

  describe('material-loading failure', () => {
    it('preserves provisional materialId and URL when listMaterials fails', async () => {
      const view = await renderGlobalTasksSection({
        initialEntry: `/tasks?courseId=${COURSE_A}&materialId=${MATERIAL_A}`,
        courses: coursesFixture,
      });

      try {
        assert.equal(view.getMaterialFilterValue(), MATERIAL_A);
        await waitFor(() =>
          listTaskPaths.some((path) => path.includes(`materialId=${MATERIAL_A}`))
        );

        await rejectMaterialsForCourse(COURSE_A, 'SERVER_ERROR', 'Failed to load materials');
        await waitFor(() => view.getSearchString().includes(`materialId=${MATERIAL_A}`));
        assert.equal(view.getMaterialFilterValue(), MATERIAL_A);

        tasksResponse = [tasksCourseAFixture[0]];
        await view.changeSelect('#global-tasks-course-filter', 'all');
        await view.changeSelect('#global-tasks-course-filter', COURSE_A);
        await waitFor(() => (pendingMaterialsByCourse.get(COURSE_A)?.length ?? 0) > 0);
        await resolveMaterialsForCourse(COURSE_A, materialsCourseAFixture);
        await view.changeSelect('#global-tasks-material-filter', MATERIAL_A);
        await waitFor(() => view.getMaterialFilterValue() === MATERIAL_A);
      } finally {
        await view.unmount();
      }
    });
  });

  describe('truly stale material', () => {
    it('resets material to all after successful hydration when UUID is absent', async () => {
      const view = await renderGlobalTasksSection({
        initialEntry: `/tasks?courseId=${COURSE_A}&materialId=${UNKNOWN_MATERIAL}`,
        courses: coursesFixture,
      });

      try {
        await resolveMaterialsForCourse(COURSE_A, materialsCourseAFixture);
        await waitFor(() => view.getMaterialFilterValue() === 'all');
        await waitFor(() => !view.getSearchString().includes('materialId='));
        assert.ok(
          listTaskPaths.some(
            (path) => path.includes(`courseId=${COURSE_A}`) && !path.includes('materialId=')
          )
        );
      } finally {
        await view.unmount();
      }
    });
  });

  describe('remount and Back/Forward', () => {
    it('remounting with the same filtered URL restores state', async () => {
      const entry = `/tasks?courseId=${COURSE_A}&materialId=${MATERIAL_A}&status=pending`;
      const first = await renderGlobalTasksSection({
        initialEntry: entry,
        courses: coursesFixture,
      });

      try {
        await resolveMaterialsForCourse(COURSE_A, materialsCourseAFixture);
        await waitFor(() => first.getSearchString().includes(`materialId=${MATERIAL_A}`));
        await first.unmount();
      } catch (err) {
        await first.unmount();
        throw err;
      }

      pendingMaterialsByCourse.clear();
      const second = await renderGlobalTasksSection({
        initialEntry: entry,
        courses: coursesFixture,
      });

      try {
        assert.equal(second.getCourseFilterValue(), COURSE_A);
        assert.equal(second.getMaterialFilterValue(), MATERIAL_A);
        await waitFor(() =>
          second.getSearchString().includes(`materialId=${MATERIAL_A}`)
        );
        await resolveMaterialsForCourse(COURSE_A, materialsCourseAFixture);
        await waitFor(() => second.getSearchString().includes('status=pending'));
      } finally {
        await second.unmount();
      }
    });

    it('restores filter state when router history moves back and forward', async () => {
      const view = await renderGlobalTasksSection({
        initialEntry: '/tasks',
        courses: coursesFixture,
      });

      try {
        await waitFor(() => listTaskPaths.length > 0);

        await view.changeSelect('#global-tasks-course-filter', COURSE_A);
        await waitFor(() => (pendingMaterialsByCourse.get(COURSE_A)?.length ?? 0) > 0);
        await resolveMaterialsForCourse(COURSE_A, materialsCourseAFixture);
        await waitFor(() => view.getCourseFilterValue() === COURSE_A);

        await view.changeSelect('#global-tasks-material-filter', MATERIAL_A);
        await waitFor(() => view.getSearchString().includes(`materialId=${MATERIAL_A}`));

        await view.changeSelect('#global-tasks-material-filter', MATERIAL_B);
        await waitFor(() => view.getSearchString().includes(`materialId=${MATERIAL_B}`));

        await view.goBack();
        await waitFor(() => view.getSearchString().includes(`materialId=${MATERIAL_A}`));
        assert.equal(view.getMaterialFilterValue(), MATERIAL_A);

        await view.goForward();
        await waitFor(() => view.getSearchString().includes(`materialId=${MATERIAL_B}`));
        assert.equal(view.getMaterialFilterValue(), MATERIAL_B);
      } finally {
        await view.unmount();
      }
    });
  });
});
