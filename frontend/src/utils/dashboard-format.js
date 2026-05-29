/**
 * @param {number} minutes
 * @returns {string}
 */
export function formatFocusMinutes(minutes) {
  if (!Number.isFinite(minutes) || minutes <= 0) {
    return '0 min';
  }

  const wholeMinutes = Math.floor(minutes);
  if (wholeMinutes === 1) {
    return '1 min';
  }

  if (wholeMinutes < 60) {
    return `${wholeMinutes} min`;
  }

  const hours = Math.floor(wholeMinutes / 60);
  const remainder = wholeMinutes % 60;

  if (remainder === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainder}m`;
}

/**
 * @param {number} completedTasks
 * @param {number} totalTasks
 * @returns {number | null}
 */
export function formatTaskCompletionPercent(completedTasks, totalTasks) {
  if (totalTasks <= 0) {
    return null;
  }

  return Math.round((completedTasks / totalTasks) * 100);
}
