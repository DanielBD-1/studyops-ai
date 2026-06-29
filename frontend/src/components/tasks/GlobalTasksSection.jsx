import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
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
import {
  resetMaterialFilterForCourseChange,
} from '../../utils/task-filters.js';
import {
  buildTasksPageSearchParams,
  parseTasksPageSearchParams,
  readTasksPageInitialTaskFilters,
  resolveInitialTaskFilters,
} from '../../utils/task-nav-query.js';
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
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { refreshStats } = useDashboardRefresh();
  const skipUrlSyncRef = useRef(false);
  const loadSeqRef = useRef(0);
  const lastUrlCourseRef = useRef(/** @type {string | undefined} */ (undefined));
  const lastLocationSearchRef = useRef(/** @type {string | null} */ (null));

  const initialFilters = useMemo(
    () => readTasksPageInitialTaskFilters(location.search),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- first-render URL snapshot only
    []
  );

  const focusReturnTo = useMemo(() => {
    const query = location.search.startsWith('?') ? location.search.slice(1) : location.search;
    return query ? `/tasks?${query}` : '/tasks';
  }, [location.search]);

  const [tasks, setTasks] = useState(
    /** @type {import('../../services/tasks.service.js').StudyTask[]} */ ([])
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(/** @type {string | null} */ (null));
  const [courseFilter, setCourseFilter] = useState(
    /** @type {'all' | string} */ (initialFilters.courseFilter)
  );
  const [statusFilter, setStatusFilter] = useState(
    /** @type {'all' | 'pending' | 'completed'} */ (initialFilters.statusFilter)
  );
  const [deadlineFilter, setDeadlineFilter] = useState(
    /** @type {'all' | 'overdue' | 'due_today' | 'next_7_days'} */ (initialFilters.deadlineFilter)
  );
  const [materialFilter, setMaterialFilter] = useState(
    /** @type {'all' | 'none' | string} */ (initialFilters.materialFilter)
  );
  const [filterMaterials, setFilterMaterials] = useState(
    /** @type {import('../../services/study-materials.service.js').MaterialSummary[]} */ ([])
  );
  const [loadingFilterMaterials, setLoadingFilterMaterials] = useState(false);
  const [materialsHydration, setMaterialsHydration] = useState(
    /** @type {{ courseId: string | null, status: 'idle' | 'loading' | 'success' | 'error' }} */
    ({ courseId: null, status: 'idle' })
  );
  const [editingTaskId, setEditingTaskId] = useState(/** @type {string | null} */ (null));
  const [editTitle, setEditTitle] = useState('');
  const [editEstimatedMinutes, setEditEstimatedMinutes] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPriority, setEditPriority] = useState(/** @type {'low' | 'medium' | 'high'} */ ('medium'));
  const [editDueDate, setEditDueDate] = useState('');
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
  const [createDueDate, setCreateDueDate] = useState('');
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
    setCreateDueDate('');
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
    setEditDueDate('');
    setEditMaterialId('');
    setEditMaterials([]);
    setEditError(null);
    setLoadingEditMaterials(false);
  }

  /**
   * @param {{
   *   courseFilter?: 'all' | string,
   *   materialFilter?: 'all' | 'none' | string,
   *   statusFilter?: 'all' | 'pending' | 'completed',
   *   deadlineFilter?: 'all' | 'overdue' | 'due_today' | 'next_7_days',
   * }} [overrides]
   */
  const loadTasks = useCallback(
    async (overrides = {}) => {
      const requestSeq = ++loadSeqRef.current;

      /** @returns {boolean} */
      const isStale = () => requestSeq !== loadSeqRef.current;

      setLoading(true);
      setError(null);

      const effectiveCourseFilter = overrides.courseFilter ?? courseFilter;
      const effectiveStatusFilter = overrides.statusFilter ?? statusFilter;
      const effectiveDeadlineFilter = overrides.deadlineFilter ?? deadlineFilter;
      const effectiveMaterialFilter = overrides.materialFilter ?? materialFilter;

      const courseId =
        effectiveCourseFilter !== 'all' &&
        courses.some((c) => c.id === effectiveCourseFilter)
          ? effectiveCourseFilter
          : undefined;
      const hasDeadline =
        effectiveDeadlineFilter === 'overdue' ||
        effectiveDeadlineFilter === 'due_today' ||
        effectiveDeadlineFilter === 'next_7_days';
      const status = hasDeadline
        ? 'pending'
        : effectiveStatusFilter === 'pending' || effectiveStatusFilter === 'completed'
          ? effectiveStatusFilter
          : undefined;
      const deadline = hasDeadline ? effectiveDeadlineFilter : undefined;
      const materialId =
        effectiveMaterialFilter === 'all' ? undefined : effectiveMaterialFilter;

      try {
        const data = await listAllTasks({ courseId, status, deadline, materialId });
        if (isStale()) return;
        setTasks(data.tasks);
      } catch (err) {
        if (isStale()) return;
        if (await handleAuthError(err)) return;
        setError(err instanceof Error ? err.message : 'Failed to load study tasks');
      } finally {
        if (!isStale()) {
          setLoading(false);
        }
      }
    },
    [courseFilter, materialFilter, statusFilter, deadlineFilter, handleAuthError, courses]
  );

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  /**
   * @param {{
   *   courseFilter: 'all' | string,
   *   materialFilter: 'all' | string,
   *   statusFilter: 'all' | 'pending' | 'completed',
   *   deadlineFilter?: 'all' | 'overdue' | 'due_today' | 'next_7_days',
   * }} filters
   * @param {{ replace?: boolean }} [options]
   */
  const pushFiltersToUrl = useCallback(
    (filters, options = {}) => {
      const { replace = false } = options;
      const canonical = buildTasksPageSearchParams(filters);
      const current = searchParams.toString();
      if (canonical === current) {
        return;
      }
      skipUrlSyncRef.current = true;
      setSearchParams(
        canonical ? new URLSearchParams(canonical) : new URLSearchParams(),
        { replace }
      );
    },
    [searchParams, setSearchParams]
  );

  const searchKey = location.search.startsWith('?') ? location.search.slice(1) : location.search;

  useLayoutEffect(() => {
    if (searchKey === lastLocationSearchRef.current) {
      return;
    }

    const previousCourseId = lastLocationSearchRef.current
      ? parseTasksPageSearchParams(`?${lastLocationSearchRef.current}`).courseId
      : undefined;
    const parsed = parseTasksPageSearchParams(location.search);
    const urlCourseId = parsed.courseId;

    if (urlCourseId !== previousCourseId) {
      loadSeqRef.current += 1;
      lastUrlCourseRef.current = urlCourseId;
    }

    lastLocationSearchRef.current = searchKey;

    const nextFilters = readTasksPageInitialTaskFilters(location.search);
    setCourseFilter(nextFilters.courseFilter);
    setMaterialFilter(nextFilters.materialFilter);
    setStatusFilter(nextFilters.statusFilter);
    setDeadlineFilter(nextFilters.deadlineFilter);
  }, [location.search, searchKey]);

  useLayoutEffect(() => {
    if (skipUrlSyncRef.current) {
      skipUrlSyncRef.current = false;
      return;
    }

    if (courses.length === 0) {
      return;
    }

    const parsed = parseTasksPageSearchParams(location.search);
    const courseInUrl = parsed.courseId;
    const materialInUrl = parsed.materialId;

    const hydrationForCourse =
      courseInUrl && materialsHydration.courseId === courseInUrl
        ? materialsHydration.status
        : 'idle';

    const awaitingMaterialMembership =
      courseInUrl &&
      materialInUrl &&
      materialInUrl !== 'none' &&
      hydrationForCourse !== 'success';

    if (awaitingMaterialMembership || (hydrationForCourse === 'error' && materialInUrl && materialInUrl !== 'none')) {
      const courseResolved = resolveInitialTaskFilters({
        courseId: parsed.courseId,
        materialId: undefined,
        status: parsed.status,
        deadline: parsed.deadline,
        courses,
        materials: [],
      });

      setCourseFilter(courseResolved.courseFilter);
      setMaterialFilter(materialInUrl);
      setStatusFilter(courseResolved.statusFilter);
      setDeadlineFilter(courseResolved.deadlineFilter);
      return;
    }

    const resolved = resolveInitialTaskFilters({
      courseId: parsed.courseId,
      materialId: parsed.materialId,
      status: parsed.status,
      deadline: parsed.deadline,
      courses,
      materials: filterMaterials,
    });

    setCourseFilter(resolved.courseFilter);
    setMaterialFilter(resolved.materialFilter);
    setStatusFilter(resolved.statusFilter);
    setDeadlineFilter(resolved.deadlineFilter);

    const canCanonicalize =
      !materialInUrl ||
      materialInUrl === 'none' ||
      hydrationForCourse === 'success' ||
      resolved.materialFilter === 'all';

    if (!canCanonicalize) {
      return;
    }

    const canonical = buildTasksPageSearchParams({
      courseFilter: resolved.courseFilter,
      materialFilter: resolved.materialFilter,
      statusFilter: resolved.statusFilter,
      deadlineFilter: resolved.deadlineFilter,
    });
    const current = searchKey;
    if (canonical !== current) {
      skipUrlSyncRef.current = true;
      setSearchParams(
        canonical ? new URLSearchParams(canonical) : new URLSearchParams(),
        { replace: true }
      );
    }
  }, [
    location.search,
    searchKey,
    courses,
    filterMaterials,
    materialsHydration,
    setSearchParams,
  ]);

  const showMaterialFilter =
    courseFilter !== 'all' && courses.some((c) => c.id === courseFilter);

  useEffect(() => {
    if (!showMaterialFilter) {
      setFilterMaterials([]);
      setLoadingFilterMaterials(false);
      setMaterialsHydration({ courseId: null, status: 'idle' });
      return undefined;
    }

    const targetCourseId = courseFilter;
    let cancelled = false;

    setFilterMaterials([]);
    setMaterialsHydration({ courseId: targetCourseId, status: 'loading' });
    setLoadingFilterMaterials(true);

    async function loadCourseMaterials() {
      try {
        const data = await listMaterials(targetCourseId);
        if (!cancelled) {
          setFilterMaterials(data.materials);
          setMaterialsHydration({ courseId: targetCourseId, status: 'success' });
        }
      } catch (err) {
        if (cancelled) return;
        if (await handleAuthError(err)) return;
        if (!cancelled) {
          setFilterMaterials([]);
          setMaterialsHydration({ courseId: targetCourseId, status: 'error' });
        }
      } finally {
        if (!cancelled) {
          setLoadingFilterMaterials(false);
        }
      }
    }

    loadCourseMaterials();

    return () => {
      cancelled = true;
    };
  }, [courseFilter, showMaterialFilter, handleAuthError, location.search]);

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
    setEditDueDate(task.dueDate ?? '');
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
    const nextMaterial = resetMaterialFilterForCourseChange();
    setCourseFilter(course);
    setMaterialFilter(nextMaterial);
    pushFiltersToUrl({
      courseFilter: course,
      materialFilter: nextMaterial,
      statusFilter,
      deadlineFilter,
    });
  }

  /**
   * @param {'all' | string} material
   */
  function handleMaterialFilterChange(material) {
    cancelCreate();
    cancelEdit();
    setActionError(null);
    setMaterialFilter(material);
    pushFiltersToUrl({
      courseFilter,
      materialFilter: material,
      statusFilter,
      deadlineFilter,
    });
  }

  /**
   * @param {'all' | 'pending' | 'completed'} filter
   */
  function handleStatusFilterChange(filter) {
    cancelCreate();
    cancelEdit();
    setActionError(null);
    const nextDeadlineFilter =
      filter === 'all' || filter === 'completed' ? 'all' : deadlineFilter;
    setStatusFilter(filter);
    setDeadlineFilter(nextDeadlineFilter);
    pushFiltersToUrl({
      courseFilter,
      materialFilter,
      statusFilter: filter,
      deadlineFilter: nextDeadlineFilter,
    });
  }

  /**
   * @param {'all' | 'overdue' | 'due_today' | 'next_7_days'} filter
   */
  function handleDeadlineFilterChange(filter) {
    cancelCreate();
    cancelEdit();
    setActionError(null);
    const nextStatusFilter = filter === 'all' ? statusFilter : 'pending';
    setDeadlineFilter(filter);
    if (filter !== 'all') {
      setStatusFilter('pending');
    }
    pushFiltersToUrl({
      courseFilter,
      materialFilter,
      statusFilter: nextStatusFilter,
      deadlineFilter: filter,
    });
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
      dueDate: createDueDate,
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
     *   materialId?: string,
     *   dueDate?: string
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
    if (parsed.data.dueDate) {
      body.dueDate = parsed.data.dueDate;
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
      pushFiltersToUrl({
        courseFilter: createdCourseId,
        materialFilter,
        statusFilter: nextStatusFilter,
        deadlineFilter,
      });
      await loadTasks({
        courseFilter: createdCourseId,
        statusFilter: nextStatusFilter,
        deadlineFilter,
      });
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
      dueDate: editDueDate,
    });
    if (!parsed.success) {
      setEditError(parsed.error.issues[0]?.message ?? 'Invalid input');
      return;
    }

    /** @type {{ title: string, estimatedMinutes: number, description: string, priority: 'low' | 'medium' | 'high', materialId: string | null, dueDate: string | null }} */
    const body = {
      title: parsed.data.title,
      estimatedMinutes: parsed.data.estimatedMinutes,
      description: parsed.data.description?.trim() ?? '',
      priority: parsed.data.priority ?? editPriority,
      materialId: parsed.data.materialId ?? null,
      dueDate: parsed.data.dueDate ? parsed.data.dueDate : null,
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

  /** @type {Array<{ value: 'all' | 'overdue' | 'due_today' | 'next_7_days', label: string }>} */
  const DEADLINE_FILTERS = [
    { value: 'all', label: 'All deadlines' },
    { value: 'overdue', label: 'Overdue' },
    { value: 'due_today', label: 'Due today' },
    { value: 'next_7_days', label: 'Next 7 days' },
  ];

  const materialTitleById = new Map([
    ...filterMaterials.map((m) => [m.id, m.title]),
    ...editMaterials.map((m) => [m.id, m.title]),
  ]);

  const displayedTasks = tasks;

  const editingTask = tasks.find((t) => t.id === editingTaskId);

  const showGlobalEmpty =
    !loading &&
    !error &&
    tasks.length === 0 &&
    courseFilter === 'all' &&
    statusFilter === 'all' &&
    materialFilter === 'all' &&
    deadlineFilter === 'all';

  const hasMaterialFilter = materialFilter !== 'all';
  const showDeadlineApiEmpty =
    !loading &&
    !error &&
    tasks.length === 0 &&
    !showGlobalEmpty &&
    (deadlineFilter === 'overdue' ||
      deadlineFilter === 'due_today' ||
      deadlineFilter === 'next_7_days') &&
    !hasMaterialFilter;

  const showDeadlineMaterialEmpty =
    !loading &&
    !error &&
    displayedTasks.length === 0 &&
    !showGlobalEmpty &&
    (deadlineFilter === 'overdue' ||
      deadlineFilter === 'due_today' ||
      deadlineFilter === 'next_7_days') &&
    hasMaterialFilter;

  const showFilterEmpty =
    !loading &&
    !error &&
    displayedTasks.length === 0 &&
    !showGlobalEmpty &&
    !showDeadlineApiEmpty &&
    !showDeadlineMaterialEmpty &&
    !(tasks.length === 0 && statusFilter === 'pending' && deadlineFilter === 'all') &&
    !(tasks.length === 0 && statusFilter === 'completed');

  const showUnlinkedFilterEmpty = showFilterEmpty && materialFilter === 'none';
  const showGenericFilterEmpty = showFilterEmpty && materialFilter !== 'none';

  return (
    <section className="section task-workspace__main" aria-label="Study task command">
      <div className="task-workspace__command-band task-workspace__command-band--deck">
        <div className="task-workspace__command-header section__header-row">
          <h2 className="section__title section__title--sm task-workspace__command-title">
            Task command
          </h2>
          <p className="section__subtitle task-workspace__command-subtitle">
            Filter by course and status, then take action on each task
          </p>
        </div>

        <div className="task-workspace__command-controls">
          <div
            className="filter-toolbar filter-toolbar--segmented task-workspace__filters"
            role="group"
            aria-label="Filter study tasks"
          >
            <label htmlFor="global-tasks-course-filter" className="field task-workspace__course-field">
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

            {showMaterialFilter ? (
              <label
                htmlFor="global-tasks-material-filter"
                className="field task-workspace__material-field"
              >
                Study material
                <select
                  id="global-tasks-material-filter"
                  value={materialFilter}
                  onChange={(e) => handleMaterialFilterChange(e.target.value)}
                  className="field__select"
                  disabled={busy || loadingFilterMaterials}
                >
                  <option value="all">All materials in course</option>
                  <option value="none">Tasks without material</option>
                  {materialFilter !== 'all' &&
                  materialFilter !== 'none' &&
                  !filterMaterials.some((material) => material.id === materialFilter) ? (
                    <option value={materialFilter}>Linked material loading…</option>
                  ) : null}
                  {filterMaterials.map((material) => (
                    <option key={material.id} value={material.id}>
                      {material.title}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            <div className="filter-toolbar__segment task-workspace__status-segment">
              {STATUS_FILTERS.map((f) => {
                const selected = statusFilter === f.value;
                return (
                  <button
                    key={f.value}
                    type="button"
                    className={`btn ${selected ? 'btn--primary' : 'btn--secondary'}`.trim()}
                    aria-pressed={selected}
                    onClick={() => handleStatusFilterChange(f.value)}
                    disabled={busy}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>

            <div
              className="filter-toolbar__segment task-workspace__deadline-segment"
              role="group"
              aria-label="Filter tasks by deadline"
            >
              {DEADLINE_FILTERS.map((f) => {
                const selected = deadlineFilter === f.value;
                return (
                  <button
                    key={f.value}
                    type="button"
                    className={`btn ${selected ? 'btn--primary' : 'btn--secondary'}`.trim()}
                    aria-pressed={selected}
                    onClick={() => handleDeadlineFilterChange(f.value)}
                    disabled={busy}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>
          </div>

          {canShowCreate && !showCreate && !loading && !error && (
            <div className="task-workspace__toolbar">
              <Button variant="primary" onClick={openCreateForm} disabled={busy}>
                Add study task
              </Button>
            </div>
          )}
        </div>

        <div className="task-workspace__command-body">
      {showCreate && canShowCreate && (
        <div className="section--compact task-workspace__create">
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
              <Input
                id="global-task-due-date-create"
                label="Due date (optional)"
                type="date"
                value={createDueDate}
                onChange={setCreateDueDate}
              />
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

      {loading && (
        <div className="task-workspace__loading">
          <LoadingState message="Loading study tasks…" />
        </div>
      )}

      {!loading && error && (
        <div className="task-workspace__error-block">
          <ErrorMessage message={error} />
          <div className="task-workspace__error-actions">
            <Button variant="secondary" onClick={loadTasks}>
              Try again
            </Button>
          </div>
        </div>
      )}

      {showGlobalEmpty && courses.length === 0 && (
        <div className="task-workspace__empty">
          <EmptyState
            headline="No study tasks yet"
            description="Add tasks from a course, or create a course first."
            actionLabel="Go to courses"
            onAction={() => navigate('/courses')}
          />
        </div>
      )}

      {showGlobalEmpty && courses.length > 0 && (
        <div className="task-workspace__empty">
          <EmptyState
            headline="No study tasks yet"
            description="Create a study task for one of your courses."
            actionLabel="Add study task"
            onAction={openCreateForm}
          />
        </div>
      )}

      {!loading && !error && tasks.length === 0 && !showGlobalEmpty && statusFilter === 'pending' && deadlineFilter === 'all' && (
        <p className="section__meta task-workspace__filter-empty">No pending tasks.</p>
      )}

      {showDeadlineApiEmpty && deadlineFilter === 'overdue' && (
        <p className="section__meta task-workspace__filter-empty">
          No overdue pending tasks.
        </p>
      )}

      {showDeadlineApiEmpty && deadlineFilter === 'due_today' && (
        <p className="section__meta task-workspace__filter-empty">Nothing due today.</p>
      )}

      {showDeadlineMaterialEmpty && deadlineFilter === 'overdue' && (
        <p className="section__meta task-workspace__filter-empty">
          No overdue pending tasks match the selected filters.
        </p>
      )}

      {showDeadlineMaterialEmpty && deadlineFilter === 'due_today' && (
        <p className="section__meta task-workspace__filter-empty">
          Nothing due today matches the selected filters.
        </p>
      )}

      {!loading && !error && tasks.length === 0 && !showGlobalEmpty && statusFilter === 'completed' && (
        <p className="section__meta task-workspace__filter-empty">No completed tasks.</p>
      )}

      {showDeadlineApiEmpty && deadlineFilter === 'next_7_days' && (
        <p className="section__empty" role="status">
          No pending tasks due in the next 7 days.
        </p>
      )}
      {showDeadlineMaterialEmpty && deadlineFilter === 'next_7_days' && (
        <p className="section__empty" role="status">
          No pending tasks due in the next 7 days match the selected filters.
        </p>
      )}
      {showUnlinkedFilterEmpty && (
        <p className="section__meta task-workspace__filter-empty">
          No tasks without a study material link in this course.
        </p>
      )}

      {showGenericFilterEmpty && (
        <p className="section__meta task-workspace__filter-empty">
          No tasks match the selected filters.
        </p>
      )}

      {!loading && !error && displayedTasks.length > 0 && (
        <div className="task-workspace__list-zone">
          <ul className="card-list task-list task-workspace__list" aria-label="Study tasks">
          {displayedTasks.map((task) =>
            editingTaskId === task.id ? (
              <li key={task.id} className="task-workspace__list-item">
              <FormCard title="Edit study task" className="task-workspace__edit-card">
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
                    <Input
                      id={`global-task-due-date-edit-${task.id}`}
                      label="Due date (optional)"
                      type="date"
                      value={editDueDate}
                      onChange={setEditDueDate}
                    />
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
              </li>
            ) : (
              <li key={task.id} className="task-workspace__list-item">
              <TaskCard
                task={task}
                onEdit={() => startEdit(task)}
                onComplete={() => handleComplete(task.id)}
                onDelete={() => handleDelete(task)}
                editing={editingTaskId !== null}
                completing={completingId === task.id}
                deleting={deletingId === task.id}
                focusReturnTo={focusReturnTo}
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
              </li>
            )
          )}
          </ul>
        </div>
      )}

      {actionError && (
        <div className="task-workspace__action-error">
          <ErrorMessage message={actionError} />
        </div>
      )}
        </div>
      </div>
    </section>
  );
}
