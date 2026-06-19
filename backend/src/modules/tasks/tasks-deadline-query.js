import {
  addCalendarDaysToIsoDate,
  getUtcTodayIsoCalendarDate,
} from '../../shared/validation/calendar-date.js';

/** @type {readonly ['overdue', 'due_today', 'next_7_days']} */
export const TASK_DEADLINE_FILTER_VALUES = ['overdue', 'due_today', 'next_7_days'];

export const TASK_DEADLINE_NEXT_7_DAYS_OFFSET = 7;

/**
 * @param {string} referenceDate YYYY-MM-DD
 * @returns {string}
 */
export function computeNext7DaysWindowEnd(referenceDate) {
  return addCalendarDaysToIsoDate(referenceDate, TASK_DEADLINE_NEXT_7_DAYS_OFFSET);
}

/**
 * @param {{ deadline?: 'overdue' | 'due_today' | 'next_7_days', referenceDate?: string }} query
 * @returns {string | undefined}
 */
export function resolveTaskListReferenceDate(query) {
  if (!query.deadline) {
    return undefined;
  }
  return query.referenceDate ?? getUtcTodayIsoCalendarDate();
}

/**
 * Apply deadline predicates. Always scopes to pending tasks.
 *
 * @template T
 * @param {T} builder
 * @param {'overdue' | 'due_today' | 'next_7_days'} deadline
 * @param {string} referenceDate YYYY-MM-DD
 * @returns {T}
 */
export function applyTaskDeadlineFilters(builder, deadline, referenceDate) {
  let next = /** @type {T & {
 *   eq: Function,
 *   not: Function,
 *   lt: Function,
 *   gt: Function,
 *   lte: Function,
 * }} */ (builder).eq('status', 'pending');

  if (deadline === 'overdue') {
    return /** @type {T} */ (
      next.not('due_date', 'is', null).lt('due_date', referenceDate)
    );
  }

  if (deadline === 'next_7_days') {
    const windowEnd = computeNext7DaysWindowEnd(referenceDate);
    return /** @type {T} */ (
      next.gt('due_date', referenceDate).lte('due_date', windowEnd)
    );
  }

  return /** @type {T} */ (next.eq('due_date', referenceDate));
}
