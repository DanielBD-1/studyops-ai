import { apiFetch } from './api.js';
import { ApiRequestError } from './courses.service.js';
import { getSupabaseBrowser } from '../lib/supabase.js';

export { ApiRequestError };

/** @type {typeof apiFetch | null} */
let apiFetchOverride = null;

/** @type {string | null} */
let accessTokenOverride = null;

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
 * @typedef {{ id: string, courseId: string, title: string, sourceType: string, createdAt: string, updatedAt: string }} MaterialSummary
 * @typedef {MaterialSummary & { content: string }} MaterialDetail
 * @typedef {{
 *   summary: string,
 *   keyTopics: string[],
 *   difficulty: 'easy' | 'medium' | 'hard',
 *   tasks: Array<{
 *     title: string,
 *     description: string,
 *     priority: string,
 *     estimatedMinutes: number,
 *     difficulty: string,
 *     tags: string[],
 *   }>,
 *   flashcards: Array<{
 *     question: string,
 *     answer: string,
 *     tags: string[],
 *   }>,
 * }} StudyPlan
 */

/**
 * @param {string} courseId
 */
export async function listMaterials(courseId) {
  const data = await request(`/api/courses/${courseId}/materials`, { method: 'GET' });
  return /** @type {{ materials: MaterialSummary[] }} */ (data);
}

/**
 * @param {string} courseId
 * @param {{ title: string, content: string, sourceType?: 'manual' | 'paste' }} body
 */
export async function createMaterial(courseId, body) {
  const data = await request(`/api/courses/${courseId}/materials`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return /** @type {{ material: MaterialDetail }} */ (data);
}

/**
 * @param {string} materialId
 */
export async function getMaterial(materialId) {
  const data = await request(`/api/study-materials/${materialId}`, { method: 'GET' });
  return /** @type {{ material: MaterialDetail }} */ (data);
}

/**
 * @param {string} materialId
 * @param {{ title?: string, content?: string, sourceType?: 'manual' | 'paste' }} body
 */
export async function updateMaterial(materialId, body) {
  const data = await request(`/api/study-materials/${materialId}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
  return /** @type {{ material: MaterialDetail }} */ (data);
}

/**
 * @param {string} materialId
 */
export async function deleteMaterial(materialId) {
  const data = await request(`/api/study-materials/${materialId}`, { method: 'DELETE' });
  return /** @type {{ deleted: boolean }} */ (data);
}

/**
 * @param {string} materialId
 */
export async function generateMaterial(materialId) {
  const data = await request(`/api/study-materials/${materialId}/generate`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
  return /** @type {{ materialId: string, courseId: string, plan: StudyPlan }} */ (data);
}
