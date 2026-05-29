import {
  createTasksMockSupabaseClient,
  OWN_COURSE_ID,
  OWN_TASK_ID,
  OTHER_USER_TASK_ID,
  TEST_USER_ID,
  getMockTasks,
} from './mockSupabaseTasks.js';

export {
  OWN_COURSE_ID,
  OWN_TASK_ID,
  OTHER_USER_TASK_ID,
  TEST_USER_ID,
  getMockTasks,
};

export const OWN_COMPLETED_TASK_ID = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';

/** @type {Array<{
 *   id: string,
 *   user_id: string,
 *   course_id: string,
 *   task_id: string,
 *   duration_minutes: number,
 *   completed_task: boolean,
 *   started_at: string,
 *   ended_at: string | null,
 * }>} */
const focusSessions = [];

let nextFocusSessionNumericId = 1;

/** @type {string | undefined} */
let nextFocusSessionStartedAt;

/**
 * @param {string} iso
 */
export function setNextFocusSessionStartedAt(iso) {
  nextFocusSessionStartedAt = iso;
}

export function clearNextFocusSessionStartedAt() {
  nextFocusSessionStartedAt = undefined;
}

/**
 * @returns {typeof focusSessions}
 */
export function getMockFocusSessions() {
  return focusSessions;
}

export function resetMockFocusSessions() {
  focusSessions.length = 0;
  nextFocusSessionNumericId = 1;
  nextFocusSessionStartedAt = undefined;

  const ownTask = getMockTasks().find((t) => t.id === OWN_TASK_ID);
  if (ownTask) {
    ownTask.status = 'pending';
    ownTask.updated_at = '2026-01-10T00:00:00.000Z';
  }
}

function ensureCompletedOwnTask() {
  const tasks = getMockTasks();
  if (!tasks.some((t) => t.id === OWN_COMPLETED_TASK_ID)) {
    tasks.push({
      id: OWN_COMPLETED_TASK_ID,
      user_id: TEST_USER_ID,
      course_id: OWN_COURSE_ID,
      material_id: null,
      title: 'Completed own task',
      description: '',
      priority: 'medium',
      estimated_minutes: 20,
      difficulty: 'medium',
      tags: [],
      status: 'completed',
      source: 'manual',
      created_at: '2026-01-08T00:00:00.000Z',
      updated_at: '2026-01-12T00:00:00.000Z',
    });
  }
}

/**
 * @param {Record<string, unknown>} state
 */
function resolveFocusSelect(state) {
  let rows = focusSessions.filter((s) => {
    if (state.filters.id && s.id !== state.filters.id) return false;
    if (state.filters.user_id && s.user_id !== state.filters.user_id) return false;
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
function resolveFocusInsert(state) {
  const suffix = String(nextFocusSessionNumericId++).padStart(12, '0');
  const row = {
    id: `11111111-1111-4111-8111-${suffix}`,
    user_id: state.insert.user_id,
    course_id: state.insert.course_id,
    task_id: state.insert.task_id,
    duration_minutes: state.insert.duration_minutes,
    completed_task: state.insert.completed_task ?? false,
    started_at:
      state.insert.started_at ??
      nextFocusSessionStartedAt ??
      new Date().toISOString(),
    ended_at: state.insert.ended_at ?? null,
  };
  nextFocusSessionStartedAt = undefined;
  focusSessions.push(row);
  return { data: row, error: null };
}

/**
 * @param {Record<string, unknown>} state
 */
function resolveFocusUpdate(state) {
  const existing = focusSessions.find(
    (s) => s.id === state.filters.id && s.user_id === state.filters.user_id
  );
  if (!existing) {
    return { data: null, error: { code: 'PGRST116', message: 'not found' } };
  }
  Object.assign(existing, state.update);
  return { data: existing, error: null };
}

function createFocusSessionsBuilder() {
  /** @type {Record<string, unknown>} */
  const state = {
    filters: {},
    single: false,
  };

  const builder = {
    select() {
      return builder;
    },
    insert(row) {
      state.insert = row;
      state.single = true;
      return builder;
    },
    update(row) {
      state.update = row;
      state.single = true;
      return builder;
    },
    eq(column, value) {
      state.filters[column] = value;
      return builder;
    },
    single() {
      state.single = true;
      return builder;
    },
    then(onFulfilled, onRejected) {
      let result;
      if (state.insert) {
        result = resolveFocusInsert(state);
      } else if (state.update) {
        result = resolveFocusUpdate(state);
      } else {
        result = resolveFocusSelect(state);
      }
      return Promise.resolve(result).then(onFulfilled, onRejected);
    },
  };

  return builder;
}

export function createFocusMockSupabaseClient() {
  ensureCompletedOwnTask();
  const base = createTasksMockSupabaseClient();
  const baseFrom = base.from.bind(base);

  return {
    ...base,
    from(table) {
      if (table === 'focus_sessions') {
        return createFocusSessionsBuilder();
      }
      return baseFrom(table);
    },
  };
}
