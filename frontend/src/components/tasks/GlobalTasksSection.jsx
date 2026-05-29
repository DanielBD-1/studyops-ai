import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboardRefresh } from '../../context/DashboardContext.jsx';
import {
  ApiRequestError,
  listAllTasks,
  createCourseTask,
  updateTask,
  completeTask,
  deleteTask,
} from '../../services/tasks.service.js';
import { listMaterials } from '../../services/study-materials.service.js';
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
 *   courses: import('../../services/courses.service.js').Course[],
 *   handleAuthError: (err: unknown) => Promise<boolean>,
 * }} props
 */
export default function GlobalTasksSection({ courses, handleAuthError }) {
  const navigate = useNavigate();
  const { refreshStats } = useDashboardRefresh();
  const [tasks, setTasks] = useState(
    /** @type {import('../../services/tasks.service.js').StudyTask[]} */ ([])
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(/** @type {string | null} */ (null));
  const [courseFilter, setCourseFilter] = useState(/** @type {'all' | string} */ ('all'));
  const [statusFilter, setStatusFilter] = useState(
    /** @type {'all' | 'pending' | 'completed'} */ ('all')
  );
  const [editingTaskId, setEditingTaskId] = useState(/** @type {string | null} */ (null));
  const [editTitle, setEditTitle] = useState('');
  const [editEstimatedMinutes, setEditEstimatedMinutes] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPriority, setEditPriority] = useState(/** @type {'low' | 'medium' | 'high'} */ ('medium'));
  const [editMaterialId, setEditMaterialId] = useState('');
  const [editMaterials, setEditMaterials] = useState(
    /** @type {import('../../services/study-materials.service.js').MaterialSummary[]} */ ([])
  );
  const [loadingEditMaterials, setLoadingEditMaterials] = useState(false);
  const [editError, setEditError] = useState(/** @type {string | null} */ (null));
  const [savingEdit, setSavingEdit] = useState(false);
  const [completingId, setCompletingId] = useState(/** @type {string | null} */ (null));
  const [deletingId, setDeletingId] = useState(/** @type {string | null} */ (null));
  const [actionError, setActionError] = useState(/** @type {string | null} */ (null));
  const [showCreate, setShowCreate] = useState(false);
  const [createCourseId, setCreateCourseId] = useState('');
  const [createTitle, setCreateTitle] = useState('');
  const [createEstimatedMinutes, setCreateEstimatedMinutes] = useState('');
  const [createDescription, setCreateDescription] = useState('');
  const [createPriority, setCreatePriority] = useState(
    /** @type {'low' | 'medium' | 'high'} */ ('medium')
  );
  const [createMaterialId, setCreateMaterialId] = useState('');
  const [createMaterials, setCreateMaterials] = useState(
    /** @type {import('../../services/study-materials.service.js').MaterialSummary[]} */ ([])
  );
  const [loadingCreateMaterials, setLoadingCreateMaterials] = useState(false);
  const [createError, setCreateError] = useState(/** @type {string | null} */ (null));
  const [creating, setCreating] = useState(false);

  const courseTitleById = new Map(courses.map((c) => [c.id, c.title]));

  function cancelCreate() {
    setShowCreate(false);
    setCreateCourseId('');
    setCreateTitle('');
    setCreateEstimatedMinutes('');
    setCreateDescription('');
    setCreatePriority('medium');
    setCreateMaterialId('');
    setCreateMaterials([]);
    setCreateError(null);
    setLoadingCreateMaterials(false);
  }

  function cancelEdit() {
    setEditingTaskId(null);
    setEditTitle('');
    setEditEstimatedMinutes('');
    setEditDescription('');
    setEditPriority('medium');
    setEditMaterialId('');
    setEditMaterials([]);
    setEditError(null);
    setLoadingEditMaterials(false);
  }

  /**
   * @param {{ courseFilter?: 'all' | string, statusFilter?: 'all' | 'pending' | 'completed' }} [overrides]
   */
  const loadTasks = useCallback(
    async (overrides = {}) => {
      setLoading(true);
      setError(null);

      const effectiveCourseFilter = overrides.courseFilter ?? courseFilter;
      const effectiveStatusFilter = overrides.statusFilter ?? statusFilter;

      const courseId =
        effectiveCourseFilter !== 'all' &&
        courses.some((c) => c.id === effectiveCourseFilter)
          ? effectiveCourseFilter
          : undefined;
      const status =
        effectiveStatusFilter === 'pending' || effectiveStatusFilter === 'completed'
          ? effectiveStatusFilter
          : undefined;

      try {
        const data = await listAllTasks({ courseId, status });
        setTasks(data.tasks);
      } catch (err) {
        if (await handleAuthError(err)) return;
        setError(err instanceof Error ? err.message : 'Failed to load study tasks');
      } finally {
        setLoading(false);
      }
    },
    [courseFilter, statusFilter, handleAuthError, courses]
  );

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  useEffect(() => {
    if (!showCreate || !createCourseId || !courses.some((c) => c.id === createCourseId)) {
      setCreateMaterials([]);
      return undefined;
    }

    let cancelled = false;

    async function loadCreateMaterials() {
      setLoadingCreateMaterials(true);
      try {
        const data = await listMaterials(createCourseId);
        if (!cancelled) {
          setCreateMaterials(data.materials);
        }
      } catch (err) {
        if (cancelled) return;
        if (await handleAuthError(err)) return;
        setCreateError('Failed to load study materials for this course');
        setCreateMaterials([]);
      } finally {
        if (!cancelled) {
          setLoadingCreateMaterials(false);
        }
      }
    }

    loadCreateMaterials();

    return () => {
      cancelled = true;
    };
  }, [createCourseId, showCreate, courses, handleAuthError]);

  /**
   * @param {import('../../services/tasks.service.js').StudyTask} task
   */
  async function startEdit(task) {
    cancelCreate();
    cancelEdit();
    setActionError(null);
    setEditingTaskId(task.id);
    setEditTitle(task.title);
    setEditEstimatedMinutes(String(task.estimatedMinutes));
    setEditDescription(task.description ?? '');
    setEditPriority(task.priority);
    setEditMaterialId(task.materialId ?? '');
    setLoadingEditMaterials(true);

    try {
      const data = await listMaterials(task.courseId);
      setEditMaterials(data.materials);
    } catch (err) {
      if (await handleAuthError(err)) return;
      setEditError('Failed to load study materials for this course');
    } finally {
      setLoadingEditMaterials(false);
    }
  }

  /**
   * @param {'all' | string} course
   */
  function handleCourseFilterChange(course) {
    cancelCreate();
    cancelEdit();
    setActionError(null);
    setCourseFilter(course);
  }

  /**
   * @param {'all' | 'pending' | 'completed'} filter
   */
  function handleStatusFilterChange(filter) {
    cancelCreate();
    cancelEdit();
    setActionError(null);
    setStatusFilter(filter);
  }

  function openCreateForm() {
    cancelEdit();
    setActionError(null);
    setCreateError(null);
    setCreateCourseId(courseFilter !== 'all' ? courseFilter : '');
    setShowCreate(true);
  }

  async function handleCreate(event) {
    event.preventDefault();
    setCreateError(null);

    if (!createCourseId || !courses.some((c) => c.id === createCourseId)) {
      setCreateError('Select a course');
      return;
    }

    const parsed = createTaskFormSchema.safeParse({
      title: createTitle,
      estimatedMinutes: createEstimatedMinutes,
      description: createDescription.trim() === '' ? undefined : createDescription,
      priority: createPriority,
      materialId: createMaterialId === '' ? undefined : createMaterialId,
    });
    if (!parsed.success) {
      setCreateError(parsed.error.issues[0]?.message ?? 'Invalid input');
      return;
    }

    /** @type {{
     *   title: string,
     *   estimatedMinutes: number,
     *   description?: string,
     *   priority?: 'low' | 'medium' | 'high',
     *   materialId?: string
     * }} */
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
    if (parsed.data.materialId !== undefined) {
      body.materialId = parsed.data.materialId;
    }

    const createdCourseId = createCourseId;

    setCreating(true);
    try {
      await createCourseTask(createdCourseId, body);
      cancelCreate();
      const nextStatusFilter = statusFilter === 'completed' ? 'pending' : statusFilter;
      setCourseFilter(createdCourseId);
      if (statusFilter === 'completed') {
        setStatusFilter('pending');
      }
      await loadTasks({ courseFilter: createdCourseId, statusFilter: nextStatusFilter });
      refreshStats();
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
      materialId: editMaterialId === '' ? null : editMaterialId,
    });
    if (!parsed.success) {
      setEditError(parsed.error.issues[0]?.message ?? 'Invalid input');
      return;
    }

    /** @type {{ title: string, estimatedMinutes: number, description: string, priority: 'low' | 'medium' | 'high', materialId: string | null }} */
    const body = {
      title: parsed.data.title,
      estimatedMinutes: parsed.data.estimatedMinutes,
      description: parsed.data.description?.trim() ?? '',
      priority: parsed.data.priority ?? editPriority,
      materialId: parsed.data.materialId ?? null,
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
      refreshStats();
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
      refreshStats();
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

  const busy =
    creating ||
    savingEdit ||
    completingId !== null ||
    deletingId !== null ||
    loadingEditMaterials ||
    loadingCreateMaterials;

  const canShowCreate = courses.length > 0 && statusFilter !== 'completed';

  /** @type {Array<{ value: 'all' | 'pending' | 'completed', label: string }>} */
  const STATUS_FILTERS = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
  ];

  const materialTitleById = new Map(editMaterials.map((m) => [m.id, m.title]));

  const editingTask = tasks.find((t) => t.id === editingTaskId);

  const showGlobalEmpty =
    !loading &&
    !error &&
    tasks.length === 0 &&
    courseFilter === 'all' &&
    statusFilter === 'all';

  return (
    <section className="section">
      <div className="form-row">
        <label htmlFor="global-tasks-course-filter" className="field">
          Course
          <select
            id="global-tasks-course-filter"
            value={courseFilter}
            onChange={(e) => handleCourseFilterChange(e.target.value)}
            className="field__select"
            disabled={busy}
          >
            <option value="all">All courses</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="form-row">
        {STATUS_FILTERS.map((f) => (
          <Button
            key={f.value}
            type="button"
            variant={statusFilter === f.value ? 'primary' : 'secondary'}
            onClick={() => handleStatusFilterChange(f.value)}
            disabled={busy}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {canShowCreate && !showCreate && !loading && !error && (
        <p className="section__actions">
          <Button variant="primary" onClick={openCreateForm} disabled={busy}>
            Add study task
          </Button>
        </p>
      )}

      {showCreate && canShowCreate && (
        <div className="section--compact">
          <FormCard title="Add study task">
            <form onSubmit={handleCreate} className="form-stack">
              <label htmlFor="global-task-course-create" className="field">
                Course
                <select
                  id="global-task-course-create"
                  value={createCourseId}
                  onChange={(e) => {
                    setCreateCourseId(e.target.value);
                    setCreateMaterialId('');
                    setCreateError(null);
                  }}
                  className="field__select"
                  required
                >
                  <option value="">Select a course</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </label>
              <Input
                id="global-task-title-create"
                label="Title"
                value={createTitle}
                onChange={setCreateTitle}
                required
              />
              <Input
                id="global-task-estimated-minutes-create"
                label="Estimated minutes"
                type="number"
                value={createEstimatedMinutes}
                onChange={setCreateEstimatedMinutes}
                required
              />
              <label htmlFor="global-task-priority-create" className="field">
                Priority
                <select
                  id="global-task-priority-create"
                  value={createPriority}
                  onChange={(e) =>
                    setCreatePriority(/** @type {'low' | 'medium' | 'high'} */ (e.target.value))
                  }
                  className="field__select"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </label>
              <label htmlFor="global-task-material-create" className="field">
                Link to material (optional)
                <select
                  id="global-task-material-create"
                  value={createMaterialId}
                  onChange={(e) => setCreateMaterialId(e.target.value)}
                  className="field__select"
                  disabled={!createCourseId || loadingCreateMaterials}
                >
                  <option value="">None</option>
                  {createMaterials.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title}
                    </option>
                  ))}
                </select>
              </label>
              <Textarea
                id="global-task-description-create"
                label="Description (optional)"
                value={createDescription}
                onChange={setCreateDescription}
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
                  onClick={cancelCreate}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </FormCard>
        </div>
      )}

      {loading && <LoadingState message="Loading study tasks…" />}

      {!loading && error && (
        <>
          <ErrorMessage message={error} />
          <Button variant="secondary" onClick={loadTasks}>
            Try again
          </Button>
        </>
      )}

      {showGlobalEmpty && courses.length === 0 && (
        <EmptyState
          headline="No study tasks yet"
          description="Add tasks from a course, or create a course first."
          actionLabel="Go to courses"
          onAction={() => navigate('/courses')}
        />
      )}

      {showGlobalEmpty && courses.length > 0 && (
        <>
          <EmptyState
            headline="No study tasks yet"
            description="Create a study task for one of your courses."
            actionLabel="Add study task"
            onAction={openCreateForm}
          />
        </>
      )}

      {!loading && !error && tasks.length === 0 && !showGlobalEmpty && statusFilter === 'pending' && (
        <p className="section__meta">No pending tasks.</p>
      )}

      {!loading && !error && tasks.length === 0 && !showGlobalEmpty && statusFilter === 'completed' && (
        <p className="section__meta">No completed tasks.</p>
      )}

      {!loading && !error && tasks.length === 0 && !showGlobalEmpty && statusFilter === 'all' && (
        <p className="section__meta">No tasks match the selected filters.</p>
      )}

      {!loading && !error && tasks.length > 0 && (
        <div className="card-list">
          {tasks.map((task) =>
            editingTaskId === task.id ? (
              <FormCard key={task.id} title="Edit study task">
                {loadingEditMaterials ? (
                  <LoadingState message="Loading study materials…" />
                ) : (
                  <form onSubmit={handleUpdate} className="form-stack">
                    <Input
                      id={`global-task-title-edit-${task.id}`}
                      label="Title"
                      value={editTitle}
                      onChange={setEditTitle}
                      required
                    />
                    <Input
                      id={`global-task-estimated-minutes-edit-${task.id}`}
                      label="Estimated minutes"
                      type="number"
                      value={editEstimatedMinutes}
                      onChange={setEditEstimatedMinutes}
                      required
                    />
                    <label htmlFor={`global-task-priority-edit-${task.id}`} className="field">
                      Priority
                      <select
                        id={`global-task-priority-edit-${task.id}`}
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
                    <label htmlFor={`global-task-material-edit-${task.id}`} className="field">
                      Link to material (optional)
                      <select
                        id={`global-task-material-edit-${task.id}`}
                        value={editMaterialId}
                        onChange={(e) => setEditMaterialId(e.target.value)}
                        className="field__select"
                        disabled={loadingEditMaterials}
                      >
                        <option value="">None</option>
                        {editingTask?.materialId &&
                        !materialTitleById.has(editingTask.materialId) ? (
                          <option value={editingTask.materialId}>
                            Linked material unavailable
                          </option>
                        ) : null}
                        {editMaterials.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.title}
                          </option>
                        ))}
                      </select>
                    </label>
                    <Textarea
                      id={`global-task-description-edit-${task.id}`}
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
                )}
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
                focusReturnTo="/tasks"
                courseLabel={
                  courseTitleById.has(task.courseId)
                    ? { courseId: task.courseId, title: courseTitleById.get(task.courseId) }
                    : null
                }
                materialLabel={
                  task.materialId
                    ? materialTitleById.get(task.materialId) ?? null
                    : null
                }
                disabled={busy}
              />
            )
          )}
        </div>
      )}

      {actionError && <ErrorMessage message={actionError} />}
    </section>
  );
}
