import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  formatFocusMinutes,
  formatTaskCompletionPercent,
} from '../../src/utils/dashboard-format.js';

describe('dashboard-format', () => {
  describe('formatFocusMinutes', () => {
    it('formats zero and one minute', () => {
      assert.equal(formatFocusMinutes(0), '0 min');
      assert.equal(formatFocusMinutes(1), '1 min');
    });

    it('formats minutes under one hour', () => {
      assert.equal(formatFocusMinutes(90), '1h 30m');
      assert.equal(formatFocusMinutes(45), '45 min');
    });

    it('formats whole hours without remainder', () => {
      assert.equal(formatFocusMinutes(120), '2h');
    });
  });

  describe('formatTaskCompletionPercent', () => {
    it('returns null when totalTasks is zero', () => {
      assert.equal(formatTaskCompletionPercent(0, 0), null);
    });

    it('returns rounded percentage when totalTasks is positive', () => {
      assert.equal(formatTaskCompletionPercent(3, 10), 30);
      assert.equal(formatTaskCompletionPercent(1, 3), 33);
    });
  });
});
