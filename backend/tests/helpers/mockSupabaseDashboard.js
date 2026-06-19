import {
  createFocusMockSupabaseClient,
  getMockFocusSessions,
  resetMockFocusSessions,
  OWN_COURSE_ID,
  OWN_TASK_ID,
  TEST_USER_ID,
} from './mockSupabaseFocus.js';
import {
  getMockGeneratedPlans,
  OWN_MATERIAL_ID,
  OTHER_USER_COURSE_ID,
  OTHER_USER_MATERIAL_ID,
  resetStudyMaterialsMockOverrides,
} from './mockSupabaseStudyMaterials.js';
import { getMockFlashcards } from './mockSupabaseFlashcards.js';
import { getMockTasks } from './mockSupabaseTasks.js';

export {
  TEST_USER_ID,
  OWN_COURSE_ID,
  OTHER_USER_COURSE_ID,
  OWN_MATERIAL_ID,
  OTHER_USER_MATERIAL_ID,
  OWN_TASK_ID,
  getMockTasks,
  getMockFlashcards,
  getMockGeneratedPlans,
  getMockFocusSessions,
};

export const EMPTY_USER_ID = '00000000-0000-4000-8000-000000000001';
export const OTHER_USER_ID = '99999999-9999-9999-9999-999999999999';

/** @type {Record<string, string>} */
const courseOwners = {
  [OWN_COURSE_ID]: TEST_USER_ID,
  [OTHER_USER_COURSE_ID]: OTHER_USER_ID,
};

/**
 * @param {string} courseId
 * @returns {string | undefined}
 */
function getCourseOwner(courseId) {
  return courseOwners[courseId];
}

/**
 * @param {Record<string, unknown>} state
 * @param {Array<Record<string, unknown>>} rows
 */
function applyCommonFilters(state, rows) {
  let filtered = rows;

  for (const [column, value] of Object.entries(state.filters)) {
    filtered = filtered.filter((row) => row[column] === value);
  }

  if (state.coursesUserIdFilter !== undefined) {
    filtered = filtered.filter((row) => {
      const courseId = /** @type {string} */ (row.course_id);
      return getCourseOwner(courseId) === state.coursesUserIdFilter;
    });
  }

  if (state.notNullColumns) {
    for (const column of state.notNullColumns) {
      filtered = filtered.filter((row) => row[column] != null);
    }
  }

  if (state.gteFilters) {
    for (const [column, minValue] of Object.entries(state.gteFilters)) {
      filtered = filtered.filter((row) => {
        const cell = row[column];
        return cell != null && String(cell) >= String(minValue);
      });
    }
  }

  if (state.ltFilters) {
    for (const [column, maxValue] of Object.entries(state.ltFilters)) {
      filtered = filtered.filter((row) => {
        const cell = row[column];
        return cell != null && String(cell) < String(maxValue);
      });
    }
  }

  if (state.gtFilters) {
    for (const [column, minValue] of Object.entries(state.gtFilters)) {
      filtered = filtered.filter((row) => {
        const cell = row[column];
        return cell != null && String(cell) > String(minValue);
      });
    }
  }

  if (state.lteFilters) {
    for (const [column, maxValue] of Object.entries(state.lteFilters)) {
      filtered = filtered.filter((row) => {
        const cell = row[column];
        return cell != null && String(cell) <= String(maxValue);
      });
    }
  }

  return filtered;
}

/**
 * Filters flashcards due for review: next_review_at IS NULL OR next_review_at <= lte ISO.
 *
 * @param {string} orFilter
 * @param {Array<Record<string, unknown>>} rows
 */
function applyFlashcardDueOrFilter(orFilter, rows) {
  const lteMatch = orFilter.match(/next_review_at\.lte\.(.+)/);
  const lteIso = lteMatch ? lteMatch[1] : null;

  return rows.filter((row) => {
    const nextReviewAt = row.next_review_at;
    if (nextReviewAt == null) {
      return true;
    }
    if (lteIso && typeof nextReviewAt === 'string') {
      return nextReviewAt <= lteIso;
    }
    return false;
  });
}

/**
 * @param {Record<string, unknown>} state
 * @param {Array<Record<string, unknown>>} rows
 */
function resolveCountOrRows(state, rows) {
  const filtered = applyCommonFilters(state, rows);

  if (state.head && state.countExact) {
    return { data: null, count: filtered.length, error: null };
  }

  const projected = filtered.map((row) => projectRow(state.selectColumns, row));
  return { data: projected, count: null, error: null };
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

function createCoursesBuilder() {
  /** @type {Record<string, unknown>} */
  const state = {
    filters: {},
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
    not(column, operator, value) {
      if (operator === 'is' && value === null) {
        state.notNullColumns.push(column);
      }
      return builder;
    },
    then(onFulfilled, onRejected) {
      const rows = getMockCoursesRows();
      const result = resolveCountOrRows(state, rows);
      return Promise.resolve(result).then(onFulfilled, onRejected);
    },
  };

  return builder;
}

function createStudyMaterialsBuilder() {
  /** @type {Record<string, unknown>} */
  const state = {
    filters: {},
    notNullColumns: [],
    coursesUserIdFilter: undefined,
    innerJoinCourses: false,
  };

  const builder = {
    select(columns, options = {}) {
      state.selectColumns = columns;
      state.countExact = options.count === 'exact';
      state.head = options.head === true;
      if (typeof columns === 'string' && columns.includes('courses!inner')) {
        state.innerJoinCourses = true;
      }
      return builder;
    },
    eq(column, value) {
      if (column === 'courses.user_id') {
        state.coursesUserIdFilter = value;
      } else {
        state.filters[column] = value;
      }
      return builder;
    },
    not(column, operator, value) {
      if (operator === 'is' && value === null) {
        state.notNullColumns.push(column);
      }
      return builder;
    },
    then(onFulfilled, onRejected) {
      const rows = getMockMaterialsRows();
      const result = resolveCountOrRows(state, rows);
      return Promise.resolve(result).then(onFulfilled, onRejected);
    },
  };

  return builder;
}

function createGeneratedPlansBuilder() {
  /** @type {Record<string, unknown>} */
  const state = {
    filters: {},
    notNullColumns: [],
    coursesUserIdFilter: undefined,
  };

  const builder = {
    select(columns, options = {}) {
      state.selectColumns = columns;
      state.countExact = options.count === 'exact';
      state.head = options.head === true;
      return builder;
    },
    eq(column, value) {
      if (column === 'courses.user_id') {
        state.coursesUserIdFilter = value;
      } else {
        state.filters[column] = value;
      }
      return builder;
    },
    not(column, operator, value) {
      if (operator === 'is' && value === null) {
        state.notNullColumns.push(column);
      }
      return builder;
    },
    then(onFulfilled, onRejected) {
      const rows = getMockGeneratedPlans().map((plan) => ({ ...plan }));
      const result = resolveCountOrRows(state, rows);
      return Promise.resolve(result).then(onFulfilled, onRejected);
    },
  };

  return builder;
}

function createStudyTasksBuilder() {
  /** @type {Record<string, unknown>} */
  const state = {
    filters: {},
    notNullColumns: [],
    ltFilters: {},
    gtFilters: {},
    lteFilters: {},
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
    lt(column, value) {
      state.ltFilters[column] = value;
      return builder;
    },
    gt(column, value) {
      state.gtFilters[column] = value;
      return builder;
    },
    lte(column, value) {
      state.lteFilters[column] = value;
      return builder;
    },
    not(column, operator, value) {
      if (operator === 'is' && value === null) {
        state.notNullColumns.push(column);
      }
      return builder;
    },
    then(onFulfilled, onRejected) {
      const rows = getMockTasks().map((task) => ({ ...task }));
      const result = resolveCountOrRows(state, rows);
      return Promise.resolve(result).then(onFulfilled, onRejected);
    },
  };

  return builder;
}

function createFlashcardsBuilder() {
  /** @type {Record<string, unknown>} */
  const state = {
    filters: {},
    notNullColumns: [],
    orFilter: undefined,
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
    or(filter) {
      state.orFilter = filter;
      return builder;
    },
    not(column, operator, value) {
      if (operator === 'is' && value === null) {
        state.notNullColumns.push(column);
      }
      return builder;
    },
    then(onFulfilled, onRejected) {
      let rows = getMockFlashcards().map((card) => ({ ...card }));
      rows = applyCommonFilters(state, rows);
      if (typeof state.orFilter === 'string') {
        rows = applyFlashcardDueOrFilter(state.orFilter, rows);
      }
      const result = resolveCountOrRows(
        { ...state, filters: {}, notNullColumns: [], coursesUserIdFilter: undefined },
        rows
      );
      return Promise.resolve(result).then(onFulfilled, onRejected);
    },
  };

  return builder;
}

function createFocusSessionsBuilder() {
  /** @type {Record<string, unknown>} */
  const state = {
    filters: {},
    notNullColumns: [],
    gteFilters: {},
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
      const rows = getMockFocusSessions().map((session) => ({ ...session }));
      const result = resolveCountOrRows(state, rows);
      return Promise.resolve(result).then(onFulfilled, onRejected);
    },
  };

  return builder;
}

/** @type {Array<{ id: string, user_id: string, title: string }>} */
const courses = [
  { id: OWN_COURSE_ID, user_id: TEST_USER_ID, title: 'Own Course' },
  { id: OTHER_USER_COURSE_ID, user_id: OTHER_USER_ID, title: 'Other User Course' },
];

/** @type {Array<{ id: string, course_id: string }>} */
const materials = [
  { id: OWN_MATERIAL_ID, course_id: OWN_COURSE_ID },
  { id: OTHER_USER_MATERIAL_ID, course_id: OTHER_USER_COURSE_ID },
];

function getMockCoursesRows() {
  return courses.map((course) => ({ ...course }));
}

function getMockMaterialsRows() {
  return materials.map((material) => ({ ...material }));
}

export function resetDashboardMockData() {
  resetStudyMaterialsMockOverrides();
  resetMockFocusSessions();

  getMockGeneratedPlans().length = 0;
  getMockFocusSessions().length = 0;

  const tasks = getMockTasks();
  tasks.length = 0;
  tasks.push(
    {
      id: OWN_TASK_ID,
      user_id: TEST_USER_ID,
      course_id: OWN_COURSE_ID,
      material_id: OWN_MATERIAL_ID,
      title: 'Existing own task',
      description: 'Sensitive task description',
      priority: 'medium',
      estimated_minutes: 30,
      difficulty: 'medium',
      tags: [],
      status: 'pending',
      source: 'manual',
      due_date: null,
      trello_card_id: null,
      created_at: '2026-01-10T00:00:00.000Z',
      updated_at: '2026-01-10T00:00:00.000Z',
    },
    {
      id: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
      user_id: OTHER_USER_ID,
      course_id: OTHER_USER_COURSE_ID,
      material_id: null,
      title: 'Other user task',
      description: 'Other sensitive description',
      priority: 'low',
      estimated_minutes: 15,
      difficulty: 'medium',
      tags: [],
      status: 'pending',
      source: 'manual',
      due_date: null,
      trello_card_id: 'other-user-trello-card',
      created_at: '2026-01-09T00:00:00.000Z',
      updated_at: '2026-01-09T00:00:00.000Z',
    }
  );

  const flashcards = getMockFlashcards();
  flashcards.length = 0;
  flashcards.push(
    {
      id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      user_id: TEST_USER_ID,
      course_id: OWN_COURSE_ID,
      material_id: OWN_MATERIAL_ID,
      question: 'Sensitive question?',
      answer: 'Sensitive answer.',
      tags: ['calculus'],
      source: 'manual',
      created_at: '2026-01-10T00:00:00.000Z',
      updated_at: '2026-01-10T00:00:00.000Z',
    },
    {
      id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      user_id: OTHER_USER_ID,
      course_id: OTHER_USER_COURSE_ID,
      material_id: null,
      question: 'Other user question?',
      answer: 'Other user answer.',
      tags: null,
      source: 'manual',
      created_at: '2026-01-09T00:00:00.000Z',
      updated_at: '2026-01-09T00:00:00.000Z',
    }
  );
}

export function seedDashboardMixedData() {
  resetDashboardMockData();

  getMockGeneratedPlans().push(
    {
      id: 'plan-own-1111-4111-8111-111111111111',
      study_material_id: OWN_MATERIAL_ID,
      course_id: OWN_COURSE_ID,
      plan: { summary: 'Sensitive plan summary', tasks: [], flashcards: [] },
      is_active: true,
      created_at: '2026-01-09T00:00:00.000Z',
      updated_at: '2026-01-10T00:00:00.000Z',
    },
    {
      id: 'plan-own-inactive-3333-4333-8333-333333333333',
      study_material_id: OWN_MATERIAL_ID,
      course_id: OWN_COURSE_ID,
      plan: { summary: 'Inactive own plan', tasks: [], flashcards: [] },
      is_active: false,
      created_at: '2026-01-08T00:00:00.000Z',
      updated_at: '2026-01-08T00:00:00.000Z',
    },
    {
      id: 'plan-other-2222-4222-8222-222222222222',
      study_material_id: OTHER_USER_MATERIAL_ID,
      course_id: OTHER_USER_COURSE_ID,
      plan: { summary: 'Other user plan', tasks: [], flashcards: [] },
      is_active: true,
      created_at: '2026-01-09T00:00:00.000Z',
      updated_at: '2026-01-10T00:00:00.000Z',
    }
  );

  getMockTasks().push(
    {
      id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
      user_id: TEST_USER_ID,
      course_id: OWN_COURSE_ID,
      material_id: null,
      title: 'Completed own task',
      description: 'Completed sensitive description',
      priority: 'medium',
      estimated_minutes: 20,
      difficulty: 'medium',
      tags: [],
      status: 'completed',
      source: 'manual',
      due_date: null,
      trello_card_id: null,
      created_at: '2026-01-08T00:00:00.000Z',
      updated_at: '2026-01-12T00:00:00.000Z',
    },
    {
      id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
      user_id: TEST_USER_ID,
      course_id: OWN_COURSE_ID,
      material_id: null,
      title: 'Synced own task',
      description: 'Synced sensitive description',
      priority: 'high',
      estimated_minutes: 25,
      difficulty: 'medium',
      tags: [],
      status: 'pending',
      source: 'manual',
      due_date: null,
      trello_card_id: 'own-trello-card-id',
      created_at: '2026-01-07T00:00:00.000Z',
      updated_at: '2026-01-07T00:00:00.000Z',
    }
  );

  getMockFocusSessions().push(
    {
      id: 'focus-completed-1111-4111-8111-111111111111',
      user_id: TEST_USER_ID,
      course_id: OWN_COURSE_ID,
      task_id: OWN_TASK_ID,
      duration_minutes: 18,
      completed_task: false,
      started_at: '2026-06-01T12:00:00.000Z',
      ended_at: '2026-06-01T12:18:00.000Z',
    },
    {
      id: 'focus-completed-2222-4222-8222-222222222222',
      user_id: TEST_USER_ID,
      course_id: OWN_COURSE_ID,
      task_id: OWN_TASK_ID,
      duration_minutes: 12,
      completed_task: true,
      started_at: '2026-06-02T12:00:00.000Z',
      ended_at: '2026-06-02T12:12:00.000Z',
    },
    {
      id: 'focus-in-progress-3333-4333-8333-333333333333',
      user_id: TEST_USER_ID,
      course_id: OWN_COURSE_ID,
      task_id: OWN_TASK_ID,
      duration_minutes: 25,
      completed_task: false,
      started_at: '2026-06-03T12:00:00.000Z',
      ended_at: null,
    },
    {
      id: 'focus-other-user-4444-4444-8444-444444444444',
      user_id: OTHER_USER_ID,
      course_id: OTHER_USER_COURSE_ID,
      task_id: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
      duration_minutes: 60,
      completed_task: false,
      started_at: '2026-06-01T10:00:00.000Z',
      ended_at: '2026-06-01T11:00:00.000Z',
    }
  );
}

export function seedDashboardEmptyUserData() {
  resetDashboardMockData();
}

seedDashboardMixedData();

export function createDashboardMockSupabaseClient() {
  const base = createFocusMockSupabaseClient();

  return {
    ...base,
    auth: {
      getUser: async (token) => {
        if (token === 'valid-token') {
          return {
            data: { user: { id: TEST_USER_ID, email: 'student@example.com' } },
            error: null,
          };
        }
        if (token === 'empty-user-token') {
          return {
            data: { user: { id: EMPTY_USER_ID, email: 'empty@example.com' } },
            error: null,
          };
        }
        return { data: { user: null }, error: { message: 'Invalid JWT' } };
      },
    },
    from(table) {
      if (table === 'courses') {
        return createCoursesBuilder();
      }
      if (table === 'study_materials') {
        return createStudyMaterialsBuilder();
      }
      if (table === 'material_generated_plans') {
        return createGeneratedPlansBuilder();
      }
      if (table === 'study_tasks') {
        return createStudyTasksBuilder();
      }
      if (table === 'flashcards') {
        return createFlashcardsBuilder();
      }
      if (table === 'focus_sessions') {
        return createFocusSessionsBuilder();
      }
      return base.from(table);
    },
  };
}
