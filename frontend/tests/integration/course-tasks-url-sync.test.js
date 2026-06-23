import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  __setAccessTokenForTests,
  __setApiFetchForTests,
} from '../../src/services/tasks.service.js';
import { waitFor, getReactElementProps } from '../helpers/minimal-browser.js';
import { renderCourseTasksSection } from '../helpers/render-course-tasks-section.jsx';
import {
  COURSE_A,
  MATERIAL_A,
  MATERIAL_B,
  TASK_A,
  TEST_TOKEN,
  materialsCourseAFixture,
  tasksCourseAFixture,
  makeStudyTask,
} from '../helpers/course-tasks-test-fixtures.js';

const UNKNOWN_MATERIAL = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';

/** @type {string[]} */
let listTaskPaths = [];

/** @type {import('../../src/services/tasks.service.js').StudyTask[]} */
let tasksResponse = tasksCourseAFixture;

beforeEach(() => {
  listTaskPaths = [];
  tasksResponse = tasksCourseAFixture;

  __setAccessTokenForTests(TEST_TOKEN);
  __setApiFetchForTests(async (path, init) => {
    if (path.match(/^\/api\/courses\/[^/]+\/tasks(?:\?.*)?$/)) {
      listTaskPaths.push(path);
      return {
        success: true,
        data: { tasks: tasksResponse },
        meta: { timestamp: '2026-06-21T00:00:00.000Z' },
      };
    }

    if (path.match(/^\/api\/tasks\/[^/]+\/complete$/) && init?.method === 'POST') {
      tasksResponse = tasksResponse.map((task) =>
        task.id === TASK_A ? { ...task, status: 'completed' } : task
      );
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
  });
});

afterEach(() => {
  __setApiFetchForTests(null);
  __setAccessTokenForTests(null);
});

describe('CourseTasksSection URL filter synchronization', () => {
  describe('deep-link initialization', () => {
    it('initializes material and status filters from the URL and fetches with them', async () => {
      const view = await renderCourseTasksSection({
        initialEntry: `/courses/${COURSE_A}?materialId=${MATERIAL_A}&status=pending`,
        courseId: COURSE_A,
        materials: materialsCourseAFixture,
      });

      try {
        await waitFor(() => view.getSearchString().includes(`materialId=${MATERIAL_A}`));
        assert.match(view.getSearchString(), /status=pending/);
        await waitFor(() => listTaskPaths.some((path) => path.includes(`materialId=${MATERIAL_A}`)));
        assert.ok(listTaskPaths.some((path) => path.includes('status=pending')));
        assert.ok(!listTaskPaths.some((path) => path === `/api/courses/${COURSE_A}/tasks`));
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

      const view = await renderCourseTasksSection({
        initialEntry: `/courses/${COURSE_A}?materialId=none`,
        courseId: COURSE_A,
        materials: materialsCourseAFixture,
      });

      try {
        await waitFor(() => view.getSearchString() === '?materialId=none');
        await waitFor(() => listTaskPaths.some((path) => path.includes('materialId=none')));
        assert.ok(!listTaskPaths.some((path) => path === `/api/courses/${COURSE_A}/tasks`));
        await waitFor(() => view.query('.task-card__title')?.textContent === 'Unlinked only');
        assert.equal(view.getMaterialFilterValue(), 'none');
      } finally {
        await view.unmount();
      }
    });
  });

  describe('manual filter changes update the URL', () => {
    it('adds materialId when a material is selected', async () => {
      const view = await renderCourseTasksSection({
        initialEntry: `/courses/${COURSE_A}`,
        courseId: COURSE_A,
        materials: materialsCourseAFixture,
      });

      try {
        await waitFor(() => listTaskPaths.length > 0);
        await view.changeSelect('#course-tasks-material-filter', MATERIAL_A);
        await waitFor(() => view.getSearchString() === `?materialId=${MATERIAL_A}`);

        assert.equal(view.getSearchString(), `?materialId=${MATERIAL_A}`);
      } finally {
        await view.unmount();
      }
    });

    it('removes query params when filters return to All defaults', async () => {
      const view = await renderCourseTasksSection({
        initialEntry: `/courses/${COURSE_A}?materialId=${MATERIAL_A}&status=pending`,
        courseId: COURSE_A,
        materials: materialsCourseAFixture,
      });

      try {
        await waitFor(() => view.getSearchString().includes(`materialId=${MATERIAL_A}`));
        await view.changeSelect('#course-tasks-material-filter', 'all');
        await view.clickButton('All');
        await waitFor(() => view.getSearchString() === '');

        assert.equal(view.getSearchString(), '');
      } finally {
        await view.unmount();
      }
    });
  });

  describe('invalid and stale URL canonicalization', () => {
    it('strips invalid status and deadline params', async () => {
      const view = await renderCourseTasksSection({
        initialEntry: `/courses/${COURSE_A}?status=in_progress&deadline=due_soon`,
        courseId: COURSE_A,
        materials: materialsCourseAFixture,
      });

      try {
        await waitFor(() => view.getSearchString() === '');
        assert.equal(view.getSearchString(), '');
      } finally {
        await view.unmount();
      }
    });

    it('retains a material UUID while materials are loading, then removes a stale UUID after materials load', async () => {
      const view = await renderCourseTasksSection({
        initialEntry: `/courses/${COURSE_A}?materialId=${UNKNOWN_MATERIAL}`,
        courseId: COURSE_A,
        materials: [],
      });

      try {
        await waitFor(() => listTaskPaths.length > 0);
        assert.match(view.getSearchString(), new RegExp(`materialId=${UNKNOWN_MATERIAL}`));
        assert.ok(listTaskPaths.some((path) => path.includes(`materialId=${UNKNOWN_MATERIAL}`)));

        await view.setMaterials(materialsCourseAFixture);
        await waitFor(() => view.getSearchString() === '');

        assert.equal(view.getSearchString(), '');
      } finally {
        await view.unmount();
      }
    });

    it('keeps a valid material UUID after materials load', async () => {
      const view = await renderCourseTasksSection({
        initialEntry: `/courses/${COURSE_A}?materialId=${MATERIAL_A}`,
        courseId: COURSE_A,
        materials: [],
      });

      try {
        await waitFor(() => listTaskPaths.some((path) => path.includes(`materialId=${MATERIAL_A}`)));
        await view.setMaterials(materialsCourseAFixture);
        await waitFor(() => view.getSearchString() === `?materialId=${MATERIAL_A}`);

        assert.equal(view.getSearchString(), `?materialId=${MATERIAL_A}`);
      } finally {
        await view.unmount();
      }
    });

    it('deadline-only URL normalizes to pending plus deadline', async () => {
      const view = await renderCourseTasksSection({
        initialEntry: `/courses/${COURSE_A}?deadline=overdue`,
        courseId: COURSE_A,
        materials: materialsCourseAFixture,
      });

      try {
        await waitFor(() => view.getSearchString() === '?status=pending&deadline=overdue');
        assert.equal(view.getSearchString(), '?status=pending&deadline=overdue');
      } finally {
        await view.unmount();
      }
    });

    it('completed plus deadline drops the deadline from the URL', async () => {
      const view = await renderCourseTasksSection({
        initialEntry: `/courses/${COURSE_A}?status=completed&deadline=overdue`,
        courseId: COURSE_A,
        materials: materialsCourseAFixture,
      });

      try {
        await waitFor(() => view.getSearchString() === '?status=completed');
        assert.equal(view.getSearchString(), '?status=completed');
      } finally {
        await view.unmount();
      }
    });
  });

  describe('browser Back/Forward restoration', () => {
    it('restores filter state when router history moves back and forward', async () => {
      const view = await renderCourseTasksSection({
        initialEntry: `/courses/${COURSE_A}`,
        courseId: COURSE_A,
        materials: materialsCourseAFixture,
      });

      try {
        await waitFor(() => listTaskPaths.length > 0);
        await view.changeSelect('#course-tasks-material-filter', MATERIAL_A);
        await waitFor(() => view.getSearchString() === `?materialId=${MATERIAL_A}`);

        await view.changeSelect('#course-tasks-material-filter', MATERIAL_B);
        await waitFor(() => view.getSearchString() === `?materialId=${MATERIAL_B}`);

        await view.goBack();
        await waitFor(() => view.getSearchString() === `?materialId=${MATERIAL_A}`);

        await view.goForward();
        await waitFor(() => view.getSearchString() === `?materialId=${MATERIAL_B}`);
      } finally {
        await view.unmount();
      }
    });
  });

  describe('remount and mutation refetch', () => {
    it('remounting with the same filtered URL restores state', async () => {
      const entry = `/courses/${COURSE_A}?materialId=${MATERIAL_A}&status=pending`;
      const first = await renderCourseTasksSection({
        initialEntry: entry,
        courseId: COURSE_A,
        materials: materialsCourseAFixture,
      });

      try {
        await waitFor(() => first.getSearchString().includes(`materialId=${MATERIAL_A}`));
        await first.unmount();
      } catch (err) {
        await first.unmount();
        throw err;
      }

      const second = await renderCourseTasksSection({
        initialEntry: entry,
        courseId: COURSE_A,
        materials: materialsCourseAFixture,
      });

      try {
        await waitFor(() => second.getSearchString() === `?materialId=${MATERIAL_A}&status=pending`);
        assert.equal(second.getSearchString(), `?materialId=${MATERIAL_A}&status=pending`);
      } finally {
        await second.unmount();
      }
    });

    it('mutation-triggered refetch preserves active URL filters', async () => {
      const view = await renderCourseTasksSection({
        initialEntry: `/courses/${COURSE_A}?materialId=${MATERIAL_A}&status=pending`,
        courseId: COURSE_A,
        materials: materialsCourseAFixture,
      });

      try {
        await waitFor(() => view.getSearchString().includes(`materialId=${MATERIAL_A}`));
        listTaskPaths = [];

        await view.clickButton('Mark complete');
        await waitFor(() => listTaskPaths.some((path) => path.includes(`materialId=${MATERIAL_A}`)));

        assert.ok(listTaskPaths.every((path) => path.includes(`materialId=${MATERIAL_A}`)));
        assert.ok(listTaskPaths.some((path) => path.includes('status=pending')));
        assert.equal(view.getSearchString(), `?materialId=${MATERIAL_A}&status=pending`);
      } finally {
        await view.unmount();
      }
    });
  });

  describe('focusReturnTo', () => {
    it('preserves the active course-page query string when starting focus', async () => {
      const view = await renderCourseTasksSection({
        initialEntry: `/courses/${COURSE_A}?materialId=${MATERIAL_A}&status=pending`,
        courseId: COURSE_A,
        materials: materialsCourseAFixture,
      });

      try {
        await waitFor(() => view.query('.task-card__title')?.textContent === 'Review chapter');
        const focusLink = Array.from(view.container.querySelectorAll('a')).find(
          (link) => link.textContent.trim() === 'Start Focus'
        );
        assert.ok(focusLink, 'Start Focus link should exist');

        const linkProps = getReactElementProps(focusLink);
        assert.equal(linkProps?.to, `/focus/${TASK_A}`);
        assert.equal(
          linkProps?.state?.returnTo,
          `/courses/${COURSE_A}?materialId=${MATERIAL_A}&status=pending`
        );
      } finally {
        await view.unmount();
      }
    });
  });
});
