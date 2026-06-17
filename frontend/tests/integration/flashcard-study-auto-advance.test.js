import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { renderFlashcardStudyHarness } from '../helpers/render-flashcard-study.jsx';

const CARD_A = {
  id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  question: 'Question A',
  answer: 'Answer A',
};

const CARD_B = {
  id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  question: 'Question B',
  answer: 'Answer B',
};

const CARD_C = {
  id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
  question: 'Question C',
  answer: 'Answer C',
};

describe('FlashcardStudy auto-advance after review', () => {
  it('advances to the next card after a successful Known review when the card stays in the deck', async () => {
    const view = await renderFlashcardStudyHarness({
      initialCards: [CARD_A, CARD_B],
      reviewHandler: async (_flashcardId, _outcome, setCards) => {
        setCards((prev) => [...prev]);
        return true;
      },
    });

    try {
      assert.equal(view.getCounterText(), 'Card 1 of 2');
      assert.match(view.getQuestionText(), /Question A/);

      await view.clickShowAnswer();
      assert.ok(view.hasKnownButton());

      await view.clickReview('known');
      await view.waitForCounter('Card 2 of 2');

      assert.ok(view.hasShowAnswerButton());
      assert.equal(view.hasKnownButton(), false);
    } finally {
      await view.unmount();
    }
  });

  it('clamps the index when the reviewed card leaves the filtered deck', async () => {
    const view = await renderFlashcardStudyHarness({
      initialCards: [CARD_A, CARD_B, CARD_C],
      reviewHandler: async (flashcardId, outcome, setCards) => {
        if (outcome === 'known' && flashcardId === CARD_A.id) {
          setCards((prev) => prev.filter((card) => card.id !== CARD_A.id));
        }
        return true;
      },
    });

    try {
      assert.equal(view.getCounterText(), 'Card 1 of 3');

      await view.clickShowAnswer();
      await view.clickReview('known');
      await view.waitForCounter('Card 1 of 2');
    } finally {
      await view.unmount();
    }
  });

  it('does not advance when the review handler returns false', async () => {
    const view = await renderFlashcardStudyHarness({
      initialCards: [CARD_A, CARD_B],
      reviewHandler: async () => false,
    });

    try {
      await view.clickShowAnswer();
      await view.clickReview('known');

      assert.equal(view.getCounterText(), 'Card 1 of 2');
      assert.match(view.getQuestionText(), /Question A/);
      assert.ok(view.hasKnownButton());
    } finally {
      await view.unmount();
    }
  });

  it('resets revealed state on the next card after a successful review', async () => {
    const view = await renderFlashcardStudyHarness({
      initialCards: [CARD_A, CARD_B],
      reviewHandler: async (_flashcardId, _outcome, setCards) => {
        setCards((prev) => [...prev]);
        return true;
      },
    });

    try {
      await view.clickShowAnswer();
      assert.ok(view.hasKnownButton());

      await view.clickReview('known');
      await view.waitForCounter('Card 2 of 2');

      assert.ok(view.hasShowAnswerButton());
      assert.equal(view.hasKnownButton(), false);
      assert.doesNotMatch(view.container.textContent ?? '', /Answer B/);
    } finally {
      await view.unmount();
    }
  });
});
