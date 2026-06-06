/** Maximum whole-day interval after repeated known reviews. */
export const MAX_INTERVAL_DAYS = 90;

const FIRST_KNOWN_INTERVAL_DAYS = 1;
const UNKNOWN_RESET_INTERVAL_DAYS = 1;

/**
 * @param {Date} date
 * @param {number} days
 * @returns {string} ISO 8601 timestamp
 */
function addDaysUtc(date, days) {
  const result = new Date(date.getTime());
  result.setUTCDate(result.getUTCDate() + days);
  return result.toISOString();
}

/**
 * Compute SRS-lite scheduling fields from existing card state and review outcome.
 * Whole-day intervals only; scheduling is server-side on POST /review.
 *
 * @param {{
 *   mastery: 'new' | 'learning' | 'known',
 *   reviewIntervalDays: number,
 * }} existing
 * @param {'known' | 'unknown'} outcome
 * @param {Date} now
 * @returns {{
 *   mastery: 'learning' | 'known',
 *   reviewIntervalDays: number,
 *   nextReviewAt: string,
 * }}
 */
export function computeNextReviewState(existing, outcome, now) {
  if (outcome === 'unknown') {
    return {
      mastery: 'learning',
      reviewIntervalDays: 0,
      nextReviewAt: addDaysUtc(now, UNKNOWN_RESET_INTERVAL_DAYS),
    };
  }

  if (existing.mastery === 'new' || existing.mastery === 'learning') {
    return {
      mastery: 'known',
      reviewIntervalDays: FIRST_KNOWN_INTERVAL_DAYS,
      nextReviewAt: addDaysUtc(now, FIRST_KNOWN_INTERVAL_DAYS),
    };
  }

  if (existing.reviewIntervalDays < 1) {
    return {
      mastery: 'known',
      reviewIntervalDays: FIRST_KNOWN_INTERVAL_DAYS,
      nextReviewAt: addDaysUtc(now, FIRST_KNOWN_INTERVAL_DAYS),
    };
  }

  const newInterval = Math.min(existing.reviewIntervalDays * 2, MAX_INTERVAL_DAYS);
  return {
    mastery: 'known',
    reviewIntervalDays: newInterval,
    nextReviewAt: addDaysUtc(now, newInterval),
  };
}
