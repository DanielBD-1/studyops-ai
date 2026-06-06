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
 * @typedef {{
 *   id: string,
 *   courseId: string,
 *   materialId: string | null,
 *   question: string,
 *   answer: string,
 *   tags: string[],
 *   source: string,
 *   mastery: 'new' | 'learning' | 'known',
 *   lastReviewedAt: string | null,
 *   reviewCount: number,
 *   knownCount: number,
 *   unknownCount: number,
 *   nextReviewAt: string | null,
 *   reviewIntervalDays: number,
 *   createdAt: string,
 *   updatedAt: string,
 * }} Flashcard
 */

/**
 * @param {{ courseId?: string, materialId?: string }} [filters]
 */
export async function listFlashcards(filters = {}) {
  const params = new URLSearchParams();
  if (filters.courseId) {
    params.set('courseId', filters.courseId);
  }
  if (filters.materialId) {
    params.set('materialId', filters.materialId);
  }
  const query = params.toString();
  const path = query ? `/api/flashcards?${query}` : '/api/flashcards';
  const data = await request(path, { method: 'GET' });
  return /** @type {{ flashcards: Flashcard[] }} */ (data);
}

/**
 * @param {string} courseId
 * @param {{
 *   question: string,
 *   answer: string,
 *   tags?: string[],
 *   materialId?: string | null,
 * }} body
 */
export async function createCourseFlashcard(courseId, body) {
  const data = await request(`/api/courses/${courseId}/flashcards`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return /** @type {{ flashcard: Flashcard }} */ (data);
}

/**
 * @param {string} flashcardId
 * @param {{
 *   question?: string,
 *   answer?: string,
 *   tags?: string[],
 *   materialId?: string | null,
 * }} body
 */
export async function updateFlashcard(flashcardId, body) {
  const data = await request(`/api/flashcards/${flashcardId}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
  return /** @type {{ flashcard: Flashcard }} */ (data);
}

/**
 * @param {string} flashcardId
 */
export async function deleteFlashcard(flashcardId) {
  const data = await request(`/api/flashcards/${flashcardId}`, { method: 'DELETE' });
  return /** @type {{ deleted: boolean }} */ (data);
}

/**
 * @param {string} flashcardId
 * @param {{ outcome: 'known' | 'unknown' }} body
 */
export async function reviewFlashcard(flashcardId, body) {
  const data = await request(`/api/flashcards/${flashcardId}/review`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return /** @type {{ flashcard: Flashcard }} */ (data);
}
