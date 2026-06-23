import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  __setAccessTokenForTests,
  __setApiFetchForTests,
} from '../../src/services/tasks.service.js';
import { waitFor } from '../helpers/minimal-browser.js';
import { renderCourseTasksSection } from '../helpers/render-course-tasks-section.jsx';
import {
  createDeferredCourseTasksFetch,
  filteredCourseTasksPath,
  getRenderedTaskTitles,
  isTasksLoading,
  unfilteredCourseTasksPath,
} from '../helpers/deferred-course-tasks-fetch.js';
import {
  COURSE_A,
  COURSE_B,
  MATERIAL_A,
  MATERIAL_B,
  TASK_A,
  TEST_TOKEN,
  materialsCourseAFixture,
  tasksCourseAFixture,
  makeStudyTask,
} from '../helpers/course-tasks-test-fixtures.js';

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

/** @type {ReturnType<createDeferredCourseTasksFetch> | null} */
let deferred = null;

beforeEach(() => {
  deferred = createDeferredCourseTasksFetch({
    async onUnhandled(path, init) {
      if (path.match(/^\/api\/tasks\/[^/]+\/complete$/) && init?.method === 'POST') {
        return {
          success: true,
          data: { task: { ...makeStudyTask({ id: TASK_A, status: 'completed' }) } },
          meta: { timestamp: '2026-06-21T00:00:00.000Z' },
        };
      }
      return {
        success: true,
        data: {},
        meta: { timestamp: '2026-06-21T00:00:00.000Z' },
      };
    },
  });

  __setAccessTokenForTests(TEST_TOKEN);
  __setApiFetchForTests(deferred.handler);
});

afterEach(() => {
  __setApiFetchForTests(null);
  __setAccessTokenForTests(null);
  deferred = null;
});

describe('CourseTasksSection fetch race stabilization', () => {
  describe('filtered deep-link initial request', () => {
    it('issues only a filtered request for material UUID deep link', async () => {
      const filteredPath = filteredCourseTasksPath(COURSE_A, {
        materialId: MATERIAL_A,
        status: 'pending',
      });
      const view = await renderCourseTasksSection({
        initialEntry: `/courses/${COURSE_A}?materialId=${MATERIAL_A}&status=pending`,
        courseId: COURSE_A,
        materials: materialsCourseAFixture,
      });

      try {
        await waitFor(() => deferred.getCallOrder().length > 0);
        const calls = deferred.getCallOrder();
        assert.equal(calls.length, 1);
        assert.equal(calls[0], filteredPath);
        assert.ok(!calls.some((path) => path === unfilteredCourseTasksPath(COURSE_A)));
        assert.equal(view.getMaterialFilterValue(), MATERIAL_A);

        await deferred.resolvePathAndFlush(filteredPath, filteredMaterialATasks);
        await waitFor(() => getRenderedTaskTitles(view).length === 1);
        assert.deepEqual(getRenderedTaskTitles(view), ['Review chapter']);
      } finally {
        await view.unmount();
      }
    });

    it('issues only a filtered request for materialId=none deep link', async () => {
      const filteredPath = filteredCourseTasksPath(COURSE_A, { materialId: 'none' });
      const view = await renderCourseTasksSection({
        initialEntry: `/courses/${COURSE_A}?materialId=none`,
        courseId: COURSE_A,
        materials: materialsCourseAFixture,
      });

      try {
        await waitFor(() => deferred.getCallOrder().length > 0);
        const calls = deferred.getCallOrder();
        assert.equal(calls.length, 1);
        assert.equal(calls[0], filteredPath);
        assert.ok(!calls.some((path) => path === unfilteredCourseTasksPath(COURSE_A)));
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
    it('keeps newer filtered results when an older unfiltered request resolves last', async () => {
      const unfilteredPath = unfilteredCourseTasksPath(COURSE_A);
      const filteredPath = filteredCourseTasksPath(COURSE_A, {
        materialId: MATERIAL_B,
      });

      const view = await renderCourseTasksSection({
        initialEntry: `/courses/${COURSE_A}`,
        courseId: COURSE_A,
        materials: materialsCourseAFixture,
      });

      try {
        await waitFor(() => deferred.getCallOrder().includes(unfilteredPath));
        await view.changeSelect('#course-tasks-material-filter', MATERIAL_B);
        await waitFor(() => deferred.getCallOrder().includes(filteredPath));

        await deferred.resolvePathAndFlush(filteredPath, filteredMaterialBTasks);
        await waitFor(() => getRenderedTaskTitles(view).includes('Complete worksheet'));

        await deferred.resolvePathAndFlush(unfilteredPath, tasksCourseAFixture);

        assert.deepEqual(getRenderedTaskTitles(view), ['Complete worksheet']);
        assert.equal(view.getSearchString(), `?materialId=${MATERIAL_B}`);
        assert.equal(view.getMaterialFilterValue(), MATERIAL_B);
      } finally {
        await view.unmount();
      }
    });
  });

  describe('rapid filter change', () => {
    it('keeps the latest filter request authoritative', async () => {
      const pendingPath = filteredCourseTasksPath(COURSE_A, { status: 'pending' });
      const materialAPath = filteredCourseTasksPath(COURSE_A, {
        materialId: MATERIAL_A,
        status: 'pending',
      });

      const view = await renderCourseTasksSection({
        initialEntry: `/courses/${COURSE_A}`,
        courseId: COURSE_A,
        materials: materialsCourseAFixture,
      });

      try {
        await waitFor(() => deferred.getCallOrder().length > 0);
        await view.clickButton('Pending');
        await waitFor(() => deferred.getCallOrder().includes(pendingPath));
        await view.changeSelect('#course-tasks-material-filter', MATERIAL_A);
        await waitFor(() => deferred.getCallOrder().includes(materialAPath));

        await deferred.resolvePathAndFlush(materialAPath, filteredMaterialATasks);
        await waitFor(() => getRenderedTaskTitles(view).includes('Review chapter'));

        await deferred.resolvePathAndFlush(pendingPath, tasksCourseAFixture);

        assert.deepEqual(getRenderedTaskTitles(view), ['Review chapter']);
      } finally {
        await view.unmount();
      }
    });
  });

  describe('loading and error stale-response handling', () => {
    it('ignores obsolete error after current success', async () => {
      const firstPath = unfilteredCourseTasksPath(COURSE_A);
      const secondPath = filteredCourseTasksPath(COURSE_A, { status: 'pending' });

      const view = await renderCourseTasksSection({
        initialEntry: `/courses/${COURSE_A}`,
        courseId: COURSE_A,
        materials: materialsCourseAFixture,
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
      const firstPath = unfilteredCourseTasksPath(COURSE_A);
      const secondPath = filteredCourseTasksPath(COURSE_A, { status: 'pending' });

      const view = await renderCourseTasksSection({
        initialEntry: `/courses/${COURSE_A}`,
        courseId: COURSE_A,
        materials: materialsCourseAFixture,
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
      const firstPath = unfilteredCourseTasksPath(COURSE_A);
      const secondPath = filteredCourseTasksPath(COURSE_A, { status: 'pending' });

      const view = await renderCourseTasksSection({
        initialEntry: `/courses/${COURSE_A}`,
        courseId: COURSE_A,
        materials: materialsCourseAFixture,
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

  describe('course route change', () => {
    it('prevents a previous course response from writing into the current course', async () => {
      const courseAPath = unfilteredCourseTasksPath(COURSE_A);
      const courseBPath = unfilteredCourseTasksPath(COURSE_B);

      const view = await renderCourseTasksSection({
        initialEntry: `/courses/${COURSE_A}`,
        courseId: COURSE_A,
        materials: materialsCourseAFixture,
      });

      try {
        await waitFor(() => deferred.getCallOrder().includes(courseAPath));

        await view.setCourseId(COURSE_B);
        await view.navigateTo(`/courses/${COURSE_B}`);
        await waitFor(() => deferred.getCallOrder().includes(courseBPath));

        const courseBTasks = [
          makeStudyTask({
            id: '99999999-9999-4999-8999-999999999999',
            courseId: COURSE_B,
            title: 'Course B task',
            materialId: null,
          }),
        ];
        await deferred.resolvePathAndFlush(courseBPath, courseBTasks);
        await waitFor(() => getRenderedTaskTitles(view).includes('Course B task'));

        await deferred.resolvePathAndFlush(courseAPath, tasksCourseAFixture);

        assert.deepEqual(getRenderedTaskTitles(view), ['Course B task']);
      } finally {
        await view.unmount();
      }
    });
  });

  describe('Back/Forward overlap', () => {
    it('keeps restored URL results when an older request resolves later', async () => {
      const defaultPath = unfilteredCourseTasksPath(COURSE_A);
      const materialAPath = filteredCourseTasksPath(COURSE_A, { materialId: MATERIAL_A });
      const materialBPath = filteredCourseTasksPath(COURSE_A, { materialId: MATERIAL_B });

      const view = await renderCourseTasksSection({
        initialEntry: `/courses/${COURSE_A}`,
        courseId: COURSE_A,
        materials: materialsCourseAFixture,
      });

      try {
        await waitFor(() => deferred.getCallOrder().includes(defaultPath));
        await deferred.resolvePathAndFlush(defaultPath, tasksCourseAFixture);
        await waitFor(() => getRenderedTaskTitles(view).length === 2);

        await view.changeSelect('#course-tasks-material-filter', MATERIAL_A);
        await waitFor(() => deferred.getCallOrder().includes(materialAPath));

        await view.changeSelect('#course-tasks-material-filter', MATERIAL_B);
        await waitFor(() => deferred.getCallOrder().includes(materialBPath));

        await view.goBack();
        await waitFor(() => view.getSearchString() === `?materialId=${MATERIAL_A}`);
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

  describe('mutation refetch overlap', () => {
    it('keeps mutation refetch results when an older list request resolves later', async () => {
      const materialBPath = filteredCourseTasksPath(COURSE_A, {
        materialId: MATERIAL_B,
        status: 'pending',
      });
      const materialAPath = filteredCourseTasksPath(COURSE_A, {
        materialId: MATERIAL_A,
        status: 'pending',
      });

      const view = await renderCourseTasksSection({
        initialEntry: `/courses/${COURSE_A}?materialId=${MATERIAL_B}&status=pending`,
        courseId: COURSE_A,
        materials: materialsCourseAFixture,
      });

      try {
        await waitFor(() => deferred.getCallOrder().includes(materialBPath));
        await deferred.resolvePathAndFlush(materialBPath, filteredMaterialBTasks);
        await waitFor(() => getRenderedTaskTitles(view).includes('Complete worksheet'));

        await view.changeSelect('#course-tasks-material-filter', MATERIAL_A);
        await waitFor(() => deferred.getCallOrder().includes(materialAPath));

        await view.changeSelect('#course-tasks-material-filter', MATERIAL_B);
        await waitFor(
          () => deferred.getCallOrder().filter((path) => path === materialBPath).length >= 2
        );
        await deferred.resolveLatestAndFlush(filteredMaterialBTasks);
        await waitFor(() => getRenderedTaskTitles(view).includes('Complete worksheet'));

        await view.clickButton('Mark complete');
        await waitFor(() => deferred.getPendingPaths().length > 0);

        await deferred.resolveLatestAndFlush([]);
        await waitFor(() => view.container.textContent.includes('No pending tasks'));

        await deferred.resolvePathAndFlush(materialAPath, filteredMaterialATasks);

        assert.equal(getRenderedTaskTitles(view).length, 0);
        assert.equal(view.getSearchString(), `?materialId=${MATERIAL_B}&status=pending`);
      } finally {
        await view.unmount();
      }
    });
  });
});
