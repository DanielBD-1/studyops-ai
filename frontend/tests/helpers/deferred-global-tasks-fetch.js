import { act } from 'react';
import { ApiRequestError } from '../../src/services/courses.service.js';
import { flushUpdates } from './minimal-browser.js';

/**
 * @typedef {{
 *   path: string,
 *   resolve: (value: unknown) => void,
 *   reject: (err: Error) => void,
 * }} PendingEntry
 */

/**
 * Deferred global task-list fetch mock with FIFO resolve/reject controls per path.
 *
 * @param {{
 *   onUnhandled?: (path: string, init?: RequestInit) => Promise<unknown>,
 * }} [options]
 */
export function createDeferredGlobalTasksFetch(options = {}) {
  /** @type {PendingEntry[]} */
  const pending = [];
  /** @type {string[]} */
  const callOrder = [];

  /**
   * @param {string} path
   * @param {RequestInit} [init]
   */
  async function handler(path, init) {
    if (path.match(/^\/api\/tasks(?:\?.*)?$/)) {
      callOrder.push(path);
      return new Promise((resolve, reject) => {
        pending.push({ path, resolve, reject });
      });
    }

    if (options.onUnhandled) {
      return options.onUnhandled(path, init);
    }

    return {
      success: true,
      data: {},
      meta: { timestamp: '2026-06-21T00:00:00.000Z' },
    };
  }

  /**
   * @param {(entry: PendingEntry) => void} settle
   * @param {string} [path]
   */
  function settleEntry(settle, path) {
    const index =
      path === undefined ? pending.length - 1 : pending.findIndex((entry) => entry.path === path);
    if (index < 0) {
      throw new Error(
        path === undefined
          ? 'No pending deferred task-list requests'
          : `No pending deferred request for path: ${path}`
      );
    }
    const [entry] = pending.splice(index, 1);
    settle(entry);
  }

  return {
    handler,
    /** @returns {string[]} */
    getCallOrder() {
      return [...callOrder];
    },
    /** @returns {string[]} */
    getPendingPaths() {
      return pending.map((entry) => entry.path);
    },
    /**
     * @param {string} path
     * @param {import('../../src/services/tasks.service.js').StudyTask[]} tasks
     */
    resolvePath(path, tasks) {
      settleEntry((entry) => {
        entry.resolve({
          success: true,
          data: { tasks },
          meta: { timestamp: '2026-06-21T00:00:00.000Z' },
        });
      }, path);
    },
    /**
     * @param {string} path
     * @param {string} code
     * @param {string} message
     */
    rejectPath(path, code, message) {
      settleEntry((entry) => {
        entry.reject(new ApiRequestError(code, message));
      }, path);
    },
    /**
     * @param {import('../../src/services/tasks.service.js').StudyTask[]} tasks
     */
    resolveLatest(tasks) {
      let latestPath = '';
      settleEntry((entry) => {
        latestPath = entry.path;
        entry.resolve({
          success: true,
          data: { tasks },
          meta: { timestamp: '2026-06-21T00:00:00.000Z' },
        });
      });
      return latestPath;
    },
    /**
     * @param {string} path
     * @param {import('../../src/services/tasks.service.js').StudyTask[]} tasks
     */
    async resolvePathAndFlush(path, tasks) {
      await act(async () => {
        this.resolvePath(path, tasks);
      });
      await flushUpdates();
      await flushUpdates();
    },
    /**
     * @param {string} path
     * @param {string} code
     * @param {string} message
     */
    async rejectPathAndFlush(path, code, message) {
      await act(async () => {
        this.rejectPath(path, code, message);
      });
      await flushUpdates();
      await flushUpdates();
    },
    /**
     * @param {import('../../src/services/tasks.service.js').StudyTask[]} tasks
     */
    async resolveLatestAndFlush(tasks) {
      let latestPath = '';
      await act(async () => {
        latestPath = this.resolveLatest(tasks);
      });
      await flushUpdates();
      await flushUpdates();
      return latestPath;
    },
  };
}

/**
 * @param {import('./render-global-tasks-section.jsx').GlobalTasksSectionView} view
 * @returns {string[]}
 */
export function getRenderedTaskTitles(view) {
  return [...view.container.querySelectorAll('.task-card__title')].map((el) =>
    el.textContent.trim()
  );
}

/**
 * @param {import('./render-global-tasks-section.jsx').GlobalTasksSectionView} view
 * @returns {boolean}
 */
export function isTasksLoading(view) {
  const status = view.container.querySelector('[role="status"]');
  return Boolean(status?.textContent?.includes('Loading study tasks'));
}

/**
 * @returns {string}
 */
export function unfilteredGlobalTasksPath() {
  return '/api/tasks';
}

/**
 * @param {string} courseId
 * @returns {string}
 */
export function courseOnlyGlobalTasksPath(courseId) {
  return `/api/tasks?courseId=${courseId}`;
}

/**
 * @param {Record<string, string>} params
 * @returns {string}
 */
export function filteredGlobalTasksPath(params) {
  const qs = new URLSearchParams(params).toString();
  return `/api/tasks?${qs}`;
}
