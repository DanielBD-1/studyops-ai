import { act, useState } from 'react';
import { createRoot } from 'react-dom/client';
import FlashcardStudy from '../../src/components/materials/FlashcardStudy.jsx';
import {
  clickElement,
  findButtonByText,
  flushUpdates,
  installMinimalBrowser,
  waitFor,
} from './minimal-browser.js';

/**
 * @param {{
 *   initialCards: Array<{ id: string, question: string, answer: string, tags?: string[], mastery?: string, reviewCount?: number }>,
 *   reviewHandler: (
 *     flashcardId: string,
 *     outcome: 'known' | 'unknown',
 *     setCards: (updater: (prev: typeof initialCards) => typeof initialCards) => void
 *   ) => Promise<boolean>,
 * }} options
 */
export async function renderFlashcardStudyHarness(options) {
  const { initialCards, reviewHandler } = options;
  const browser = installMinimalBrowser();
  const root = createRoot(browser.container);

  /** @type {typeof initialCards} */
  let latestCards = initialCards;

  function Harness() {
    const [cards, setCards] = useState(initialCards);
    const [reviewing, setReviewing] = useState(false);

    latestCards = cards;

    async function handleReview(flashcardId, outcome) {
      setReviewing(true);
      try {
        return await reviewHandler(flashcardId, outcome, setCards);
      } finally {
        setReviewing(false);
      }
    }

    return (
      <FlashcardStudy
        flashcards={cards}
        title="Test deck"
        onReviewOutcome={handleReview}
        reviewing={reviewing}
      />
    );
  }

  await act(async () => {
    root.render(<Harness />);
  });
  await flushUpdates();
  await flushUpdates();

  return {
    container: browser.container,
    getCards: () => latestCards,
    getCounterText() {
      const counter = browser.container.querySelector('.flashcard-study__counter');
      return counter?.textContent ?? '';
    },
    getQuestionText() {
      const question = browser.container.querySelector('.flashcard-study__question');
      return question?.textContent ?? '';
    },
    hasShowAnswerButton() {
      return Boolean(findButtonByText(browser.container, 'Show answer'));
    },
    hasKnownButton() {
      return Boolean(findButtonByText(browser.container, 'Known'));
    },
    async clickShowAnswer() {
      const button = findButtonByText(browser.container, 'Show answer');
      if (!button) {
        throw new Error('Show answer button not found');
      }
      await act(async () => {
        clickElement(button);
      });
      await flushUpdates();
      await flushUpdates();
    },
    /**
     * @param {'known' | 'unknown'} outcome
     */
    async clickReview(outcome) {
      const label = outcome === 'known' ? 'Known' : 'Unknown';
      const button = findButtonByText(browser.container, label);
      if (!button) {
        throw new Error(`${label} button not found`);
      }
      await act(async () => {
        clickElement(button);
      });
      await flushUpdates();
      await flushUpdates();
      await flushUpdates();
    },
    async waitForCounter(expected) {
      await waitFor(() => this.getCounterText() === expected);
    },
    async waitForQuestionIncludes(text) {
      await waitFor(() => this.getQuestionText().includes(text));
    },
    async unmount() {
      await act(async () => {
        root.unmount();
      });
      await flushUpdates();
      browser.cleanup();
    },
  };
}
