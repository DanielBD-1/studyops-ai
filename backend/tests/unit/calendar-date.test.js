import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  isValidIsoCalendarDate,
  parseIsoCalendarDateComponents,
} from '../../src/shared/validation/calendar-date.js';

describe('calendar-date validation', () => {
  it('accepts valid YYYY-MM-DD dates', () => {
    assert.equal(isValidIsoCalendarDate('2026-06-24'), true);
    assert.equal(isValidIsoCalendarDate('2024-02-29'), true);
    assert.equal(isValidIsoCalendarDate('0001-01-01'), true);
    assert.equal(isValidIsoCalendarDate('0099-12-31'), true);
    assert.equal(isValidIsoCalendarDate('9999-12-31'), true);
  });

  it('accepts past dates', () => {
    assert.equal(isValidIsoCalendarDate('1999-01-01'), true);
  });

  it('rejects empty string', () => {
    assert.equal(isValidIsoCalendarDate(''), false);
  });

  it('rejects invalid format and separators', () => {
    assert.equal(isValidIsoCalendarDate('2026/06/24'), false);
    assert.equal(isValidIsoCalendarDate('24-06-2026'), false);
    assert.equal(isValidIsoCalendarDate('2026-6-24'), false);
    assert.equal(isValidIsoCalendarDate('20260624'), false);
  });

  it('rejects timestamps', () => {
    assert.equal(isValidIsoCalendarDate('2026-06-24T00:00:00.000Z'), false);
  });

  it('rejects impossible dates', () => {
    assert.equal(isValidIsoCalendarDate('2026-02-30'), false);
    assert.equal(isValidIsoCalendarDate('2023-02-29'), false);
    assert.equal(isValidIsoCalendarDate('2026-13-01'), false);
    assert.equal(isValidIsoCalendarDate('2026-00-10'), false);
  });

  it('applies century-year leap rules for Feb 29', () => {
    assert.equal(isValidIsoCalendarDate('1900-02-29'), false);
    assert.equal(isValidIsoCalendarDate('2000-02-29'), true);
    assert.equal(isValidIsoCalendarDate('2100-02-29'), false);
  });

  it('rejects non-string values via parse helper', () => {
    assert.equal(parseIsoCalendarDateComponents(null), null);
    assert.equal(parseIsoCalendarDateComponents(20260624), null);
    assert.equal(isValidIsoCalendarDate(/** @type {unknown} */ (123)), false);
  });

  it('rejects year 0000', () => {
    assert.equal(isValidIsoCalendarDate('0000-01-01'), false);
  });

  it('rejects years outside 0001 through 9999', () => {
    assert.equal(isValidIsoCalendarDate('10000-01-01'), false);
  });

  it('parses years 0001–0099 without relying on implicit UTC Date parsing', () => {
    const parts = parseIsoCalendarDateComponents('0042-03-05');
    assert.deepEqual(parts, { year: 42, month: 3, day: 5 });
    assert.equal(isValidIsoCalendarDate('0042-03-05'), true);
  });
});
