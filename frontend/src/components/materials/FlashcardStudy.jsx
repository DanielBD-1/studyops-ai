import { useEffect, useState } from 'react';
import Button from '../ui/Button.jsx';
import {
  canNavigateFlashcards,
  formatCardCounter,
  getNextIndex,
  getPreviousIndex,
} from '../../utils/flashcard-study.js';

/**
 * @param {{
 *   flashcards: Array<{ question: string, answer: string, tags?: string[] }>,
 *   title?: string,
 *   className?: string,
 * }} props
 */
export default function FlashcardStudy({ flashcards, title = 'Flashcards', className = '' }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const total = flashcards.length;
  const card = flashcards[currentIndex];
  const showNav = canNavigateFlashcards(total);

  useEffect(() => {
    setCurrentIndex(0);
    setRevealed(false);
  }, [flashcards]);

  function goNext() {
    setCurrentIndex((index) => getNextIndex(index, total));
    setRevealed(false);
  }

  function goPrevious() {
    setCurrentIndex((index) => getPreviousIndex(index, total));
    setRevealed(false);
  }

  if (!card) {
    return null;
  }

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
      </article>

      <div className="form-row flashcard-study__actions">
        {!revealed ? (
          <Button type="button" variant="primary" onClick={() => setRevealed(true)}>
            Show answer
          </Button>
        ) : null}
        {showNav ? (
          <>
            <Button type="button" variant="secondary" onClick={goPrevious}>
              Previous
            </Button>
            <Button type="button" variant="secondary" onClick={goNext}>
              Next
            </Button>
          </>
        ) : null}
      </div>
    </section>
  );
}
