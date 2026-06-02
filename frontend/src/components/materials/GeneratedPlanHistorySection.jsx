import { useState } from 'react';
import Button from '../ui/Button.jsx';
import ErrorMessage from '../ui/ErrorMessage.jsx';
import FormCard from '../ui/FormCard.jsx';
import {
  activateGeneratedPlan,
  deleteGeneratedPlanVersion,
  getGeneratedPlanById,
} from '../../services/study-materials.service.js';
import { isActivePlanDeleteConflict } from '../../utils/generated-plan-errors.js';
import {
  formatPlanPreviewMeta,
  getPlanPreviewStats,
  getPlanSummarySnippet,
} from '../../utils/generated-plan-history-preview.js';

/**
 * @param {{
 *   materialId: string,
 *   plans: import('../../services/study-materials.service.js').GeneratedPlanHistoryItem[],
 *   loading?: boolean,
 *   error?: string | null,
 *   onRetry?: () => void,
 *   disabled?: boolean,
 *   onActivated: (data: import('../../services/study-materials.service.js').GeneratedPlanDetail & { planId: string }) => void,
 *   onMutated: () => void | Promise<void>,
 *   handleAuthError: (err: unknown) => Promise<boolean>,
 * }} props
 */
export default function GeneratedPlanHistorySection({
  materialId,
  plans,
  loading = false,
  error = null,
  onRetry,
  disabled = false,
  onActivated,
  onMutated,
  handleAuthError,
}) {
  const [previewPlanId, setPreviewPlanId] = useState(/** @type {string | null} */ (null));
  const [previewPlan, setPreviewPlan] = useState(
    /** @type {import('../../services/study-materials.service.js').StudyPlan | null} */ (null)
  );
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState(/** @type {string | null} */ (null));
  const [activatingPlanId, setActivatingPlanId] = useState(/** @type {string | null} */ (null));
  const [activateError, setActivateError] = useState(/** @type {string | null} */ (null));
  const [deletingPlanId, setDeletingPlanId] = useState(/** @type {string | null} */ (null));
  const [deleteError, setDeleteError] = useState(/** @type {string | null} */ (null));

  function clearPreview() {
    setPreviewPlanId(null);
    setPreviewPlan(null);
    setPreviewError(null);
  }

  async function handlePreview(planId) {
    if (disabled || previewLoading) return;

    if (previewPlanId === planId && previewPlan) {
      clearPreview();
      return;
    }

    setPreviewPlanId(planId);
    setPreviewPlan(null);
    setPreviewError(null);
    setPreviewLoading(true);

    try {
      const data = await getGeneratedPlanById(materialId, planId);
      setPreviewPlan(data.plan);
    } catch (err) {
      if (await handleAuthError(err)) return;
      setPreviewError(err instanceof Error ? err.message : 'Failed to load plan preview');
    } finally {
      setPreviewLoading(false);
    }
  }

  async function handleActivate(planId) {
    if (disabled || activatingPlanId) return;

    setActivateError(null);
    setActivatingPlanId(planId);

    try {
      const data = await activateGeneratedPlan(materialId, planId);
      onActivated(data);
      clearPreview();
      await onMutated();
    } catch (err) {
      if (await handleAuthError(err)) return;
      setActivateError(err instanceof Error ? err.message : 'Failed to restore plan');
    } finally {
      setActivatingPlanId(null);
    }
  }

  async function handleDelete(planId, savedAtLabel) {
    if (disabled || deletingPlanId) return;

    const confirmed = window.confirm(
      `Delete this inactive plan from ${savedAtLabel}? This cannot be undone.`
    );
    if (!confirmed) return;

    setDeleteError(null);
    setDeletingPlanId(planId);

    try {
      await deleteGeneratedPlanVersion(materialId, planId);
      if (previewPlanId === planId) {
        clearPreview();
      }
      await onMutated();
    } catch (err) {
      if (await handleAuthError(err)) return;
      if (isActivePlanDeleteConflict(err)) {
        setDeleteError('Cannot delete the active plan. Clear the active plan first.');
      } else {
        setDeleteError(err instanceof Error ? err.message : 'Failed to delete plan version');
      }
    } finally {
      setDeletingPlanId(null);
    }
  }

  if (loading) {
    return (
      <FormCard className="plan-history">
        <p className="plan-panel__status plan-panel__status--loading plan-history__status">
          Loading plan history…
        </p>
      </FormCard>
    );
  }

  if (error) {
    return (
      <FormCard className="plan-history">
        <div className="plan-panel__error plan-history__error">
          <ErrorMessage message={error} />
          {onRetry ? (
            <Button variant="secondary" onClick={onRetry} disabled={disabled}>
              Try again
            </Button>
          ) : null}
        </div>
      </FormCard>
    );
  }

  if (plans.length === 0) {
    return (
      <FormCard className="plan-history">
        <p className="plan-panel__status plan-history__empty" role="status">
          No saved plan versions yet. Generate a study plan to create one.
        </p>
      </FormCard>
    );
  }

  const previewStats = previewPlan ? getPlanPreviewStats(previewPlan) : null;
  const previewSnippet = previewPlan ? getPlanSummarySnippet(previewPlan) : '';

  return (
    <FormCard className="plan-history plan-history--compact">
      <p className="plan-disclaimer plan-history__intro">
        Previous generated plans for this material. Only metadata is listed until you preview an
        inactive version.
      </p>
      <ul className="plan-history__list" aria-label="Generated plan versions">
        {plans.map((item) => {
          const savedAtLabel = new Date(item.savedAt).toLocaleString();
          const isPreviewOpen = previewPlanId === item.planId;
          const rowBusy =
            activatingPlanId === item.planId ||
            deletingPlanId === item.planId ||
            (isPreviewOpen && previewLoading);

          return (
            <li
              key={item.planId}
              className={`plan-history__item${item.isActive ? ' plan-history__item--active' : ''}`}
            >
              <div className="plan-history__header">
                <div className="plan-history__meta">
                  <p className="plan-history__title">Generated plan version</p>
                  <p className="plan-block__meta plan-history__timestamps">
                    Saved {savedAtLabel}
                  </p>
                  <p className="plan-block__meta plan-history__timestamps">
                    Created {new Date(item.createdAt).toLocaleString()}
                  </p>
                </div>
                {item.isActive ? (
                  <span className="plan-history__badge plan-history__badge--active">Active</span>
                ) : (
                  <span className="plan-history__badge plan-history__badge--inactive">
                    Previous version
                  </span>
                )}
              </div>

              {!item.isActive ? (
                <div className="plan-history__actions">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => handlePreview(item.planId)}
                    disabled={disabled || rowBusy}
                  >
                    {isPreviewOpen && previewPlan ? 'Hide preview' : 'Preview'}
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    className="plan-history__action--activate"
                    onClick={() => handleActivate(item.planId)}
                    disabled={disabled || rowBusy}
                  >
                    {activatingPlanId === item.planId ? 'Restoring…' : 'Make active'}
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    onClick={() => handleDelete(item.planId, savedAtLabel)}
                    disabled={disabled || rowBusy}
                  >
                    {deletingPlanId === item.planId ? 'Deleting…' : 'Delete'}
                  </Button>
                </div>
              ) : (
                <p className="plan-panel__status">Currently shown in the generated study plan above.</p>
              )}

              {!item.isActive && isPreviewOpen ? (
                <div className="plan-history__preview plan-history__preview-panel" aria-live="polite">
                  {previewLoading ? (
                    <p className="plan-panel__status plan-panel__status--loading">
                      Loading preview…
                    </p>
                  ) : null}
                  {previewError ? <ErrorMessage message={previewError} /> : null}
                  {previewPlan && previewStats ? (
                    <>
                      {previewSnippet ? (
                        <p className="plan-block__body plan-history__preview-summary">
                          {previewSnippet}
                        </p>
                      ) : null}
                      <p className="plan-block__meta plan-history__preview-meta">
                        {formatPlanPreviewMeta(previewStats)}
                      </p>
                    </>
                  ) : null}
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
      {activateError ? <ErrorMessage message={activateError} /> : null}
      {deleteError ? <ErrorMessage message={deleteError} /> : null}
    </FormCard>
  );
}
