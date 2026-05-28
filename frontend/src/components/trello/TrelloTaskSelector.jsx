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
          <div className="trello-sync__toolbar">
            <div className="trello-sync__actions">
              <Button type="button" variant="secondary" onClick={onSelectAll} disabled={disabled}>
                Select all
              </Button>
              <Button type="button" variant="secondary" onClick={onClearSelection} disabled={disabled}>
                Clear selection
              </Button>
            </div>
            <p className="trello-sync__selection-count" aria-live="polite">
              <span className="trello-sync__selection-count-value">{selectedTaskIds.size}</span>
              {' '}
              selected · max {TRELLO_SYNC_MAX_TASKS}
            </p>
          </div>
          {overLimit && (
            <p className="field__error trello-sync__limit-error" role="alert">
              Select at most {TRELLO_SYNC_MAX_TASKS} tasks to sync.
            </p>
          )}
          <ul className="trello-task-list">
            {tasks.map((task) => {
              const courseTitle = courseTitleById.get(task.courseId) ?? 'Unknown course';
              const checked = selectedTaskIds.has(task.id);
              return (
                <li key={task.id} className="trello-task-list__item">
                  <label
                    className={`trello-task-list__label${checked ? ' trello-task-list__label--selected' : ''}`}
                  >
                    <input
                      type="checkbox"
                      className="trello-task-list__checkbox"
                      checked={checked}
                      disabled={disabled}
                      onChange={() => onToggleTask(task.id)}
                    />
                    <span className="trello-task-list__content">
                      <span className="trello-task-list__title">{task.title}</span>
                      <span className="trello-task-list__meta">
                        {task.status} · {task.priority} priority · {task.estimatedMinutes} min ·{' '}
                        {courseTitle}
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
