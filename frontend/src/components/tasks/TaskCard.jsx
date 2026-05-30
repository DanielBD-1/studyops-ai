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
 *   className?: string,
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
  className,
}) {
  const isCompleted = task.status === 'completed';

  const cardClass = [
    'source-card',
    'source-card--task',
    'task-card',
    isCompleted && 'source-card--completed',
    isCompleted && 'task-card--completed',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const priorityPillClass = [
    'source-card__pill',
    'source-card__pill--priority',
    `source-card__pill--priority-${task.priority}`,
  ].join(' ');

  const focusDisabled = disabled || editing || completing || deleting;

  return (
    <article className={cardClass}>
      <div className="source-card__header task-card__header">
        <span
          className={
            isCompleted
              ? 'source-card__pill source-card__pill--completed'
              : 'source-card__pill source-card__pill--pending'
          }
        >
          {isCompleted ? 'Completed' : 'Pending'}
        </span>
        <span className={priorityPillClass}>{task.priority} priority</span>
      </div>

      <h3 className="source-card__title task-card__title">{task.title}</h3>

      <ul className="source-card__stat-row task-card__stats" aria-label="Task details">
        <li className="source-card__stat">
          <span className="source-card__stat-value">{task.estimatedMinutes}</span>
          <span className="source-card__stat-label">Minutes</span>
        </li>
      </ul>

      <div className="task-card__meta">
        {courseLabel ? (
          <p className="source-card__meta">
            Course:{' '}
            <Link className="source-card__link" to={`/courses/${courseLabel.courseId}`}>
              {courseLabel.title}
            </Link>
          </p>
        ) : task.courseId ? (
          <p className="source-card__meta">Course: unavailable</p>
        ) : null}
        {task.description ? (
          <p className="source-card__meta task-card__description">{task.description}</p>
        ) : null}
        {task.materialId ? (
          <p className="source-card__meta">Material: {materialLabel ?? 'unavailable'}</p>
        ) : null}
      </div>

      <div className="form-row source-card__actions task-card__actions">
        {!isCompleted && (
          <>
            {focusDisabled ? (
              <span className="link-btn link-btn--secondary link-btn--disabled" aria-disabled="true">
                Start Focus
              </span>
            ) : (
              <Link
                className="link-btn link-btn--secondary"
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
              disabled={focusDisabled}
              onClick={onEdit}
            >
              Edit
            </Button>
            <Button
              type="button"
              variant="primary"
              disabled={focusDisabled}
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
