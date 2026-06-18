import { materialIdSchema } from './validation.js';

const uuidParamSchema = materialIdSchema;

/** @type {readonly ['pending', 'completed']} */
const TASK_STATUS_QUERY_VALUES = ['pending', 'completed'];

/** @type {readonly ['overdue', 'due_today']} */
const TASK_DEADLINE_QUERY_VALUES = ['overdue', 'due_today'];

/** @type {'none'} */
const TASK_MATERIAL_QUERY_NONE = 'none';

/**
 * @param {string | null} value
 * @returns {string | undefined}
 */
function parseUuidQueryParam(value) {
  if (value == null || value.trim() === '') {
    return undefined;
  }

  const parsed = uuidParamSchema.safeParse(value.trim());
  return parsed.success ? parsed.data : undefined;
}

/**
 * @param {string | null} value
 * @returns {'pending' | 'completed' | undefined}
 */
function parseStatusQueryParam(value) {
  if (value == null || value.trim() === '') {
    return undefined;
  }

  const trimmed = value.trim();
  return TASK_STATUS_QUERY_VALUES.includes(trimmed) ? trimmed : undefined;
}

/**
 * @param {string | null} value
 * @returns {'overdue' | 'due_today' | undefined}
 */
function parseDeadlineQueryParam(value) {
  if (value == null || value.trim() === '') {
    return undefined;
  }

  const trimmed = value.trim();
  return TASK_DEADLINE_QUERY_VALUES.includes(trimmed) ? trimmed : undefined;
}

/**
 * @param {string} searchString
 * @returns {{
 *   courseId?: string,
 *   materialId?: string,
 *   status?: 'pending' | 'completed',
 *   deadline?: 'overdue' | 'due_today',
 * }}
 */
export function parseTasksPageSearchParams(searchString) {
  const normalized = searchString.startsWith('?') ? searchString.slice(1) : searchString;
  const params = new URLSearchParams(normalized);

  /** @type {{
   *   courseId?: string,
   *   materialId?: string,
   *   status?: 'pending' | 'completed',
   *   deadline?: 'overdue' | 'due_today',
   * }} */
  const result = {};

  const courseId = parseUuidQueryParam(params.get('courseId'));
  if (courseId) {
    result.courseId = courseId;
  }

  const rawMaterialId = params.get('materialId');
  if (rawMaterialId != null && rawMaterialId.trim() === TASK_MATERIAL_QUERY_NONE) {
    result.materialId = TASK_MATERIAL_QUERY_NONE;
  } else {
    const materialId = parseUuidQueryParam(rawMaterialId);
    if (materialId) {
      result.materialId = materialId;
    }
  }

  const status = parseStatusQueryParam(params.get('status'));
  if (status) {
    result.status = status;
  }

  const deadline = parseDeadlineQueryParam(params.get('deadline'));
  if (deadline) {
    result.deadline = deadline;
  }

  return result;
}

/**
 * Build canonical /tasks query string from filter state. Omits default/all values.
 *
 * @param {{
 *   courseFilter?: 'all' | string,
 *   materialFilter?: 'all' | 'none' | string,
 *   statusFilter?: 'all' | 'pending' | 'completed',
 *   deadlineFilter?: 'all' | 'overdue' | 'due_today',
 * }} filters
 * @returns {string} Query string without leading "?" (empty when all defaults).
 */
export function buildTasksPageSearchParams({
  courseFilter = 'all',
  materialFilter = 'all',
  statusFilter = 'all',
  deadlineFilter = 'all',
} = {}) {
  const params = new URLSearchParams();
  const courseId = courseFilter !== 'all' ? courseFilter : undefined;
  const materialId = materialFilter !== 'all' ? materialFilter : undefined;
  const hasDeadline =
    (deadlineFilter === 'overdue' || deadlineFilter === 'due_today') &&
    statusFilter !== 'completed';
  const status = hasDeadline
    ? 'pending'
    : statusFilter === 'pending' || statusFilter === 'completed'
      ? statusFilter
      : undefined;

  if (courseId) {
    params.set('courseId', courseId);
  }

  if (courseId && materialId) {
    params.set('materialId', materialId);
  }

  if (status) {
    params.set('status', status);
  }

  if (hasDeadline) {
    params.set('deadline', deadlineFilter);
  }

  return params.toString();
}

/**
 * Resolve /tasks filter state from URL query params and loaded ownership lists.
 *
 * @param {{
 *   courseId?: string,
 *   materialId?: string,
 *   status?: 'pending' | 'completed',
 *   deadline?: 'overdue' | 'due_today',
 *   courses: { id: string }[],
 *   materials: { id: string }[],
 * }} input
 * @returns {{
 *   courseFilter: 'all' | string,
 *   materialFilter: 'all' | 'none' | string,
 *   statusFilter: 'all' | 'pending' | 'completed',
 *   deadlineFilter: 'all' | 'overdue' | 'due_today',
 * }}
 */
export function resolveInitialTaskFilters({
  courseId,
  materialId,
  status,
  deadline,
  courses,
  materials,
}) {
  const deadlineFilter =
    deadline === 'overdue' || deadline === 'due_today' ? deadline : 'all';

  let statusFilter = status === 'pending' || status === 'completed' ? status : 'all';
  let resolvedDeadlineFilter = deadlineFilter;

  if (resolvedDeadlineFilter !== 'all' && statusFilter === 'completed') {
    resolvedDeadlineFilter = 'all';
  } else if (resolvedDeadlineFilter !== 'all') {
    statusFilter = 'pending';
  }

  if (!courseId || !courses.some((course) => course.id === courseId)) {
    return {
      courseFilter: 'all',
      materialFilter: 'all',
      statusFilter,
      deadlineFilter: resolvedDeadlineFilter,
    };
  }

  if (materialId === TASK_MATERIAL_QUERY_NONE) {
    return {
      courseFilter: courseId,
      materialFilter: TASK_MATERIAL_QUERY_NONE,
      statusFilter,
      deadlineFilter: resolvedDeadlineFilter,
    };
  }

  if (!materialId || !materials.some((material) => material.id === materialId)) {
    return {
      courseFilter: courseId,
      materialFilter: 'all',
      statusFilter,
      deadlineFilter: resolvedDeadlineFilter,
    };
  }

  return {
    courseFilter: courseId,
    materialFilter: materialId,
    statusFilter,
    deadlineFilter: resolvedDeadlineFilter,
  };
}

/**
 * @param {string} courseId
 * @param {string} materialId
 * @returns {string}
 */
export function buildTasksPageMaterialLink(courseId, materialId) {
  const params = new URLSearchParams();
  params.set('courseId', courseId);
  params.set('materialId', materialId);
  return `/tasks?${params.toString()}`;
}

/**
 * @returns {string}
 */
export function buildTasksPagePendingLink() {
  const qs = buildTasksPageSearchParams({ statusFilter: 'pending' });
  return `/tasks?${qs}`;
}

/**
 * @returns {string}
 */
export function buildTasksPageOverdueLink() {
  return '/tasks?status=pending&deadline=overdue';
}

/**
 * @returns {string}
 */
export function buildTasksPageDueTodayLink() {
  return '/tasks?status=pending&deadline=due_today';
}

/**
 * @param {string} courseId
 * @returns {string}
 */
export function buildTasksPageCoursePendingLink(courseId) {
  const qs = buildTasksPageSearchParams({
    courseFilter: courseId,
    statusFilter: 'pending',
  });
  return `/tasks?${qs}`;
}
