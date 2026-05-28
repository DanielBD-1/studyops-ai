/**
 * @typedef {{
 *   total: number,
 *   success: number,
 *   skipped: number,
 *   failed: number,
 * }} TrelloSyncSummary
 */

/**
 * @typedef {{
 *   taskId: string,
 *   status: 'success' | 'failed' | 'skipped',
 *   trelloCardId: string | null,
 *   error: string | null,
 * }} TrelloSyncResult
 */

/**
 * @param {TrelloSyncSummary} summary
 * @returns {string}
 */
export function buildTrelloSyncSummaryText(summary) {
  return `Synced ${summary.total} task${summary.total === 1 ? '' : 's'} — ${summary.success} succeeded, ${summary.skipped} skipped, ${summary.failed} failed`;
}

/**
 * @param {TrelloSyncResult[]} results
 * @param {Map<string, { title: string }>} taskTitleById
 * @returns {Array<{
 *   taskId: string,
 *   title: string,
 *   status: string,
 *   trelloCardId: string | null,
 *   error: string | null,
 *   statusLabel: string,
 * }>}
 */
export function mapTrelloSyncResultsForDisplay(results, taskTitleById) {
  return results.map((row) => {
    const title = taskTitleById.get(row.taskId)?.title ?? 'Unknown task';
    let statusLabel = 'Failed';
    if (row.status === 'success') {
      statusLabel = 'Success';
    } else if (row.status === 'skipped') {
      statusLabel = 'Skipped';
    }

    return {
      taskId: row.taskId,
      title,
      status: row.status,
      trelloCardId: row.status === 'success' ? row.trelloCardId : null,
      error: row.error,
      statusLabel,
    };
  });
}

/**
 * @param {unknown} value
 * @returns {boolean}
 */
export function trelloSyncDisplayHasNoCredentials(value) {
  if (value === null || value === undefined) {
    return true;
  }
  if (typeof value === 'string') {
    return (
      !value.includes('secret-api-key') &&
      !value.includes('secret-token') &&
      !value.includes('manual-list-123')
    );
  }
  if (typeof value !== 'object') {
    return true;
  }
  const obj = /** @type {Record<string, unknown>} */ (value);
  if ('apiKey' in obj || 'token' in obj || 'listId' in obj) {
    return false;
  }
  return Object.values(obj).every((child) => trelloSyncDisplayHasNoCredentials(child));
}
