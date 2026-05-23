import {
  createStudyMaterialsMockSupabaseClient,
  TEST_USER_ID,
  OWN_COURSE_ID,
  OTHER_USER_COURSE_ID,
  OWN_MATERIAL_ID,
  OTHER_USER_MATERIAL_ID,
} from './mockSupabaseStudyMaterials.js';

export {
  TEST_USER_ID,
  OWN_COURSE_ID,
  OTHER_USER_COURSE_ID,
  OWN_MATERIAL_ID,
  OTHER_USER_MATERIAL_ID,
};

export const OWN_TASK_ID = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';
export const OTHER_USER_TASK_ID = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee';

/** @type {string | null} */
let lastStudyTasksSelectColumns = null;

/** @type {string | null} */
let lastStudyMaterialsSelectColumns = null;

/**
 * @returns {string | null}
 */
export function getLastStudyTasksSelectColumns() {
  return lastStudyTasksSelectColumns;
}

/**
 * @returns {string | null}
 */
export function getLastStudyMaterialsSelectColumns() {
  return lastStudyMaterialsSelectColumns;
}

export function resetTasksMockTelemetry() {
  lastStudyTasksSelectColumns = null;
  lastStudyMaterialsSelectColumns = null;
}

/** @type {Array<{
 *   id: string,
 *   user_id: string,
 *   course_id: string,
 *   material_id: string | null,
 *   title: string,
 *   description: string,
 *   priority: string,
 *   estimated_minutes: number,
 *   difficulty: string,
 *   tags: string[],
 *   status: string,
 *   source: string,
 *   created_at: string,
 *   updated_at: string,
 * }>} */
const tasks = [
  {
    id: OWN_TASK_ID,
    user_id: TEST_USER_ID,
    course_id: OWN_COURSE_ID,
    material_id: OWN_MATERIAL_ID,
    title: 'Existing own task',
    description: '',
    priority: 'medium',
    estimated_minutes: 30,
    difficulty: 'medium',
    tags: [],
    status: 'pending',
    source: 'manual',
    created_at: '2026-01-10T00:00:00.000Z',
    updated_at: '2026-01-10T00:00:00.000Z',
  },
  {
    id: OTHER_USER_TASK_ID,
    user_id: '99999999-9999-9999-9999-999999999999',
    course_id: OTHER_USER_COURSE_ID,
    material_id: null,
    title: 'Other user task',
    description: '',
    priority: 'low',
    estimated_minutes: 15,
    difficulty: 'medium',
    tags: [],
    status: 'pending',
    source: 'manual',
    created_at: '2026-01-09T00:00:00.000Z',
    updated_at: '2026-01-09T00:00:00.000Z',
  },
];

let nextTaskNumericId = 1;

/** @type {{ taskInsertError?: { code: string, message?: string, details?: string } | null }} */
let taskMockOverrides = {};

/**
 * @param {typeof taskMockOverrides} overrides
 */
export function setTasksMockOverrides(overrides) {
  taskMockOverrides = { ...overrides };
}

export function resetTasksMockOverrides() {
  taskMockOverrides = {};
}

/**
 * @returns {typeof tasks}
 */
export function getMockTasks() {
  return tasks;
}

/**
 * @param {Record<string, unknown>} state
 */
function resolveTasksSelect(state) {
  let rows = tasks.filter((t) => {
    if (state.filters.id && t.id !== state.filters.id) return false;
    if (state.filters.user_id && t.user_id !== state.filters.user_id) return false;
    if (state.filters.course_id && t.course_id !== state.filters.course_id) return false;
    if (state.filters.status && t.status !== state.filters.status) return false;
    return true;
  });

  if (state.order?.column === 'created_at' && state.order.ascending === false) {
    rows = [...rows].sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  }

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
function resolveTasksInsert(state) {
  if (taskMockOverrides.taskInsertError) {
    return { data: null, error: taskMockOverrides.taskInsertError };
  }

  const suffix = String(nextTaskNumericId++).padStart(12, '0');
  const row = {
    id: `ffffffff-ffff-4fff-8fff-${suffix}`,
    user_id: state.insert.user_id,
    course_id: state.insert.course_id,
    material_id: state.insert.material_id ?? null,
    title: state.insert.title,
    description: state.insert.description ?? '',
    priority: state.insert.priority ?? 'medium',
    estimated_minutes: state.insert.estimated_minutes,
    difficulty: state.insert.difficulty ?? 'medium',
    tags: state.insert.tags ?? [],
    status: state.insert.status ?? 'pending',
    source: state.insert.source ?? 'manual',
    created_at: '2026-01-11T00:00:00.000Z',
    updated_at: '2026-01-11T00:00:00.000Z',
  };
  tasks.push(row);
  return { data: row, error: null };
}

/**
 * @param {Record<string, unknown>} state
 */
function resolveTasksUpdate(state) {
  const existing = tasks.find(
    (t) => t.id === state.filters.id && t.user_id === state.filters.user_id
  );
  if (!existing) {
    return { data: null, error: { code: 'PGRST116', message: 'not found' } };
  }
  Object.assign(existing, state.update, {
    updated_at: '2026-01-12T00:00:00.000Z',
  });
  return { data: existing, error: null };
}

/**
 * @param {Record<string, unknown>} state
 */
function resolveTasksDelete(state) {
  const index = tasks.findIndex(
    (t) => t.id === state.filters.id && t.user_id === state.filters.user_id
  );
  if (index === -1) {
    return { data: null, error: { code: 'PGRST116', message: 'not found' } };
  }
  const [removed] = tasks.splice(index, 1);
  return { data: { id: removed.id }, error: null };
}

function createTasksBuilder() {
  /** @type {Record<string, unknown>} */
  const state = {
    filters: {},
    single: false,
  };

  const builder = {
    select(columns) {
      lastStudyTasksSelectColumns = columns;
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
    delete() {
      state.delete = true;
      state.single = true;
      return builder;
    },
    eq(column, value) {
      state.filters[column] = value;
      return builder;
    },
    order(column, options) {
      state.order = { column, ascending: options?.ascending ?? true };
      return builder;
    },
    single() {
      state.single = true;
      return builder;
    },
    then(onFulfilled, onRejected) {
      let result;
      if (state.insert) {
        result = resolveTasksInsert(state);
      } else if (state.update) {
        result = resolveTasksUpdate(state);
      } else if (state.delete) {
        result = resolveTasksDelete(state);
      } else {
        result = resolveTasksSelect(state);
      }
      return Promise.resolve(result).then(onFulfilled, onRejected);
    },
  };

  return builder;
}

export function createTasksMockSupabaseClient() {
  const base = createStudyMaterialsMockSupabaseClient();
  const baseFrom = base.from.bind(base);

  return {
    ...base,
    from(table) {
      if (table === 'study_tasks') {
        return createTasksBuilder();
      }
      if (table === 'study_materials') {
        const builder = baseFrom(table);
        const originalSelect = builder.select.bind(builder);
        builder.select = (columns) => {
          lastStudyMaterialsSelectColumns = columns;
          return originalSelect(columns);
        };
        return builder;
      }
      return baseFrom(table);
    },
  };
}
