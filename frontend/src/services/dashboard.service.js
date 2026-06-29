import { apiFetch } from './api.js';
import { ApiRequestError } from './courses.service.js';
import { getSupabaseBrowser } from '../lib/supabase.js';
import { getLocalTodayIsoCalendarDate } from '../utils/task-due-date.js';

export { ApiRequestError };

/** @type {typeof apiFetch | null} */
let apiFetchOverride = null;

/** @type {string | null} */
let accessTokenOverride = null;

/** @type {(() => string) | null} */
let referenceDateForTestsOverride = null;

/**
 * @param {typeof apiFetch | null} fn
 */
export function __setApiFetchForTests(fn) {
  apiFetchOverride = fn;
}

/**
 * @param {string | null} token
 */
export function __setAccessTokenForTests(token) {
  accessTokenOverride = token;
}

/**
 * @param {(() => string) | null} fn
 */
export function __setReferenceDateForTests(fn) {
  referenceDateForTestsOverride = fn;
}

/**
 * @returns {Promise<string>}
 */
async function getAccessToken() {
  if (accessTokenOverride) {
    return accessTokenOverride;
  }

  const { data: { session } } = await getSupabaseBrowser().auth.getSession();
  if (!session?.access_token) {
    throw new ApiRequestError('AUTH_REQUIRED', 'Authentication required');
  }
  return session.access_token;
}

/**
 * @param {import('./api.js').ApiSuccess<unknown> | import('./api.js').ApiFailure} result
 */
function assertSuccess(result) {
  if (!result.success) {
    throw new ApiRequestError(result.error.code, result.error.message);
  }
  return result.data;
}

/**
 * @param {string} path
 * @param {RequestInit} [init]
 */
async function request(path, init = {}) {
  const token = await getAccessToken();
  const fetcher = apiFetchOverride ?? apiFetch;
  const result = await fetcher(path, init, token);
  return assertSuccess(result);
}

/**
 * @typedef {{
 *   courseId: string,
 *   courseName: string,
 *   totalTasks: number,
 *   completedTasks: number,
 *   totalFlashcards: number,
 * }} DashboardCourseStat
 */

/**
 * @typedef {{
 *   materialId: string,
 *   courseId: string,
 *   materialTitle: string,
 *   pendingTasks: number,
 * }} DashboardMaterialPendingStat
 */

/**
 * @typedef {{
 *   totalCourses: number,
 *   totalStudyMaterials: number,
 *   totalGeneratedPlans: number,
 *   totalTasks: number,
 *   pendingTasks: number,
 *   completedTasks: number,
 *   overduePendingTasks: number,
 *   dueTodayPendingTasks: number,
 *   dueNext7DaysPendingTasks: number,
 *   deadlineReferenceDate: string,
 *   totalFlashcards: number,
 *   dueFlashcardsCount: number,
 *   totalFocusMinutes: number,
 *   completedFocusSessions: number,
 *   focusMinutesLast7Days: number,
 *   completedFocusSessionsLast7Days: number,
 *   trelloSyncedTasks: number,
 *   courseStats: DashboardCourseStat[],
 *   materialsWithPendingTasks: number,
 *   topMaterialsByPendingTasks: DashboardMaterialPendingStat[],
 * }} DashboardStats
 */

/**
 * @param {unknown} value
 * @returns {number}
 */
function normalizeMaterialsWithPendingTasks(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0;
  }
  return parsed;
}

/**
 * @param {unknown} value
 * @returns {DashboardMaterialPendingStat[]}
 */
function normalizeTopMaterialsByPendingTasks(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  /** @type {DashboardMaterialPendingStat[]} */
  const normalized = [];

  for (const entry of value) {
    if (!entry || typeof entry !== 'object') {
      continue;
    }

    const record = /** @type {Record<string, unknown>} */ (entry);
    const materialId = typeof record.materialId === 'string' ? record.materialId.trim() : '';
    const courseId = typeof record.courseId === 'string' ? record.courseId.trim() : '';
    const materialTitle =
      typeof record.materialTitle === 'string' ? record.materialTitle.trim() : '';
    const pendingTasks = Number(record.pendingTasks);

    if (!materialId || !courseId || !materialTitle) {
      continue;
    }

    if (!Number.isFinite(pendingTasks) || pendingTasks < 1) {
      continue;
    }

    normalized.push({
      materialId,
      courseId,
      materialTitle,
      pendingTasks,
    });
  }

  return normalized;
}

/**
 * @param {Record<string, unknown>} data
 * @returns {DashboardStats}
 */
export function normalizeDashboardStats(data) {
  return {
    .../** @type {DashboardStats} */ (data),
    materialsWithPendingTasks: normalizeMaterialsWithPendingTasks(data.materialsWithPendingTasks),
    topMaterialsByPendingTasks: normalizeTopMaterialsByPendingTasks(
      data.topMaterialsByPendingTasks
    ),
  };
}

/**
 * @returns {Promise<DashboardStats>}
 */
export async function getDashboardStats() {
  const referenceDate = referenceDateForTestsOverride
    ? referenceDateForTestsOverride()
    : getLocalTodayIsoCalendarDate();
  const params = new URLSearchParams({ referenceDate });
  const data = await request(`/api/dashboard/stats?${params.toString()}`, { method: 'GET' });
  return normalizeDashboardStats(/** @type {Record<string, unknown>} */ (data));
}
