import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDashboardRefresh } from '../../context/DashboardContext.jsx';
import { ApiRequestError } from '../../services/courses.service.js';
import {
  createCourseFlashcard,
  deleteFlashcard,
  listFlashcards,
  reviewFlashcard,
  updateFlashcard,
} from '../../services/flashcards.service.js';
import { listMaterials } from '../../services/study-materials.service.js';
import {
  buildCreateFlashcardBody,
  buildUpdateFlashcardBody,
  truncateFlashcardQuestion,
} from '../../utils/flashcard-form.js';
import {
  resetMaterialFilterForCourseChange,
  resolveFlashcardListFilters,
} from '../../utils/flashcard-filters.js';
import FlashcardStudy from '../materials/FlashcardStudy.jsx';
import Button from '../ui/Button.jsx';
import EmptyState from '../ui/EmptyState.jsx';
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
  const navigate = useNavigate();
  const { refreshStats } = useDashboardRefresh();
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

  const [showCreate, setShowCreate] = useState(false);
  const [createCourseId, setCreateCourseId] = useState('');
  const [createMaterialId, setCreateMaterialId] = useState('');
  const [createMaterials, setCreateMaterials] = useState(
    /** @type {import('../../services/study-materials.service.js').MaterialSummary[]} */ ([])
  );
  const [loadingCreateMaterials, setLoadingCreateMaterials] = useState(false);
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

  const courseTitleById = new Map(courses.map((c) => [c.id, c.title]));
  const materialTitleById = new Map(materials.map((m) => [m.id, m.title]));

  const busy = creating || savingEdit || deletingId !== null || reviewing;
  const showMaterialFilter = courseFilter !== 'all' && courses.some((c) => c.id === courseFilter);
  const canShowCreate = courses.length > 0;
  const showGlobalEmpty =
    !loading &&
    !error &&
    flashcards.length === 0 &&
    !showCreate &&
    courseFilter === 'all' &&
    materialFilter === 'all';

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
    setCreateCourseId('');
    setCreateMaterialId('');
    setCreateMaterials([]);
    setCreateQuestion('');
    setCreateAnswer('');
    setCreateTags('');
    setCreateError(null);
    setLoadingCreateMaterials(false);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditQuestion('');
    setEditAnswer('');
    setEditTags('');
    setEditError(null);
  }

  /**
   * @param {{ courseFilter?: 'all' | string, materialFilter?: 'all' | string, materials?: { id: string }[] }} [overrides]
   */
  const loadFlashcards = useCallback(
    async (overrides = {}) => {
      setLoading(true);
      setError(null);

      const effectiveCourseFilter = overrides.courseFilter ?? courseFilter;
      const effectiveMaterialFilter = overrides.materialFilter ?? materialFilter;
      const materialsForFilters = overrides.materials ?? materials;

      const apiFilters = resolveFlashcardListFilters({
        courseFilter: effectiveCourseFilter,
        materialFilter: effectiveMaterialFilter,
        courses,
        materials: materialsForFilters,
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

  useEffect(() => {
    if (!showCreate || !createCourseId || !courses.some((c) => c.id === createCourseId)) {
      setCreateMaterials([]);
      setLoadingCreateMaterials(false);
      return undefined;
    }

    let cancelled = false;

    async function loadCreateCourseMaterials() {
      setLoadingCreateMaterials(true);
      try {
        const data = await listMaterials(createCourseId);
        if (!cancelled) {
          setCreateMaterials(data.materials);
        }
      } catch (err) {
        if (cancelled) return;
        if (await handleAuthError(err)) return;
        setCreateMaterials([]);
        setCreateError('Failed to load study materials for this course');
      } finally {
        if (!cancelled) {
          setLoadingCreateMaterials(false);
        }
      }
    }

    loadCreateCourseMaterials();

    return () => {
      cancelled = true;
    };
  }, [createCourseId, showCreate, courses, handleAuthError]);

  /**
   * @param {'all' | string} course
   */
  function handleCourseFilterChange(course) {
    cancelEdit();
    cancelCreate();
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
    cancelCreate();
    setActionError(null);
    setSuccessMessage(null);
    setMaterialFilter(material);
  }

  function openCreateForm() {
    cancelEdit();
    setActionError(null);
    setSuccessMessage(null);
    setCreateError(null);

    const defaultCourseId =
      courseFilter !== 'all' && courses.some((c) => c.id === courseFilter)
        ? courseFilter
        : '';

    let defaultMaterialId = '';
    if (
      defaultCourseId &&
      materialFilter !== 'all' &&
      materials.some((m) => m.id === materialFilter)
    ) {
      defaultMaterialId = materialFilter;
    }

    setCreateCourseId(defaultCourseId);
    setCreateMaterialId(defaultMaterialId);
    setCreateQuestion('');
    setCreateAnswer('');
    setCreateTags('');
    setShowCreate(true);
  }

  async function handleCreate(event) {
    event.preventDefault();
    setCreateError(null);
    setSuccessMessage(null);

    if (!createCourseId || !courses.some((c) => c.id === createCourseId)) {
      setCreateError('Select a course');
      return;
    }

    if (
      createMaterialId !== '' &&
      !createMaterials.some((m) => m.id === createMaterialId)
    ) {
      setCreateError('Select a valid study material for this course');
      return;
    }

    const materialIdForBody = createMaterialId === '' ? undefined : createMaterialId;
    const built = buildCreateFlashcardBody(
      createQuestion,
      createAnswer,
      createTags,
      materialIdForBody
    );
    if (!built.success) {
      setCreateError(built.error);
      return;
    }

    const createdCourseId = createCourseId;
    const createdMaterialId = built.body.materialId;

    setCreating(true);
    try {
      await createCourseFlashcard(createdCourseId, built.body);
      cancelCreate();
      setSuccessMessage('Flashcard saved.');

      const nextMaterialFilter = createdMaterialId ?? 'all';
      let materialsForFilters = materials;

      if (
        createdCourseId !== courseFilter ||
        (createdMaterialId &&
          !materials.some((m) => m.id === createdMaterialId))
      ) {
        const data = await listMaterials(createdCourseId);
        materialsForFilters = data.materials;
        setMaterials(materialsForFilters);
      }

      setCourseFilter(createdCourseId);
      setMaterialFilter(nextMaterialFilter);

      await loadFlashcards({
        courseFilter: createdCourseId,
        materialFilter: nextMaterialFilter,
        materials: materialsForFilters,
      });
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
      refreshStats();
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
      setFlashcards((prev) =>
        prev.map((card) => (card.id === data.flashcard.id ? data.flashcard : card))
      );
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
    <section className="section flashcards-workspace__main" aria-label="Flashcard library">
      <div className="flashcards-workspace__command-band flashcards-workspace__command-band--deck">
        <div className="flashcards-workspace__command-header section__header-row">
          <h2 className="section__title section__title--sm flashcards-workspace__command-title">
            Flashcard library
          </h2>
          <p className="section__subtitle flashcards-workspace__command-subtitle">
            Filter, study, and manage saved cards
          </p>
        </div>

        <div className="flashcards-workspace__command-controls">
          <div
            className="filter-toolbar flashcards-workspace__filters"
            role="group"
            aria-label="Filter saved flashcards"
          >
            <label
              htmlFor="global-flashcards-course-filter"
              className="field flashcards-workspace__course-field"
            >
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
              <label
                htmlFor="global-flashcards-material-filter"
                className="field flashcards-workspace__material-field"
              >
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

          {canShowCreate && !showCreate && editingId === null && !loading && !error && (
            <div className="flashcards-workspace__toolbar">
              <Button type="button" variant="primary" onClick={openCreateForm} disabled={busy}>
                {flashcards.length === 0 ? 'Create flashcard' : 'Add another flashcard'}
              </Button>
            </div>
          )}
        </div>

        <div className="flashcards-workspace__command-body">
          <FormCard className="flashcard-library">
            <p className="flashcard-library__intro plan-disclaimer">
              Saved flashcards stay in your account across courses. You can also create or import
              cards from a study material page.
            </p>

        {showCreate && canShowCreate && (
          <div className="flashcards-workspace__create">
            <FormCard title="New flashcard">
              <form onSubmit={handleCreate} className="form-stack">
                <label htmlFor="global-flashcard-create-course" className="field">
                  Course
                  <select
                    id="global-flashcard-create-course"
                    value={createCourseId}
                    onChange={(e) => {
                      setCreateCourseId(e.target.value);
                      setCreateMaterialId('');
                      setCreateError(null);
                    }}
                    className="field__select"
                    required
                    disabled={creating || busy}
                  >
                    <option value="">Select a course</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                </label>

                <label htmlFor="global-flashcard-create-material" className="field">
                  Study material
                  <select
                    id="global-flashcard-create-material"
                    value={createMaterialId}
                    onChange={(e) => {
                      setCreateMaterialId(e.target.value);
                      setCreateError(null);
                    }}
                    className="field__select"
                    disabled={
                      !createCourseId || loadingCreateMaterials || creating || busy
                    }
                  >
                    <option value="">Not linked to a material</option>
                    {createMaterials.map((material) => (
                      <option key={material.id} value={material.id}>
                        {material.title}
                      </option>
                    ))}
                  </select>
                </label>

                <Textarea
                  id="global-flashcard-create-question"
                  label="Question"
                  value={createQuestion}
                  onChange={setCreateQuestion}
                  rows={3}
                  required
                />
                <Textarea
                  id="global-flashcard-create-answer"
                  label="Answer"
                  value={createAnswer}
                  onChange={setCreateAnswer}
                  rows={4}
                  required
                />
                <Input
                  id="global-flashcard-create-tags"
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
            </FormCard>
          </div>
        )}

        {loading && (
          <div className="flashcards-workspace__loading">
            <LoadingState message="Loading saved flashcards…" />
          </div>
        )}

        {error && !loading && (
          <div className="flashcards-workspace__error-block">
            <ErrorMessage message={error} />
            <div className="flashcards-workspace__error-actions">
              <Button
                type="button"
                variant="secondary"
                onClick={() => loadFlashcards()}
                disabled={busy}
              >
                Try again
              </Button>
            </div>
          </div>
        )}

        {showGlobalEmpty && courses.length === 0 && (
          <div className="flashcards-workspace__empty">
            <EmptyState
              headline="No saved flashcards yet"
              description="Create a course first, then add flashcards here or from a study material page."
              actionLabel="Go to courses"
              onAction={() => navigate('/courses')}
            />
          </div>
        )}

        {showGlobalEmpty && courses.length > 0 && (
          <div className="flashcards-workspace__empty">
            <EmptyState
              headline="No saved flashcards yet"
              description="Create a flashcard for one of your courses, or add cards from a study material page."
              actionLabel="Create flashcard"
              onAction={openCreateForm}
            />
          </div>
        )}

        {!loading &&
          !error &&
          flashcards.length === 0 &&
          !showGlobalEmpty &&
          !showCreate && (
            <p className="section__meta flashcards-workspace__filter-empty">
              No flashcards match the selected filters.
            </p>
          )}

        {!loading && !error && flashcards.length > 0 && (
          <>
            <div className="flashcards-workspace__study-zone flashcard-library__study">
              <FlashcardStudy
                flashcards={studyCards}
                title="Study filtered cards"
                className="flashcard-study--library"
                onReviewOutcome={handleReviewOutcome}
                reviewing={reviewing}
                reviewError={reviewError}
                reviewSuccessMessage={reviewSuccessMessage}
              />
            </div>

            <section
              className="flashcards-workspace__manage-zone flashcard-library__manage plan-block"
              aria-label="Manage saved flashcards"
            >
              <h3 className="plan-block__title">Your saved cards</h3>
              <ul className="flashcard-library__list plan-block__list flashcards-workspace__list">
                {flashcards.map((card) =>
                  editingId === card.id ? (
                    <li
                      key={card.id}
                      className="plan-block__item flashcard-library__item flashcards-workspace__list-item"
                    >
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
                    <li
                      key={card.id}
                      className="plan-block__item flashcard-library__item flashcards-workspace__list-item"
                    >
                      <p className="plan-block__body flashcard-library__question">
                        {truncateFlashcardQuestion(card.question)}
                      </p>
                      {Array.isArray(card.tags) && card.tags.length > 0 ? (
                        <p className="plan-block__meta">Tags: {card.tags.join(', ')}</p>
                      ) : null}
                      <p className="plan-block__meta flashcard-library__meta">
                        Course:{' '}
                        {courseTitleById.has(card.courseId) ? (
                          <Link to={`/courses/${card.courseId}`}>
                            {courseTitleById.get(card.courseId)}
                          </Link>
                        ) : (
                          'Unknown course'
                        )}
                      </p>
                      <p className="plan-block__meta flashcard-library__meta">
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

            {!showCreate && editingId === null && (
              <p className="section__actions flashcard-library__create-cta">
                <Button type="button" variant="primary" onClick={openCreateForm} disabled={busy}>
                  Add another flashcard
                </Button>
              </p>
            )}
          </>
        )}

        {successMessage && (
          <p className="plan-panel__status plan-panel__status--success">{successMessage}</p>
        )}
          </FormCard>

          {actionError && (
            <div className="flashcards-workspace__action-error">
              <ErrorMessage message={actionError} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
