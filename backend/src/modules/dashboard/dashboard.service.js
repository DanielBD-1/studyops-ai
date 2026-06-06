import { getSupabaseAdmin } from '../../config/supabase.js';
import { ApiError } from '../../shared/errors/ApiError.js';

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
 */
export async function getDashboardStats(userId) {
  const supabase = getSupabaseAdmin();
  const nowIso = new Date().toISOString();

  const [
    totalCourses,
    totalStudyMaterials,
    totalGeneratedPlans,
    totalTasks,
    pendingTasks,
    completedTasks,
    totalFlashcards,
    dueFlashcardsCount,
    completedFocusSessions,
    trelloSyncedTasks,
    focusResult,
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
    supabase.from('courses').select('id, title').eq('user_id', userId),
    supabase.from('study_tasks').select('course_id, status').eq('user_id', userId),
    supabase.from('flashcards').select('course_id').eq('user_id', userId),
  ]);

  if (focusResult.error) {
    throw new ApiError('DATABASE_ERROR', 'Failed to load dashboard stats', 500);
  }

  if (coursesResult.error || tasksResult.error || flashcardsResult.error) {
    throw new ApiError('DATABASE_ERROR', 'Failed to load dashboard stats', 500);
  }

  const totalFocusMinutes = sumCompletedFocusMinutes(focusResult.data ?? []);
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
    totalFlashcards,
    dueFlashcardsCount,
    totalFocusMinutes,
    completedFocusSessions,
    trelloSyncedTasks,
    courseStats,
  };
}
