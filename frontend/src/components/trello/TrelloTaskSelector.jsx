import Button from '../ui/Button.jsx';
import EmptyState from '../ui/EmptyState.jsx';
import FormCard from '../ui/FormCard.jsx';
import { TRELLO_SYNC_MAX_TASKS } from '../../utils/trello-sync-validation.js';

/**
 * @param {{
 *   tasks: import('../../services/tasks.service.js').StudyTask[],
 *   courseTitleById: Map<string, string>,
 *   selectedTaskIds: Set<string>,
 *   onToggleTask: (taskId: string) => void,
 *   onSelectAll: () => void,
 *   onClearSelection: () => void,
 *   disabled?: boolean,
 * }} props
 */
export default function TrelloTaskSelector({
  tasks,
  courseTitleById,
  selectedTaskIds,
  onToggleTask,
  onSelectAll,
  onClearSelection,
  disabled = false,
}) {
  const overLimit = selectedTaskIds.size > TRELLO_SYNC_MAX_TASKS;

  return (
    <FormCard>
      <h2 className="form-card__title">Select tasks</h2>
      {tasks.length === 0 ? (
        <EmptyState message="No study tasks yet. Create tasks on a course or the All study tasks page." />
      ) : (
        <>
          <div className="form-actions">
            <Button type="button" variant="secondary" onClick={onSelectAll} disabled={disabled}>
              Select all
            </Button>
            <Button type="button" variant="secondary" onClick={onClearSelection} disabled={disabled}>
              Clear selection
            </Button>
          </div>
          <p className="form-card__hint">
            {selectedTaskIds.size} selected (max {TRELLO_SYNC_MAX_TASKS})
          </p>
          {overLimit && (
            <p className="field__error" role="alert">
              Select at most {TRELLO_SYNC_MAX_TASKS} tasks to sync.
            </p>
          )}
          <ul className="trello-task-list">
            {tasks.map((task) => {
              const courseTitle = courseTitleById.get(task.courseId) ?? 'Unknown course';
              const checked = selectedTaskIds.has(task.id);
              return (
                <li key={task.id} className="trello-task-list__item">
                  <label className="trello-task-list__label">
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={disabled}
                      onChange={() => onToggleTask(task.id)}
                    />
                    <span className="trello-task-list__text">
                      <strong>{task.title}</strong>
                      <span className="trello-task-list__meta">
                        {courseTitle} · {task.status} · {task.priority} priority ·{' '}
                        {task.estimatedMinutes} min
                      </span>
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </FormCard>
  );
}
