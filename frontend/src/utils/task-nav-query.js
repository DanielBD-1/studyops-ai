import { materialIdSchema } from './validation.js';

const uuidParamSchema = materialIdSchema;

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
 * @param {string} searchString
 * @returns {{ courseId?: string, materialId?: string }}
 */
export function parseTasksPageSearchParams(searchString) {
  const normalized = searchString.startsWith('?') ? searchString.slice(1) : searchString;
  const params = new URLSearchParams(normalized);

  /** @type {{ courseId?: string, materialId?: string }} */
  const result = {};

  const courseId = parseUuidQueryParam(params.get('courseId'));
  if (courseId) {
    result.courseId = courseId;
  }

  const materialId = parseUuidQueryParam(params.get('materialId'));
  if (materialId) {
    result.materialId = materialId;
  }

  return result;
}

/**
 * Resolve initial /tasks filter state from URL query params and loaded ownership lists.
 *
 * @param {{
 *   courseId?: string,
 *   materialId?: string,
 *   courses: { id: string }[],
 *   materials: { id: string }[],
 * }} input
 * @returns {{ courseFilter: 'all' | string, materialFilter: 'all' | string }}
 */
export function resolveInitialTaskFilters({ courseId, materialId, courses, materials }) {
  if (!courseId || !courses.some((course) => course.id === courseId)) {
    return { courseFilter: 'all', materialFilter: 'all' };
  }

  if (!materialId || !materials.some((material) => material.id === materialId)) {
    return { courseFilter: courseId, materialFilter: 'all' };
  }

  return { courseFilter: courseId, materialFilter: materialId };
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
