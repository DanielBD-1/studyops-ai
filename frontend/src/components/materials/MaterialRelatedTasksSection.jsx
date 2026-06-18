import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ApiRequestError, listCourseTasks } from '../../services/tasks.service.js';
import {
  getMaterialLinkedTasks,
  selectLinkedTaskPreview,
  summarizeLinkedTaskCounts,
} from '../../utils/task-filters.js';
import { buildTasksPageMaterialLink } from '../../utils/task-nav-query.js';
import { getTaskDueDatePresentation } from '../../utils/task-due-date.js';
import Button from '../ui/Button.jsx';
import ErrorMessage from '../ui/ErrorMessage.jsx';
import LoadingState from '../ui/LoadingState.jsx';

const PREVIEW_LIMIT = 5;

/**
 * @param {{
 *   courseId: string,
 *   materialId: string,
 *   materialTitle: string,
 *   handleAuthError: (err: unknown) => Promise<boolean>,
 *   refreshKey?: number,
 * }} props
 */
export default function MaterialRelatedTasksSection({
  courseId,
  materialId,
  materialTitle,
  handleAuthError,
  refreshKey = 0,
}) {
  const [courseTasks, setCourseTasks] = useState(
    /** @type {import('../../services/tasks.service.js').StudyTask[]} */ ([])
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(/** @type {string | null} */ (null));

  const materials = useMemo(
    () => [{ id: materialId, title: materialTitle }],
    [materialId, materialTitle]
  );

  const loadTasks = useCallback(async () => {
    if (!courseId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await listCourseTasks(courseId);
      setCourseTasks(data.tasks);
    } catch (err) {
      if (await handleAuthError(err)) return;
      if (err instanceof ApiRequestError && err.code === 'NOT_FOUND') {
        setError('Course not found');
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to load related tasks');
    } finally {
      setLoading(false);
    }
  }, [courseId, handleAuthError]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks, refreshKey]);

  const linkedTasks = useMemo(
    () => getMaterialLinkedTasks(courseTasks, materialId, materials),
    [courseTasks, materialId, materials]
  );

  const counts = useMemo(() => summarizeLinkedTaskCounts(linkedTasks), [linkedTasks]);
  const previewTasks = useMemo(
    () => selectLinkedTaskPreview(linkedTasks, PREVIEW_LIMIT),
    [linkedTasks]
  );
  const remainingCount = Math.max(0, linkedTasks.length - previewTasks.length);

  return (
    <section
      className="section material-workspace__related-tasks"
      aria-labelledby="related-tasks-heading"
    >
      <div className="section__header-row">
        <h2 id="related-tasks-heading" className="section__title">
          Related study tasks
        </h2>
        <p className="section__subtitle">
          Saved study tasks linked to this material — not the AI plan preview above
        </p>
      </div>

      {loading && (
        <div className="material-related-tasks__loading">
          <LoadingState message="Loading related tasks…" />
        </div>
      )}

      {!loading && error && (
        <div className="material-related-tasks__error">
          <ErrorMessage message={error} />
          <div className="material-related-tasks__error-actions">
            <Button variant="secondary" onClick={loadTasks}>
              Try again
            </Button>
          </div>
        </div>
      )}

      {!loading && !error && linkedTasks.length === 0 && (
        <p className="section__meta material-related-tasks__empty" role="status">
          No study tasks are linked to this material yet. Import tasks from your generated plan
          or add tasks on the course page and link them to this material.
        </p>
      )}

      {!loading && !error && linkedTasks.length > 0 && (
        <div className="material-related-tasks__body">
          <p className="material-related-tasks__counts" role="status">
            {counts.pending} pending · {counts.completed} completed · {counts.total} total
          </p>

          <ul className="material-related-tasks__list" aria-label="Linked study tasks preview">
            {previewTasks.map((task) => {
              const isCompleted = task.status === 'completed';
              const dueDatePresentation = getTaskDueDatePresentation(task);
              return (
                <li key={task.id} className="material-related-tasks__item">
                  <span
                    className={
                      isCompleted
                        ? 'material-related-tasks__status material-related-tasks__status--completed'
                        : 'material-related-tasks__status material-related-tasks__status--pending'
                    }
                  >
                    {isCompleted ? 'Completed' : 'Pending'}
                  </span>
                  <span className="material-related-tasks__title">{task.title}</span>
                  <span className="material-related-tasks__meta">
                    {task.priority} priority · {task.estimatedMinutes} min
                    {dueDatePresentation ? (
                      <>
                        {' · '}
                        <span
                          className={[
                            'material-related-tasks__due-date',
                            dueDatePresentation.variant === 'overdue' &&
                              'material-related-tasks__due-date--overdue',
                            dueDatePresentation.variant === 'completed' &&
                              'material-related-tasks__due-date--completed',
                          ]
                            .filter(Boolean)
                            .join(' ')}
                        >
                          <time dateTime={dueDatePresentation.dateTime}>
                            {dueDatePresentation.label}
                          </time>
                        </span>
                      </>
                    ) : null}
                  </span>
                </li>
              );
            })}
          </ul>

          {remainingCount > 0 && (
            <p className="section__meta material-related-tasks__more">
              {remainingCount} more linked task{remainingCount === 1 ? '' : 's'} on the course
              page.
            </p>
          )}
        </div>
      )}

      {!loading && !error && (
        <p className="section__actions material-related-tasks__course-link">
          <Link to={buildTasksPageMaterialLink(courseId, materialId)}>View linked tasks</Link>
          {' · '}
          <Link to={`/courses/${courseId}`}>View tasks on course</Link>
        </p>
      )}
    </section>
  );
}
