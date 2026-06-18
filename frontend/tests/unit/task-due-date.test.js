import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  compareIsoCalendarDates,
  getLocalTodayIsoCalendarDate,
  getTaskDueDatePresentation,
  isValidIsoCalendarDate,
  parseIsoCalendarDateComponents,
} from '../../src/utils/task-due-date.js';

describe('task-due-date utilities', () => {
  it('compares strict ISO calendar dates lexicographically', () => {
    assert.equal(compareIsoCalendarDates('2026-06-10', '2026-06-24'), -1);
    assert.equal(compareIsoCalendarDates('2026-06-24', '2026-06-24'), 0);
    assert.equal(compareIsoCalendarDates('2026-06-25', '2026-06-24'), 1);
  });

  it('builds local today as YYYY-MM-DD from numeric components', () => {
    const today = getLocalTodayIsoCalendarDate();
    assert.match(today, /^\d{4}-\d{2}-\d{2}$/);
    const parts = parseIsoCalendarDateComponents(today);
    assert.ok(parts);
    const reconstructed = new Date(parts.year, parts.month - 1, parts.day);
    const now = new Date();
    assert.equal(reconstructed.getFullYear(), now.getFullYear());
    assert.equal(reconstructed.getMonth(), now.getMonth());
    assert.equal(reconstructed.getDate(), now.getDate());
  });

  it('returns null presentation when no due date', () => {
    assert.equal(getTaskDueDatePresentation({ status: 'pending', dueDate: null }), null);
    assert.equal(getTaskDueDatePresentation({ status: 'pending' }), null);
  });

  it('labels future pending tasks', () => {
    const presentation = getTaskDueDatePresentation(
      { status: 'pending', dueDate: '2099-12-31' },
      '2026-06-17'
    );
    assert.ok(presentation);
    assert.equal(presentation.variant, 'future');
    assert.match(presentation.label, /^Due /);
    assert.equal(presentation.dateTime, '2099-12-31');
  });

  it('labels due today for pending tasks', () => {
    const presentation = getTaskDueDatePresentation(
      { status: 'pending', dueDate: '2026-06-17' },
      '2026-06-17'
    );
    assert.ok(presentation);
    assert.equal(presentation.label, 'Due today');
    assert.equal(presentation.variant, 'today');
  });

  it('labels overdue pending tasks with text prefix', () => {
    const presentation = getTaskDueDatePresentation(
      { status: 'pending', dueDate: '2026-06-10' },
      '2026-06-17'
    );
    assert.ok(presentation);
    assert.equal(presentation.variant, 'overdue');
    assert.match(presentation.label, /^Overdue · Due /);
  });

  it('uses neutral completed presentation without overdue wording', () => {
    const presentation = getTaskDueDatePresentation(
      { status: 'completed', dueDate: '2020-01-01' },
      '2026-06-17'
    );
    assert.ok(presentation);
    assert.equal(presentation.variant, 'completed');
    assert.doesNotMatch(presentation.label, /Overdue/i);
    assert.match(presentation.label, /^Due /);
  });

  it('includes year when due date year differs from today', () => {
    const presentation = getTaskDueDatePresentation(
      { status: 'pending', dueDate: '2027-06-24' },
      '2026-06-17'
    );
    assert.ok(presentation);
    assert.match(presentation.label, /2027/);
  });

  it('handles years 0001–0099 without one-day UTC shift', () => {
    assert.equal(isValidIsoCalendarDate('0042-06-15'), true);
    const presentation = getTaskDueDatePresentation(
      { status: 'pending', dueDate: '0042-06-15' },
      '2026-06-17'
    );
    assert.ok(presentation);
    assert.equal(presentation.dateTime, '0042-06-15');
    assert.match(presentation.label, /Jun 15/);
  });

  it('applies century-year leap rules for Feb 29', () => {
    assert.equal(isValidIsoCalendarDate('1900-02-29'), false);
    assert.equal(isValidIsoCalendarDate('2000-02-29'), true);
    assert.equal(isValidIsoCalendarDate('2100-02-29'), false);
  });

  it('does not parse YYYY-MM-DD via implicit UTC Date constructor', () => {
    const iso = '2026-06-24';
    const parts = parseIsoCalendarDateComponents(iso);
    assert.ok(parts);
    const local = new Date(parts.year, parts.month - 1, parts.day);
    assert.equal(local.getMonth(), 5);
    assert.equal(local.getDate(), 24);
    const presentation = getTaskDueDatePresentation(
      { status: 'pending', dueDate: iso },
      '2026-06-17'
    );
    assert.ok(presentation);
    assert.match(presentation.label, /Jun 24/);
    assert.doesNotMatch(presentation.label, /Jun 23/);
  });
});
