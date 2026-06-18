import { buildFlashcardsPageDueNowLink } from './flashcard-nav-query.js';
import {
  buildTasksPageCoursePendingLink,
  buildTasksPageDueTodayLink,
  buildTasksPageOverdueLink,
  buildTasksPagePendingLink,
} from './task-nav-query.js';

/**
 * @typedef {import('../services/dashboard.service.js').DashboardStats} DashboardStats
 * @typedef {import('../services/dashboard.service.js').DashboardCourseStat} DashboardCourseStat
 */

/**
 * @param {DashboardCourseStat} course
 * @returns {number}
 */
export function deriveCoursePendingTasks(course) {
  const total = Number.isFinite(course.totalTasks) ? course.totalTasks : 0;
  const completed = Number.isFinite(course.completedTasks) ? course.completedTasks : 0;
  return Math.max(0, total - completed);
}

/**
 * @param {DashboardCourseStat[] | null | undefined} courseStats
 * @returns {{ courseId: string, courseName: string, pending: number } | null}
 */
export function findMostPendingCourse(courseStats) {
  if (!Array.isArray(courseStats) || courseStats.length === 0) {
    return null;
  }

  const withPending = courseStats
    .map((course) => ({
      courseId: course.courseId,
      courseName: course.courseName,
      pending: deriveCoursePendingTasks(course),
    }))
    .filter((course) => course.pending > 0);

  if (withPending.length === 0) {
    return null;
  }

  withPending.sort((a, b) => {
    if (b.pending !== a.pending) {
      return b.pending - a.pending;
    }
    return a.courseName.localeCompare(b.courseName, undefined, { sensitivity: 'base' });
  });

  return withPending[0];
}

/**
 * @typedef {{
 *   kind:
 *     | 'no-courses'
 *     | 'overdue-tasks'
 *     | 'due-today-tasks'
 *     | 'pending-tasks'
 *     | 'due-flashcards'
 *     | 'plan-gap'
 *     | 'flashcards'
 *     | 'add-tasks-or-plans'
 *     | 'empty-workspace'
 *     | 'caught-up',
 *   headline: string,
 *   context: string,
 *   primaryCta: { label: string, to: string },
 *   secondaryCta?: { label: string, to: string },
 * }} DashboardRecommendation
 */

/**
 * @param {DashboardStats | null | undefined} stats
 * @returns {DashboardRecommendation | null}
 */
export function deriveDashboardRecommendation(stats) {
  if (!stats) {
    return null;
  }

  const totalCourses = stats.totalCourses ?? 0;
  const pendingTasks = stats.pendingTasks ?? 0;
  const overduePendingTasks = stats.overduePendingTasks ?? 0;
  const dueTodayPendingTasks = stats.dueTodayPendingTasks ?? 0;
  const totalStudyMaterials = stats.totalStudyMaterials ?? 0;
  const totalGeneratedPlans = stats.totalGeneratedPlans ?? 0;
  const totalFlashcards = stats.totalFlashcards ?? 0;
  const dueFlashcardsCount = stats.dueFlashcardsCount ?? 0;
  const totalTasks = stats.totalTasks ?? 0;
  const completedTasks = stats.completedTasks ?? 0;
  const courseStats = stats.courseStats ?? [];

  if (totalCourses === 0) {
    return {
      kind: 'no-courses',
      headline: 'Create your first course to get started.',
      context:
        'Organize study materials by subject before you add tasks or generate plans. Based on your pending tasks and active study plans.',
      primaryCta: { label: 'Go to My courses', to: '/courses' },
    };
  }

  if (overduePendingTasks > 0) {
    const taskWord = overduePendingTasks === 1 ? 'task' : 'tasks';
    return {
      kind: 'overdue-tasks',
      headline: `You have ${overduePendingTasks} overdue pending ${taskWord}. Tackle those first.`,
      context: 'Based on your pending tasks and active study plans.',
      primaryCta: { label: 'View pending tasks', to: buildTasksPageOverdueLink() },
    };
  }

  if (dueTodayPendingTasks > 0) {
    const taskWord = dueTodayPendingTasks === 1 ? 'task' : 'tasks';
    return {
      kind: 'due-today-tasks',
      headline: `You have ${dueTodayPendingTasks} pending ${taskWord} due today.`,
      context: 'Based on your pending tasks and active study plans.',
      primaryCta: { label: 'View pending tasks', to: buildTasksPageDueTodayLink() },
    };
  }

  if (pendingTasks > 0) {
    const mostPending = findMostPendingCourse(courseStats);
    const taskWord = pendingTasks === 1 ? 'task' : 'tasks';
    let context = 'Based on your pending tasks and active study plans.';

    if (mostPending) {
      const courseTaskWord = mostPending.pending === 1 ? 'task' : 'tasks';
      context = `Most pending: ${mostPending.courseName} (${mostPending.pending} ${courseTaskWord}). Based on your pending tasks and active study plans.`;
    }

    /** @type {DashboardRecommendation} */
    const recommendation = {
      kind: 'pending-tasks',
      headline: `You have ${pendingTasks} pending ${taskWord} — work through those next.`,
      context,
      primaryCta: { label: 'View tasks', to: buildTasksPagePendingLink() },
    };

    if (mostPending) {
      recommendation.secondaryCta = {
        label: `Open ${mostPending.courseName}`,
        to: buildTasksPageCoursePendingLink(mostPending.courseId),
      };
    }

    return recommendation;
  }

  if (dueFlashcardsCount > 0) {
    const flashcardWord = dueFlashcardsCount === 1 ? 'flashcard' : 'flashcards';
    return {
      kind: 'due-flashcards',
      headline: `${dueFlashcardsCount} ${flashcardWord} due for review.`,
      context: 'Based on your review schedule and study stats.',
      primaryCta: {
        label: 'Review due flashcards',
        to: buildFlashcardsPageDueNowLink(),
      },
    };
  }

  if (totalStudyMaterials > totalGeneratedPlans) {
    const gap = totalStudyMaterials - totalGeneratedPlans;
    const materialWord = gap === 1 ? 'material' : 'materials';
    return {
      kind: 'plan-gap',
      headline: `${gap} ${materialWord} without an active study plan.`,
      context:
        'Open a course and generate a plan from saved material content. Based on your pending tasks and active study plans.',
      primaryCta: { label: 'Go to My courses', to: '/courses' },
    };
  }

  if (totalFlashcards > 0) {
    return {
      kind: 'flashcards',
      headline: 'No pending tasks — review your flashcards.',
      context: 'Based on your pending tasks and active study plans.',
      primaryCta: { label: 'Review flashcards', to: '/flashcards' },
    };
  }

  if (totalTasks === 0 && totalStudyMaterials > 0) {
    return {
      kind: 'add-tasks-or-plans',
      headline: 'Add tasks or generate a study plan from your saved materials.',
      context: 'Based on your pending tasks and active study plans.',
      primaryCta: { label: 'Go to My courses', to: '/courses' },
    };
  }

  if (totalStudyMaterials === 0 && totalTasks === 0 && totalFlashcards === 0) {
    return {
      kind: 'empty-workspace',
      headline: 'Add materials or tasks to get started.',
      context: 'Based on your pending tasks and active study plans.',
      primaryCta: { label: 'Go to My courses', to: '/courses' },
    };
  }

  const planWord = totalGeneratedPlans === 1 ? 'plan' : 'plans';
  return {
    kind: 'caught-up',
    headline: "You're caught up on pending tasks.",
    context: `${completedTasks} completed tasks and ${totalGeneratedPlans} active ${planWord}. Based on your pending tasks and active study plans.`,
    primaryCta: { label: 'Browse courses', to: '/courses' },
    secondaryCta: { label: 'View tasks', to: '/tasks' },
  };
}
