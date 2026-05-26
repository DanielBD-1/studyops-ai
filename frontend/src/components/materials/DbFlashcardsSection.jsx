import Button from '../ui/Button.jsx';
import ErrorMessage from '../ui/ErrorMessage.jsx';
import FormCard from '../ui/FormCard.jsx';
import LoadingState from '../ui/LoadingState.jsx';
import FlashcardStudy from './FlashcardStudy.jsx';

/**
 * @param {{
 *   flashcards: import('../../services/flashcards.service.js').Flashcard[],
 *   loading: boolean,
 *   error: string | null,
 *   onRetry?: () => void,
 * }} props
 */
export default function DbFlashcardsSection({ flashcards, loading, error, onRetry }) {
  const studyCards = flashcards.map((card) => ({
    question: card.question,
    answer: card.answer,
    tags: card.tags,
  }));

  return (
    <FormCard title="Saved flashcards">
      <p className="plan-disclaimer">
        These flashcards are stored in your account and remain available even if you clear
        the generated plan below.
      </p>

      {loading && <LoadingState message="Loading saved flashcards…" />}

      {error && !loading && (
        <>
          <ErrorMessage message={error} />
          {onRetry ? (
            <p className="section__actions">
              <Button type="button" variant="secondary" onClick={onRetry}>
                Try again
              </Button>
            </p>
          ) : null}
        </>
      )}

      {!loading && !error && flashcards.length === 0 && (
        <p className="plan-block__body">
          No saved flashcards yet. Import from your generated plan below.
        </p>
      )}

      {!loading && !error && flashcards.length > 0 && (
        <FlashcardStudy flashcards={studyCards} />
      )}
    </FormCard>
  );
}
