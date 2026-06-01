import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  formatFocusMinutes,
  formatTaskCompletionPercent,
} from '../../src/utils/dashboard-format.js';
import {
  deriveCoursePendingTasks,
  deriveDashboardRecommendation,
  findMostPendingCourse,
} from '../../src/utils/dashboard-recommendation.js';

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
  totalFlashcards: 0,
  totalFocusMinutes: 30,
  completedFocusSessions: 1,
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
      assert.equal(recommendation?.primaryCta.to, '/tasks');
      assert.equal(recommendation?.secondaryCta?.to, '/courses/course-a');
      assert.match(recommendation?.context ?? '', /Most pending: Alpha/);
    });

    it('recommends generating plans when active-plan gap exists', () => {
      const recommendation = deriveDashboardRecommendation({
        ...recommendationBaseStats,
        totalStudyMaterials: 3,
        totalGeneratedPlans: 1,
      });

      assert.equal(recommendation?.kind, 'plan-gap');
      assert.match(recommendation?.headline ?? '', /2 materials without an active study plan/);
      assert.equal(recommendation?.primaryCta.to, '/courses');
    });

    it('recommends flashcards when no pending tasks remain', () => {
      const recommendation = deriveDashboardRecommendation({
        ...recommendationBaseStats,
        totalFlashcards: 5,
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
        totalFlashcards: 0,
        totalFocusMinutes: 0,
        completedFocusSessions: 0,
        trelloSyncedTasks: 0,
        courseStats: [],
      });

      assert.equal(recommendation?.kind, 'no-courses');
    });
  });
});
