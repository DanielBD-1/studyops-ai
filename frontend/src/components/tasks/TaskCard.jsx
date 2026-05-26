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
  disabled,
}) {
  const isCompleted = task.status === 'completed';

  return (
    <article className="source-card">
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
      <div className="form-row">
        {!isCompleted && (
          <>
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
