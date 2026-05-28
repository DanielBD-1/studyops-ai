import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildTrelloSyncSummaryText,
  mapTrelloSyncResultsForDisplay,
  trelloSyncDisplayHasNoCredentials,
} from '../../src/utils/trello-sync-results.js';

const TASK_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

describe('trello-sync-results', () => {
  it('buildTrelloSyncSummaryText maps summary counts', () => {
    const text = buildTrelloSyncSummaryText({
      total: 3,
      success: 1,
      skipped: 1,
      failed: 1,
    });
    assert.match(text, /3 tasks/);
    assert.match(text, /1 succeeded/);
    assert.match(text, /1 skipped/);
    assert.match(text, /1 failed/);
  });

  it('mapTrelloSyncResultsForDisplay maps success, skipped, and failed statuses', () => {
    const taskTitleById = new Map([[TASK_ID, { title: 'Read chapter 1' }]]);
    const rows = mapTrelloSyncResultsForDisplay(
      [
        {
          taskId: TASK_ID,
          status: 'success',
          trelloCardId: 'card-abc',
          error: null,
        },
        {
          taskId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
          status: 'skipped',
          trelloCardId: null,
          error: 'Already synced',
        },
        {
          taskId: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
          status: 'failed',
          trelloCardId: null,
          error: 'Trello error',
        },
      ],
      taskTitleById
    );

    assert.equal(rows[0].statusLabel, 'Success');
    assert.equal(rows[0].trelloCardId, 'card-abc');
    assert.equal(rows[1].statusLabel, 'Skipped');
    assert.equal(rows[1].trelloCardId, null);
    assert.equal(rows[2].statusLabel, 'Failed');
    assert.equal(rows[2].error, 'Trello error');
  });

  it('display rows do not include apiKey, token, or listId', () => {
    const rows = mapTrelloSyncResultsForDisplay(
      [
        {
          taskId: TASK_ID,
          status: 'success',
          trelloCardId: 'card-abc',
          error: null,
        },
      ],
      new Map([[TASK_ID, { title: 'Task' }]])
    );

    for (const row of rows) {
      assert.equal(trelloSyncDisplayHasNoCredentials(row), true);
      assert.equal('apiKey' in row, false);
      assert.equal('token' in row, false);
      assert.equal('listId' in row, false);
    }
  });
});
