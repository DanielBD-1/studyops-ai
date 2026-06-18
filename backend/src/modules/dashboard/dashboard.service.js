import { getSupabaseAdmin } from '../../config/supabase.js';
import { ApiError } from '../../shared/errors/ApiError.js';

const LAST_7_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Rolling last-7-days lower bound (inclusive on ended_at), not a calendar week.
 *
 * @param {Date} [now]
 * @returns {string}
 */
export function computeLast7DaysThresholdIso(now = new Date()) {
  return new Date(now.getTime() - LAST_7_DAYS_MS).toISOString();
}

/**
 * @param {{ duration_minutes: number }[]} sessions
 * @returns {number}
 */
export function sumCompletedFocusMinutes(sessions) {
  return sessions.reduce((sum, session) => sum + session.duration_minutes, 0);
}

/**
 * @param {{ id: string, title: string }[]} courses
 * @param {{ course_id: string, status: string }[]} tasks
 * @param {{ course_id: string }[]} flashcards
 * @returns {Array<{ courseId: string, courseName: string, totalTasks: number, completedTasks: number, totalFlashcards: number }>}
 */
export function aggregateCourseStats(courses, tasks, flashcards) {
  return courses.map((course) => {
    const courseTasks = tasks.filter((task) => task.course_id === course.id);
    const courseFlashcards = flashcards.filter((card) => card.course_id === course.id);

    return {
      courseId: course.id,
      courseName: course.title,
      totalTasks: courseTasks.length,
      completedTasks: courseTasks.filter((task) => task.status === 'completed').length,
      totalFlashcards: courseFlashcards.length,
    };
  });
}

/**
 * @param {Promise<{ count: number | null, error: { message?: string } | null }>} query
 * @returns {Promise<number>}
 */
async function countExact(query) {
  const { count, error } = await query;

  if (error) {
    throw new ApiError('DATABASE_ERROR', 'Failed to load dashboard stats', 500);
  }

  return count ?? 0;
}

/**
 * @param {string} userId
 * @param {string} deadlineReferenceDate YYYY-MM-DD calendar date for overdue/due-today counts
 */
export async function getDashboardStats(userId, deadlineReferenceDate) {
  const supabase = getSupabaseAdmin();
  const now = new Date();
  const nowIso = now.toISOString();
  const last7DaysThresholdIso = computeLast7DaysThresholdIso(now);

  const [
    totalCourses,
    totalStudyMaterials,
    totalGeneratedPlans,
    totalTasks,
    pendingTasks,
    completedTasks,
    overduePendingTasks,
    dueTodayPendingTasks,
    totalFlashcards,
    dueFlashcardsCount,
    completedFocusSessions,
    trelloSyncedTasks,
    focusResult,
    last7DaysFocusResult,
    coursesResult,
    tasksResult,
    flashcardsResult,
  ] = await Promise.all([
    countExact(
      supabase
        .from('courses')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
    ),
    countExact(
      supabase
        .from('study_materials')
        .select('id, courses!inner(id)', { count: 'exact', head: true })
        .eq('courses.user_id', userId)
    ),
    countExact(
      supabase
        .from('material_generated_plans')
        .select('id, courses!inner(id)', { count: 'exact', head: true })
        .eq('courses.user_id', userId)
        .eq('is_active', true)
    ),
    countExact(
      supabase
        .from('study_tasks')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
    ),
    countExact(
      supabase
        .from('study_tasks')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'pending')
    ),
    countExact(
      supabase
        .from('study_tasks')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'completed')
    ),
    countExact(
      supabase
        .from('study_tasks')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'pending')
        .not('due_date', 'is', null)
        .lt('due_date', deadlineReferenceDate)
    ),
    countExact(
      supabase
        .from('study_tasks')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'pending')
        .eq('due_date', deadlineReferenceDate)
    ),
    countExact(
      supabase
        .from('flashcards')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
    ),
    countExact(
      supabase
        .from('flashcards')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .or(`next_review_at.is.null,next_review_at.lte.${nowIso}`)
    ),
    countExact(
      supabase
        .from('focus_sessions')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .not('ended_at', 'is', null)
    ),
    countExact(
      supabase
        .from('study_tasks')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .not('trello_card_id', 'is', null)
    ),
    supabase
      .from('focus_sessions')
      .select('duration_minutes')
      .eq('user_id', userId)
      .not('ended_at', 'is', null),
    supabase
      .from('focus_sessions')
      .select('duration_minutes')
      .eq('user_id', userId)
      .not('ended_at', 'is', null)
      .gte('ended_at', last7DaysThresholdIso),
    supabase.from('courses').select('id, title').eq('user_id', userId),
    supabase.from('study_tasks').select('course_id, status').eq('user_id', userId),
    supabase.from('flashcards').select('course_id').eq('user_id', userId),
  ]);

  if (focusResult.error || last7DaysFocusResult.error) {
    throw new ApiError('DATABASE_ERROR', 'Failed to load dashboard stats', 500);
  }

  if (coursesResult.error || tasksResult.error || flashcardsResult.error) {
    throw new ApiError('DATABASE_ERROR', 'Failed to load dashboard stats', 500);
  }

  const totalFocusMinutes = sumCompletedFocusMinutes(focusResult.data ?? []);
  const last7DaysSessions = last7DaysFocusResult.data ?? [];
  const focusMinutesLast7Days = sumCompletedFocusMinutes(last7DaysSessions);
  const completedFocusSessionsLast7Days = last7DaysSessions.length;
  const courseStats = aggregateCourseStats(
    coursesResult.data ?? [],
    tasksResult.data ?? [],
    flashcardsResult.data ?? []
  );

  return {
    totalCourses,
    totalStudyMaterials,
    totalGeneratedPlans,
    totalTasks,
    pendingTasks,
    completedTasks,
    overduePendingTasks,
    dueTodayPendingTasks,
    deadlineReferenceDate,
    totalFlashcards,
    dueFlashcardsCount,
    totalFocusMinutes,
    completedFocusSessions,
    focusMinutesLast7Days,
    completedFocusSessionsLast7Days,
    trelloSyncedTasks,
    courseStats,
  };
}
