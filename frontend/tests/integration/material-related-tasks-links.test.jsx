import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import MaterialRelatedTasksSection from '../../src/components/materials/MaterialRelatedTasksSection.jsx';
import {
  buildCoursePageMaterialLink,
  buildTasksPageMaterialLink,
} from '../../src/utils/task-nav-query.js';
import { flushUpdates, installMinimalBrowser } from '../helpers/minimal-browser.js';
import {
  COURSE_A,
  MATERIAL_A,
  TEST_TOKEN,
  tasksCourseAFixture,
} from '../helpers/course-tasks-test-fixtures.js';
import {
  __setAccessTokenForTests,
  __setApiFetchForTests,
} from '../../src/services/tasks.service.js';

describe('MaterialRelatedTasksSection course navigation links', () => {
  it('renders primary global and secondary course material links', async () => {
    __setAccessTokenForTests(TEST_TOKEN);
    __setApiFetchForTests(async (path) => {
      if (path.match(/^\/api\/courses\/[^/]+\/tasks(?:\?.*)?$/)) {
        return {
          success: true,
          data: { tasks: tasksCourseAFixture },
          meta: { timestamp: '2026-06-21T00:00:00.000Z' },
        };
      }
      return { success: true, data: {}, meta: {} };
    });

    const browser = installMinimalBrowser();
    const root = createRoot(browser.container);

    await act(async () => {
      root.render(
        <MemoryRouter>
          <MaterialRelatedTasksSection
            courseId={COURSE_A}
            materialId={MATERIAL_A}
            materialTitle="Chapter 1"
            handleAuthError={async () => false}
          />
        </MemoryRouter>
      );
    });
    await flushUpdates();
    await flushUpdates();

    try {
      await flushUpdates();
      const links = browser.container.querySelectorAll('a');
      const hrefs = Array.from(links).map((link) => link.getAttribute('href'));

      assert.ok(
        hrefs.includes(buildTasksPageMaterialLink(COURSE_A, MATERIAL_A)),
        'primary View linked tasks link unchanged'
      );
      assert.ok(
        hrefs.includes(buildCoursePageMaterialLink(COURSE_A, MATERIAL_A)),
        'secondary View tasks on course uses course-page material link'
      );
    } finally {
      await act(async () => {
        root.unmount();
      });
      __setApiFetchForTests(null);
      __setAccessTokenForTests(null);
      browser.cleanup();
    }
  });
});
