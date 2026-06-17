import { materialIdSchema } from './validation.js';

const uuidParamSchema = materialIdSchema;

/** @type {readonly ['pending', 'completed']} */
const TASK_STATUS_QUERY_VALUES = ['pending', 'completed'];

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
 * @param {string} searchString
 * @returns {{ courseId?: string, materialId?: string, status?: 'pending' | 'completed' }}
 */
export function parseTasksPageSearchParams(searchString) {
  const normalized = searchString.startsWith('?') ? searchString.slice(1) : searchString;
  const params = new URLSearchParams(normalized);

  /** @type {{ courseId?: string, materialId?: string, status?: 'pending' | 'completed' }} */
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

  return result;
}

/**
 * Build canonical /tasks query string from filter state. Omits default/all values.
 *
 * @param {{
 *   courseFilter?: 'all' | string,
 *   materialFilter?: 'all' | 'none' | string,
 *   statusFilter?: 'all' | 'pending' | 'completed',
 * }} filters
 * @returns {string} Query string without leading "?" (empty when all defaults).
 */
export function buildTasksPageSearchParams({
  courseFilter = 'all',
  materialFilter = 'all',
  statusFilter = 'all',
} = {}) {
  const params = new URLSearchParams();
  const courseId = courseFilter !== 'all' ? courseFilter : undefined;
  const materialId = materialFilter !== 'all' ? materialFilter : undefined;
  const status =
    statusFilter === 'pending' || statusFilter === 'completed' ? statusFilter : undefined;

  if (courseId) {
    params.set('courseId', courseId);
  }

  if (courseId && materialId) {
    params.set('materialId', materialId);
  }

  if (status) {
    params.set('status', status);
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
 *   courses: { id: string }[],
 *   materials: { id: string }[],
 * }} input
 * @returns {{
 *   courseFilter: 'all' | string,
 *   materialFilter: 'all' | 'none' | string,
 *   statusFilter: 'all' | 'pending' | 'completed',
 * }}
 */
export function resolveInitialTaskFilters({ courseId, materialId, status, courses, materials }) {
  const statusFilter =
    status === 'pending' || status === 'completed' ? status : 'all';

  if (!courseId || !courses.some((course) => course.id === courseId)) {
    return { courseFilter: 'all', materialFilter: 'all', statusFilter };
  }

  if (materialId === TASK_MATERIAL_QUERY_NONE) {
    return { courseFilter: courseId, materialFilter: TASK_MATERIAL_QUERY_NONE, statusFilter };
  }

  if (!materialId || !materials.some((material) => material.id === materialId)) {
    return { courseFilter: courseId, materialFilter: 'all', statusFilter };
  }

  return { courseFilter: courseId, materialFilter: materialId, statusFilter };
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
