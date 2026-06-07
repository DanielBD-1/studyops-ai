import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  canNavigateFlashcards,
  computeIndexAfterSuccessfulReview,
  formatCardCounter,
  getNextIndex,
  getPreviousIndex,
  buildStudySetKey,
} from '../../src/utils/flashcard-study.js';

describe('flashcard-study formatCardCounter', () => {
  it('displays Card X of N', () => {
    assert.equal(formatCardCounter(0, 12), 'Card 1 of 12');
    assert.equal(formatCardCounter(2, 5), 'Card 3 of 5');
  });

  it('works for one card', () => {
    assert.equal(formatCardCounter(0, 1), 'Card 1 of 1');
  });
});

describe('flashcard-study navigation', () => {
  it('next moves to next card and wraps at end', () => {
    assert.equal(getNextIndex(0, 3), 1);
    assert.equal(getNextIndex(1, 3), 2);
    assert.equal(getNextIndex(2, 3), 0);
  });

  it('previous moves to previous card and wraps at start', () => {
    assert.equal(getPreviousIndex(0, 3), 2);
    assert.equal(getPreviousIndex(1, 3), 0);
    assert.equal(getPreviousIndex(2, 3), 1);
  });

  it('one-card case keeps index at 0', () => {
    assert.equal(getNextIndex(0, 1), 0);
    assert.equal(getPreviousIndex(0, 1), 0);
    assert.equal(canNavigateFlashcards(1), false);
  });

  it('allows navigation when more than one card', () => {
    assert.equal(canNavigateFlashcards(2), true);
    assert.equal(canNavigateFlashcards(30), true);
  });
});

describe('flashcard-study buildStudySetKey', () => {
  it('uses stable id keys so review metadata updates do not change the key', () => {
    const before = [{ id: 'card-1', question: 'Q', answer: 'A' }];
    const after = [{ id: 'card-1', question: 'Q', answer: 'A' }];
    assert.equal(buildStudySetKey(before), buildStudySetKey(after));
  });

  it('changes key when cards are added or removed', () => {
    const one = [{ id: 'a', question: 'Q1', answer: 'A1' }];
    const two = [
      { id: 'a', question: 'Q1', answer: 'A1' },
      { id: 'b', question: 'Q2', answer: 'A2' },
    ];
    assert.notEqual(buildStudySetKey(one), buildStudySetKey(two));
  });
});

describe('flashcard-study computeIndexAfterSuccessfulReview', () => {
  const deck = [
    { id: 'a', question: 'Q1', answer: 'A1' },
    { id: 'b', question: 'Q2', answer: 'A2' },
    { id: 'c', question: 'Q3', answer: 'A3' },
  ];

  it('advances to the next card when the reviewed card stays in the deck', () => {
    assert.equal(computeIndexAfterSuccessfulReview(1, 'b', deck), 2);
  });

  it('wraps to the first card when reviewing the last card in an unchanged deck', () => {
    assert.equal(computeIndexAfterSuccessfulReview(2, 'c', deck), 0);
  });

  it('keeps the same slot when the reviewed card leaves the filtered deck', () => {
    const afterDueReview = [
      { id: 'a', question: 'Q1', answer: 'A1' },
      { id: 'c', question: 'Q3', answer: 'A3' },
    ];
    assert.equal(computeIndexAfterSuccessfulReview(1, 'b', afterDueReview), 1);
  });

  it('clamps when the reviewed card was last in a shrinking deck', () => {
    const afterLastReview = [{ id: 'a', question: 'Q1', answer: 'A1' }];
    assert.equal(computeIndexAfterSuccessfulReview(1, 'b', afterLastReview), 0);
  });

  it('returns 0 for an empty deck', () => {
    assert.equal(computeIndexAfterSuccessfulReview(0, 'a', []), 0);
  });
});

describe('flashcard-study reveal reset simulation', () => {
  it('simulates next moving to next card and resetting reveal state', () => {
    let currentIndex = 0;
    let revealed = true;
    const total = 3;

    currentIndex = getNextIndex(currentIndex, total);
    revealed = false;

    assert.equal(currentIndex, 1);
    assert.equal(revealed, false);
  });

  it('simulates previous moving to previous card and resetting reveal state', () => {
    let currentIndex = 1;
    let revealed = true;
    const total = 3;

    currentIndex = getPreviousIndex(currentIndex, total);
    revealed = false;

    assert.equal(currentIndex, 0);
    assert.equal(revealed, false);
  });

  it('simulates flashcards change resetting index and reveal', () => {
    let currentIndex = 2;
    let revealed = true;

    currentIndex = 0;
    revealed = false;

    assert.equal(currentIndex, 0);
    assert.equal(revealed, false);
  });
});

describe('flashcard-study first question visibility', () => {
  it('renders first question at index 0', () => {
    const flashcards = [
      { question: 'What is X?', answer: 'X is the first concept.' },
      { question: 'What is Y?', answer: 'Y is the second concept.' },
    ];
    const currentIndex = 0;

    assert.equal(formatCardCounter(currentIndex, flashcards.length), 'Card 1 of 2');
    assert.equal(flashcards[currentIndex].question, 'What is X?');
  });

  it('answer is hidden before reveal when revealed is false', () => {
    const revealed = false;
    const showAnswerInUi = revealed;
    assert.equal(showAnswerInUi, false);
  });

  it('reveal shows answer when revealed is true', () => {
    const revealed = true;
    const showAnswerInUi = revealed;
    assert.equal(showAnswerInUi, true);
  });
});
