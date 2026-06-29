import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import DashboardStub, { DashboardMaterialsPending } from '../../src/pages/DashboardStub.jsx';
import { DashboardProvider } from '../../src/context/DashboardContext.jsx';
import {
  __setApiFetchForTests,
  __setAccessTokenForTests,
  __setReferenceDateForTests,
} from '../../src/services/dashboard.service.js';
import {
  buildCoursePageMaterialLink,
  buildTasksPageMaterialLink,
} from '../../src/utils/task-nav-query.js';
import {
  clickElement,
  findButtonByText,
  flushUpdates,
  installMinimalBrowser,
  waitFor,
} from '../helpers/minimal-browser.js';
import { DashboardTestAuthProvider } from '../helpers/dashboard-test-auth.js';

const TOKEN = 'dashboard-test-token';
const COURSE_ID = '33333333-3333-4333-8333-333333333333';
const MATERIAL_A = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const MATERIAL_B = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

const BASE_STATS = {
  totalCourses: 1,
  totalStudyMaterials: 2,
  totalGeneratedPlans: 1,
  totalTasks: 6,
  pendingTasks: 4,
  completedTasks: 2,
  overduePendingTasks: 0,
  dueTodayPendingTasks: 0,
  dueNext7DaysPendingTasks: 0,
  deadlineReferenceDate: '2026-06-18',
  totalFlashcards: 1,
  dueFlashcardsCount: 0,
  totalFocusMinutes: 30,
  completedFocusSessions: 2,
  focusMinutesLast7Days: 12,
  completedFocusSessionsLast7Days: 1,
  trelloSyncedTasks: 0,
  courseStats: [
    {
      courseId: COURSE_ID,
      courseName: 'Physics',
      totalTasks: 6,
      completedTasks: 2,
      totalFlashcards: 1,
    },
  ],
};

const STATS_WITH_MATERIALS = {
  ...BASE_STATS,
  materialsWithPendingTasks: 6,
  topMaterialsByPendingTasks: [
    {
      materialId: MATERIAL_B,
      courseId: COURSE_ID,
      materialTitle: 'Beta Chapter',
      pendingTasks: 3,
    },
    {
      materialId: MATERIAL_A,
      courseId: COURSE_ID,
      materialTitle: 'Alpha Chapter',
      pendingTasks: 2,
    },
    {
      materialId: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
      courseId: COURSE_ID,
      materialTitle: 'Gamma Chapter',
      pendingTasks: 2,
    },
    {
      materialId: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
      courseId: COURSE_ID,
      materialTitle: 'Delta Chapter',
      pendingTasks: 2,
    },
    {
      materialId: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
      courseId: COURSE_ID,
      materialTitle: 'Epsilon Chapter',
      pendingTasks: 2,
    },
  ],
};

const STATS_EMPTY_MATERIALS = {
  ...BASE_STATS,
  materialsWithPendingTasks: 0,
  topMaterialsByPendingTasks: [],
};

/** @type {Record<string, unknown>} */
let currentStats = STATS_WITH_MATERIALS;

beforeEach(() => {
  currentStats = STATS_WITH_MATERIALS;
  __setAccessTokenForTests(TOKEN);
  __setReferenceDateForTests(() => '2026-06-18');
  __setApiFetchForTests(async (path, init) => {
    if (path.startsWith('/api/dashboard/stats?') && init.method === 'GET') {
      return {
        success: true,
        data: currentStats,
        meta: { timestamp: new Date().toISOString() },
      };
    }
    return {
      success: false,
      error: { code: 'NOT_FOUND', message: 'Not found' },
      meta: { timestamp: new Date().toISOString() },
    };
  });
});

afterEach(() => {
  __setApiFetchForTests(null);
  __setAccessTokenForTests(null);
  __setReferenceDateForTests(null);
});

/**
 * @param {import('react').ReactNode} children
 */
async function renderWithProviders(children) {
  const browser = installMinimalBrowser();
  const root = createRoot(browser.container);

  await act(async () => {
    root.render(
      <MemoryRouter>
        <DashboardTestAuthProvider>
          <DashboardProvider>{children}</DashboardProvider>
        </DashboardTestAuthProvider>
      </MemoryRouter>
    );
  });
  await flushUpdates();
  await flushUpdates();

  return {
    browser,
    async unmount() {
      await act(async () => {
        root.unmount();
      });
      browser.cleanup();
    },
  };
}

describe('DashboardMaterialsPending runtime rendering', () => {
  it('renders summary, rows, counts, and helper-generated links', async () => {
    const harness = await renderWithProviders(
      <DashboardMaterialsPending stats={STATS_WITH_MATERIALS} />
    );

    try {
      const text = harness.browser.container.textContent ?? '';
      assert.match(text, /6 materials with pending linked tasks/);
      assert.match(text, /Beta Chapter/);
      assert.match(text, /3 pending/);
      assert.match(text, /Showing top 5 materials by pending linked tasks/);

      const rows = harness.browser.container.querySelectorAll('.dashboard-materials-pending__row');
      assert.equal(rows.length, 5);

      const hrefs = Array.from(harness.browser.container.querySelectorAll('a')).map((link) =>
        link.getAttribute('href')
      );
      assert.ok(hrefs.includes(buildTasksPageMaterialLink(COURSE_ID, MATERIAL_B)));
      assert.ok(hrefs.includes(buildCoursePageMaterialLink(COURSE_ID, MATERIAL_B)));
    } finally {
      await harness.unmount();
    }
  });

  it('uses singular summary copy for one material', async () => {
    const harness = await renderWithProviders(
      <DashboardMaterialsPending
        stats={{
          ...BASE_STATS,
          materialsWithPendingTasks: 1,
          topMaterialsByPendingTasks: [
            {
              materialId: MATERIAL_A,
              courseId: COURSE_ID,
              materialTitle: 'Alpha Chapter',
              pendingTasks: 1,
            },
          ],
        }}
      />
    );

    try {
      const text = harness.browser.container.textContent ?? '';
      assert.match(text, /1 material with pending linked tasks/);
      assert.doesNotMatch(text, /material\(s\)/);
    } finally {
      await harness.unmount();
    }
  });

  it('renders the zero state for an empty list', async () => {
    const harness = await renderWithProviders(
      <DashboardMaterialsPending stats={STATS_EMPTY_MATERIALS} />
    );

    try {
      const text = harness.browser.container.textContent ?? '';
      assert.match(text, /No study materials have pending linked tasks right now/);
      assert.equal(
        harness.browser.container.querySelectorAll('.dashboard-materials-pending__row').length,
        0
      );
    } finally {
      await harness.unmount();
    }
  });
});

describe('DashboardStub material pending runtime rendering', () => {
  it('renders the material section with course workload and At a glance unchanged', async () => {
    const harness = await renderWithProviders(<DashboardStub />);

    try {
      await waitFor(() => {
        const text = harness.browser.container.textContent ?? '';
        return text.includes('Materials with pending tasks') && text.includes('Course workload');
      });

      const text = harness.browser.container.textContent ?? '';
      assert.match(text, /What should I study next\?/);
      assert.match(text, /Study pulse/);
      assert.match(text, /Materials with pending tasks/);
      assert.match(text, /Course workload/);
      assert.match(text, /At a glance/);
      assert.match(text, /Beta Chapter/);
      assert.equal(
        harness.browser.container.querySelectorAll('.dashboard-materials-pending__row').length,
        5
      );
    } finally {
      await harness.unmount();
    }
  });

  it('shows loading state before stats resolve', async () => {
    __setApiFetchForTests(
      () =>
        new Promise(() => {
          /* intentionally pending */
        })
    );

    const harness = await renderWithProviders(<DashboardStub />);

    try {
      const text = harness.browser.container.textContent ?? '';
      assert.match(text, /Loading dashboard/);
      assert.doesNotMatch(text, /Materials with pending tasks/);
    } finally {
      await harness.unmount();
    }
  });

  it('shows error state when dashboard stats fail', async () => {
    __setApiFetchForTests(async () => ({
      success: false,
      error: { code: 'DATABASE_ERROR', message: 'Failed to load dashboard stats' },
      meta: { timestamp: new Date().toISOString() },
    }));

    const harness = await renderWithProviders(<DashboardStub />);

    try {
      await waitFor(() =>
        (harness.browser.container.textContent ?? '').includes('Could not load dashboard stats')
      );
      const text = harness.browser.container.textContent ?? '';
      assert.match(text, /Could not load dashboard stats/);
      assert.doesNotMatch(text, /Materials with pending tasks/);
    } finally {
      await harness.unmount();
    }
  });

  it('refreshes material section values after manual refresh', async () => {
    const harness = await renderWithProviders(<DashboardStub />);

    try {
      await waitFor(() =>
        (harness.browser.container.textContent ?? '').includes('Beta Chapter')
      );

      currentStats = {
        ...STATS_WITH_MATERIALS,
        materialsWithPendingTasks: 1,
        topMaterialsByPendingTasks: [
          {
            materialId: MATERIAL_A,
            courseId: COURSE_ID,
            materialTitle: 'Refreshed Material',
            pendingTasks: 4,
          },
        ],
      };

      const refreshButton = findButtonByText(harness.browser.container, 'Refresh stats');
      assert.ok(refreshButton);
      await act(async () => {
        clickElement(refreshButton);
      });
      await flushUpdates();
      await flushUpdates();

      await waitFor(() =>
        (harness.browser.container.textContent ?? '').includes('Refreshed Material')
      );

      const text = harness.browser.container.textContent ?? '';
      assert.match(text, /1 material with pending linked tasks/);
      assert.match(text, /4 pending/);
      assert.doesNotMatch(text, /Beta Chapter/);
    } finally {
      await harness.unmount();
    }
  });

  it('does not crash when new fields are missing from the API payload', async () => {
    currentStats = {
      ...BASE_STATS,
      materialsWithPendingTasks: undefined,
      topMaterialsByPendingTasks: undefined,
    };

    const harness = await renderWithProviders(<DashboardStub />);

    try {
      await waitFor(() =>
        (harness.browser.container.textContent ?? '').includes('Materials with pending tasks')
      );
      const text = harness.browser.container.textContent ?? '';
      assert.match(text, /0 materials with pending linked tasks/);
      assert.match(text, /No study materials have pending linked tasks right now/);
    } finally {
      await harness.unmount();
    }
  });
});
