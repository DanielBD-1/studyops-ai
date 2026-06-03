import assert from 'node:assert/strict';

/** @type {Map<string, Record<string, unknown>>} */
const connectionsByUserId = new Map();

export function resetMockTrelloConnections() {
  connectionsByUserId.clear();
}

/**
 * @returns {Map<string, Record<string, unknown>>}
 */
export function getMockTrelloConnections() {
  return connectionsByUserId;
}

/**
 * @param {Record<string, unknown>} state
 */
function resolveSelect(state) {
  const row = connectionsByUserId.get(state.filters.user_id);
  if (!row) {
    return state.single
      ? { data: null, error: null }
      : { data: [], error: null };
  }

  const columns = state.columns;
  if (columns === '*') {
    return state.single
      ? { data: { ...row }, error: null }
      : { data: [{ ...row }], error: null };
  }

  /** @type {Record<string, unknown>} */
  const projected = {};
  for (const part of String(columns).split(',')) {
    const key = part.trim();
    if (key && key in row) {
      projected[key] = row[key];
    }
  }

  return state.single ? { data: projected, error: null } : { data: [projected], error: null };
}

/**
 * @param {Record<string, unknown>} state
 */
function resolveUpsert(state) {
  const row = /** @type {Record<string, unknown>} */ (state.upsert);
  const userId = String(row.user_id);
  connectionsByUserId.set(userId, { ...row });
  return resolveSelect({
    ...state,
    filters: { user_id: userId },
    single: true,
    columns: state.returnColumns,
  });
}

/**
 * @param {Record<string, unknown>} state
 */
function resolveDelete(state) {
  const userId = state.filters.user_id;
  const existing = connectionsByUserId.get(userId);
  if (!existing) {
    return { data: [], error: null };
  }
  connectionsByUserId.delete(userId);
  return { data: [{ user_id: userId }], error: null };
}

/**
 * @param {Record<string, unknown>} state
 */
function resolveUpdate(state) {
  const userId = state.filters.user_id;
  const existing = connectionsByUserId.get(userId);
  if (!existing) {
    return { data: null, error: null };
  }

  const patch = /** @type {Record<string, unknown>} */ (state.update);
  const updated = { ...existing, ...patch };
  connectionsByUserId.set(userId, updated);

  return resolveSelect({
    ...state,
    filters: { user_id: userId },
    single: true,
  });
}

function createTrelloConnectionsBuilder() {
  /** @type {Record<string, unknown>} */
  const state = {
    filters: {},
    single: false,
    columns: '*',
  };

  const builder = {
    select(columns) {
      state.columns = columns;
      return builder;
    },
    eq(column, value) {
      state.filters[column] = value;
      return builder;
    },
    upsert(row, _options) {
      state.upsert = row;
      return builder;
    },
    update(patch) {
      state.update = patch;
      return builder;
    },
    delete() {
      state.delete = true;
      return builder;
    },
    maybeSingle() {
      state.single = true;
      return builder;
    },
    single() {
      state.single = true;
      return builder;
    },
    then(onFulfilled, onRejected) {
      let result;
      if (state.delete) {
        result = resolveDelete(state);
      } else if (state.update) {
        state.returnColumns = state.columns;
        result = resolveUpdate(state);
      } else if (state.upsert) {
        state.returnColumns = state.columns;
        result = resolveUpsert(state);
      } else {
        result = resolveSelect(state);
      }
      return Promise.resolve(result).then(onFulfilled, onRejected);
    },
  };

  return builder;
}

/**
 * @returns {{ from: (table: string) => unknown }}
 */
export function createTrelloConnectionMockSupabaseClient() {
  return {
    from(table) {
      if (table === 'trello_connections') {
        return createTrelloConnectionsBuilder();
      }
      throw new Error(`Unexpected table in trello connection mock: ${table}`);
    },
  };
}

/**
 * @param {unknown} value
 * @param {string} [path]
 */
export function assertNoPlaintextTrelloTokenInValue(value, path = 'root') {
  if (value === null || value === undefined) return;
  if (typeof value === 'string') {
    assert.ok(!value.includes('ATTAsecretPlaintextToken'), `token leak at ${path}`);
    return;
  }
  if (typeof value !== 'object') return;

  const obj = /** @type {Record<string, unknown>} */ (value);
  assert.equal('token' in obj, false, `token field at ${path}`);
  assert.equal('token_ciphertext' in obj, false, `ciphertext at ${path}`);
  assert.equal('token_iv' in obj, false, `iv at ${path}`);
  assert.equal('token_tag' in obj, false, `tag at ${path}`);

  for (const [key, child] of Object.entries(obj)) {
    assertNoPlaintextTrelloTokenInValue(child, `${path}.${key}`);
  }
}
