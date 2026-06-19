import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dashboardStubSource = readFileSync(
  join(__dirname, '../../src/pages/DashboardStub.jsx'),
  'utf8'
);
import {
  formatFocusMinutes,
  formatTaskCompletionPercent,
} from '../../src/utils/dashboard-format.js';
import {
  deriveCoursePendingTasks,
  deriveDashboardRecommendation,
  findMostPendingCourse,
} from '../../src/utils/dashboard-recommendation.js';
import {
  buildTasksPageDueTodayLink,
  buildTasksPageNext7DaysLink,
  buildTasksPageOverdueLink,
  buildTasksPagePendingLink,
} from '../../src/utils/task-nav-query.js';
import {
  COURSE_ACCENT_KEYS,
  DEFAULT_COURSE_ACCENT_KEY,
  getCourseAccentKey,
  stableHash,
} from '../../src/utils/course-accent.js';

describe('dashboard-format', () => {
  describe('formatFocusMinutes', () => {
    it('formats zero and one minute', () => {
      assert.equal(formatFocusMinutes(0), '0 min');
      assert.equal(formatFocusMinutes(1), '1 min');
    });

    it('formats minutes under one hour', () => {
      assert.equal(formatFocusMinutes(90), '1h 30m');
      assert.equal(formatFocusMinutes(45), '45 min');
    });

    it('formats whole hours without remainder', () => {
      assert.equal(formatFocusMinutes(120), '2h');
    });
  });

  describe('formatTaskCompletionPercent', () => {
    it('returns null when totalTasks is zero', () => {
      assert.equal(formatTaskCompletionPercent(0, 0), null);
    });

    it('returns rounded percentage when totalTasks is positive', () => {
      assert.equal(formatTaskCompletionPercent(3, 10), 30);
      assert.equal(formatTaskCompletionPercent(1, 3), 33);
    });
  });
});

/** @type {import('../../src/services/dashboard.service.js').DashboardStats} */
const recommendationBaseStats = {
  totalCourses: 1,
  totalStudyMaterials: 2,
  totalGeneratedPlans: 2,
  totalTasks: 4,
  pendingTasks: 0,
  completedTasks: 4,
  overduePendingTasks: 0,
  dueTodayPendingTasks: 0,
  dueNext7DaysPendingTasks: 0,
  deadlineReferenceDate: '2026-06-18',
  totalFlashcards: 0,
  dueFlashcardsCount: 0,
  totalFocusMinutes: 30,
  completedFocusSessions: 1,
  focusMinutesLast7Days: 0,
  completedFocusSessionsLast7Days: 0,
  trelloSyncedTasks: 0,
  courseStats: [
    {
      courseId: 'course-a',
      courseName: 'Alpha',
      totalTasks: 2,
      completedTasks: 2,
      totalFlashcards: 0,
    },
  ],
};

describe('dashboard-recommendation', () => {
  describe('deriveCoursePendingTasks', () => {
    it('returns non-negative pending count', () => {
      assert.equal(
        deriveCoursePendingTasks({ totalTasks: 5, completedTasks: 2 }),
        3
      );
      assert.equal(
        deriveCoursePendingTasks({ totalTasks: 1, completedTasks: 3 }),
        0
      );
    });

    it('handles missing or invalid numbers defensively', () => {
      assert.equal(deriveCoursePendingTasks({}), 0);
    });
  });

  describe('findMostPendingCourse', () => {
    it('returns null when no courses have pending tasks', () => {
      assert.equal(findMostPendingCourse(recommendationBaseStats.courseStats), null);
      assert.equal(findMostPendingCourse([]), null);
      assert.equal(findMostPendingCourse(undefined), null);
    });

    it('returns the course with the highest derived pending count', () => {
      const mostPending = findMostPendingCourse([
        {
          courseId: 'b',
          courseName: 'Beta',
          totalTasks: 5,
          completedTasks: 1,
          totalFlashcards: 0,
        },
        {
          courseId: 'a',
          courseName: 'Alpha',
          totalTasks: 3,
          completedTasks: 0,
          totalFlashcards: 0,
        },
      ]);

      assert.deepEqual(mostPending, {
        courseId: 'b',
        courseName: 'Beta',
        pending: 4,
      });
    });

    it('uses courseName as a stable tie-break', () => {
      const mostPending = findMostPendingCourse([
        {
          courseId: 'z',
          courseName: 'Zulu',
          totalTasks: 3,
          completedTasks: 1,
          totalFlashcards: 0,
        },
        {
          courseId: 'a',
          courseName: 'Alpha',
          totalTasks: 3,
          completedTasks: 1,
          totalFlashcards: 0,
        },
      ]);

      assert.equal(mostPending?.courseName, 'Alpha');
      assert.equal(mostPending?.pending, 2);
    });
  });

  describe('deriveDashboardRecommendation', () => {
    it('returns null for missing stats', () => {
      assert.equal(deriveDashboardRecommendation(null), null);
      assert.equal(deriveDashboardRecommendation(undefined), null);
    });

    it('recommends creating the first course when totalCourses is zero', () => {
      const recommendation = deriveDashboardRecommendation({
        ...recommendationBaseStats,
        totalCourses: 0,
        courseStats: [],
      });

      assert.equal(recommendation?.kind, 'no-courses');
      assert.equal(recommendation?.primaryCta.to, '/courses');
    });

    it('recommends overdue tasks before due today and generic pending', () => {
      const recommendation = deriveDashboardRecommendation({
        ...recommendationBaseStats,
        pendingTasks: 5,
        overduePendingTasks: 2,
        dueTodayPendingTasks: 1,
        completedTasks: 0,
        totalTasks: 5,
      });

      assert.equal(recommendation?.kind, 'overdue-tasks');
      assert.match(recommendation?.headline ?? '', /2 overdue pending tasks/);
      assert.equal(recommendation?.primaryCta.to, '/tasks?status=pending&deadline=overdue');
      assert.equal(recommendation?.primaryCta.label, 'View pending tasks');
      assert.equal(recommendation?.secondaryCta, undefined);
    });

    it('recommends due-today tasks when overdue is zero', () => {
      const recommendation = deriveDashboardRecommendation({
        ...recommendationBaseStats,
        pendingTasks: 3,
        overduePendingTasks: 0,
        dueTodayPendingTasks: 2,
        dueNext7DaysPendingTasks: 1,
        completedTasks: 1,
        totalTasks: 4,
      });

      assert.equal(recommendation?.kind, 'due-today-tasks');
      assert.match(recommendation?.headline ?? '', /2 pending tasks due today/);
      assert.equal(recommendation?.primaryCta.to, '/tasks?status=pending&deadline=due_today');
      assert.equal(recommendation?.secondaryCta, undefined);
    });

    it('recommends due-next-7-days tasks when overdue and due today are zero', () => {
      const recommendation = deriveDashboardRecommendation({
        ...recommendationBaseStats,
        pendingTasks: 3,
        overduePendingTasks: 0,
        dueTodayPendingTasks: 0,
        dueNext7DaysPendingTasks: 2,
        completedTasks: 1,
        totalTasks: 4,
      });

      assert.equal(recommendation?.kind, 'due-next-7-days-tasks');
      assert.match(recommendation?.headline ?? '', /2 pending tasks due in the next 7 days/);
      assert.equal(recommendation?.primaryCta.to, '/tasks?status=pending&deadline=next_7_days');
      assert.equal(recommendation?.secondaryCta, undefined);
    });

    it('recommends due-next-7-days tasks before generic pending tasks', () => {
      const recommendation = deriveDashboardRecommendation({
        ...recommendationBaseStats,
        pendingTasks: 5,
        overduePendingTasks: 0,
        dueTodayPendingTasks: 0,
        dueNext7DaysPendingTasks: 1,
        completedTasks: 0,
        totalTasks: 5,
      });

      assert.equal(recommendation?.kind, 'due-next-7-days-tasks');
      assert.notEqual(recommendation?.kind, 'pending-tasks');
    });

    it('recommends overdue tasks over due flashcards', () => {
      const recommendation = deriveDashboardRecommendation({
        ...recommendationBaseStats,
        pendingTasks: 2,
        overduePendingTasks: 1,
        dueTodayPendingTasks: 0,
        dueFlashcardsCount: 5,
        totalFlashcards: 10,
      });

      assert.equal(recommendation?.kind, 'overdue-tasks');
    });

    it('recommends due-today tasks over due flashcards when overdue is zero', () => {
      const recommendation = deriveDashboardRecommendation({
        ...recommendationBaseStats,
        pendingTasks: 1,
        overduePendingTasks: 0,
        dueTodayPendingTasks: 1,
        dueFlashcardsCount: 5,
        totalFlashcards: 10,
      });

      assert.equal(recommendation?.kind, 'due-today-tasks');
    });

    it('uses singular overdue headline for one overdue task', () => {
      const recommendation = deriveDashboardRecommendation({
        ...recommendationBaseStats,
        pendingTasks: 1,
        overduePendingTasks: 1,
        dueTodayPendingTasks: 0,
      });

      assert.match(recommendation?.headline ?? '', /1 overdue pending task\./);
    });

    it('uses singular due-today headline for one task due today', () => {
      const recommendation = deriveDashboardRecommendation({
        ...recommendationBaseStats,
        pendingTasks: 1,
        overduePendingTasks: 0,
        dueTodayPendingTasks: 1,
      });

      assert.match(recommendation?.headline ?? '', /1 pending task due today\./);
    });

    it('recommends pending tasks over due flashcards when both exist', () => {
      const recommendation = deriveDashboardRecommendation({
        ...recommendationBaseStats,
        pendingTasks: 3,
        completedTasks: 1,
        totalTasks: 4,
        dueFlashcardsCount: 5,
        totalFlashcards: 10,
        courseStats: [
          {
            courseId: 'course-a',
            courseName: 'Alpha',
            totalTasks: 2,
            completedTasks: 0,
            totalFlashcards: 0,
          },
          {
            courseId: 'course-b',
            courseName: 'Beta',
            totalTasks: 2,
            completedTasks: 1,
            totalFlashcards: 0,
          },
        ],
      });

      assert.equal(recommendation?.kind, 'pending-tasks');
      assert.equal(recommendation?.primaryCta.to, '/tasks?status=pending');
    });

    it('recommends pending tasks with optional most-pending course', () => {
      const recommendation = deriveDashboardRecommendation({
        ...recommendationBaseStats,
        pendingTasks: 3,
        completedTasks: 1,
        totalTasks: 4,
        courseStats: [
          {
            courseId: 'course-a',
            courseName: 'Alpha',
            totalTasks: 2,
            completedTasks: 0,
            totalFlashcards: 0,
          },
          {
            courseId: 'course-b',
            courseName: 'Beta',
            totalTasks: 2,
            completedTasks: 1,
            totalFlashcards: 0,
          },
        ],
      });

      assert.equal(recommendation?.kind, 'pending-tasks');
      assert.match(recommendation?.headline ?? '', /3 pending tasks/);
      assert.equal(recommendation?.primaryCta.to, '/tasks?status=pending');
      assert.equal(
        recommendation?.secondaryCta?.to,
        '/tasks?courseId=course-a&status=pending'
      );
      assert.match(recommendation?.context ?? '', /Most pending: Alpha/);
    });

    it('omits secondary CTA when no course has pending tasks in courseStats', () => {
      const recommendation = deriveDashboardRecommendation({
        ...recommendationBaseStats,
        pendingTasks: 2,
        completedTasks: 2,
        totalTasks: 4,
        courseStats: [
          {
            courseId: 'course-a',
            courseName: 'Alpha',
            totalTasks: 2,
            completedTasks: 2,
            totalFlashcards: 0,
          },
        ],
      });

      assert.equal(recommendation?.kind, 'pending-tasks');
      assert.equal(recommendation?.primaryCta.to, '/tasks?status=pending');
      assert.equal(recommendation?.secondaryCta, undefined);
    });

    it('recommends generating plans when active-plan gap exists and no flashcards are due', () => {
      const recommendation = deriveDashboardRecommendation({
        ...recommendationBaseStats,
        totalStudyMaterials: 3,
        totalGeneratedPlans: 1,
        dueFlashcardsCount: 0,
      });

      assert.equal(recommendation?.kind, 'plan-gap');
      assert.match(recommendation?.headline ?? '', /2 materials without an active study plan/);
      assert.equal(recommendation?.primaryCta.to, '/courses');
    });

    it('recommends due flashcards over plan-gap when cards are due', () => {
      const recommendation = deriveDashboardRecommendation({
        ...recommendationBaseStats,
        totalStudyMaterials: 3,
        totalGeneratedPlans: 1,
        totalFlashcards: 8,
        dueFlashcardsCount: 2,
      });

      assert.equal(recommendation?.kind, 'due-flashcards');
      assert.match(recommendation?.headline ?? '', /2 flashcards due for review/);
      assert.equal(recommendation?.primaryCta.label, 'Review due flashcards');
      assert.equal(recommendation?.primaryCta.to, '/flashcards?reviewState=due_now');
    });

    it('recommends due flashcards with singular headline when one card is due', () => {
      const recommendation = deriveDashboardRecommendation({
        ...recommendationBaseStats,
        totalFlashcards: 10,
        dueFlashcardsCount: 1,
      });

      assert.equal(recommendation?.kind, 'due-flashcards');
      assert.match(recommendation?.headline ?? '', /1 flashcard due for review/);
      assert.equal(recommendation?.primaryCta.to, '/flashcards?reviewState=due_now');
      assert.match(recommendation?.context ?? '', /review schedule/);
    });

    it('recommends generic flashcards when none are due', () => {
      const recommendation = deriveDashboardRecommendation({
        ...recommendationBaseStats,
        totalFlashcards: 5,
        dueFlashcardsCount: 0,
      });

      assert.equal(recommendation?.kind, 'flashcards');
      assert.equal(recommendation?.primaryCta.to, '/flashcards');
    });

    it('recommends adding tasks or plans when materials exist but tasks do not', () => {
      const recommendation = deriveDashboardRecommendation({
        ...recommendationBaseStats,
        totalTasks: 0,
        completedTasks: 0,
        totalStudyMaterials: 2,
        totalGeneratedPlans: 2,
        totalFlashcards: 0,
      });

      assert.equal(recommendation?.kind, 'add-tasks-or-plans');
      assert.equal(recommendation?.primaryCta.to, '/courses');
    });

    it('recommends seeding the workspace when a course exists but has no assets', () => {
      const recommendation = deriveDashboardRecommendation({
        ...recommendationBaseStats,
        totalStudyMaterials: 0,
        totalGeneratedPlans: 0,
        totalTasks: 0,
        completedTasks: 0,
        totalFlashcards: 0,
      });

      assert.equal(recommendation?.kind, 'empty-workspace');
      assert.equal(recommendation?.primaryCta.to, '/courses');
    });

    it('returns a caught-up recommendation by default', () => {
      const recommendation = deriveDashboardRecommendation(recommendationBaseStats);

      assert.equal(recommendation?.kind, 'caught-up');
      assert.match(recommendation?.headline ?? '', /caught up on pending tasks/i);
      assert.equal(recommendation?.primaryCta.to, '/courses');
      assert.equal(recommendation?.secondaryCta?.to, '/tasks');
    });

    it('handles zero-valued stats defensively', () => {
      const recommendation = deriveDashboardRecommendation({
        totalCourses: 0,
        totalStudyMaterials: 0,
        totalGeneratedPlans: 0,
        totalTasks: 0,
        pendingTasks: 0,
        completedTasks: 0,
        overduePendingTasks: 0,
        dueTodayPendingTasks: 0,
        totalFlashcards: 0,
        dueFlashcardsCount: 0,
        totalFocusMinutes: 0,
        completedFocusSessions: 0,
        focusMinutesLast7Days: 0,
        completedFocusSessionsLast7Days: 0,
        trelloSyncedTasks: 0,
        courseStats: [],
      });

      assert.equal(recommendation?.kind, 'no-courses');
    });
  });
});

describe('DashboardStub deadline task stats', () => {
  /**
   * @param {string} label
   * @param {string} endLabel
   */
  function atAGlanceStatSection(label, endLabel) {
    const start = dashboardStubSource.indexOf(`label="${label}"`);
    const end = dashboardStubSource.indexOf(`label="${endLabel}"`, start);
    assert.ok(start >= 0, `expected ${label} stat in DashboardStub`);
    assert.ok(end > start, `expected ${endLabel} stat after ${label}`);
    return dashboardStubSource.slice(start, end);
  }

  it('At a glance Overdue detail uses the overdue-filtered URL', () => {
    const section = atAGlanceStatSection('Overdue', 'Due today');
    assert.match(section, /to=\{buildTasksPageOverdueLink\(\)\}/);
    assert.doesNotMatch(section, /buildTasksPagePendingLink/);
    assert.equal(buildTasksPageOverdueLink(), '/tasks?status=pending&deadline=overdue');
  });

  it('At a glance Due today detail uses the due-today-filtered URL', () => {
    const section = atAGlanceStatSection('Due today', 'Due next 7 days');
    assert.match(section, /to=\{buildTasksPageDueTodayLink\(\)\}/);
    assert.doesNotMatch(section, /buildTasksPagePendingLink/);
    assert.equal(buildTasksPageDueTodayLink(), '/tasks?status=pending&deadline=due_today');
  });

  it('At a glance Due next 7 days detail uses the next_7_days filtered URL', () => {
    const section = atAGlanceStatSection('Due next 7 days', 'Completed');
    assert.match(section, /to=\{buildTasksPageNext7DaysLink\(\)\}/);
    assert.doesNotMatch(section, /buildTasksPagePendingLink/);
    assert.equal(buildTasksPageNext7DaysLink(), '/tasks?status=pending&deadline=next_7_days');
  });

  it('shows Overdue, Due today, and Due next 7 days counts when counts are positive', () => {
    assert.match(dashboardStubSource, /label="Overdue"/);
    assert.match(dashboardStubSource, /label="Due today"/);
    assert.match(dashboardStubSource, /label="Due next 7 days"/);
    assert.match(dashboardStubSource, /stats\.overduePendingTasks/);
    assert.match(dashboardStubSource, /stats\.dueTodayPendingTasks/);
    assert.match(dashboardStubSource, /stats\.dueNext7DaysPendingTasks/);
    assert.match(dashboardStubSource, /View pending tasks/);
    assert.match(dashboardStubSource, /\(stats\.overduePendingTasks \?\? 0\) > 0/);
    assert.match(dashboardStubSource, /\(stats\.dueTodayPendingTasks \?\? 0\) > 0/);
    assert.match(dashboardStubSource, /\(stats\.dueNext7DaysPendingTasks \?\? 0\) > 0/);
  });
});

describe('dashboard deadline task links', () => {
  it('overdue recommendation hero uses the overdue-filtered URL', () => {
    const recommendation = deriveDashboardRecommendation({
      ...recommendationBaseStats,
      pendingTasks: 2,
      overduePendingTasks: 2,
      dueTodayPendingTasks: 0,
    });

    assert.equal(recommendation?.kind, 'overdue-tasks');
    assert.equal(recommendation?.primaryCta.to, buildTasksPageOverdueLink());
    assert.equal(recommendation?.primaryCta.to, '/tasks?status=pending&deadline=overdue');
  });

  it('due-today recommendation hero uses the due-today-filtered URL', () => {
    const recommendation = deriveDashboardRecommendation({
      ...recommendationBaseStats,
      pendingTasks: 2,
      overduePendingTasks: 0,
      dueTodayPendingTasks: 2,
    });

    assert.equal(recommendation?.kind, 'due-today-tasks');
    assert.equal(recommendation?.primaryCta.to, buildTasksPageDueTodayLink());
    assert.equal(recommendation?.primaryCta.to, '/tasks?status=pending&deadline=due_today');
  });

  it('due-next-7-days recommendation hero uses the next_7_days filtered URL', () => {
    const recommendation = deriveDashboardRecommendation({
      ...recommendationBaseStats,
      pendingTasks: 2,
      overduePendingTasks: 0,
      dueTodayPendingTasks: 0,
      dueNext7DaysPendingTasks: 2,
    });

    assert.equal(recommendation?.kind, 'due-next-7-days-tasks');
    assert.equal(recommendation?.primaryCta.to, buildTasksPageNext7DaysLink());
    assert.equal(recommendation?.primaryCta.to, '/tasks?status=pending&deadline=next_7_days');
  });

  it('generic pending recommendation hero keeps the generic pending URL', () => {
    const recommendation = deriveDashboardRecommendation({
      ...recommendationBaseStats,
      pendingTasks: 3,
      overduePendingTasks: 0,
      dueTodayPendingTasks: 0,
      dueNext7DaysPendingTasks: 0,
      completedTasks: 1,
      totalTasks: 4,
    });

    assert.equal(recommendation?.kind, 'pending-tasks');
    assert.equal(recommendation?.primaryCta.to, buildTasksPagePendingLink());
    assert.equal(recommendation?.primaryCta.to, '/tasks?status=pending');
  });
});

describe('DashboardStub due flashcards stat', () => {
  it('shows Due now in Learning assets with dueFlashcardsCount and link when due', () => {
    assert.match(dashboardStubSource, /label="Due now"/);
    assert.match(dashboardStubSource, /stats\.dueFlashcardsCount/);
    assert.match(dashboardStubSource, /Ready for review/);
    assert.match(dashboardStubSource, /buildFlashcardsPageDueNowLink/);
    assert.match(dashboardStubSource, /Review flashcards/);
    assert.match(dashboardStubSource, /stats\.dueFlashcardsCount > 0/);
  });
});

describe('DashboardStub last-seven-days focus', () => {
  it('shows Last 7 days focus snapshot with formatter and zero-safe defaults', () => {
    assert.match(dashboardStubSource, /Last 7 days/);
    assert.match(dashboardStubSource, /Focus time/);
    assert.match(dashboardStubSource, /Completed focus sessions/);
    assert.match(dashboardStubSource, /focusMinutesLast7Days/);
    assert.match(dashboardStubSource, /completedFocusSessionsLast7Days/);
    assert.match(dashboardStubSource, /formatFocusMinutes\(focusMinutesLast7Days\)/);
    assert.match(dashboardStubSource, /\?\? 0/);
  });
});

describe('course-accent', () => {
  describe('getCourseAccentKey', () => {
    it('returns the same key repeatedly for the same courseId', () => {
      const params = { courseId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' };
      const first = getCourseAccentKey(params);
      const second = getCourseAccentKey(params);
      const third = getCourseAccentKey(params);

      assert.equal(first, second);
      assert.equal(second, third);
      assert.ok(COURSE_ACCENT_KEYS.includes(first));
    });

    it('prefers courseId over different course names', () => {
      const courseId = 'course-id-stable-001';
      const fromNameA = getCourseAccentKey({
        courseId,
        courseName: 'Biology 101',
      });
      const fromNameB = getCourseAccentKey({
        courseId,
        courseName: 'Chemistry 202',
      });

      assert.equal(fromNameA, fromNameB);
    });

    it('falls back to courseName when courseId is missing', () => {
      const key = getCourseAccentKey({ courseName: 'History of Art' });
      assert.ok(COURSE_ACCENT_KEYS.includes(key));
    });

    it('falls back to courseTitle when courseId and courseName are missing', () => {
      const key = getCourseAccentKey({ courseTitle: 'Linear Algebra' });
      assert.ok(COURSE_ACCENT_KEYS.includes(key));
    });

    it('returns amber when no seed exists', () => {
      assert.equal(getCourseAccentKey({}), DEFAULT_COURSE_ACCENT_KEY);
      assert.equal(getCourseAccentKey({ courseId: '   ' }), DEFAULT_COURSE_ACCENT_KEY);
      assert.equal(getCourseAccentKey({ courseName: null, courseTitle: undefined }), DEFAULT_COURSE_ACCENT_KEY);
    });

    it('always returns one of amber, rose, or emerald', () => {
      const samples = [
        { courseId: '11111111-1111-1111-1111-111111111111' },
        { courseId: '22222222-2222-2222-2222-222222222222' },
        { courseName: 'Physics' },
        { courseTitle: 'Organic Chemistry' },
        {},
      ];

      for (const params of samples) {
        const key = getCourseAccentKey(params);
        assert.ok(COURSE_ACCENT_KEYS.includes(key), `unexpected key: ${key}`);
      }
    });

    it('matches golden cases for sample IDs and names', () => {
      const sampleId = '00000000-0000-4000-8000-000000000001';
      const sampleName = 'StudyOps Sample Course';

      assert.equal(
        getCourseAccentKey({ courseId: sampleId }),
        COURSE_ACCENT_KEYS[stableHash(sampleId) % COURSE_ACCENT_KEYS.length]
      );
      assert.equal(
        getCourseAccentKey({ courseName: sampleName }),
        COURSE_ACCENT_KEYS[stableHash(sampleName) % COURSE_ACCENT_KEYS.length]
      );
    });

    it('does not log to console', () => {
      const logs = [];
      const originalLog = console.log;
      const originalInfo = console.info;
      const originalWarn = console.warn;
      const originalError = console.error;

      console.log = (...args) => logs.push(['log', ...args]);
      console.info = (...args) => logs.push(['info', ...args]);
      console.warn = (...args) => logs.push(['warn', ...args]);
      console.error = (...args) => logs.push(['error', ...args]);

      try {
        getCourseAccentKey({
          courseId: 'quiet-course-id',
          courseName: 'Quiet Course Name',
          courseTitle: 'Quiet Course Title',
        });
        assert.equal(logs.length, 0);
      } finally {
        console.log = originalLog;
        console.info = originalInfo;
        console.warn = originalWarn;
        console.error = originalError;
      }
    });
  });

  describe('stableHash', () => {
    it('is deterministic for the same input', () => {
      assert.equal(stableHash('same-seed'), stableHash('same-seed'));
      assert.notEqual(stableHash('seed-a'), stableHash('seed-b'));
    });
  });
});
