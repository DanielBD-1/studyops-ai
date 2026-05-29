import { TEST_USER_ID } from './mockSupabaseTasks.js';

export { TEST_USER_ID };

export const TEST_ADMIN_USER_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
export const OTHER_USER_ID = '99999999-9999-9999-9999-999999999999';

/** @type {Array<{ id: string, email: string, role: string, created_at: string }>} */
const authProfiles = [
  {
    id: TEST_USER_ID,
    email: 'student@example.com',
    role: 'student',
    created_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: TEST_ADMIN_USER_ID,
    email: 'admin@example.com',
    role: 'admin',
    created_at: '2026-01-01T00:00:00.000Z',
  },
];

/** @type {Array<{ id: string }>} */
let platformProfiles = [];

/** @type {Array<{ id: string }>} */
let platformCourses = [];

/** @type {Array<{ id: string }>} */
let platformStudyMaterials = [];

/** @type {Array<{ id: string }>} */
let platformGeneratedPlans = [];

/** @type {Array<{ id: string, status: string, trello_card_id: string | null }>} */
let platformTasks = [];

/** @type {Array<{ id: string }>} */
let platformFlashcards = [];

/** @type {Array<{ id: string, duration_minutes: number, ended_at: string | null }>} */
let platformFocusSessions = [];

/** @type {Array<{ id: string, status: string, created_at: string }>} */
let platformTrelloSyncLogs = [];

let simulateDbFailure = false;

/**
 * @returns {string}
 */
export function getStartOfUtcDayIso() {
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  return start.toISOString();
}

/**
 * @returns {string}
 */
function utcTodayIso(hours = 12) {
  const date = new Date();
  date.setUTCHours(hours, 0, 0, 0);
  return date.toISOString();
}

/**
 * @returns {string}
 */
function utcYesterdayIso() {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - 1);
  date.setUTCHours(12, 0, 0, 0);
  return date.toISOString();
}

export function resetAdminStatsMockData() {
  platformProfiles = [];
  platformCourses = [];
  platformStudyMaterials = [];
  platformGeneratedPlans = [];
  platformTasks = [];
  platformFlashcards = [];
  platformFocusSessions = [];
  platformTrelloSyncLogs = [];
  simulateDbFailure = false;
}

export function setAdminStatsDbFailure(enabled) {
  simulateDbFailure = enabled;
}

export function seedAdminStatsEmptyPlatform() {
  resetAdminStatsMockData();
}

export function seedAdminStatsPopulatedPlatform() {
  resetAdminStatsMockData();

  platformProfiles = [
    { id: TEST_USER_ID },
    { id: TEST_ADMIN_USER_ID },
    { id: OTHER_USER_ID },
  ];

  platformCourses = [
    { id: 'course-1111-4111-8111-111111111111' },
    { id: 'course-2222-4222-8222-222222222222' },
    { id: 'course-3333-4333-8333-333333333333' },
    { id: 'course-4444-4444-8444-444444444444' },
  ];

  platformStudyMaterials = [
    { id: 'material-1111-4111-8111-111111111111' },
    { id: 'material-2222-4222-8222-222222222222' },
    { id: 'material-3333-4333-8333-333333333333' },
  ];

  platformGeneratedPlans = [
    { id: 'plan-1111-4111-8111-111111111111' },
    { id: 'plan-2222-4222-8222-222222222222' },
  ];

  platformTasks = [
    { id: 'task-1111-4111-8111-111111111111', status: 'pending', trello_card_id: null },
    { id: 'task-2222-4222-8222-222222222222', status: 'pending', trello_card_id: 'card-1' },
    { id: 'task-3333-4333-8333-333333333333', status: 'completed', trello_card_id: null },
    { id: 'task-4444-4444-8444-444444444444', status: 'completed', trello_card_id: 'card-2' },
    { id: 'task-5555-4555-8555-555555555555', status: 'pending', trello_card_id: null },
  ];

  platformFlashcards = [
    { id: 'flash-1111-4111-8111-111111111111' },
    { id: 'flash-2222-4222-8222-222222222222' },
    { id: 'flash-3333-4333-8333-333333333333' },
    { id: 'flash-4444-4444-8444-444444444444' },
  ];

  platformFocusSessions = [
    {
      id: 'focus-1111-4111-8111-111111111111',
      duration_minutes: 25,
      ended_at: '2026-06-01T12:25:00.000Z',
    },
    {
      id: 'focus-2222-4222-8222-222222222222',
      duration_minutes: 30,
      ended_at: '2026-06-02T12:30:00.000Z',
    },
    {
      id: 'focus-3333-4333-8333-333333333333',
      duration_minutes: 15,
      ended_at: '2026-06-03T12:15:00.000Z',
    },
    {
      id: 'focus-4444-4444-8444-444444444444',
      duration_minutes: 25,
      ended_at: null,
    },
  ];

  platformTrelloSyncLogs = [
    {
      id: 'log-yesterday-1111-4111-8111-111111111111',
      status: 'success',
      created_at: utcYesterdayIso(),
    },
    {
      id: 'log-today-success-1',
      status: 'success',
      created_at: utcTodayIso(10),
    },
    {
      id: 'log-today-success-2',
      status: 'success',
      created_at: utcTodayIso(11),
    },
    {
      id: 'log-today-failed-1',
      status: 'failed',
      created_at: utcTodayIso(12),
    },
    {
      id: 'log-today-skipped-1',
      status: 'skipped',
      created_at: utcTodayIso(13),
    },
  ];
}

export const POPULATED_ADMIN_STATS = {
  totalUsers: 3,
  totalCourses: 4,
  totalStudyMaterials: 3,
  totalGeneratedPlans: 2,
  totalTasks: 5,
  pendingTasks: 3,
  completedTasks: 2,
  totalFlashcards: 4,
  totalFocusMinutes: 70,
  completedFocusSessions: 3,
  trelloSyncedTasks: 2,
  trelloSyncAttemptsToday: 4,
  trelloSyncSucceededToday: 2,
  trelloSyncFailedToday: 1,
  trelloSyncSkippedToday: 1,
  systemHealth: {
    backend: 'ok',
  },
};

/**
 * @param {Record<string, unknown>} state
 * @param {Array<Record<string, unknown>>} rows
 */
function applyFilters(state, rows) {
  let filtered = rows;

  for (const [column, value] of Object.entries(state.filters ?? {})) {
    filtered = filtered.filter((row) => row[column] === value);
  }

  if (state.gteFilters) {
    for (const [column, minValue] of Object.entries(state.gteFilters)) {
      filtered = filtered.filter((row) => {
        const rowValue = row[column];
        return typeof rowValue === 'string' && rowValue >= minValue;
      });
    }
  }

  if (state.notNullColumns) {
    for (const column of state.notNullColumns) {
      filtered = filtered.filter((row) => row[column] != null);
    }
  }

  return filtered;
}

/**
 * @param {string | undefined} columns
 * @param {Record<string, unknown>} row
 */
function projectRow(columns, row) {
  if (!columns || columns === '*') {
    return { ...row };
  }

  const selected = columns.split(',').map((part) => part.trim().split('!')[0].trim());
  /** @type {Record<string, unknown>} */
  const projected = {};

  for (const column of selected) {
    if (column in row) {
      projected[column] = row[column];
    }
  }

  return projected;
}

/**
 * @param {Record<string, unknown>} state
 * @param {Array<Record<string, unknown>>} rows
 */
function resolveCountOrRows(state, rows) {
  if (simulateDbFailure) {
    return { data: null, count: null, error: { message: 'Simulated database failure' } };
  }

  const filtered = applyFilters(state, rows);

  if (state.head && state.countExact) {
    return { data: null, count: filtered.length, error: null };
  }

  const projected = filtered.map((row) => projectRow(state.selectColumns, row));
  return { data: projected, count: null, error: null };
}

function createProfilesBuilder() {
  /** @type {Record<string, unknown>} */
  const state = {
    filters: {},
    notNullColumns: [],
    isSingle: false,
  };

  const builder = {
    select(columns, options = {}) {
      state.selectColumns = columns;
      state.countExact = options.count === 'exact';
      state.head = options.head === true;
      return builder;
    },
    eq(column, value) {
      state.filters[column] = value;
      return builder;
    },
    not(column, operator, value) {
      if (operator === 'is' && value === null) {
        state.notNullColumns.push(column);
      }
      return builder;
    },
    single() {
      state.isSingle = true;
      return builder;
    },
    then(onFulfilled, onRejected) {
      if (state.isSingle) {
        const userId = state.filters.id;
        const profile = authProfiles.find((row) => row.id === userId);
        if (!profile) {
          return Promise.resolve({ data: null, error: { code: 'PGRST116' } }).then(
            onFulfilled,
            onRejected
          );
        }

        const selected = (state.selectColumns ?? '')
          .split(',')
          .map((part) => part.trim().split('!')[0].trim());
        /** @type {Record<string, unknown>} */
        const projected = {};
        for (const column of selected) {
          if (column in profile) {
            projected[column] = profile[column];
          }
        }
        return Promise.resolve({ data: projected, error: null }).then(onFulfilled, onRejected);
      }

      const rows = platformProfiles.map((row) => ({ ...row }));
      const result = resolveCountOrRows(state, rows);
      return Promise.resolve(result).then(onFulfilled, onRejected);
    },
  };

  return builder;
}

/**
 * @param {() => Array<Record<string, unknown>>} getRows
 */
function createAggregateBuilder(getRows) {
  /** @type {Record<string, unknown>} */
  const state = {
    filters: {},
    gteFilters: {},
    notNullColumns: [],
  };

  const builder = {
    select(columns, options = {}) {
      state.selectColumns = columns;
      state.countExact = options.count === 'exact';
      state.head = options.head === true;
      return builder;
    },
    eq(column, value) {
      state.filters[column] = value;
      return builder;
    },
    gte(column, value) {
      state.gteFilters[column] = value;
      return builder;
    },
    not(column, operator, value) {
      if (operator === 'is' && value === null) {
        state.notNullColumns.push(column);
      }
      return builder;
    },
    then(onFulfilled, onRejected) {
      const rows = getRows().map((row) => ({ ...row }));
      const result = resolveCountOrRows(state, rows);
      return Promise.resolve(result).then(onFulfilled, onRejected);
    },
  };

  return builder;
}

seedAdminStatsPopulatedPlatform();

export function createAdminStatsMockSupabaseClient() {
  return {
    auth: {
      getUser: async (token) => {
        if (token === 'student-token') {
          return {
            data: { user: { id: TEST_USER_ID, email: 'student@example.com' } },
            error: null,
          };
        }
        if (token === 'admin-token') {
          return {
            data: { user: { id: TEST_ADMIN_USER_ID, email: 'admin@example.com' } },
            error: null,
          };
        }
        return { data: { user: null }, error: { message: 'Invalid JWT' } };
      },
    },
    from(table) {
      if (table === 'profiles') {
        return createProfilesBuilder();
      }
      if (table === 'courses') {
        return createAggregateBuilder(() => platformCourses);
      }
      if (table === 'study_materials') {
        return createAggregateBuilder(() => platformStudyMaterials);
      }
      if (table === 'material_generated_plans') {
        return createAggregateBuilder(() => platformGeneratedPlans);
      }
      if (table === 'study_tasks') {
        return createAggregateBuilder(() => platformTasks);
      }
      if (table === 'flashcards') {
        return createAggregateBuilder(() => platformFlashcards);
      }
      if (table === 'focus_sessions') {
        return createAggregateBuilder(() => platformFocusSessions);
      }
      if (table === 'trello_sync_logs') {
        return createAggregateBuilder(() => platformTrelloSyncLogs);
      }
      throw new Error(`Unexpected table: ${table}`);
    },
  };
}
