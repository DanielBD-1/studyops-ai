/**
 * @param {string} materialId
 * @param {{ id: string }[]} materials
 */
function materialIdIsOwned(materialId, materials) {
  return materials.some((m) => m.id === materialId);
}

/**
 * Client-side material filter for task lists already loaded from the API.
 * Unknown or unowned material ids are ignored (returns the full task list).
 *
 * @param {{ materialId?: string | null }[]} tasks
 * @param {'all' | string} materialFilter
 * @param {{ id: string }[]} [materials]
 * @returns {{ materialId?: string | null }[]}
 */
export function filterTasksByMaterial(tasks, materialFilter, materials = []) {
  if (materialFilter === 'all') {
    return tasks;
  }

  if (!materialIdIsOwned(materialFilter, materials)) {
    return tasks;
  }

  return tasks.filter((task) => task.materialId === materialFilter);
}

/**
 * When the course filter changes, material filter must reset to "all".
 *
 * @returns {'all'}
 */
export function resetMaterialFilterForCourseChange() {
  return 'all';
}
