/**
 * Invalidation-only notifier: no stats storage, no fetch, no logging.
 * Coalesces duplicate refreshStats() calls scheduled before the next microtask flush.
 * @returns {{
 *   refreshStats: () => void,
 *   subscribe: (listener: (generation: number) => void) => () => void,
 *   getGeneration: () => number,
 * }}
 */
export function createDashboardRefreshNotifier() {
  /** @type {Set<(generation: number) => void>} */
  const listeners = new Set();
  let generation = 0;
  let batchScheduled = false;

  function flushNotifications() {
    batchScheduled = false;
    generation += 1;
    const currentGeneration = generation;
    for (const listener of listeners) {
      listener(currentGeneration);
    }
  }

  function refreshStats() {
    if (batchScheduled) {
      return;
    }
    batchScheduled = true;
    queueMicrotask(flushNotifications);
  }

  /**
   * @param {(generation: number) => void} listener
   * @returns {() => void}
   */
  function subscribe(listener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }

  return {
    refreshStats,
    subscribe,
    getGeneration: () => generation,
  };
}
