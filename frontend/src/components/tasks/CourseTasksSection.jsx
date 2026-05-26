import { useCallback, useEffect, useState } from 'react';
import {
  ApiRequestError,
  listCourseTasks,
  createCourseTask,
  completeTask,
  deleteTask,
} from '../../services/tasks.service.js';
import { createTaskFormSchema } from '../../utils/validation.js';
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
  const [completingId, setCompletingId] = useState(/** @type {string | null} */ (null));
  const [deletingId, setDeletingId] = useState(/** @type {string | null} */ (null));
  const [actionError, setActionError] = useState(/** @type {string | null} */ (null));

  const loadTasks = useCallback(async () => {
    if (!courseId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await listCourseTasks(courseId);
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
  }, [courseId, handleAuthError]);

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

  const busy = creating || completingId !== null || deletingId !== null;

  return (
    <section className="section">
      <h2 className="section__title">Study tasks</h2>

      {loading && <LoadingState message="Loading study tasks…" />}

      {!loading && error && (
        <>
          <ErrorMessage message={error} />
          <Button variant="secondary" onClick={loadTasks}>
            Try again
          </Button>
        </>
      )}

      {!loading && !error && tasks.length === 0 && !showCreate && (
        <EmptyState
          headline="No study tasks yet"
          description="Add a manual task to track work for this course."
          actionLabel="Add study task"
          onAction={() => setShowCreate(true)}
        />
      )}

      {!loading && !error && tasks.length > 0 && (
        <div className="card-list">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onComplete={() => handleComplete(task.id)}
              onDelete={() => handleDelete(task)}
              completing={completingId === task.id}
              deleting={deletingId === task.id}
              disabled={busy}
            />
          ))}
        </div>
      )}

      {actionError && <ErrorMessage message={actionError} />}

      {!loading && !error && tasks.length > 0 && !showCreate && (
        <p className="section__actions">
          <Button variant="primary" onClick={() => setShowCreate(true)} disabled={busy}>
            Add study task
          </Button>
        </p>
      )}

      {showCreate && (
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
