import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ApiRequestError } from '../../services/courses.service.js';
import {
  deleteFlashcard,
  listFlashcards,
  updateFlashcard,
} from '../../services/flashcards.service.js';
import { listMaterials } from '../../services/study-materials.service.js';
import {
  buildUpdateFlashcardBody,
  truncateFlashcardQuestion,
} from '../../utils/flashcard-form.js';
import {
  resetMaterialFilterForCourseChange,
  resolveFlashcardListFilters,
} from '../../utils/flashcard-filters.js';
import FlashcardStudy from '../materials/FlashcardStudy.jsx';
import Button from '../ui/Button.jsx';
import ErrorMessage from '../ui/ErrorMessage.jsx';
import FormCard from '../ui/FormCard.jsx';
import Input from '../ui/Input.jsx';
import LoadingState from '../ui/LoadingState.jsx';
import Textarea from '../ui/Textarea.jsx';

/**
 * @param {{
 *   courses: import('../../services/courses.service.js').Course[],
 *   handleAuthError: (err: unknown) => Promise<boolean>,
 * }} props
 */
export default function GlobalFlashcardsSection({ courses, handleAuthError }) {
  const [flashcards, setFlashcards] = useState(
    /** @type {import('../../services/flashcards.service.js').Flashcard[]} */ ([])
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(/** @type {string | null} */ (null));
  const [courseFilter, setCourseFilter] = useState(/** @type {'all' | string} */ ('all'));
  const [materialFilter, setMaterialFilter] = useState(/** @type {'all' | string} */ ('all'));
  const [materials, setMaterials] = useState(
    /** @type {import('../../services/study-materials.service.js').MaterialSummary[]} */ ([])
  );
  const [materialsLoading, setMaterialsLoading] = useState(false);

  const [editingId, setEditingId] = useState(/** @type {string | null} */ (null));
  const [editQuestion, setEditQuestion] = useState('');
  const [editAnswer, setEditAnswer] = useState('');
  const [editTags, setEditTags] = useState('');
  const [editError, setEditError] = useState(/** @type {string | null} */ (null));
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState(/** @type {string | null} */ (null));
  const [actionError, setActionError] = useState(/** @type {string | null} */ (null));
  const [successMessage, setSuccessMessage] = useState(/** @type {string | null} */ (null));

  const courseTitleById = new Map(courses.map((c) => [c.id, c.title]));
  const materialTitleById = new Map(materials.map((m) => [m.id, m.title]));

  const busy = savingEdit || deletingId !== null;
  const showMaterialFilter = courseFilter !== 'all' && courses.some((c) => c.id === courseFilter);

  const studyCards = flashcards.map((card) => ({
    question: card.question,
    answer: card.answer,
    tags: card.tags,
  }));

  function cancelEdit() {
    setEditingId(null);
    setEditQuestion('');
    setEditAnswer('');
    setEditTags('');
    setEditError(null);
  }

  /**
   * @param {{ courseFilter?: 'all' | string, materialFilter?: 'all' | string }} [overrides]
   */
  const loadFlashcards = useCallback(
    async (overrides = {}) => {
      setLoading(true);
      setError(null);

      const effectiveCourseFilter = overrides.courseFilter ?? courseFilter;
      const effectiveMaterialFilter = overrides.materialFilter ?? materialFilter;

      const apiFilters = resolveFlashcardListFilters({
        courseFilter: effectiveCourseFilter,
        materialFilter: effectiveMaterialFilter,
        courses,
        materials,
      });

      try {
        const data = await listFlashcards(apiFilters);
        setFlashcards(data.flashcards);
      } catch (err) {
        if (await handleAuthError(err)) return;
        if (err instanceof ApiRequestError && err.code === 'NOT_FOUND') {
          setError('Course or study material not found');
          setFlashcards([]);
          return;
        }
        setError(err instanceof Error ? err.message : 'Failed to load saved flashcards');
      } finally {
        setLoading(false);
      }
    },
    [courseFilter, materialFilter, courses, materials, handleAuthError]
  );

  useEffect(() => {
    loadFlashcards();
  }, [loadFlashcards]);

  useEffect(() => {
    if (!showMaterialFilter) {
      setMaterials([]);
      return undefined;
    }

    let cancelled = false;

    async function loadCourseMaterials() {
      setMaterialsLoading(true);
      try {
        const data = await listMaterials(courseFilter);
        if (!cancelled) {
          setMaterials(data.materials);
        }
      } catch (err) {
        if (cancelled) return;
        if (await handleAuthError(err)) return;
        setMaterials([]);
        setError('Failed to load study materials for this course');
      } finally {
        if (!cancelled) {
          setMaterialsLoading(false);
        }
      }
    }

    loadCourseMaterials();

    return () => {
      cancelled = true;
    };
  }, [courseFilter, showMaterialFilter, handleAuthError]);

  /**
   * @param {'all' | string} course
   */
  function handleCourseFilterChange(course) {
    cancelEdit();
    setActionError(null);
    setSuccessMessage(null);
    setCourseFilter(course);
    setMaterialFilter(resetMaterialFilterForCourseChange());
  }

  /**
   * @param {'all' | string} material
   */
  function handleMaterialFilterChange(material) {
    cancelEdit();
    setActionError(null);
    setSuccessMessage(null);
    setMaterialFilter(material);
  }

  /**
   * @param {import('../../services/flashcards.service.js').Flashcard} card
   */
  function startEdit(card) {
    setActionError(null);
    setSuccessMessage(null);
    setEditingId(card.id);
    setEditQuestion(card.question);
    setEditAnswer(card.answer);
    setEditTags(Array.isArray(card.tags) ? card.tags.join(', ') : '');
    setEditError(null);
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
      await loadFlashcards();
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
      await loadFlashcards();
    } catch (err) {
      if (await handleAuthError(err)) return;
      if (err instanceof ApiRequestError && err.code === 'NOT_FOUND') {
        setActionError('Flashcard not found');
        await loadFlashcards();
        return;
      }
      setActionError(err instanceof Error ? err.message : 'Failed to delete flashcard');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <FormCard title="Saved flashcards library">
      <div className="form-row">
        <label htmlFor="global-flashcards-course-filter" className="field">
          Course
          <select
            id="global-flashcards-course-filter"
            value={courseFilter}
            onChange={(e) => handleCourseFilterChange(e.target.value)}
            className="field__select"
            disabled={busy}
          >
            <option value="all">All courses</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </label>

        {showMaterialFilter ? (
          <label htmlFor="global-flashcards-material-filter" className="field">
            Study material
            <select
              id="global-flashcards-material-filter"
              value={materialFilter}
              onChange={(e) => handleMaterialFilterChange(e.target.value)}
              className="field__select"
              disabled={busy || materialsLoading}
            >
              <option value="all">All materials in course</option>
              {materials.map((material) => (
                <option key={material.id} value={material.id}>
                  {material.title}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>

      {loading && <LoadingState message="Loading saved flashcards…" />}

      {error && !loading && (
        <>
          <ErrorMessage message={error} />
          <p className="section__actions">
            <Button
              type="button"
              variant="secondary"
              onClick={() => loadFlashcards()}
              disabled={busy}
            >
              Try again
            </Button>
          </p>
        </>
      )}

      {!loading && !error && flashcards.length === 0 && (
        <p className="plan-block__body">
          No saved flashcards yet. Create or import flashcards from a study material page.
        </p>
      )}

      {!loading && !error && flashcards.length > 0 && (
        <>
          <FlashcardStudy flashcards={studyCards} title="Study filtered cards" />

          <section className="plan-block" aria-label="Manage saved flashcards">
            <h3 className="plan-block__title">Your saved cards</h3>
            <ul className="plan-block__list">
              {flashcards.map((card) =>
                editingId === card.id ? (
                  <li key={card.id} className="plan-block__item">
                    <form onSubmit={handleUpdate} className="form-stack">
                      <Textarea
                        id={`global-flashcard-edit-question-${card.id}`}
                        label="Question"
                        value={editQuestion}
                        onChange={setEditQuestion}
                        rows={3}
                        required
                      />
                      <Textarea
                        id={`global-flashcard-edit-answer-${card.id}`}
                        label="Answer"
                        value={editAnswer}
                        onChange={setEditAnswer}
                        rows={4}
                        required
                      />
                      <Input
                        id={`global-flashcard-edit-tags-${card.id}`}
                        label="Tags (comma-separated, optional)"
                        value={editTags}
                        onChange={setEditTags}
                      />
                      {editError && <ErrorMessage message={editError} />}
                      <div className="form-row">
                        <Button type="submit" variant="primary" disabled={savingEdit || busy}>
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
                  <li key={card.id} className="plan-block__item">
                    <p className="plan-block__body">
                      {truncateFlashcardQuestion(card.question)}
                    </p>
                    {Array.isArray(card.tags) && card.tags.length > 0 ? (
                      <p className="plan-block__meta">Tags: {card.tags.join(', ')}</p>
                    ) : null}
                    <p className="plan-block__meta">
                      Course:{' '}
                      {courseTitleById.has(card.courseId) ? (
                        <Link to={`/courses/${card.courseId}`}>
                          {courseTitleById.get(card.courseId)}
                        </Link>
                      ) : (
                        'Unknown course'
                      )}
                    </p>
                    <p className="plan-block__meta">
                      {card.materialId ? (
                        <>
                          Material:{' '}
                          {materialTitleById.has(card.materialId) ? (
                            <Link to={`/study-materials/${card.materialId}`}>
                              {materialTitleById.get(card.materialId)}
                            </Link>
                          ) : (
                            <Link to={`/study-materials/${card.materialId}`}>
                              View study material
                            </Link>
                          )}
                        </>
                      ) : (
                        'Not linked to a material'
                      )}
                    </p>
                    <div className="form-row">
                      <Button
                        type="button"
                        variant="secondary"
                        disabled={busy || editingId !== null}
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
        </>
      )}

      {successMessage && <p className="plan-panel__status">{successMessage}</p>}
      {actionError && <ErrorMessage message={actionError} />}
    </FormCard>
  );
}
