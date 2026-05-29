import { getSupabaseAdmin } from '../../config/supabase.js';
import { ApiError } from '../../shared/errors/ApiError.js';
import { sumCompletedFocusMinutes } from '../dashboard/dashboard.service.js';

/**
 * @returns {string}
 */
function getStartOfUtcDayIso() {
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  return start.toISOString();
}

/**
 * @param {Promise<{ count: number | null, error: { message?: string } | null }>} query
 * @returns {Promise<number>}
 */
async function countExact(query) {
  const { count, error } = await query;

  if (error) {
    throw new ApiError('DATABASE_ERROR', 'Failed to load admin stats', 500);
  }

  return count ?? 0;
}

export async function getAdminStats() {
  const supabase = getSupabaseAdmin();
  const startOfUtcDayIso = getStartOfUtcDayIso();

  const [
    totalUsers,
    totalCourses,
    totalStudyMaterials,
    totalGeneratedPlans,
    totalTasks,
    pendingTasks,
    completedTasks,
    totalFlashcards,
    completedFocusSessions,
    trelloSyncedTasks,
    trelloSyncAttemptsToday,
    trelloSyncSucceededToday,
    trelloSyncFailedToday,
    trelloSyncSkippedToday,
    focusResult,
  ] = await Promise.all([
    countExact(supabase.from('profiles').select('id', { count: 'exact', head: true })),
    countExact(supabase.from('courses').select('id', { count: 'exact', head: true })),
    countExact(
      supabase.from('study_materials').select('id', { count: 'exact', head: true })
    ),
    countExact(
      supabase.from('material_generated_plans').select('id', { count: 'exact', head: true })
    ),
    countExact(supabase.from('study_tasks').select('id', { count: 'exact', head: true })),
    countExact(
      supabase
        .from('study_tasks')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending')
    ),
    countExact(
      supabase
        .from('study_tasks')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'completed')
    ),
    countExact(supabase.from('flashcards').select('id', { count: 'exact', head: true })),
    countExact(
      supabase
        .from('focus_sessions')
        .select('id', { count: 'exact', head: true })
        .not('ended_at', 'is', null)
    ),
    countExact(
      supabase
        .from('study_tasks')
        .select('id', { count: 'exact', head: true })
        .not('trello_card_id', 'is', null)
    ),
    countExact(
      supabase
        .from('trello_sync_logs')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', startOfUtcDayIso)
    ),
    countExact(
      supabase
        .from('trello_sync_logs')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', startOfUtcDayIso)
        .eq('status', 'success')
    ),
    countExact(
      supabase
        .from('trello_sync_logs')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', startOfUtcDayIso)
        .eq('status', 'failed')
    ),
    countExact(
      supabase
        .from('trello_sync_logs')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', startOfUtcDayIso)
        .eq('status', 'skipped')
    ),
    supabase.from('focus_sessions').select('duration_minutes').not('ended_at', 'is', null),
  ]);

  if (focusResult.error) {
    throw new ApiError('DATABASE_ERROR', 'Failed to load admin stats', 500);
  }

  const totalFocusMinutes = sumCompletedFocusMinutes(focusResult.data ?? []);

  return {
    totalUsers,
    totalCourses,
    totalStudyMaterials,
    totalGeneratedPlans,
    totalTasks,
    pendingTasks,
    completedTasks,
    totalFlashcards,
    totalFocusMinutes,
    completedFocusSessions,
    trelloSyncedTasks,
    trelloSyncAttemptsToday,
    trelloSyncSucceededToday,
    trelloSyncFailedToday,
    trelloSyncSkippedToday,
    systemHealth: {
      backend: 'ok',
    },
  };
}
