import { getUtcTodayIsoCalendarDate } from '../../shared/validation/calendar-date.js';

/** @type {readonly ['overdue', 'due_today']} */
export const TASK_DEADLINE_FILTER_VALUES = ['overdue', 'due_today'];

/**
 * @param {{ deadline?: 'overdue' | 'due_today', referenceDate?: string }} query
 * @returns {string | undefined}
 */
export function resolveTaskListReferenceDate(query) {
  if (!query.deadline) {
    return undefined;
  }
  return query.referenceDate ?? getUtcTodayIsoCalendarDate();
}

/**
 * Apply overdue/due-today predicates. Always scopes to pending tasks.
 *
 * @template T
 * @param {T} builder
 * @param {'overdue' | 'due_today'} deadline
 * @param {string} referenceDate YYYY-MM-DD
 * @returns {T}
 */
export function applyTaskDeadlineFilters(builder, deadline, referenceDate) {
  let next = /** @type {T & { eq: Function, not: Function, lt: Function }} */ (builder)
    .eq('status', 'pending');

  if (deadline === 'overdue') {
    return /** @type {T} */ (
      next.not('due_date', 'is', null).lt('due_date', referenceDate)
    );
  }

  return /** @type {T} */ (next.eq('due_date', referenceDate));
}
