import { materialIdSchema } from './validation.js';

const uuidParamSchema = materialIdSchema;

/** @type {readonly ['due_now', 'needs_review', 'new', 'learning', 'known']} */
const FLASHCARD_REVIEW_STATE_QUERY_VALUES = [
  'due_now',
  'needs_review',
  'new',
  'learning',
  'known',
];

/**
 * @param {string | null} value
 * @returns {string | undefined}
 */
function parseUuidQueryParam(value) {
  if (value == null || value.trim() === '') {
    return undefined;
  }

  const parsed = uuidParamSchema.safeParse(value.trim());
  return parsed.success ? parsed.data : undefined;
}

/**
 * @param {string | null} value
 * @returns {'due_now' | 'needs_review' | 'new' | 'learning' | 'known' | undefined}
 */
function parseReviewStateQueryParam(value) {
  if (value == null || value.trim() === '') {
    return undefined;
  }

  const trimmed = value.trim();
  return FLASHCARD_REVIEW_STATE_QUERY_VALUES.includes(trimmed) ? trimmed : undefined;
}

/**
 * @param {string} searchString
 * @returns {{
 *   courseId?: string,
 *   materialId?: string,
 *   reviewState?: 'due_now' | 'needs_review' | 'new' | 'learning' | 'known',
 * }}
 */
export function parseFlashcardsPageSearchParams(searchString) {
  const normalized = searchString.startsWith('?') ? searchString.slice(1) : searchString;
  const params = new URLSearchParams(normalized);

  /** @type {{
   *   courseId?: string,
   *   materialId?: string,
   *   reviewState?: 'due_now' | 'needs_review' | 'new' | 'learning' | 'known',
   * }} */
  const result = {};

  const courseId = parseUuidQueryParam(params.get('courseId'));
  if (courseId) {
    result.courseId = courseId;
  }

  const materialId = parseUuidQueryParam(params.get('materialId'));
  if (materialId) {
    result.materialId = materialId;
  }

  const reviewState = parseReviewStateQueryParam(params.get('reviewState'));
  if (reviewState) {
    result.reviewState = reviewState;
  }

  return result;
}

/**
 * Build canonical /flashcards query string from filter state. Omits default/all values.
 *
 * @param {{
 *   courseFilter?: 'all' | string,
 *   materialFilter?: 'all' | string,
 *   reviewFilter?: 'all' | 'due_now' | 'needs_review' | 'new' | 'learning' | 'known',
 * }} filters
 * @returns {string} Query string without leading "?" (empty when all defaults).
 */
export function buildFlashcardsPageSearchParams({
  courseFilter = 'all',
  materialFilter = 'all',
  reviewFilter = 'all',
} = {}) {
  const params = new URLSearchParams();
  const courseId = courseFilter !== 'all' ? courseFilter : undefined;
  const materialId = materialFilter !== 'all' ? materialFilter : undefined;
  const reviewState =
    reviewFilter === 'due_now' ||
    reviewFilter === 'needs_review' ||
    reviewFilter === 'new' ||
    reviewFilter === 'learning' ||
    reviewFilter === 'known'
      ? reviewFilter
      : undefined;

  if (courseId) {
    params.set('courseId', courseId);
  }

  if (courseId && materialId) {
    params.set('materialId', materialId);
  }

  if (reviewState) {
    params.set('reviewState', reviewState);
  }

  return params.toString();
}

/**
 * Resolve /flashcards filter state from URL query params and loaded ownership lists.
 *
 * @param {{
 *   courseId?: string,
 *   materialId?: string,
 *   reviewState?: 'due_now' | 'needs_review' | 'new' | 'learning' | 'known',
 *   courses: { id: string }[],
 *   materials: { id: string }[],
 * }} input
 * @returns {{
 *   courseFilter: 'all' | string,
 *   materialFilter: 'all' | string,
 *   reviewFilter: 'all' | 'due_now' | 'needs_review' | 'new' | 'learning' | 'known',
 * }}
 */
export function resolveInitialFlashcardFilters({
  courseId,
  materialId,
  reviewState,
  courses,
  materials,
}) {
  const reviewFilter =
    reviewState === 'due_now' ||
    reviewState === 'needs_review' ||
    reviewState === 'new' ||
    reviewState === 'learning' ||
    reviewState === 'known'
      ? reviewState
      : 'all';

  if (!courseId || !courses.some((course) => course.id === courseId)) {
    return { courseFilter: 'all', materialFilter: 'all', reviewFilter };
  }

  if (!materialId || !materials.some((material) => material.id === materialId)) {
    return { courseFilter: courseId, materialFilter: 'all', reviewFilter };
  }

  return { courseFilter: courseId, materialFilter: materialId, reviewFilter };
}

/**
 * Dashboard deep link into /flashcards with Due now review filter selected.
 *
 * @returns {string}
 */
export function buildFlashcardsPageDueNowLink() {
  return '/flashcards?reviewState=due_now';
}
