import assert from 'node:assert/strict';
import {
  createTrelloConnectionMockSupabaseClient,
} from './mockSupabaseTrelloConnection.js';
import {
  createTasksMockSupabaseClient,
  getMockTasks,
  OWN_TASK_ID,
  TEST_USER_ID,
  OWN_COURSE_ID,
} from './mockSupabaseTasks.js';

export { resetMockTrelloConnections, getMockTrelloConnections } from './mockSupabaseTrelloConnection.js';

export {
  TEST_USER_ID,
  OWN_TASK_ID,
  OWN_COURSE_ID,
  getMockTasks,
} from './mockSupabaseTasks.js';

export const OWN_SYNCED_TASK_ID = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
export const MISSING_TASK_ID = '00000000-0000-4000-8000-000000000099';

/** @type {Array<{
 *   user_id: string,
 *   task_id: string,
 *   status: string,
 *   trello_card_id: string | null,
 *   error_message: string | null,
 * }>} */
const syncLogs = [];

/**
 * @returns {typeof syncLogs}
 */
export function getMockTrelloSyncLogs() {
  return syncLogs;
}

export function resetMockTrelloSyncLogs() {
  syncLogs.length = 0;
}

/**
 * @param {typeof syncLogs[number]} row
 */
function recordSyncLog(row) {
  syncLogs.push({ ...row });
}

function ensureSyncedTaskSeed() {
  const tasks = getMockTasks();
  const own = tasks.find((t) => t.id === OWN_TASK_ID);
  if (own && !('trello_card_id' in own)) {
    Object.assign(own, { trello_card_id: null });
  }

  if (!tasks.some((t) => t.id === OWN_SYNCED_TASK_ID)) {
    tasks.push({
      id: OWN_SYNCED_TASK_ID,
      user_id: TEST_USER_ID,
      course_id: OWN_COURSE_ID,
      material_id: null,
      title: 'Already synced task',
      description: 'Synced before',
      priority: 'medium',
      estimated_minutes: 20,
      difficulty: 'medium',
      tags: ['review'],
      status: 'pending',
      source: 'manual',
      trello_card_id: 'existingTrelloCardId123',
      created_at: '2026-01-08T00:00:00.000Z',
      updated_at: '2026-01-08T00:00:00.000Z',
    });
  }
}

ensureSyncedTaskSeed();

/**
 * @param {Record<string, unknown>} state
 */
function resolveTrelloTasksSelect(state) {
  const tasks = getMockTasks();
  let rows = tasks.filter((t) => {
    if (state.filters.user_id && t.user_id !== state.filters.user_id) return false;
    if (state.filters.id && t.id !== state.filters.id) return false;
    if (state.filters.id_in && !state.filters.id_in.includes(t.id)) return false;
    return true;
  });

  if (state.single) {
    if (rows.length === 0) {
      return { data: null, error: { code: 'PGRST116', message: 'not found' } };
    }
    return { data: rows[0], error: null };
  }

  return { data: rows, error: null };
}

/**
 * @param {Record<string, unknown>} state
 */
function resolveTrelloTasksUpdate(state) {
  const tasks = getMockTasks();
  const existing = tasks.find(
    (t) => t.id === state.filters.id && t.user_id === state.filters.user_id
  );
  if (!existing) {
    return { data: null, error: { code: 'PGRST116', message: 'not found' } };
  }
  Object.assign(existing, state.update, {
    updated_at: '2026-01-13T00:00:00.000Z',
  });
  return { data: existing, error: null };
}

function createTrelloTasksBuilder() {
  /** @type {Record<string, unknown>} */
  const state = {
    filters: {},
    single: false,
  };

  const builder = {
    select() {
      return builder;
    },
    update(row) {
      state.update = row;
      return builder;
    },
    eq(column, value) {
      state.filters[column] = value;
      return builder;
    },
    in(column, values) {
      if (column === 'id') {
        state.filters.id_in = values;
      }
      return builder;
    },
    then(onFulfilled, onRejected) {
      let result;
      if (state.update) {
        result = resolveTrelloTasksUpdate(state);
      } else {
        result = resolveTrelloTasksSelect(state);
      }
      return Promise.resolve(result).then(onFulfilled, onRejected);
    },
  };

  return builder;
}

function createTrelloSyncLogsBuilder() {
  /** @type {Record<string, unknown>} */
  const state = {};

  const builder = {
    insert(row) {
      state.insert = row;
      return builder;
    },
    then(onFulfilled, onRejected) {
      if (state.insert) {
        const row = /** @type {typeof syncLogs[number]} */ (state.insert);
        recordSyncLog(row);
        return Promise.resolve({ data: row, error: null }).then(onFulfilled, onRejected);
      }
      return Promise.resolve({ data: null, error: null }).then(onFulfilled, onRejected);
    },
  };

  return builder;
}

export function createTrelloMockSupabaseClient() {
  const base = createTasksMockSupabaseClient();
  const baseFrom = base.from.bind(base);
  const connectionClient = createTrelloConnectionMockSupabaseClient();

  return {
    ...base,
    from(table) {
      if (table === 'study_tasks') {
        return createTrelloTasksBuilder();
      }
      if (table === 'trello_sync_logs') {
        return createTrelloSyncLogsBuilder();
      }
      if (table === 'trello_connections') {
        return connectionClient.from(table);
      }
      return baseFrom(table);
    },
  };
}

/**
 * @param {unknown} value
 * @param {string} [path]
 */
export function assertNoTrelloCredentialsInValue(value, path = 'root') {
  if (value === null || value === undefined) return;
  if (typeof value === 'string') {
    assert.ok(!value.includes('secret-api-key'), `credential leak at ${path}`);
    assert.ok(!value.includes('secret-token'), `credential leak at ${path}`);
    assert.ok(!value.includes('manual-list-123'), `listId leak at ${path}`);
    return;
  }
  if (typeof value !== 'object') return;
  const obj = /** @type {Record<string, unknown>} */ (value);
  assert.equal('apiKey' in obj, false, `apiKey at ${path}`);
  assert.equal('token' in obj, false, `token at ${path}`);
  assert.equal('listId' in obj, false, `listId at ${path}`);
  for (const [key, child] of Object.entries(obj)) {
    assertNoTrelloCredentialsInValue(child, `${path}.${key}`);
  }
}
