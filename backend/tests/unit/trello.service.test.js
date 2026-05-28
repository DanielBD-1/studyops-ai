import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { applyTestEnv } from '../helpers/testEnv.js';
import { setSupabaseAdminClientForTests } from '../../src/config/supabase.js';
import { setTrelloFetchForTests } from '../../src/clients/trello.client.js';
import {
  createTrelloMockSupabaseClient,
  getMockTasks,
  getMockTrelloSyncLogs,
  resetMockTrelloSyncLogs,
  OWN_TASK_ID,
  OWN_SYNCED_TASK_ID,
  MISSING_TASK_ID,
  TEST_USER_ID,
} from '../helpers/mockSupabaseTrello.js';
import {
  buildTrelloCardDescription,
  syncTasksToTrello,
} from '../../src/modules/trello/trello.service.js';

applyTestEnv();
setSupabaseAdminClientForTests(createTrelloMockSupabaseClient());

describe('trello.service', () => {
  beforeEach(() => {
    resetMockTrelloSyncLogs();
    const own = getMockTasks().find((t) => t.id === OWN_TASK_ID);
    if (own) {
      own.trello_card_id = null;
    }
  });

  afterEach(() => {
    setTrelloFetchForTests(null);
  });

  it('buildTrelloCardDescription appends tags', () => {
    const desc = buildTrelloCardDescription({
      description: 'Read chapter 3',
      tags: ['exam', 'priority'],
    });
    assert.match(desc, /Read chapter 3/);
    assert.match(desc, /Tags: exam, priority/);
  });

  it('skips already synced tasks without calling Trello', async () => {
    let fetchCalls = 0;
    setTrelloFetchForTests(async () => {
      fetchCalls += 1;
      return { ok: true, status: 200, json: async () => ({ id: 'x' }) };
    });

    const data = await syncTasksToTrello(TEST_USER_ID, {
      apiKey: 'k',
      token: 't',
      listId: 'list',
      taskIds: [OWN_SYNCED_TASK_ID],
    });

    assert.equal(fetchCalls, 0);
    assert.equal(data.results[0].status, 'skipped');
    assert.equal(getMockTrelloSyncLogs().length, 1);
    assert.equal(getMockTrelloSyncLogs()[0].status, 'skipped');
    assert.equal(getMockTrelloSyncLogs()[0].error_message, 'Already synced to Trello');
  });

  it('does not insert log for missing task', async () => {
    setTrelloFetchForTests(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ id: 'card' }),
    }));

    const data = await syncTasksToTrello(TEST_USER_ID, {
      apiKey: 'k',
      token: 't',
      listId: 'list',
      taskIds: [MISSING_TASK_ID],
    });

    assert.equal(data.results[0].status, 'failed');
    assert.equal(data.results[0].error, 'Task not found');
    assert.equal(getMockTrelloSyncLogs().length, 0);
  });

  it('updates task and inserts success log', async () => {
    setTrelloFetchForTests(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ id: 'newCard999' }),
    }));

    const data = await syncTasksToTrello(TEST_USER_ID, {
      apiKey: 'k',
      token: 't',
      listId: 'list',
      taskIds: [OWN_TASK_ID],
    });

    assert.equal(data.results[0].status, 'success');
    assert.equal(data.results[0].trelloCardId, 'newCard999');
    const task = getMockTasks().find((t) => t.id === OWN_TASK_ID);
    assert.equal(task?.trello_card_id, 'newCard999');
    assert.equal(getMockTrelloSyncLogs().length, 1);
    const log = getMockTrelloSyncLogs()[0];
    assert.equal(log.status, 'success');
    assert.equal(log.trello_card_id, 'newCard999');
    assert.equal(log.error_message, null);
    assert.equal('apiKey' in log, false);
    assert.equal('token' in log, false);
    assert.equal('listId' in log, false);
  });

  it('short-circuits after Trello auth failure', async () => {
    let fetchCalls = 0;
    setTrelloFetchForTests(async () => {
      fetchCalls += 1;
      return { ok: false, status: 401, json: async () => ({}) };
    });

    const data = await syncTasksToTrello(TEST_USER_ID, {
      apiKey: 'k',
      token: 't',
      listId: 'list',
      taskIds: [OWN_TASK_ID, OWN_SYNCED_TASK_ID],
    });

    assert.equal(fetchCalls, 1);
    const unsyncedResult = data.results.find((r) => r.taskId === OWN_TASK_ID);
    assert.equal(unsyncedResult?.error, 'Trello authentication failed');
    const skippedResult = data.results.find((r) => r.taskId === OWN_SYNCED_TASK_ID);
    assert.equal(skippedResult?.status, 'skipped');
    assert.equal(getMockTrelloSyncLogs().length, 2);
  });

  it('sanitized failure log does not include credentials', async () => {
    setTrelloFetchForTests(async () => ({
      ok: false,
      status: 429,
      json: async () => ({ error: 'rate limit' }),
    }));

    await syncTasksToTrello(TEST_USER_ID, {
      apiKey: 'secret-api-key',
      token: 'secret-token',
      listId: 'manual-list-123',
      taskIds: [OWN_TASK_ID],
    });

    const log = getMockTrelloSyncLogs()[0];
    assert.equal(log.status, 'failed');
    assert.equal(log.error_message, 'Trello rate limit reached');
    assert.equal(String(log.error_message).includes('secret-api-key'), false);
    assert.equal(String(log.error_message).includes('secret-token'), false);
  });
});
