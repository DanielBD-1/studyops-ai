export const TEST_USER_ID = '11111111-1111-4111-8111-111111111111';
export const OTHER_USER_COURSE_ID = '22222222-2222-4222-8222-222222222222';
export const OWN_COURSE_ID = '33333333-3333-4333-8333-333333333333';
export const OWN_MATERIAL_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
export const OTHER_USER_MATERIAL_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

/** Minimum-length study content for validation tests */
export const VALID_STUDY_CONTENT = 'a'.repeat(100);

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

let nextMaterialNumericId = 1;

/** @type {{
 *   courseOwnedSelectNullSuccess?: boolean,
 *   materialOwnedSelectNullSuccess?: boolean,
 *   materialInsertNullSuccess?: boolean,
 *   materialUpdateNullSuccess?: boolean,
 *   materialDeleteNullSuccess?: boolean,
 *   materialInsertError?: { code: string, message?: string, details?: string } | null,
 * }} */
let mockTestOverrides = {};

/**
 * @param {typeof mockTestOverrides} overrides
 */
export function setStudyMaterialsMockOverrides(overrides) {
  mockTestOverrides = { ...overrides };
}

export function resetStudyMaterialsMockOverrides() {
  mockTestOverrides = {};
}

/** @type {Array<{ id: string, course_id: string, title: string, content: string, source_type: string, created_at: string, updated_at: string }>} */
const materials = [
  {
    id: OWN_MATERIAL_ID,
    course_id: OWN_COURSE_ID,
    title: 'Own Material',
    content: VALID_STUDY_CONTENT,
    source_type: 'manual',
    created_at: '2026-01-05T00:00:00.000Z',
    updated_at: '2026-01-05T00:00:00.000Z',
  },
  {
    id: OTHER_USER_MATERIAL_ID,
    course_id: OTHER_USER_COURSE_ID,
    title: 'Other User Material',
    content: VALID_STUDY_CONTENT,
    source_type: 'paste',
    created_at: '2026-01-06T00:00:00.000Z',
    updated_at: '2026-01-06T00:00:00.000Z',
  },
];

/**
 * @param {Record<string, unknown>} state
 */
function resolveCoursesSelect(state) {
  let rows = courses.filter((c) => {
    if (state.filters.id && c.id !== state.filters.id) return false;
    if (state.filters.user_id && c.user_id !== state.filters.user_id) return false;
    return true;
  });

  if (state.order?.column === 'created_at' && state.order.ascending === false) {
    rows = [...rows].sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  }

  if (state.single) {
    if (
      mockTestOverrides.courseOwnedSelectNullSuccess &&
      state.filters.id &&
      state.filters.user_id
    ) {
      return { data: null, error: null };
    }
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
function resolveCoursesInsert(state) {
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
function resolveCoursesUpdate(state) {
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
function resolveCoursesDelete(state) {
  const index = courses.findIndex(
    (c) => c.id === state.filters.id && c.user_id === state.filters.user_id
  );
  if (index === -1) {
    return { data: null, error: { code: 'PGRST116', message: 'not found' } };
  }
  const [removed] = courses.splice(index, 1);
  return { data: { id: removed.id }, error: null };
}

/**
 * @param {Record<string, unknown>} state
 */
function resolveMaterialsSelect(state) {
  const idOnlyLookup =
    state.filters.id &&
    !state.filters.course_id &&
    state.coursesUserIdFilter === undefined;

  if (idOnlyLookup) {
    return { data: null, error: { code: 'PGRST116', message: 'not found' } };
  }

  let rows = materials.filter((m) => {
    if (state.filters.id && m.id !== state.filters.id) return false;
    if (state.filters.course_id && m.course_id !== state.filters.course_id) return false;
    return true;
  });

  if (state.coursesUserIdFilter !== undefined) {
    rows = rows.filter((m) => {
      const course = courses.find((c) => c.id === m.course_id);
      return course?.user_id === state.coursesUserIdFilter;
    });
  }

  if (state.order?.column === 'created_at' && state.order.ascending === false) {
    rows = [...rows].sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  }

  if (state.single) {
    if (
      mockTestOverrides.materialOwnedSelectNullSuccess &&
      state.filters.id &&
      state.coursesUserIdFilter !== undefined
    ) {
      return { data: null, error: null };
    }
    if (rows.length === 0) {
      return { data: null, error: { code: 'PGRST116', message: 'not found' } };
    }
    const row = rows[0];
    if (state.innerJoinCourses) {
      const course = courses.find((c) => c.id === row.course_id);
      return {
        data: { ...row, courses: { id: course?.id } },
        error: null,
      };
    }
    return { data: row, error: null };
  }

  return { data: rows, error: null };
}

/**
 * @param {Record<string, unknown>} state
 */
function resolveMaterialsInsert(state) {
  if (mockTestOverrides.materialInsertError) {
    return { data: null, error: mockTestOverrides.materialInsertError };
  }
  if (mockTestOverrides.materialInsertNullSuccess) {
    return { data: null, error: null };
  }

  const suffix = String(nextMaterialNumericId++).padStart(12, '0');
  const row = {
    id: `cccccccc-cccc-4ccc-8ccc-${suffix}`,
    course_id: state.insert.course_id,
    title: state.insert.title,
    content: state.insert.content,
    source_type: state.insert.source_type,
    created_at: '2026-01-07T00:00:00.000Z',
    updated_at: '2026-01-07T00:00:00.000Z',
  };
  materials.push(row);
  return { data: row, error: null };
}

/**
 * @param {Record<string, unknown>} state
 */
function resolveMaterialsUpdate(state) {
  if (mockTestOverrides.materialUpdateNullSuccess) {
    return { data: null, error: null };
  }

  const existing = materials.find(
    (m) => m.id === state.filters.id && m.course_id === state.filters.course_id
  );
  if (!existing) {
    return { data: null, error: { code: 'PGRST116', message: 'not found' } };
  }
  if (state.update.title !== undefined) existing.title = state.update.title;
  if (state.update.content !== undefined) existing.content = state.update.content;
  if (state.update.source_type !== undefined) existing.source_type = state.update.source_type;
  existing.updated_at = '2026-01-08T00:00:00.000Z';
  return { data: existing, error: null };
}

/**
 * @param {Record<string, unknown>} state
 */
function resolveMaterialsDelete(state) {
  if (mockTestOverrides.materialDeleteNullSuccess) {
    return { data: null, error: null };
  }

  const index = materials.findIndex(
    (m) => m.id === state.filters.id && m.course_id === state.filters.course_id
  );
  if (index === -1) {
    return { data: null, error: { code: 'PGRST116', message: 'not found' } };
  }
  const [removed] = materials.splice(index, 1);
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
      if (column === 'courses.user_id') {
        state.coursesUserIdFilter = value;
      } else {
        state.filters[column] = value;
      }
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
        result = resolveCoursesInsert(state);
      } else if (state.update) {
        result = resolveCoursesUpdate(state);
      } else if (state.delete) {
        result = resolveCoursesDelete(state);
      } else {
        result = resolveCoursesSelect(state);
      }
      return Promise.resolve(result).then(onFulfilled, onRejected);
    },
  };

  return builder;
}

function createMaterialsBuilder() {
  /** @type {Record<string, unknown>} */
  const state = {
    filters: {},
    single: false,
    coursesUserIdFilter: undefined,
    innerJoinCourses: false,
  };

  const builder = {
    select(columns) {
      if (typeof columns === 'string' && columns.includes('courses!inner')) {
        state.innerJoinCourses = true;
      }
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
      if (column === 'courses.user_id') {
        state.coursesUserIdFilter = value;
      } else {
        state.filters[column] = value;
      }
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
        result = resolveMaterialsInsert(state);
      } else if (state.update) {
        result = resolveMaterialsUpdate(state);
      } else if (state.delete) {
        result = resolveMaterialsDelete(state);
      } else {
        result = resolveMaterialsSelect(state);
      }
      return Promise.resolve(result).then(onFulfilled, onRejected);
    },
  };

  return builder;
}

export function createStudyMaterialsMockSupabaseClient() {
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
      if (table === 'courses') {
        return createCoursesBuilder();
      }
      if (table === 'study_materials') {
        return createMaterialsBuilder();
      }
      throw new Error(`Unexpected table: ${table}`);
    },
  };
}
