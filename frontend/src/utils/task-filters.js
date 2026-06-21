/**
 * When the course filter changes, material filter must reset to "all".
 *
 * @returns {'all'}
 */
export function resetMaterialFilterForCourseChange() {
  return 'all';
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
