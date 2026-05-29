import { Link } from 'react-router-dom';
import Button from '../ui/Button.jsx';

/**
 * @param {{
 *   task: import('../../services/tasks.service.js').StudyTask,
 *   onEdit: () => void,
 *   onComplete: () => void,
 *   onDelete: () => void,
 *   editing: boolean,
 *   completing: boolean,
 *   deleting: boolean,
 *   materialLabel: string | null,
 *   courseLabel?: { courseId: string, title: string } | null,
 *   focusReturnTo?: string | null,
 *   disabled: boolean,
 * }} props
 */
export default function TaskCard({
  task,
  onEdit,
  onComplete,
  onDelete,
  editing,
  completing,
  deleting,
  materialLabel,
  courseLabel,
  focusReturnTo,
  disabled,
}) {
  const isCompleted = task.status === 'completed';

  const cardClass = [
    'source-card',
    'source-card--task',
    isCompleted && 'source-card--completed',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <article className={cardClass}>
      <h3 className="source-card__title">{task.title}</h3>
      {courseLabel ? (
        <p className="source-card__meta">
          Course:{' '}
          <Link to={`/courses/${courseLabel.courseId}`}>{courseLabel.title}</Link>
        </p>
      ) : task.courseId ? (
        <p className="source-card__meta">Course: unavailable</p>
      ) : null}
      {isCompleted && <p className="source-card__meta">Status: Completed</p>}
      {task.description ? (
        <p className="source-card__meta">{task.description}</p>
      ) : null}
      {task.materialId ? (
        <p className="source-card__meta">Material: {materialLabel ?? 'unavailable'}</p>
      ) : null}
      <p className="source-card__meta">
        Priority: {task.priority} · {task.estimatedMinutes} min
      </p>
      <div className="form-row source-card__actions">
        {!isCompleted && (
          <>
            {disabled || editing || completing || deleting ? (
              <span aria-disabled="true">Start Focus</span>
            ) : (
              <Link
                to={`/focus/${task.id}`}
                state={{
                  taskTitle: task.title,
                  courseId: task.courseId,
                  returnTo: focusReturnTo ?? '/tasks',
                }}
              >
                Start Focus
              </Link>
            )}
            <Button
              type="button"
              variant="secondary"
              disabled={disabled || editing || completing || deleting}
              onClick={onEdit}
            >
              Edit
            </Button>
            <Button
              type="button"
              variant="primary"
              disabled={disabled || editing || completing || deleting}
              onClick={onComplete}
            >
              {completing ? 'Completing…' : 'Mark complete'}
            </Button>
          </>
        )}
        <Button
          type="button"
          variant="danger"
          disabled={disabled || completing || deleting}
          onClick={onDelete}
        >
          {deleting ? 'Deleting…' : 'Delete'}
        </Button>
      </div>
    </article>
  );
}
