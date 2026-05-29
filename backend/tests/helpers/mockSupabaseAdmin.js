import { TEST_USER_ID } from './mockSupabaseTasks.js';

export { TEST_USER_ID };

export const TEST_ADMIN_USER_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

/** @type {Array<{ id: string, email: string, role: string, created_at: string }>} */
const profiles = [
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

function createProfilesBuilder() {
  /** @type {string | null} */
  let userId = null;
  /** @type {string | undefined} */
  let selectColumns;

  const builder = {
    select(columns) {
      selectColumns = columns;
      return builder;
    },
    eq(column, value) {
      if (column === 'id') {
        userId = value;
      }
      return builder;
    },
    single() {
      const profile = profiles.find((row) => row.id === userId);
      if (!profile) {
        return Promise.resolve({ data: null, error: { code: 'PGRST116' } });
      }

      if (!selectColumns) {
        return Promise.resolve({ data: profile, error: null });
      }

      const selected = selectColumns
        .split(',')
        .map((part) => part.trim().split('!')[0].trim());
      /** @type {Record<string, unknown>} */
      const projected = {};
      for (const column of selected) {
        if (column in profile) {
          projected[column] = profile[column];
        }
      }
      return Promise.resolve({ data: projected, error: null });
    },
  };

  return builder;
}

export function createAdminMockSupabaseClient() {
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
      throw new Error(`Unexpected table: ${table}`);
    },
  };
}
