/** @typedef {'amber' | 'rose' | 'emerald'} CourseAccentKey */

/** @type {readonly CourseAccentKey[]} */
export const COURSE_ACCENT_KEYS = ['amber', 'rose', 'emerald'];

/** @type {CourseAccentKey} */
export const DEFAULT_COURSE_ACCENT_KEY = 'amber';

/**
 * Stable 32-bit hash for accent selection (djb2).
 * @param {string} value
 * @returns {number}
 */
export function stableHash(value) {
  let hash = 5381;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 33) ^ value.charCodeAt(i);
  }
  return hash >>> 0;
}

/**
 * @param {string | null | undefined} value
 * @returns {string}
 */
function normalizeSeed(value) {
  if (value == null) {
    return '';
  }
  return String(value).trim();
}

/**
 * Deterministic course accent key from existing course identity fields.
 * Prefers courseId, then courseName, then courseTitle.
 *
 * @param {{ courseId?: string | null, courseName?: string | null, courseTitle?: string | null }} params
 * @returns {CourseAccentKey}
 */
export function getCourseAccentKey({ courseId, courseName, courseTitle } = {}) {
  const seed =
    normalizeSeed(courseId) || normalizeSeed(courseName) || normalizeSeed(courseTitle);

  if (!seed) {
    return DEFAULT_COURSE_ACCENT_KEY;
  }

  const index = stableHash(seed) % COURSE_ACCENT_KEYS.length;
  return COURSE_ACCENT_KEYS[index];
}
