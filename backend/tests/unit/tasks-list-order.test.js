import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  usesDeadlineAwarePendingOrder,
  applyTaskListOrdering,
} from '../../src/modules/tasks/tasks-list-order.js';

function createOrderSpyBuilder() {
  /** @type {Array<{ column: string, options: { ascending?: boolean, nullsFirst?: boolean } }>} */
  const calls = [];

  const builder = {
    order(column, options = {}) {
      calls.push({ column, options });
      return builder;
    },
  };

  return { builder, calls };
}

describe('tasks-list-order', () => {
  it('status=pending selects Mode 1', () => {
    assert.equal(usesDeadlineAwarePendingOrder({ status: 'pending' }), true);
  });

  it('deadline=overdue with omitted status selects Mode 1', () => {
    assert.equal(usesDeadlineAwarePendingOrder({ deadline: 'overdue' }), true);
  });

  it('deadline=due_today with omitted status selects Mode 1', () => {
    assert.equal(usesDeadlineAwarePendingOrder({ deadline: 'due_today' }), true);
  });

  it('deadline=next_7_days with omitted status selects Mode 1', () => {
    assert.equal(usesDeadlineAwarePendingOrder({ deadline: 'next_7_days' }), true);
  });

  it('status=completed selects Mode 2', () => {
    assert.equal(usesDeadlineAwarePendingOrder({ status: 'completed' }), false);
  });

  it('omitted status and omitted deadline selects Mode 2', () => {
    assert.equal(usesDeadlineAwarePendingOrder({}), false);
  });

  it('Mode 1 applies due_date, created_at, and id order in sequence for pending', () => {
    const { builder, calls } = createOrderSpyBuilder();

    const result = applyTaskListOrdering(builder, { status: 'pending' });

    assert.equal(result, builder);
    assert.deepEqual(calls, [
      { column: 'due_date', options: { ascending: true, nullsFirst: false } },
      { column: 'created_at', options: { ascending: false } },
      { column: 'id', options: { ascending: true } },
    ]);
  });

  it('Mode 1 applies due_date, created_at, and id order in sequence for next_7_days', () => {
    const { builder, calls } = createOrderSpyBuilder();

    const result = applyTaskListOrdering(builder, { deadline: 'next_7_days' });

    assert.equal(result, builder);
    assert.deepEqual(calls, [
      { column: 'due_date', options: { ascending: true, nullsFirst: false } },
      { column: 'created_at', options: { ascending: false } },
      { column: 'id', options: { ascending: true } },
    ]);
  });

  it('Mode 2 applies created_at and id order in sequence', () => {
    const { builder, calls } = createOrderSpyBuilder();

    const result = applyTaskListOrdering(builder, { status: 'completed' });

    assert.equal(result, builder);
    assert.deepEqual(calls, [
      { column: 'created_at', options: { ascending: false } },
      { column: 'id', options: { ascending: true } },
    ]);
  });

  it('does not use priority, updated_at, or dynamic columns', () => {
    const { builder, calls } = createOrderSpyBuilder();

    applyTaskListOrdering(builder, { status: 'pending' });
    applyTaskListOrdering(builder, { status: 'completed' });

    const columns = calls.map((call) => call.column);
    assert.deepEqual(columns, [
      'due_date',
      'created_at',
      'id',
      'created_at',
      'id',
    ]);
    assert.equal(columns.includes('priority'), false);
    assert.equal(columns.includes('updated_at'), false);
  });
});
