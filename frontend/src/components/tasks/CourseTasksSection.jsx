import { useCallback, useEffect, useState } from 'react';
import {
  ApiRequestError,
  listCourseTasks,
  createCourseTask,
  updateTask,
  completeTask,
  deleteTask,
} from '../../services/tasks.service.js';
import { createTaskFormSchema, updateTaskFormSchema } from '../../utils/validation.js';
import TaskCard from './TaskCard.jsx';
import Button from '../ui/Button.jsx';
import EmptyState from '../ui/EmptyState.jsx';
import ErrorMessage from '../ui/ErrorMessage.jsx';
import FormCard from '../ui/FormCard.jsx';
import Input from '../ui/Input.jsx';
import LoadingState from '../ui/LoadingState.jsx';
import Textarea from '../ui/Textarea.jsx';

/**
 * @param {{
 *   courseId: string,
 *   handleAuthError: (err: unknown) => Promise<boolean>,
 * }} props
 */
export default function CourseTasksSection({ courseId, handleAuthError }) {
  const [tasks, setTasks] = useState(
    /** @type {import('../../services/tasks.service.js').StudyTask[]} */ ([])
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(/** @type {string | null} */ (null));
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState(/** @type {'low' | 'medium' | 'high'} */ ('medium'));
  const [createError, setCreateError] = useState(/** @type {string | null} */ (null));
  const [creating, setCreating] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(/** @type {string | null} */ (null));
  const [editTitle, setEditTitle] = useState('');
  const [editEstimatedMinutes, setEditEstimatedMinutes] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPriority, setEditPriority] = useState(/** @type {'low' | 'medium' | 'high'} */ ('medium'));
  const [editError, setEditError] = useState(/** @type {string | null} */ (null));
  const [savingEdit, setSavingEdit] = useState(false);
  const [completingId, setCompletingId] = useState(/** @type {string | null} */ (null));
  const [deletingId, setDeletingId] = useState(/** @type {string | null} */ (null));
  const [actionError, setActionError] = useState(/** @type {string | null} */ (null));
  const [statusFilter, setStatusFilter] = useState(
    /** @type {'all' | 'pending' | 'completed'} */ ('all')
  );

  function cancelEdit() {
    setEditingTaskId(null);
    setEditTitle('');
    setEditEstimatedMinutes('');
    setEditDescription('');
    setEditPriority('medium');
    setEditError(null);
  }

  /**
   * @param {import('../../services/tasks.service.js').StudyTask} task
   */
  function startEdit(task) {
    setShowCreate(false);
    setCreateError(null);
    setEditingTaskId(task.id);
    setEditTitle(task.title);
    setEditEstimatedMinutes(String(task.estimatedMinutes));
    setEditDescription(task.description ?? '');
    setEditPriority(task.priority);
    setEditError(null);
    setActionError(null);
  }

  const loadTasks = useCallback(async () => {
    if (!courseId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await listCourseTasks(
        courseId,
        statusFilter === 'all' ? undefined : statusFilter
      );
      setTasks(data.tasks);
    } catch (err) {
      if (await handleAuthError(err)) return;
      if (err instanceof ApiRequestError && err.code === 'NOT_FOUND') {
        setError('Course not found');
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to load study tasks');
    } finally {
      setLoading(false);
    }
  }, [courseId, handleAuthError, statusFilter]);

  /**
   * @param {'all' | 'pending' | 'completed'} filter
   */
  function handleFilterChange(filter) {
    cancelEdit();
    setShowCreate(false);
    setCreateError(null);
    setActionError(null);
    setStatusFilter(filter);
  }

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  async function handleCreate(event) {
    event.preventDefault();
    setCreateError(null);

    const parsed = createTaskFormSchema.safeParse({
      title,
      estimatedMinutes,
      description: description.trim() === '' ? undefined : description,
      priority,
    });
    if (!parsed.success) {
      setCreateError(parsed.error.issues[0]?.message ?? 'Invalid input');
      return;
    }

    /** @type {{ title: string, estimatedMinutes: number, description?: string, priority?: 'low' | 'medium' | 'high' }} */
    const body = {
      title: parsed.data.title,
      estimatedMinutes: parsed.data.estimatedMinutes,
    };
    if (parsed.data.description !== undefined) {
      body.description = parsed.data.description;
    }
    if (parsed.data.priority !== undefined) {
      body.priority = parsed.data.priority;
    }

    setCreating(true);
    try {
      await createCourseTask(courseId, body);
      setTitle('');
      setEstimatedMinutes('');
      setDescription('');
      setPriority('medium');
      setShowCreate(false);
      await loadTasks();
    } catch (err) {
      if (await handleAuthError(err)) return;
      if (err instanceof ApiRequestError && err.code === 'NOT_FOUND') {
        setCreateError('Course not found');
        return;
      }
      setCreateError(err instanceof Error ? err.message : 'Failed to create study task');
    } finally {
      setCreating(false);
    }
  }

  async function handleUpdate(event) {
    event.preventDefault();
    if (!editingTaskId) return;

    setEditError(null);

    const parsed = updateTaskFormSchema.safeParse({
      title: editTitle,
      estimatedMinutes: editEstimatedMinutes,
      description: editDescription,
      priority: editPriority,
    });
    if (!parsed.success) {
      setEditError(parsed.error.issues[0]?.message ?? 'Invalid input');
      return;
    }

    /** @type {{ title: string, estimatedMinutes: number, description: string, priority: 'low' | 'medium' | 'high' }} */
    const body = {
      title: parsed.data.title,
      estimatedMinutes: parsed.data.estimatedMinutes,
      description: parsed.data.description?.trim() ?? '',
      priority: parsed.data.priority ?? editPriority,
    };

    setSavingEdit(true);
    try {
      await updateTask(editingTaskId, body);
      cancelEdit();
      await loadTasks();
    } catch (err) {
      if (await handleAuthError(err)) return;
      if (err instanceof ApiRequestError && err.code === 'NOT_FOUND') {
        setEditError('Task not found');
        return;
      }
      setEditError(err instanceof Error ? err.message : 'Failed to update study task');
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleComplete(taskId) {
    setActionError(null);
    setCompletingId(taskId);
    try {
      await completeTask(taskId);
      await loadTasks();
    } catch (err) {
      if (await handleAuthError(err)) return;
      if (err instanceof ApiRequestError && err.code === 'NOT_FOUND') {
        setActionError('Task not found');
        return;
      }
      setActionError(err instanceof Error ? err.message : 'Failed to complete task');
    } finally {
      setCompletingId(null);
    }
  }

  async function handleDelete(task) {
    const confirmed = window.confirm(`Delete "${task.title}"? This cannot be undone.`);
    if (!confirmed) return;

    setActionError(null);
    setDeletingId(task.id);
    try {
      await deleteTask(task.id);
      await loadTasks();
    } catch (err) {
      if (await handleAuthError(err)) return;
      if (err instanceof ApiRequestError && err.code === 'NOT_FOUND') {
        setActionError('Task not found');
        return;
      }
      setActionError(err instanceof Error ? err.message : 'Failed to delete task');
    } finally {
      setDeletingId(null);
    }
  }

  const busy = creating || savingEdit || completingId !== null || deletingId !== null;

  /** @type {Array<{ value: 'all' | 'pending' | 'completed', label: string }>} */
  const FILTERS = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
  ];

  return (
    <section className="section">
      <h2 className="section__title">Study tasks</h2>

      <div className="form-row">
        {FILTERS.map((f) => (
          <Button
            key={f.value}
            type="button"
            variant={statusFilter === f.value ? 'primary' : 'secondary'}
            onClick={() => handleFilterChange(f.value)}
            disabled={busy}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {loading && <LoadingState message="Loading study tasks…" />}

      {!loading && error && (
        <>
          <ErrorMessage message={error} />
          <Button variant="secondary" onClick={loadTasks}>
            Try again
          </Button>
        </>
      )}

      {!loading && !error && tasks.length === 0 && !showCreate && statusFilter === 'all' && (
        <EmptyState
          headline="No study tasks yet"
          description="Add a manual task to track work for this course."
          actionLabel="Add study task"
          onAction={() => {
            cancelEdit();
            setShowCreate(true);
          }}
        />
      )}

      {!loading && !error && tasks.length === 0 && statusFilter === 'pending' && (
        <p className="section__meta">No pending tasks.</p>
      )}

      {!loading && !error && tasks.length === 0 && statusFilter === 'completed' && (
        <p className="section__meta">No completed tasks.</p>
      )}

      {!loading && !error && tasks.length > 0 && (
        <div className="card-list">
          {tasks.map((task) =>
            editingTaskId === task.id ? (
              <FormCard key={task.id} title="Edit study task">
                <form onSubmit={handleUpdate} className="form-stack">
                  <Input
                    id={`task-title-edit-${task.id}`}
                    label="Title"
                    value={editTitle}
                    onChange={setEditTitle}
                    required
                  />
                  <Input
                    id={`task-estimated-minutes-edit-${task.id}`}
                    label="Estimated minutes"
                    type="number"
                    value={editEstimatedMinutes}
                    onChange={setEditEstimatedMinutes}
                    required
                  />
                  <label htmlFor={`task-priority-edit-${task.id}`} className="field">
                    Priority
                    <select
                      id={`task-priority-edit-${task.id}`}
                      value={editPriority}
                      onChange={(e) =>
                        setEditPriority(/** @type {'low' | 'medium' | 'high'} */ (e.target.value))
                      }
                      className="field__select"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </label>
                  <Textarea
                    id={`task-description-edit-${task.id}`}
                    label="Description (optional)"
                    value={editDescription}
                    onChange={setEditDescription}
                    rows={4}
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
              </FormCard>
            ) : (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={() => startEdit(task)}
                onComplete={() => handleComplete(task.id)}
                onDelete={() => handleDelete(task)}
                editing={editingTaskId !== null}
                completing={completingId === task.id}
                deleting={deletingId === task.id}
                disabled={busy}
              />
            )
          )}
        </div>
      )}

      {actionError && <ErrorMessage message={actionError} />}

      {!loading && !error && tasks.length > 0 && !showCreate && statusFilter === 'all' && (
        <p className="section__actions">
          <Button
            variant="primary"
            onClick={() => {
              cancelEdit();
              setShowCreate(true);
            }}
            disabled={busy}
          >
            Add study task
          </Button>
        </p>
      )}

      {showCreate && statusFilter === 'all' && (
        <div className="section--compact">
          <FormCard title="Add study task">
            <form onSubmit={handleCreate} className="form-stack">
              <Input
                id="task-title-create"
                label="Title"
                value={title}
                onChange={setTitle}
                required
              />
              <Input
                id="task-estimated-minutes-create"
                label="Estimated minutes"
                type="number"
                value={estimatedMinutes}
                onChange={setEstimatedMinutes}
                required
              />
              <label htmlFor="task-priority-create" className="field">
                Priority
                <select
                  id="task-priority-create"
                  value={priority}
                  onChange={(e) =>
                    setPriority(/** @type {'low' | 'medium' | 'high'} */ (e.target.value))
                  }
                  className="field__select"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </label>
              <Textarea
                id="task-description-create"
                label="Description (optional)"
                value={description}
                onChange={setDescription}
                rows={4}
              />
              {createError && <ErrorMessage message={createError} />}
              <div className="form-row">
                <Button type="submit" variant="primary" disabled={creating || busy}>
                  {creating ? 'Creating…' : 'Create study task'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={creating}
                  onClick={() => {
                    setShowCreate(false);
                    setCreateError(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </FormCard>
        </div>
      )}
    </section>
  );
}
