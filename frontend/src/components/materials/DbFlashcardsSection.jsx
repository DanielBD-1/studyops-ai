import { useState } from 'react';
import { useDashboardRefresh } from '../../context/DashboardContext.jsx';
import { ApiRequestError } from '../../services/courses.service.js';
import {
  buildCreateFlashcardBody,
  buildUpdateFlashcardBody,
  truncateFlashcardQuestion,
} from '../../utils/flashcard-form.js';
import Button from '../ui/Button.jsx';
import ErrorMessage from '../ui/ErrorMessage.jsx';
import FormCard from '../ui/FormCard.jsx';
import Input from '../ui/Input.jsx';
import LoadingState from '../ui/LoadingState.jsx';
import Textarea from '../ui/Textarea.jsx';
import FlashcardStudy from './FlashcardStudy.jsx';

/**
 * @param {{
 *   courseId: string,
 *   materialId: string,
 *   flashcards: import('../../services/flashcards.service.js').Flashcard[],
 *   loading: boolean,
 *   error: string | null,
 *   onRetry?: () => void,
 *   onMutated: () => void | Promise<void>,
 *   createCourseFlashcard: typeof import('../../services/flashcards.service.js').createCourseFlashcard,
 *   updateFlashcard: typeof import('../../services/flashcards.service.js').updateFlashcard,
 *   deleteFlashcard: typeof import('../../services/flashcards.service.js').deleteFlashcard,
 *   reviewFlashcard: typeof import('../../services/flashcards.service.js').reviewFlashcard,
 *   onFlashcardUpdated?: (flashcard: import('../../services/flashcards.service.js').Flashcard) => void,
 *   handleAuthError: (err: unknown) => Promise<boolean>,
 *   disabled?: boolean,
 * }} props
 */
export default function DbFlashcardsSection({
  courseId,
  materialId,
  flashcards,
  loading,
  error,
  onRetry,
  onMutated,
  createCourseFlashcard,
  updateFlashcard,
  deleteFlashcard,
  reviewFlashcard,
  onFlashcardUpdated,
  handleAuthError,
  disabled = false,
}) {
  const { refreshStats } = useDashboardRefresh();
  const [showCreate, setShowCreate] = useState(false);
  const [createQuestion, setCreateQuestion] = useState('');
  const [createAnswer, setCreateAnswer] = useState('');
  const [createTags, setCreateTags] = useState('');
  const [createError, setCreateError] = useState(/** @type {string | null} */ (null));
  const [creating, setCreating] = useState(false);

  const [editingId, setEditingId] = useState(/** @type {string | null} */ (null));
  const [editQuestion, setEditQuestion] = useState('');
  const [editAnswer, setEditAnswer] = useState('');
  const [editTags, setEditTags] = useState('');
  const [editError, setEditError] = useState(/** @type {string | null} */ (null));
  const [savingEdit, setSavingEdit] = useState(false);

  const [deletingId, setDeletingId] = useState(/** @type {string | null} */ (null));
  const [actionError, setActionError] = useState(/** @type {string | null} */ (null));
  const [successMessage, setSuccessMessage] = useState(/** @type {string | null} */ (null));
  const [reviewing, setReviewing] = useState(false);
  const [reviewError, setReviewError] = useState(/** @type {string | null} */ (null));
  const [reviewSuccessMessage, setReviewSuccessMessage] = useState(
    /** @type {string | null} */ (null)
  );

  const busy = disabled || creating || savingEdit || deletingId !== null || reviewing;
  const studyCards = flashcards.map((card) => ({
    id: card.id,
    question: card.question,
    answer: card.answer,
    tags: card.tags,
    mastery: card.mastery,
    reviewCount: card.reviewCount,
  }));

  function cancelCreate() {
    setShowCreate(false);
    setCreateQuestion('');
    setCreateAnswer('');
    setCreateTags('');
    setCreateError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditQuestion('');
    setEditAnswer('');
    setEditTags('');
    setEditError(null);
  }

  function openCreate() {
    cancelEdit();
    setActionError(null);
    setSuccessMessage(null);
    setShowCreate(true);
  }

  /**
   * @param {import('../../services/flashcards.service.js').Flashcard} card
   */
  function startEdit(card) {
    cancelCreate();
    setActionError(null);
    setSuccessMessage(null);
    setEditingId(card.id);
    setEditQuestion(card.question);
    setEditAnswer(card.answer);
    setEditTags(Array.isArray(card.tags) ? card.tags.join(', ') : '');
    setEditError(null);
  }

  async function handleCreate(event) {
    event.preventDefault();
    setCreateError(null);
    setSuccessMessage(null);

    const built = buildCreateFlashcardBody(
      createQuestion,
      createAnswer,
      createTags,
      materialId
    );
    if (!built.success) {
      setCreateError(built.error);
      return;
    }

    setCreating(true);
    try {
      await createCourseFlashcard(courseId, built.body);
      cancelCreate();
      setSuccessMessage('Flashcard saved.');
      await onMutated();
      refreshStats();
    } catch (err) {
      if (await handleAuthError(err)) return;
      if (err instanceof ApiRequestError && err.code === 'NOT_FOUND') {
        setCreateError('Course or study material not found');
        return;
      }
      setCreateError(err instanceof Error ? err.message : 'Failed to create flashcard');
    } finally {
      setCreating(false);
    }
  }

  async function handleUpdate(event) {
    event.preventDefault();
    if (!editingId) return;

    setEditError(null);
    setSuccessMessage(null);

    const built = buildUpdateFlashcardBody(editQuestion, editAnswer, editTags);
    if (!built.success) {
      setEditError(built.error);
      return;
    }

    setSavingEdit(true);
    try {
      await updateFlashcard(editingId, built.body);
      cancelEdit();
      setSuccessMessage('Flashcard updated.');
      await onMutated();
    } catch (err) {
      if (await handleAuthError(err)) return;
      if (err instanceof ApiRequestError && err.code === 'NOT_FOUND') {
        setEditError('Flashcard not found');
        return;
      }
      setEditError(err instanceof Error ? err.message : 'Failed to update flashcard');
    } finally {
      setSavingEdit(false);
    }
  }

  /**
   * @param {import('../../services/flashcards.service.js').Flashcard} card
   */
  async function handleDelete(card) {
    const confirmed = window.confirm(
      'Delete this saved flashcard? This cannot be undone.'
    );
    if (!confirmed) return;

    setActionError(null);
    setSuccessMessage(null);
    setDeletingId(card.id);
    try {
      await deleteFlashcard(card.id);
      if (editingId === card.id) {
        cancelEdit();
      }
      setSuccessMessage('Flashcard deleted.');
      await onMutated();
      refreshStats();
    } catch (err) {
      if (await handleAuthError(err)) return;
      if (err instanceof ApiRequestError && err.code === 'NOT_FOUND') {
        setActionError('Flashcard not found');
        await onMutated();
        return;
      }
      setActionError(err instanceof Error ? err.message : 'Failed to delete flashcard');
    } finally {
      setDeletingId(null);
    }
  }

  /**
   * @param {string} flashcardId
   * @param {'known' | 'unknown'} outcome
   */
  async function handleReviewOutcome(flashcardId, outcome) {
    setReviewError(null);
    setReviewSuccessMessage(null);
    setReviewing(true);
    try {
      const data = await reviewFlashcard(flashcardId, { outcome });
      onFlashcardUpdated?.(data.flashcard);
      setReviewSuccessMessage(
        outcome === 'known' ? 'Marked as known.' : 'Marked as unknown.'
      );
    } catch (err) {
      if (await handleAuthError(err)) return;
      if (err instanceof ApiRequestError && err.code === 'NOT_FOUND') {
        setReviewError('Flashcard not found');
        return;
      }
      setReviewError(err instanceof Error ? err.message : 'Failed to save review');
    } finally {
      setReviewing(false);
    }
  }

  return (
    <FormCard title="Flashcard library" className="flashcard-library flashcard-library--material">
      <p className="flashcard-library__intro plan-disclaimer">
        These flashcards are stored in your account and remain available even if you clear
        the generated plan below.
      </p>

      {loading && (
        <div className="flashcard-library__loading">
          <LoadingState message="Loading saved flashcards…" />
        </div>
      )}

      {error && !loading && (
        <div className="flashcard-library__error">
          <ErrorMessage message={error} />
          {onRetry ? (
            <p className="section__actions">
              <Button type="button" variant="secondary" onClick={onRetry} disabled={busy}>
                Try again
              </Button>
            </p>
          ) : null}
        </div>
      )}

      {!loading && !error && (
        <>
          {!showCreate && editingId === null && (
            <p className="section__actions flashcard-library__create-cta">
              <Button type="button" variant="primary" onClick={openCreate} disabled={busy}>
                Create flashcard
              </Button>
            </p>
          )}

          {flashcards.length === 0 && !showCreate && (
            <p className="flashcard-library__empty plan-block__body">
              No saved flashcards yet. Create a flashcard, or import from your generated plan
              below.
            </p>
          )}

          {showCreate && (
            <div className="flashcard-library__form section--compact">
              <h3 className="plan-block__title">New flashcard</h3>
              <form onSubmit={handleCreate} className="form-stack">
                <Textarea
                  id="flashcard-create-question"
                  label="Question"
                  value={createQuestion}
                  onChange={setCreateQuestion}
                  rows={3}
                  required
                />
                <Textarea
                  id="flashcard-create-answer"
                  label="Answer"
                  value={createAnswer}
                  onChange={setCreateAnswer}
                  rows={4}
                  required
                />
                <Input
                  id="flashcard-create-tags"
                  label="Tags (comma-separated, optional)"
                  value={createTags}
                  onChange={setCreateTags}
                />
                {createError && <ErrorMessage message={createError} />}
                <div className="form-row">
                  <Button type="submit" variant="primary" disabled={creating || busy}>
                    {creating ? 'Saving…' : 'Save flashcard'}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={creating}
                    onClick={cancelCreate}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}

          {flashcards.length > 0 && (
            <div className="flashcard-library__study">
              <FlashcardStudy
                flashcards={studyCards}
                title="Study saved cards"
                className="flashcard-study--library"
                onReviewOutcome={handleReviewOutcome}
                reviewing={reviewing}
                reviewError={reviewError}
                reviewSuccessMessage={reviewSuccessMessage}
              />
            </div>
          )}

          {flashcards.length > 0 && (
            <section
              className="flashcard-library__manage plan-block"
              aria-label="Manage saved flashcards"
            >
              <h3 className="plan-block__title">Your saved cards</h3>
              <ul className="flashcard-library__list plan-block__list">
                {flashcards.map((card) =>
                  editingId === card.id ? (
                    <li key={card.id} className="plan-block__item flashcard-library__item">
                      <form onSubmit={handleUpdate} className="form-stack">
                        <Textarea
                          id={`flashcard-edit-question-${card.id}`}
                          label="Question"
                          value={editQuestion}
                          onChange={setEditQuestion}
                          rows={3}
                          required
                        />
                        <Textarea
                          id={`flashcard-edit-answer-${card.id}`}
                          label="Answer"
                          value={editAnswer}
                          onChange={setEditAnswer}
                          rows={4}
                          required
                        />
                        <Input
                          id={`flashcard-edit-tags-${card.id}`}
                          label="Tags (comma-separated, optional)"
                          value={editTags}
                          onChange={setEditTags}
                        />
                        {editError && <ErrorMessage message={editError} />}
                        <div className="form-row">
                          <Button
                            type="submit"
                            variant="primary"
                            disabled={savingEdit || busy}
                          >
                            {savingEdit ? 'Saving…' : 'Save changes'}
                          </Button>
                          <Button
                            type="button"
                            variant="secondary"
                            disabled={savingEdit}
                            onClick={cancelEdit}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </li>
                  ) : (
                    <li key={card.id} className="plan-block__item flashcard-library__item">
                      <p className="plan-block__body flashcard-library__question">
                        {truncateFlashcardQuestion(card.question)}
                      </p>
                      {Array.isArray(card.tags) && card.tags.length > 0 ? (
                        <p className="plan-block__meta">Tags: {card.tags.join(', ')}</p>
                      ) : null}
                      <div className="form-row flashcard-library__item-actions">
                        <Button
                          type="button"
                          variant="secondary"
                          disabled={busy || editingId !== null || showCreate}
                          onClick={() => startEdit(card)}
                        >
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="danger"
                          disabled={busy || deletingId === card.id}
                          onClick={() => handleDelete(card)}
                        >
                          {deletingId === card.id ? 'Deleting…' : 'Delete'}
                        </Button>
                      </div>
                    </li>
                  )
                )}
              </ul>
            </section>
          )}

          {flashcards.length > 0 && !showCreate && editingId === null && (
            <p className="section__actions flashcard-library__create-cta">
              <Button type="button" variant="primary" onClick={openCreate} disabled={busy}>
                Add another flashcard
              </Button>
            </p>
          )}

          {successMessage && (
            <p className="plan-panel__status plan-panel__status--success">{successMessage}</p>
          )}
          {actionError && <ErrorMessage message={actionError} />}
        </>
      )}
    </FormCard>
  );
}
