/**
 * @param {string} courseId
 * @param {{ id: string }[]} courses
 */
function courseIdIsOwned(courseId, courses) {
  return courses.some((c) => c.id === courseId);
}

/**
 * @param {string} materialId
 * @param {{ id: string }[]} materials
 */
function materialIdIsOwned(materialId, materials) {
  return materials.some((m) => m.id === materialId);
}

/**
 * Resolves safe listFlashcards query filters from UI state.
 * Only returns courseId/materialId values present in owned course/material lists.
 *
 * @param {{
 *   courseFilter: 'all' | string,
 *   materialFilter: 'all' | string,
 *   courses: { id: string }[],
 *   materials: { id: string }[],
 * }} params
 * @returns {{ courseId?: string, materialId?: string }}
 */
export function resolveFlashcardListFilters({
  courseFilter,
  materialFilter,
  courses,
  materials,
}) {
  if (courseFilter === 'all' || !courseIdIsOwned(courseFilter, courses)) {
    return {};
  }

  /** @type {{ courseId: string, materialId?: string }} */
  const filters = { courseId: courseFilter };

  if (
    materialFilter !== 'all' &&
    materialIdIsOwned(materialFilter, materials)
  ) {
    filters.materialId = materialFilter;
  }

  return filters;
}

/**
 * When the course filter changes, material filter must reset to "all".
 *
 * @returns {'all'}
 */
export function resetMaterialFilterForCourseChange() {
  return 'all';
}
