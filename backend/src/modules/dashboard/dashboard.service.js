import { getSupabaseAdmin } from '../../config/supabase.js';
import { ApiError } from '../../shared/errors/ApiError.js';
import { computeNext7DaysWindowEnd } from '../tasks/tasks-deadline-query.js';

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

const MATERIAL_TITLE_LOCALE_COMPARE = { sensitivity: 'base' };

/**
 * @param {{ material_id: string, course_id: string }[]} pendingLinkedTaskRows
 * @param {{ id: string, title: string, course_id: string }[]} ownedMaterialRows
 * @returns {{
 *   materialsWithPendingTasks: number,
 *   topMaterialsByPendingTasks: Array<{
 *     materialId: string,
 *     courseId: string,
 *     materialTitle: string,
 *     pendingTasks: number,
 *   }>,
 * }}
 */
export function aggregateMaterialPendingTasks(pendingLinkedTaskRows, ownedMaterialRows) {
  /** @type {Map<string, { title: string, course_id: string }>} */
  const ownedMaterialById = new Map();

  for (const material of ownedMaterialRows) {
    ownedMaterialById.set(material.id, {
      title: material.title,
      course_id: material.course_id,
    });
  }

  /** @type {Map<string, { materialId: string, courseId: string, materialTitle: string, pendingTasks: number }>} */
  const pendingByMaterialId = new Map();

  for (const task of pendingLinkedTaskRows) {
    const ownedMaterial = ownedMaterialById.get(task.material_id);
    if (!ownedMaterial) {
      continue;
    }

    if (ownedMaterial.course_id !== task.course_id) {
      continue;
    }

    const existing = pendingByMaterialId.get(task.material_id);
    if (existing) {
      existing.pendingTasks += 1;
      continue;
    }

    pendingByMaterialId.set(task.material_id, {
      materialId: task.material_id,
      courseId: ownedMaterial.course_id,
      materialTitle: ownedMaterial.title,
      pendingTasks: 1,
    });
  }

  const materialsWithPendingTasks = pendingByMaterialId.size;
  const topMaterialsByPendingTasks = Array.from(pendingByMaterialId.values())
    .sort((a, b) => {
      if (b.pendingTasks !== a.pendingTasks) {
        return b.pendingTasks - a.pendingTasks;
      }

      const titleCompare = a.materialTitle.localeCompare(
        b.materialTitle,
        undefined,
        MATERIAL_TITLE_LOCALE_COMPARE
      );
      if (titleCompare !== 0) {
        return titleCompare;
      }

      return a.materialId.localeCompare(b.materialId, undefined, MATERIAL_TITLE_LOCALE_COMPARE);
    })
    .slice(0, 5);

  return {
    materialsWithPendingTasks,
    topMaterialsByPendingTasks,
  };
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
  const dueNext7DaysWindowEnd = computeNext7DaysWindowEnd(deadlineReferenceDate);

  const [
    totalCourses,
    totalStudyMaterials,
    totalGeneratedPlans,
    totalTasks,
    pendingTasks,
    completedTasks,
    overduePendingTasks,
    dueTodayPendingTasks,
    dueNext7DaysPendingTasks,
    totalFlashcards,
    dueFlashcardsCount,
    completedFocusSessions,
    trelloSyncedTasks,
    focusResult,
    last7DaysFocusResult,
    coursesResult,
    tasksResult,
    flashcardsResult,
    pendingLinkedTasksResult,
    ownedMaterialsResult,
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
        .from('study_tasks')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'pending')
        .gt('due_date', deadlineReferenceDate)
        .lte('due_date', dueNext7DaysWindowEnd)
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
    supabase
      .from('study_tasks')
      .select('material_id, course_id')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .not('material_id', 'is', null),
    supabase
      .from('study_materials')
      .select('id, title, course_id, courses!inner(user_id)')
      .eq('courses.user_id', userId),
  ]);

  if (focusResult.error || last7DaysFocusResult.error) {
    throw new ApiError('DATABASE_ERROR', 'Failed to load dashboard stats', 500);
  }

  if (coursesResult.error || tasksResult.error || flashcardsResult.error) {
    throw new ApiError('DATABASE_ERROR', 'Failed to load dashboard stats', 500);
  }

  if (pendingLinkedTasksResult.error || ownedMaterialsResult.error) {
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
  const { materialsWithPendingTasks, topMaterialsByPendingTasks } = aggregateMaterialPendingTasks(
    pendingLinkedTasksResult.data ?? [],
    ownedMaterialsResult.data ?? []
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
    dueNext7DaysPendingTasks,
    deadlineReferenceDate,
    totalFlashcards,
    dueFlashcardsCount,
    totalFocusMinutes,
    completedFocusSessions,
    focusMinutesLast7Days,
    completedFocusSessionsLast7Days,
    trelloSyncedTasks,
    courseStats,
    materialsWithPendingTasks,
    topMaterialsByPendingTasks,
  };
}
