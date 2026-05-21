export const TEST_USER_ID = '11111111-1111-4111-8111-111111111111';
export const OTHER_USER_COURSE_ID = '22222222-2222-4222-8222-222222222222';
export const OWN_COURSE_ID = '33333333-3333-4333-8333-333333333333';

/** @type {Array<{ id: string, user_id: string, title: string, created_at: string, updated_at: string }>} */
const courses = [
  {
    id: OWN_COURSE_ID,
    user_id: TEST_USER_ID,
    title: 'Own Course',
    created_at: '2026-01-02T00:00:00.000Z',
    updated_at: '2026-01-02T00:00:00.000Z',
  },
  {
    id: OTHER_USER_COURSE_ID,
    user_id: '99999999-9999-9999-9999-999999999999',
    title: 'Other User Course',
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  },
];

/**
 * @param {Record<string, unknown>} state
 */
function resolveSelect(state) {
  let rows = courses.filter((c) => {
    if (state.filters.id && c.id !== state.filters.id) return false;
    if (state.filters.user_id && c.user_id !== state.filters.user_id) return false;
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
function resolveInsert(state) {
  const row = {
    id: '44444444-4444-4444-8444-444444444444',
    user_id: state.insert.user_id,
    title: state.insert.title,
    created_at: '2026-01-03T00:00:00.000Z',
    updated_at: '2026-01-03T00:00:00.000Z',
  };
  courses.push(row);
  return { data: row, error: null };
}

/**
 * @param {Record<string, unknown>} state
 */
function resolveUpdate(state) {
  const existing = courses.find(
    (c) => c.id === state.filters.id && c.user_id === state.filters.user_id
  );
  if (!existing) {
    return { data: null, error: { code: 'PGRST116', message: 'not found' } };
  }
  existing.title = state.update.title;
  existing.updated_at = '2026-01-04T00:00:00.000Z';
  return { data: existing, error: null };
}

/**
 * @param {Record<string, unknown>} state
 */
function resolveDelete(state) {
  const index = courses.findIndex(
    (c) => c.id === state.filters.id && c.user_id === state.filters.user_id
  );
  if (index === -1) {
    return { data: null, error: { code: 'PGRST116', message: 'not found' } };
  }
  const [removed] = courses.splice(index, 1);
  return { data: { id: removed.id }, error: null };
}

function createCoursesBuilder() {
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
        result = resolveInsert(state);
      } else if (state.update) {
        result = resolveUpdate(state);
      } else if (state.delete) {
        result = resolveDelete(state);
      } else {
        result = resolveSelect(state);
      }
      return Promise.resolve(result).then(onFulfilled, onRejected);
    },
  };

  return builder;
}

export function createCoursesMockSupabaseClient() {
  return {
    auth: {
      getUser: async (token) => {
        if (token === 'valid-token') {
          return {
            data: { user: { id: TEST_USER_ID, email: 'student@example.com' } },
            error: null,
          };
        }
        return { data: { user: null }, error: { message: 'Invalid JWT' } };
      },
    },
    from(table) {
      if (table !== 'courses') {
        throw new Error(`Unexpected table: ${table}`);
      }
      return createCoursesBuilder();
    },
  };
}
