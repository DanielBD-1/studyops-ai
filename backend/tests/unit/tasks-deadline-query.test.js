import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  TASK_DEADLINE_FILTER_VALUES,
  computeNext7DaysWindowEnd,
  resolveTaskListReferenceDate,
  applyTaskDeadlineFilters,
} from '../../src/modules/tasks/tasks-deadline-query.js';

describe('tasks-deadline-query', () => {
  it('includes next_7_days in filter values', () => {
    assert.deepEqual(TASK_DEADLINE_FILTER_VALUES, ['overdue', 'due_today', 'next_7_days']);
  });

  it('computes window end seven calendar days after reference date', () => {
    assert.equal(computeNext7DaysWindowEnd('2026-06-19'), '2026-06-26');
  });

  it('resolveTaskListReferenceDate uses explicit referenceDate when deadline is set', () => {
    assert.equal(
      resolveTaskListReferenceDate({ deadline: 'next_7_days', referenceDate: '2026-06-19' }),
      '2026-06-19'
    );
  });

  it('resolveTaskListReferenceDate falls back to UTC today when referenceDate omitted', () => {
    const resolved = resolveTaskListReferenceDate({ deadline: 'next_7_days' });
    assert.match(resolved ?? '', /^\d{4}-\d{2}-\d{2}$/);
  });

  it('applyTaskDeadlineFilters applies gt/lte window for next_7_days', () => {
    /** @type {Array<[string, string, unknown]>} */
    const calls = [];

    const builder = {
      eq(column, value) {
        calls.push(['eq', column, value]);
        return builder;
      },
      gt(column, value) {
        calls.push(['gt', column, value]);
        return builder;
      },
      lte(column, value) {
        calls.push(['lte', column, value]);
        return builder;
      },
      not() {
        return builder;
      },
      lt() {
        return builder;
      },
    };

    applyTaskDeadlineFilters(builder, 'next_7_days', '2026-06-19');

    assert.deepEqual(calls, [
      ['eq', 'status', 'pending'],
      ['gt', 'due_date', '2026-06-19'],
      ['lte', 'due_date', '2026-06-26'],
    ]);
  });

  it('applyTaskDeadlineFilters enforces pending status for overdue', () => {
    /** @type {Array<[string, string, unknown]>} */
    const calls = [];

    const builder = {
      eq(column, value) {
        calls.push(['eq', column, value]);
        return builder;
      },
      not(column, operator, value) {
        calls.push(['not', column, operator, value]);
        return builder;
      },
      lt(column, value) {
        calls.push(['lt', column, value]);
        return builder;
      },
    };

    applyTaskDeadlineFilters(builder, 'overdue', '2026-06-19');
    assert.equal(calls[0][1], 'status');
    assert.equal(calls[0][2], 'pending');
  });
});
