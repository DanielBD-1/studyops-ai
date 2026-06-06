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

/**
 * Tasks linked to a specific material from an already-loaded course task list.
 *
 * @param {{ materialId?: string | null }[]} tasks
 * @param {string} materialId
 * @param {{ id: string }[]} materials
 * @returns {{ materialId?: string | null }[]}
 */
export function getMaterialLinkedTasks(tasks, materialId, materials) {
  return filterTasksByMaterial(tasks, materialId, materials);
}

/**
 * @param {{ status?: string }[]} tasks
 * @returns {{ total: number, pending: number, completed: number }}
 */
export function summarizeLinkedTaskCounts(tasks) {
  let pending = 0;
  let completed = 0;

  for (const task of tasks) {
    if (task.status === 'completed') {
      completed += 1;
    } else {
      pending += 1;
    }
  }

  return { total: tasks.length, pending, completed };
}

/**
 * Pending tasks first, then completed; capped for compact preview lists.
 *
 * @param {{ status?: string }[]} tasks
 * @param {number} [limit]
 * @returns {{ status?: string }[]}
 */
export function selectLinkedTaskPreview(tasks, limit = 5) {
  if (limit <= 0) {
    return [];
  }

  const pending = [];
  const completed = [];

  for (const task of tasks) {
    if (task.status === 'completed') {
      completed.push(task);
    } else {
      pending.push(task);
    }
  }

  return [...pending, ...completed].slice(0, limit);
}
