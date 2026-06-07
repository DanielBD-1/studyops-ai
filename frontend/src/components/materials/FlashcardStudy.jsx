import { useEffect, useMemo, useRef, useState } from 'react';
import Button from '../ui/Button.jsx';
import ErrorMessage from '../ui/ErrorMessage.jsx';
import {
  buildStudySetKey,
  canNavigateFlashcards,
  computeIndexAfterSuccessfulReview,
  formatCardCounter,
  getNextIndex,
  getPreviousIndex,
} from '../../utils/flashcard-study.js';

/**
 * @param {{
 *   flashcards: Array<{ id?: string, question: string, answer: string, tags?: string[], mastery?: string, reviewCount?: number }>,
 *   title?: string,
 *   className?: string,
 *   onReviewOutcome?: (
 *     flashcardId: string,
 *     outcome: 'known' | 'unknown'
 *   ) => void | Promise<void | boolean>,
 *   reviewing?: boolean,
 *   reviewError?: string | null,
 *   reviewSuccessMessage?: string | null,
 * }} props
 */
export default function FlashcardStudy({
  flashcards,
  title = 'Flashcards',
  className = '',
  onReviewOutcome,
  reviewing = false,
  reviewError = null,
  reviewSuccessMessage = null,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  /** @type {import('react').MutableRefObject<{ reviewedCardId: string, indexBeforeReview: number } | null>} */
  const pendingAdvanceRef = useRef(null);
  const skipDeckResetRef = useRef(false);

  const total = flashcards.length;
  const card = flashcards[currentIndex];
  const showNav = canNavigateFlashcards(total);
  const studySetKey = useMemo(() => buildStudySetKey(flashcards), [flashcards]);

  useEffect(() => {
    if (skipDeckResetRef.current || pendingAdvanceRef.current) {
      return;
    }
    setCurrentIndex(0);
    setRevealed(false);
  }, [studySetKey, flashcards.length]);

  useEffect(() => {
    const pending = pendingAdvanceRef.current;
    if (!pending) {
      return;
    }

    const nextIndex = computeIndexAfterSuccessfulReview(
      pending.indexBeforeReview,
      pending.reviewedCardId,
      flashcards
    );
    pendingAdvanceRef.current = null;
    skipDeckResetRef.current = false;
    setCurrentIndex(nextIndex);
    setRevealed(false);
  }, [flashcards, studySetKey]);

  useEffect(() => {
    if (total > 0 && currentIndex >= total) {
      setCurrentIndex(total - 1);
    }
  }, [currentIndex, total]);

  function goNext() {
    setCurrentIndex((index) => getNextIndex(index, total));
    setRevealed(false);
  }

  function goPrevious() {
    setCurrentIndex((index) => getPreviousIndex(index, total));
    setRevealed(false);
  }

  /**
   * @param {'known' | 'unknown'} outcome
   */
  async function handleReviewOutcomeClick(outcome) {
    if (!card?.id || !onReviewOutcome) {
      return;
    }

    const indexBeforeReview = currentIndex;
    const reviewedCardId = card.id;
    const result = await onReviewOutcome(reviewedCardId, outcome);

    if (result !== true) {
      return;
    }

    skipDeckResetRef.current = true;
    pendingAdvanceRef.current = { reviewedCardId, indexBeforeReview };
  }

  if (!card) {
    return null;
  }

  const canReview = Boolean(onReviewOutcome && revealed && card.id);
  const reviewBusy = reviewing;
  const showReviewMeta =
    card.id &&
    typeof card.reviewCount === 'number' &&
    card.reviewCount > 0 &&
    card.mastery;

  const sectionClass = ['flashcard-study', 'plan-block', className].filter(Boolean).join(' ');

  return (
    <section className={sectionClass} aria-label="Flashcard study">
      <div className="flashcard-study__header">
        <h3 className="plan-block__title">{title}</h3>
        <p className="plan-block__meta flashcard-study__counter">
          {formatCardCounter(currentIndex, total)}
        </p>
      </div>

      <article className="plan-block__item flashcard-study__card">
        <p className="plan-block__body flashcard-study__question">
          <span className="flashcard-study__label">Q</span>
          {card.question}
        </p>
        {revealed ? (
          <p className="plan-block__body flashcard-study__answer">
            <span className="flashcard-study__label">A</span>
            {card.answer}
          </p>
        ) : null}
        {Array.isArray(card.tags) && card.tags.length > 0 ? (
          <p className="plan-block__meta">Tags: {card.tags.join(', ')}</p>
        ) : null}
        {showReviewMeta ? (
          <p className="plan-block__meta flashcard-study__review-meta">
            Mastery: {card.mastery} · Reviews: {card.reviewCount}
          </p>
        ) : null}
      </article>

      <div className="form-row flashcard-study__actions">
        {!revealed ? (
          <Button type="button" variant="primary" onClick={() => setRevealed(true)}>
            Show answer
          </Button>
        ) : null}
        {canReview ? (
          <>
            <Button
              type="button"
              variant="primary"
              disabled={reviewBusy}
              onClick={() => handleReviewOutcomeClick('known')}
            >
              {reviewBusy ? 'Saving…' : 'Known'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={reviewBusy}
              onClick={() => handleReviewOutcomeClick('unknown')}
            >
              {reviewBusy ? 'Saving…' : 'Unknown'}
            </Button>
          </>
        ) : null}
        {showNav ? (
          <>
            <Button type="button" variant="secondary" onClick={goPrevious} disabled={reviewBusy}>
              Previous
            </Button>
            <Button type="button" variant="secondary" onClick={goNext} disabled={reviewBusy}>
              Next
            </Button>
          </>
        ) : null}
      </div>

      {reviewSuccessMessage ? (
        <p className="plan-panel__status plan-panel__status--success flashcard-study__review-success">
          {reviewSuccessMessage}
        </p>
      ) : null}
      {reviewError ? <ErrorMessage message={reviewError} /> : null}
    </section>
  );
}
