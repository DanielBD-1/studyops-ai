import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  computeNextReviewState,
  MAX_INTERVAL_DAYS,
} from '../../src/modules/flashcards/flashcard-scheduling.js';

const FIXED_NOW = new Date('2026-06-07T12:00:00.000Z');

/**
 * @param {string} iso
 * @param {number} days
 */
function expectedAfterDays(iso, days) {
  const date = new Date(iso);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
}

describe('flashcard-scheduling', () => {
  it('new + known sets interval 1 and nextReviewAt now + 1 day', () => {
    const result = computeNextReviewState(
      { mastery: 'new', reviewIntervalDays: 0 },
      'known',
      FIXED_NOW,
    );
    assert.equal(result.mastery, 'known');
    assert.equal(result.reviewIntervalDays, 1);
    assert.equal(result.nextReviewAt, expectedAfterDays(FIXED_NOW.toISOString(), 1));
  });

  it('learning + known sets interval 1 and nextReviewAt now + 1 day', () => {
    const result = computeNextReviewState(
      { mastery: 'learning', reviewIntervalDays: 0 },
      'known',
      FIXED_NOW,
    );
    assert.equal(result.mastery, 'known');
    assert.equal(result.reviewIntervalDays, 1);
    assert.equal(result.nextReviewAt, expectedAfterDays(FIXED_NOW.toISOString(), 1));
  });

  it('known interval 1 + known doubles interval to 2', () => {
    const result = computeNextReviewState(
      { mastery: 'known', reviewIntervalDays: 1 },
      'known',
      FIXED_NOW,
    );
    assert.equal(result.mastery, 'known');
    assert.equal(result.reviewIntervalDays, 2);
    assert.equal(result.nextReviewAt, expectedAfterDays(FIXED_NOW.toISOString(), 2));
  });

  it('known interval 4 + known doubles interval to 8', () => {
    const result = computeNextReviewState(
      { mastery: 'known', reviewIntervalDays: 4 },
      'known',
      FIXED_NOW,
    );
    assert.equal(result.mastery, 'known');
    assert.equal(result.reviewIntervalDays, 8);
    assert.equal(result.nextReviewAt, expectedAfterDays(FIXED_NOW.toISOString(), 8));
  });

  it('known interval 64 + known caps interval at 90', () => {
    const result = computeNextReviewState(
      { mastery: 'known', reviewIntervalDays: 64 },
      'known',
      FIXED_NOW,
    );
    assert.equal(result.mastery, 'known');
    assert.equal(result.reviewIntervalDays, MAX_INTERVAL_DAYS);
    assert.equal(result.nextReviewAt, expectedAfterDays(FIXED_NOW.toISOString(), MAX_INTERVAL_DAYS));
  });

  it('known interval 0 + known sets interval 1', () => {
    const result = computeNextReviewState(
      { mastery: 'known', reviewIntervalDays: 0 },
      'known',
      FIXED_NOW,
    );
    assert.equal(result.mastery, 'known');
    assert.equal(result.reviewIntervalDays, 1);
    assert.equal(result.nextReviewAt, expectedAfterDays(FIXED_NOW.toISOString(), 1));
  });

  it('any + unknown resets interval to 0 and nextReviewAt now + 1 day', () => {
    for (const mastery of ['new', 'learning', 'known']) {
      const result = computeNextReviewState(
        { mastery, reviewIntervalDays: mastery === 'known' ? 8 : 0 },
        'unknown',
        FIXED_NOW,
      );
      assert.equal(result.mastery, 'learning');
      assert.equal(result.reviewIntervalDays, 0);
      assert.equal(result.nextReviewAt, expectedAfterDays(FIXED_NOW.toISOString(), 1));
    }
  });
});
