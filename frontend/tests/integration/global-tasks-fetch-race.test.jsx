import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  __setAccessTokenForTests as setTasksToken,
  __setApiFetchForTests as setTasksApiFetch,
} from '../../src/services/tasks.service.js';
import {
  __setAccessTokenForTests as setMaterialsToken,
  __setApiFetchForTests as setMaterialsApiFetch,
} from '../../src/services/study-materials.service.js';
import { waitFor } from '../helpers/minimal-browser.js';
import { renderGlobalTasksSection } from '../helpers/render-global-tasks-section.jsx';
import {
  createDeferredGlobalTasksFetch,
  courseOnlyGlobalTasksPath,
  filteredGlobalTasksPath,
  getRenderedTaskTitles,
  isTasksLoading,
  unfilteredGlobalTasksPath,
} from '../helpers/deferred-global-tasks-fetch.js';
import {
  COURSE_A,
  COURSE_B,
  MATERIAL_A,
  MATERIAL_B,
  MATERIAL_B_COURSE_B,
  TEST_TOKEN,
  coursesFixture,
  materialsCourseAFixture,
  materialsCourseBFixture,
  tasksCourseAFixture,
  makeStudyTask,
} from '../helpers/course-tasks-test-fixtures.js';

/** @type {ReturnType<createDeferredGlobalTasksFetch> | null} */
let deferred = null;

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
  const materials =
    courseId === COURSE_A
      ? materialsCourseAFixture
      : courseId === COURSE_B
        ? materialsCourseBFixture
        : [];

  return {
    success: true,
    data: { materials },
    meta: { timestamp: '2026-06-21T00:00:00.000Z' },
  };
}

beforeEach(() => {
  deferred = createDeferredGlobalTasksFetch();

  setTasksToken(TEST_TOKEN);
  setMaterialsToken(TEST_TOKEN);
  setTasksApiFetch(deferred.handler);
  setMaterialsApiFetch(materialsApiHandler);
});

afterEach(() => {
  setTasksApiFetch(null);
  setMaterialsApiFetch(null);
  setTasksToken(null);
  setMaterialsToken(null);
  deferred = null;
});

const filteredMaterialATasks = [tasksCourseAFixture[0]];
const filteredMaterialBTasks = [tasksCourseAFixture[1]];
const unlinkedTasks = [
  makeStudyTask({
    id: 'ffffffff-ffff-4fff-8fff-ffffffffffff',
    title: 'Unlinked pending',
    materialId: null,
    status: 'pending',
  }),
];

describe('GlobalTasksSection fetch race stabilization', () => {
  describe('filtered deep-link initial request', () => {
    it('issues only a filtered request for course plus material UUID deep link', async () => {
      const filteredPath = filteredGlobalTasksPath({
        courseId: COURSE_A,
        materialId: MATERIAL_A,
      });

      const view = await renderGlobalTasksSection({
        initialEntry: `/tasks?courseId=${COURSE_A}&materialId=${MATERIAL_A}`,
        courses: coursesFixture,
      });

      try {
        await waitFor(() => deferred.getCallOrder().length > 0);
        const calls = deferred.getCallOrder();
        assert.equal(calls.length, 1);
        assert.equal(calls[0], filteredPath);
        assert.ok(!calls.some((path) => path === unfilteredGlobalTasksPath()));
        assert.ok(!calls.some((path) => path === courseOnlyGlobalTasksPath(COURSE_A)));
        assert.equal(view.getCourseFilterValue(), COURSE_A);
        assert.equal(view.getMaterialFilterValue(), MATERIAL_A);

        await deferred.resolvePathAndFlush(filteredPath, filteredMaterialATasks);
        await waitFor(() => getRenderedTaskTitles(view).length === 1);
        assert.deepEqual(getRenderedTaskTitles(view), ['Review chapter']);
      } finally {
        await view.unmount();
      }
    });

    it('issues only a filtered request for materialId=none deep link', async () => {
      const filteredPath = filteredGlobalTasksPath({
        courseId: COURSE_A,
        materialId: 'none',
      });

      const view = await renderGlobalTasksSection({
        initialEntry: `/tasks?courseId=${COURSE_A}&materialId=none`,
        courses: coursesFixture,
      });

      try {
        await waitFor(() => deferred.getCallOrder().length > 0);
        const calls = deferred.getCallOrder();
        assert.equal(calls.length, 1);
        assert.equal(calls[0], filteredPath);
        assert.ok(!calls.some((path) => path === unfilteredGlobalTasksPath()));
        assert.ok(!calls.some((path) => path === courseOnlyGlobalTasksPath(COURSE_A)));
        assert.equal(view.getMaterialFilterValue(), 'none');

        await deferred.resolvePathAndFlush(filteredPath, unlinkedTasks);
        await waitFor(() => getRenderedTaskTitles(view).length === 1);
        assert.deepEqual(getRenderedTaskTitles(view), ['Unlinked pending']);
      } finally {
        await view.unmount();
      }
    });
  });

  describe('ordered stale-success race', () => {
    it('keeps newer filtered results when an older course-only request resolves last', async () => {
      const courseOnlyPath = courseOnlyGlobalTasksPath(COURSE_A);
      const filteredPath = filteredGlobalTasksPath({
        courseId: COURSE_A,
        materialId: MATERIAL_B,
      });

      const view = await renderGlobalTasksSection({
        initialEntry: `/tasks?courseId=${COURSE_A}`,
        courses: coursesFixture,
      });

      try {
        await waitFor(() => deferred.getCallOrder().includes(courseOnlyPath));
        await view.changeSelect('#global-tasks-material-filter', MATERIAL_B);
        await waitFor(() => deferred.getCallOrder().includes(filteredPath));

        await deferred.resolvePathAndFlush(filteredPath, filteredMaterialBTasks);
        await waitFor(() => getRenderedTaskTitles(view).includes('Complete worksheet'));

        await deferred.resolvePathAndFlush(courseOnlyPath, tasksCourseAFixture);

        assert.deepEqual(getRenderedTaskTitles(view), ['Complete worksheet']);
        assert.match(view.getSearchString(), new RegExp(`materialId=${MATERIAL_B}`));
        assert.equal(view.getMaterialFilterValue(), MATERIAL_B);
      } finally {
        await view.unmount();
      }
    });
  });

  describe('loading and error stale-response handling', () => {
    it('ignores obsolete error after current success', async () => {
      const firstPath = courseOnlyGlobalTasksPath(COURSE_A);
      const secondPath = filteredGlobalTasksPath({
        courseId: COURSE_A,
        status: 'pending',
      });

      const view = await renderGlobalTasksSection({
        initialEntry: `/tasks?courseId=${COURSE_A}`,
        courses: coursesFixture,
      });

      try {
        await waitFor(() => deferred.getCallOrder().includes(firstPath));
        await view.clickButton('Pending');
        await waitFor(() => deferred.getCallOrder().includes(secondPath));

        await deferred.resolvePathAndFlush(secondPath, filteredMaterialATasks);
        await waitFor(() => !isTasksLoading(view));
        assert.ok(!view.container.textContent.includes('Failed to load study tasks'));

        await deferred.rejectPathAndFlush(firstPath, 'SERVER_ERROR', 'Stale failure');

        assert.deepEqual(getRenderedTaskTitles(view), ['Review chapter']);
        assert.ok(!view.container.textContent.includes('Stale failure'));
        assert.ok(!isTasksLoading(view));
      } finally {
        await view.unmount();
      }
    });

    it('ignores obsolete success after current error', async () => {
      const firstPath = courseOnlyGlobalTasksPath(COURSE_A);
      const secondPath = filteredGlobalTasksPath({
        courseId: COURSE_A,
        status: 'pending',
      });

      const view = await renderGlobalTasksSection({
        initialEntry: `/tasks?courseId=${COURSE_A}`,
        courses: coursesFixture,
      });

      try {
        await waitFor(() => deferred.getCallOrder().includes(firstPath));
        await view.clickButton('Pending');
        await waitFor(() => deferred.getCallOrder().includes(secondPath));

        await deferred.rejectPathAndFlush(secondPath, 'SERVER_ERROR', 'Active failure');
        await waitFor(() => view.container.textContent.includes('Active failure'));

        await deferred.resolvePathAndFlush(firstPath, tasksCourseAFixture);

        assert.ok(view.container.textContent.includes('Active failure'));
        assert.equal(getRenderedTaskTitles(view).length, 0);
        assert.ok(!isTasksLoading(view));
      } finally {
        await view.unmount();
      }
    });

    it('keeps loading active until the latest request completes', async () => {
      const firstPath = courseOnlyGlobalTasksPath(COURSE_A);
      const secondPath = filteredGlobalTasksPath({
        courseId: COURSE_A,
        status: 'pending',
      });

      const view = await renderGlobalTasksSection({
        initialEntry: `/tasks?courseId=${COURSE_A}`,
        courses: coursesFixture,
      });

      try {
        await waitFor(() => deferred.getCallOrder().includes(firstPath));
        await view.clickButton('Pending');
        await waitFor(() => deferred.getCallOrder().includes(secondPath));

        await deferred.resolvePathAndFlush(firstPath, tasksCourseAFixture);
        assert.ok(isTasksLoading(view), 'loading should remain while newer request is pending');

        await deferred.resolvePathAndFlush(secondPath, filteredMaterialATasks);
        await waitFor(() => !isTasksLoading(view));
        assert.deepEqual(getRenderedTaskTitles(view), ['Review chapter']);
      } finally {
        await view.unmount();
      }
    });
  });

  describe('same-mount course change race', () => {
    it('prevents a previous course response from writing into the current course', async () => {
      const courseAPath = filteredGlobalTasksPath({
        courseId: COURSE_A,
        materialId: MATERIAL_A,
      });
      const courseBPath = filteredGlobalTasksPath({
        courseId: COURSE_B,
        materialId: MATERIAL_B_COURSE_B,
      });

      const view = await renderGlobalTasksSection({
        initialEntry: `/tasks?courseId=${COURSE_A}&materialId=${MATERIAL_A}`,
        courses: coursesFixture,
      });

      try {
        await waitFor(() => deferred.getCallOrder().includes(courseAPath));

        await view.changeSelect('#global-tasks-course-filter', COURSE_B);
        await view.changeSelect('#global-tasks-material-filter', MATERIAL_B_COURSE_B);
        await waitFor(() => deferred.getCallOrder().includes(courseBPath));
        await waitFor(() => view.getCourseFilterValue() === COURSE_B);

        const courseBTasks = [
          makeStudyTask({
            id: '99999999-9999-4999-8999-999999999999',
            courseId: COURSE_B,
            materialId: MATERIAL_B_COURSE_B,
            title: 'Course B task',
            status: 'pending',
          }),
        ];
        await deferred.resolvePathAndFlush(courseBPath, courseBTasks);
        await waitFor(() => getRenderedTaskTitles(view).includes('Course B task'));

        await deferred.resolvePathAndFlush(courseAPath, tasksCourseAFixture);

        assert.deepEqual(getRenderedTaskTitles(view), ['Course B task']);
        assert.equal(view.getCourseFilterValue(), COURSE_B);
        assert.equal(view.getMaterialFilterValue(), MATERIAL_B_COURSE_B);
      } finally {
        await view.unmount();
      }
    });
  });

  describe('Back/Forward overlap', () => {
    it('keeps restored URL results when an older request resolves later', async () => {
      const defaultPath = courseOnlyGlobalTasksPath(COURSE_A);
      const materialAPath = filteredGlobalTasksPath({
        courseId: COURSE_A,
        materialId: MATERIAL_A,
      });
      const materialBPath = filteredGlobalTasksPath({
        courseId: COURSE_A,
        materialId: MATERIAL_B,
      });

      const view = await renderGlobalTasksSection({
        initialEntry: `/tasks?courseId=${COURSE_A}`,
        courses: coursesFixture,
      });

      try {
        await waitFor(() => deferred.getCallOrder().includes(defaultPath));
        await deferred.resolvePathAndFlush(defaultPath, tasksCourseAFixture);
        await waitFor(() => getRenderedTaskTitles(view).length === 2);

        await view.changeSelect('#global-tasks-material-filter', MATERIAL_A);
        await waitFor(() => deferred.getCallOrder().includes(materialAPath));

        await view.changeSelect('#global-tasks-material-filter', MATERIAL_B);
        await waitFor(() => deferred.getCallOrder().includes(materialBPath));

        await view.goBack();
        await waitFor(() => view.getSearchString().includes(`materialId=${MATERIAL_A}`));
        await waitFor(
          () => deferred.getCallOrder().filter((path) => path === materialAPath).length >= 2
        );

        assert.ok(deferred.getPendingPaths().includes(materialAPath));

        await deferred.resolveLatestAndFlush(filteredMaterialATasks);
        await waitFor(() => getRenderedTaskTitles(view).includes('Review chapter'));

        await deferred.resolvePathAndFlush(materialBPath, filteredMaterialBTasks);

        assert.deepEqual(getRenderedTaskTitles(view), ['Review chapter']);
        assert.equal(view.getMaterialFilterValue(), MATERIAL_A);
      } finally {
        await view.unmount();
      }
    });
  });
});
