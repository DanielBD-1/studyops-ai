import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useDashboardRefresh } from '../context/DashboardContext.jsx';
import PageHeader from '../components/layout/PageHeader.jsx';
import Button from '../components/ui/Button.jsx';
import ErrorMessage from '../components/ui/ErrorMessage.jsx';
import FormCard from '../components/ui/FormCard.jsx';
import Input from '../components/ui/Input.jsx';
import LoadingState from '../components/ui/LoadingState.jsx';
import Textarea from '../components/ui/Textarea.jsx';
import { ApiRequestError } from '../services/courses.service.js';
import DbFlashcardsSection from '../components/materials/DbFlashcardsSection.jsx';
import GeneratedPlanSection from '../components/materials/GeneratedPlanSection.jsx';
import GeneratedPlanHistorySection from '../components/materials/GeneratedPlanHistorySection.jsx';
import {
  getMaterial,
  updateMaterial,
  deleteMaterial,
  generateMaterial,
  getGeneratedPlan,
  deleteGeneratedPlan,
  listGeneratedPlans,
  importPlanTasks,
  importPlanFlashcards,
} from '../services/study-materials.service.js';
import {
  createCourseFlashcard,
  deleteFlashcard,
  listFlashcards,
  updateFlashcard,
} from '../services/flashcards.service.js';
import {
  isGeneratedPlanNotFound,
  isStudyMaterialNotFound,
} from '../utils/generated-plan-errors.js';
import {
  buildValidatedPlanFlashcardsImportPayload,
  formatPlanFlashcardImportSummaryMessage,
  importPlanFlashcardsFromPlan,
} from '../utils/plan-flashcard-import.js';
import {
  buildValidatedPlanTasksImportPayload,
  buildPlanImportConfirmMessage,
  formatPlanImportSummaryMessage,
  importPlanTasksFromPlan,
} from '../utils/plan-import.js';
import { updateStudyMaterialFormSchema } from '../utils/validation.js';

export default function StudyMaterialDetail() {
  const { materialId } = useParams();
  const { logout } = useAuth();
  const { refreshStats } = useDashboardRefresh();
  const navigate = useNavigate();

  const [material, setMaterial] = useState(
    /** @type {import('../services/study-materials.service.js').MaterialDetail | null} */ (null)
  );
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [sourceType, setSourceType] = useState(/** @type {'manual' | 'paste'} */ ('manual'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(/** @type {string | null} */ (null));
  const [notFound, setNotFound] = useState(false);
  const [saveError, setSaveError] = useState(/** @type {string | null} */ (null));
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(/** @type {string | null} */ (null));
  const [plan, setPlan] = useState(
    /** @type {import('../services/study-materials.service.js').StudyPlan | null} */ (null)
  );
  const [savedAt, setSavedAt] = useState(/** @type {string | null} */ (null));
  const [planHistory, setPlanHistory] = useState(
    /** @type {import('../services/study-materials.service.js').GeneratedPlanHistoryItem[]} */ ([])
  );
  const [planHistoryLoading, setPlanHistoryLoading] = useState(false);
  const [planHistoryError, setPlanHistoryError] = useState(/** @type {string | null} */ (null));
  const [planLoading, setPlanLoading] = useState(false);
  const [planLoadError, setPlanLoadError] = useState(/** @type {string | null} */ (null));
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState(/** @type {string | null} */ (null));
  const [clearing, setClearing] = useState(false);
  const [clearError, setClearError] = useState(/** @type {string | null} */ (null));
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState(/** @type {string | null} */ (null));
  const [importSuccess, setImportSuccess] = useState(/** @type {string | null} */ (null));
  const [importProgress, setImportProgress] = useState(/** @type {string | null} */ (null));
  const [dbFlashcards, setDbFlashcards] = useState(
    /** @type {import('../services/flashcards.service.js').Flashcard[]} */ ([])
  );
  const [dbFlashcardsLoading, setDbFlashcardsLoading] = useState(false);
  const [dbFlashcardsError, setDbFlashcardsError] = useState(/** @type {string | null} */ (null));
  const [importingFlashcards, setImportingFlashcards] = useState(false);
  const [importFlashcardsError, setImportFlashcardsError] = useState(
    /** @type {string | null} */ (null)
  );
  const [importFlashcardsSuccess, setImportFlashcardsSuccess] = useState(
    /** @type {string | null} */ (null)
  );
  const [importFlashcardsProgress, setImportFlashcardsProgress] = useState(
    /** @type {string | null} */ (null)
  );

  const importingAny = importing || importingFlashcards;

  const flashcardsCrudDisabled =
    saving || deleting || generating || clearing || importingAny;

  const hasUnsavedChanges =
    material !== null &&
    (title !== material.title ||
      content !== material.content ||
      sourceType !== (material.sourceType === 'paste' ? 'paste' : 'manual'));

  const generateDisabled =
    loading ||
    planLoading ||
    generating ||
    saving ||
    deleting ||
    importingAny ||
    hasUnsavedChanges;

  const handleAuthError = useCallback(
    async (err) => {
      if (err instanceof ApiRequestError && err.code === 'AUTH_REQUIRED') {
        await logout();
        navigate('/');
        return true;
      }
      return false;
    },
    [logout, navigate]
  );

  const loadSavedPlan = useCallback(async () => {
    if (!materialId) return;

    setPlanLoading(true);
    setPlanLoadError(null);

    try {
      const data = await getGeneratedPlan(materialId);
      setPlan(data.plan);
      setSavedAt(data.savedAt);
    } catch (err) {
      if (await handleAuthError(err)) return;
      if (isGeneratedPlanNotFound(err)) {
        setPlan(null);
        setSavedAt(null);
        return;
      }
      if (isStudyMaterialNotFound(err)) {
        setNotFound(true);
        return;
      }
      setPlanLoadError(
        err instanceof Error ? err.message : 'Failed to load saved study plan'
      );
    } finally {
      setPlanLoading(false);
    }
  }, [materialId, handleAuthError]);

  const loadPlanHistory = useCallback(async () => {
    if (!materialId) return;

    setPlanHistoryLoading(true);
    setPlanHistoryError(null);

    try {
      const data = await listGeneratedPlans(materialId);
      setPlanHistory(data.plans);
    } catch (err) {
      if (await handleAuthError(err)) return;
      if (isStudyMaterialNotFound(err)) {
        setNotFound(true);
        return;
      }
      setPlanHistory([]);
      setPlanHistoryError(
        err instanceof Error ? err.message : 'Failed to load plan history'
      );
    } finally {
      setPlanHistoryLoading(false);
    }
  }, [materialId, handleAuthError]);

  const loadDbFlashcards = useCallback(async () => {
    if (!materialId) return;

    setDbFlashcardsLoading(true);
    setDbFlashcardsError(null);

    try {
      const data = await listFlashcards({ materialId });
      setDbFlashcards(data.flashcards);
    } catch (err) {
      if (await handleAuthError(err)) return;
      setDbFlashcards([]);
      setDbFlashcardsError(
        err instanceof Error ? err.message : 'Failed to load saved flashcards'
      );
    } finally {
      setDbFlashcardsLoading(false);
    }
  }, [materialId, handleAuthError]);

  const loadMaterial = useCallback(async () => {
    if (!materialId) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setNotFound(false);
    setGenerateError(null);
    setPlanLoadError(null);
    setClearError(null);

    try {
      const data = await getMaterial(materialId);
      setMaterial(data.material);
      setTitle(data.material.title);
      setContent(data.material.content);
      setSourceType(
        data.material.sourceType === 'paste' ? 'paste' : 'manual'
      );
      await loadSavedPlan();
      await loadPlanHistory();
      await loadDbFlashcards();
    } catch (err) {
      if (await handleAuthError(err)) return;
      if (err instanceof ApiRequestError && err.code === 'NOT_FOUND') {
        setNotFound(true);
        setPlan(null);
        setSavedAt(null);
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to load study material');
      setPlan(null);
      setSavedAt(null);
    } finally {
      setLoading(false);
    }
  }, [materialId, handleAuthError, loadSavedPlan, loadPlanHistory, loadDbFlashcards]);

  useEffect(() => {
    setPlan(null);
    setSavedAt(null);
    setPlanHistory([]);
    loadMaterial();
  }, [loadMaterial]);

  const handleActivePlanUpdated = useCallback(
    (data) => {
      setPlan(data.plan);
      setSavedAt(data.savedAt);
      setClearError(null);
      setGenerateError(null);
      refreshStats();
    },
    [refreshStats]
  );

  async function handleSave(event) {
    event.preventDefault();
    if (!materialId) return;
    setSaveError(null);

    const parsed = updateStudyMaterialFormSchema.safeParse({
      title,
      content,
      sourceType,
    });
    if (!parsed.success) {
      setSaveError(parsed.error.issues[0]?.message ?? 'Invalid input');
      return;
    }

    setSaving(true);
    try {
      const data = await updateMaterial(materialId, parsed.data);
      setMaterial(data.material);
      setTitle(data.material.title);
      setContent(data.material.content);
      setSourceType(data.material.sourceType === 'paste' ? 'paste' : 'manual');
    } catch (err) {
      if (await handleAuthError(err)) return;
      if (err instanceof ApiRequestError && err.code === 'NOT_FOUND') {
        setNotFound(true);
        return;
      }
      setSaveError(err instanceof Error ? err.message : 'Failed to update study material');
    } finally {
      setSaving(false);
    }
  }

  async function handleGenerate() {
    if (!materialId || generateDisabled) return;

    setGenerateError(null);
    setGenerating(true);
    try {
      const data = await generateMaterial(materialId);
      setPlan(data.plan);
      setSavedAt(data.savedAt);
      setClearError(null);
      refreshStats();
      await loadPlanHistory();
      await loadSavedPlan();
    } catch (err) {
      if (await handleAuthError(err)) return;
      if (err instanceof ApiRequestError && err.code === 'NOT_FOUND') {
        setNotFound(true);
        return;
      }
      setGenerateError(
        err instanceof Error ? err.message : 'Failed to generate study plan'
      );
    } finally {
      setGenerating(false);
    }
  }

  async function handleImportFlashcards() {
    if (!materialId || !material || !plan || importingAny) return;

    const planFlashcards = Array.isArray(plan.flashcards) ? plan.flashcards : [];
    if (planFlashcards.length === 0) return;

    const confirmed = window.confirm(
      buildPlanImportConfirmMessage(planFlashcards.length, 'flashcards')
    );
    if (!confirmed) return;

    setImportFlashcardsError(null);
    setImportFlashcardsSuccess(null);
    setImportFlashcardsProgress(null);

    const validated = buildValidatedPlanFlashcardsImportPayload(plan);
    if (!validated.success) {
      setImportFlashcardsError(validated.error);
      return;
    }

    setImportingFlashcards(true);
    try {
      setImportFlashcardsProgress(`Importing ${validated.flashcards.length} flashcards…`);

      const result = await importPlanFlashcardsFromPlan(
        materialId,
        validated.flashcards,
        importPlanFlashcards
      );

      if (result.success) {
        setImportFlashcardsSuccess(formatPlanFlashcardImportSummaryMessage(result.summary));
        setImportFlashcardsProgress(null);
        await loadDbFlashcards();
        refreshStats();
        return;
      }

      if (await handleAuthError(result.error)) return;

      if (result.summary) {
        setImportFlashcardsError(formatPlanFlashcardImportSummaryMessage(result.summary));
        if (result.summary.imported > 0) {
          await loadDbFlashcards();
          refreshStats();
        }
      } else {
        setImportFlashcardsError(
          result.error instanceof Error
            ? result.error.message
            : 'Failed to import flashcards'
        );
      }
      setImportFlashcardsProgress(null);
    } finally {
      setImportingFlashcards(false);
    }
  }

  async function handleImportPlan() {
    if (!materialId || !material || !plan || importingAny) return;

    const planTasks = Array.isArray(plan.tasks) ? plan.tasks : [];
    if (planTasks.length === 0) return;

    const confirmed = window.confirm(
      buildPlanImportConfirmMessage(planTasks.length, 'tasks')
    );
    if (!confirmed) return;

    setImportError(null);
    setImportSuccess(null);
    setImportProgress(null);

    const validated = buildValidatedPlanTasksImportPayload(plan);
    if (!validated.success) {
      setImportError(validated.error);
      return;
    }

    setImporting(true);
    try {
      setImportProgress(`Importing ${validated.tasks.length} tasks…`);

      const result = await importPlanTasksFromPlan(
        materialId,
        validated.tasks,
        importPlanTasks
      );

      if (result.success) {
        setImportSuccess(formatPlanImportSummaryMessage(result.summary, 'tasks'));
        setImportProgress(null);
        refreshStats();
        return;
      }

      if (await handleAuthError(result.error)) return;

      if (result.summary) {
        setImportError(formatPlanImportSummaryMessage(result.summary, 'tasks'));
        if (result.summary.imported > 0) {
          refreshStats();
        }
      } else {
        setImportError(
          result.error instanceof Error
            ? result.error.message
            : 'Failed to import study tasks'
        );
      }
      setImportProgress(null);
    } finally {
      setImporting(false);
    }
  }

  async function handleClearPlan() {
    if (!materialId || clearing) return;

    setClearError(null);
    setClearing(true);
    try {
      await deleteGeneratedPlan(materialId);
      setPlan(null);
      setSavedAt(null);
      refreshStats();
      await loadPlanHistory();
    } catch (err) {
      if (await handleAuthError(err)) return;
      if (isGeneratedPlanNotFound(err)) {
        setPlan(null);
        setSavedAt(null);
        await loadPlanHistory();
        return;
      }
      if (isStudyMaterialNotFound(err)) {
        setNotFound(true);
        return;
      }
      setClearError(err instanceof Error ? err.message : 'Failed to clear saved plan');
    } finally {
      setClearing(false);
    }
  }

  async function handleDelete() {
    if (!materialId || !material) return;
    const confirmed = window.confirm(
      `Delete "${material.title}"? This cannot be undone.`
    );
    if (!confirmed) return;

    setDeleteError(null);
    setDeleting(true);
    try {
      await deleteMaterial(materialId);
      refreshStats();
      navigate(`/courses/${material.courseId}`);
    } catch (err) {
      if (await handleAuthError(err)) return;
      if (err instanceof ApiRequestError && err.code === 'NOT_FOUND') {
        setNotFound(true);
        return;
      }
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete study material');
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <main className="page page--reading page--material-detail material-workspace">
        <LoadingState message="Loading study material…" />
      </main>
    );
  }

  if (notFound) {
    return (
      <main className="page page--reading page--material-detail material-workspace">
        <h1 className="page__title--tight">Study material not found</h1>
        <p className="not-found__text">This study material may have been deleted.</p>
        <Link to="/courses">Back to courses</Link>
      </main>
    );
  }

  if (error || !material) {
    return (
      <main className="page page--reading page--material-detail material-workspace">
        <ErrorMessage message={error ?? 'Failed to load study material'} />
        <Button variant="secondary" onClick={loadMaterial}>
          Try again
        </Button>
        <p className="section__actions">
          <Link to="/courses">Back to courses</Link>
        </p>
      </main>
    );
  }

  const sourceTypeLabel = sourceType === 'paste' ? 'Pasted text' : 'Manual entry';

  const showPlanSection = planLoading || plan != null || planLoadError != null;

  const planTasks = plan && Array.isArray(plan.tasks) ? plan.tasks : [];
  const planFlashcards = plan && Array.isArray(plan.flashcards) ? plan.flashcards : [];

  const canImportPlan =
    planTasks.length > 0 &&
    !generating &&
    !clearing &&
    !importingAny &&
    !hasUnsavedChanges;

  const canImportFlashcards =
    planFlashcards.length > 0 &&
    !generating &&
    !clearing &&
    !importingAny &&
    !hasUnsavedChanges;

  const historyDisabled =
    saving || deleting || generating || clearing || importingAny || hasUnsavedChanges;

  const showPlanHistorySection =
    planHistoryLoading ||
    planHistoryError != null ||
    (!planHistoryLoading && planHistoryError == null);

  return (
    <main className="page page--reading page--material-detail material-workspace">
      <PageHeader
        intro
        title={material.title}
        lead="Study material workspace"
        note={`Source: ${sourceTypeLabel}. Edit your text, generate an AI study plan, and manage saved flashcards.`}
        backTo={{
          to: `/courses/${material.courseId}`,
          label: '← Back to course',
        }}
      />

      <section className="material-workspace__editor" aria-label="Edit study material">
        <div className="section__header-row">
          <h2 className="section__title">Source document</h2>
          <p className="section__subtitle">Reading and editing workspace</p>
        </div>
        <FormCard title="Edit study material" className="material-workspace__editor-card">
          {hasUnsavedChanges && (
            <p className="material-workspace__unsaved-hint" role="status">
              Unsaved changes
            </p>
          )}
          <form onSubmit={handleSave} className="form-stack material-workspace__editor-form">
            <Input
              id="material-title-edit"
              label="Title"
              value={title}
              onChange={setTitle}
              required
            />
            <label htmlFor="material-source-type" className="field">
              Source type
              <select
                id="material-source-type"
                value={sourceType}
                onChange={(e) =>
                  setSourceType(/** @type {'manual' | 'paste'} */ (e.target.value))
                }
                className="field__select"
              >
                <option value="manual">Manual entry</option>
                <option value="paste">Pasted text</option>
              </select>
            </label>
            <Textarea
              id="material-content-edit"
              label="Study material"
              value={content}
              onChange={setContent}
              rows={12}
              reading
              required
            />
            {saveError && <ErrorMessage message={saveError} />}
            <div className="material-workspace__editor-actions">
              <Button
                type="submit"
                variant="primary"
                disabled={saving || deleting || generating || importingAny}
              >
                {saving ? 'Saving…' : 'Save changes'}
              </Button>
            </div>
          </form>
        </FormCard>
      </section>

      <section
        className="section material-workspace__library"
        aria-labelledby="saved-flashcards-heading"
      >
        <div className="section__header-row">
          <h2 id="saved-flashcards-heading" className="section__title">
            Saved flashcards
          </h2>
          <p className="section__subtitle">Your flashcard library for this material</p>
        </div>
        <DbFlashcardsSection
          courseId={material.courseId}
          materialId={materialId}
          flashcards={dbFlashcards}
          loading={dbFlashcardsLoading}
          error={dbFlashcardsError}
          onRetry={loadDbFlashcards}
          onMutated={loadDbFlashcards}
          createCourseFlashcard={createCourseFlashcard}
          updateFlashcard={updateFlashcard}
          deleteFlashcard={deleteFlashcard}
          handleAuthError={handleAuthError}
          disabled={flashcardsCrudDisabled}
        />
        {importFlashcardsError && (
          <ErrorMessage message={importFlashcardsError} />
        )}
        {importFlashcardsSuccess && (
          <p className="plan-panel__status plan-panel__status--success">
            {importFlashcardsSuccess}
          </p>
        )}
      </section>

      <section
        className="ai-panel material-workspace__generate"
        aria-labelledby="generate-heading"
      >
        <div className="ai-panel__header">
          <h2 id="generate-heading" className="ai-panel__title">
            Generate study plan
          </h2>
          <p className="ai-panel__lead">
            Uses your last saved material to build a summary, tasks, and flashcards.
          </p>
        </div>
        {hasUnsavedChanges && (
          <p className="ai-panel__hint ai-panel__hint--warning" role="status">
            Save changes before generating — generation uses your last saved material.
          </p>
        )}
        {generateError && <ErrorMessage message={generateError} />}
        <div className="ai-panel__actions">
          <Button variant="primary" disabled={generateDisabled} onClick={handleGenerate}>
            {generating ? 'Processing with AI…' : 'Generate study plan'}
          </Button>
        </div>
        {generating && (
          <div className="ai-panel__loading ai-panel__loading--active" aria-live="polite">
            <LoadingState message="Processing with AI…" />
          </div>
        )}
      </section>

      {showPlanSection && (
        <section
          className="section material-workspace__plan"
          aria-labelledby="saved-plan-heading"
        >
          <div className="section__header-row">
            <h2 id="saved-plan-heading" className="section__title">
              Generated study plan
            </h2>
            <p className="section__subtitle">Latest AI output for this material</p>
          </div>
          {planLoading && (
            <p className="plan-panel__status plan-panel__status--loading">
              Loading saved plan…
            </p>
          )}
          {planLoadError && !planLoading && (
            <div className="plan-panel__error">
              <ErrorMessage message={planLoadError} />
              <Button variant="secondary" onClick={loadSavedPlan} disabled={planLoading}>
                Try again
              </Button>
            </div>
          )}
          {plan && !planLoading && (
            <GeneratedPlanSection
              plan={plan}
              savedAt={savedAt}
              onClear={handleClearPlan}
              clearDisabled={generating || saving || deleting || clearing || importingAny}
              clearing={clearing}
              onImport={canImportPlan ? handleImportPlan : undefined}
              importDisabled={
                generating || saving || deleting || clearing || importingAny || hasUnsavedChanges
              }
              importing={importing}
              importProgress={importProgress}
              onImportFlashcards={canImportFlashcards ? handleImportFlashcards : undefined}
              importFlashcardsDisabled={
                generating || saving || deleting || clearing || importingAny || hasUnsavedChanges
              }
              importingFlashcards={importingFlashcards}
              importFlashcardsProgress={importFlashcardsProgress}
            />
          )}
          {importError && plan && !planLoading && (
            <div className="plan-panel__feedback">
              <ErrorMessage message={importError} />
            </div>
          )}
          {importSuccess && plan && !planLoading && (
            <p className="plan-panel__status plan-panel__status--success">
              {importSuccess}{' '}
              <Link to={`/courses/${material.courseId}`}>View tasks on course</Link>
            </p>
          )}
          {clearError && plan && !planLoading && (
            <div className="plan-panel__feedback">
              <ErrorMessage message={clearError} />
            </div>
          )}
        </section>
      )}

      {showPlanHistorySection && (
        <section
          className="section material-workspace__plan-history"
          aria-labelledby="plan-history-heading"
        >
          <div className="section__header-row">
            <h2 id="plan-history-heading" className="section__title">
              Plan history
            </h2>
            <p className="section__subtitle">Previous generated plan versions</p>
          </div>
          <GeneratedPlanHistorySection
            materialId={materialId}
            plans={planHistory}
            loading={planHistoryLoading}
            error={planHistoryError}
            onRetry={loadPlanHistory}
            disabled={historyDisabled}
            onActivated={handleActivePlanUpdated}
            onMutated={loadPlanHistory}
            handleAuthError={handleAuthError}
          />
        </section>
      )}

      <section className="danger-zone material-workspace__danger">
        <h2 className="danger-zone__title">Danger zone</h2>
        {deleteError && <ErrorMessage message={deleteError} />}
        <Button
          variant="danger"
          disabled={saving || deleting || generating || importingAny}
          onClick={handleDelete}
        >
          {deleting ? 'Deleting…' : 'Delete study material'}
        </Button>
      </section>
    </main>
  );
}
