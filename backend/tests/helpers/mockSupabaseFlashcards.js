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

export const OWN_FLASHCARD_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
export const OWN_COURSE_LEVEL_FLASHCARD_ID = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';
export const OTHER_USER_FLASHCARD_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

let lastStudyMaterialsSelectColumns = null;

export function getLastStudyMaterialsSelectColumns() {
  return lastStudyMaterialsSelectColumns;
}

export function resetFlashcardsMockTelemetry() {
  lastStudyMaterialsSelectColumns = null;
}

/** @type {Array<{
 *   id: string,
 *   user_id: string,
 *   course_id: string,
 *   material_id: string | null,
 *   question: string,
 *   answer: string,
 *   tags: string[] | null,
 *   source: string,
 *   mastery: string,
 *   last_reviewed_at: string | null,
 *   review_count: number,
 *   known_count: number,
 *   unknown_count: number,
 *   created_at: string,
 *   updated_at: string,
 * }>} */
const DEFAULT_REVIEW_STATE = {
  mastery: 'new',
  last_reviewed_at: null,
  review_count: 0,
  known_count: 0,
  unknown_count: 0,
};

const flashcards = [
  {
    id: OWN_FLASHCARD_ID,
    user_id: TEST_USER_ID,
    course_id: OWN_COURSE_ID,
    material_id: OWN_MATERIAL_ID,
    question: 'What is the derivative of x^2?',
    answer: 'The derivative of x^2 is 2x.',
    tags: ['calculus'],
    source: 'manual',
    ...DEFAULT_REVIEW_STATE,
    created_at: '2026-01-10T00:00:00.000Z',
    updated_at: '2026-01-10T00:00:00.000Z',
  },
  {
    id: OWN_COURSE_LEVEL_FLASHCARD_ID,
    user_id: TEST_USER_ID,
    course_id: OWN_COURSE_ID,
    material_id: null,
    question: 'What is a course-level flashcard?',
    answer: 'A flashcard not linked to any study material.',
    tags: ['general'],
    source: 'manual',
    ...DEFAULT_REVIEW_STATE,
    created_at: '2026-01-08T00:00:00.000Z',
    updated_at: '2026-01-08T00:00:00.000Z',
  },
  {
    id: OTHER_USER_FLASHCARD_ID,
    user_id: '99999999-9999-9999-9999-999999999999',
    course_id: OTHER_USER_COURSE_ID,
    material_id: null,
    question: 'Other user question?',
    answer: 'Other user answer.',
    tags: null,
    source: 'manual',
    ...DEFAULT_REVIEW_STATE,
    created_at: '2026-01-09T00:00:00.000Z',
    updated_at: '2026-01-09T00:00:00.000Z',
  },
];

let nextFlashcardNumericId = 1;

/** Matches DB index: lower(trim(...)) */
function normalizePlanImportFlashcardText(value) {
  return String(value).trim().toLowerCase();
}

function planFlashcardDedupeKey(question, answer) {
  return `${normalizePlanImportFlashcardText(question)}\0${normalizePlanImportFlashcardText(answer)}`;
}

/**
 * @returns {typeof flashcards}
 */
export function getMockFlashcards() {
  return flashcards;
}

function resolveFlashcardsSelect(state) {
  let rows = flashcards.filter((f) => {
    if (state.filters.id && f.id !== state.filters.id) return false;
    if (state.filters.user_id && f.user_id !== state.filters.user_id) return false;
    if (state.filters.course_id && f.course_id !== state.filters.course_id) return false;
    if (state.filters.source && f.source !== state.filters.source) return false;
    if (state.filters.material_id !== undefined) {
      if (state.filters.material_id === null && f.material_id !== null) return false;
      if (state.filters.material_id !== null && f.material_id !== state.filters.material_id)
        return false;
    }
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

function resolveFlashcardsInsert(state) {
  if (
    state.insert.source === 'plan' &&
    state.insert.material_id &&
    state.insert.user_id
  ) {
    const duplicate = flashcards.find(
      (f) =>
        f.user_id === state.insert.user_id &&
        f.material_id === state.insert.material_id &&
        f.source === 'plan' &&
        planFlashcardDedupeKey(f.question, f.answer) ===
          planFlashcardDedupeKey(state.insert.question, state.insert.answer)
    );
    if (duplicate) {
      return {
        data: null,
        error: {
          code: '23505',
          message:
            'duplicate key value violates unique constraint "flashcards_plan_import_dedupe_idx"',
        },
      };
    }
  }

  const suffix = String(nextFlashcardNumericId++).padStart(12, '0');
  const row = {
    id: `cccccccc-cccc-4ccc-8ccc-${suffix}`,
    user_id: state.insert.user_id,
    course_id: state.insert.course_id,
    material_id: state.insert.material_id ?? null,
    question: state.insert.question,
    answer: state.insert.answer,
    tags: state.insert.tags ?? [],
    source: state.insert.source ?? 'manual',
    ...DEFAULT_REVIEW_STATE,
    created_at: '2026-01-11T00:00:00.000Z',
    updated_at: '2026-01-11T00:00:00.000Z',
  };
  flashcards.push(row);
  return { data: row, error: null };
}

function resolveFlashcardsUpdate(state) {
  const existing = flashcards.find(
    (f) => f.id === state.filters.id && f.user_id === state.filters.user_id,
  );
  if (!existing) {
    return { data: null, error: { code: 'PGRST116', message: 'not found' } };
  }
  Object.assign(existing, state.update, {
    updated_at: '2026-01-12T00:00:00.000Z',
  });
  return { data: existing, error: null };
}

function resolveFlashcardsDelete(state) {
  const index = flashcards.findIndex(
    (f) => f.id === state.filters.id && f.user_id === state.filters.user_id,
  );
  if (index === -1) {
    return { data: null, error: { code: 'PGRST116', message: 'not found' } };
  }
  const [removed] = flashcards.splice(index, 1);
  return { data: { id: removed.id }, error: null };
}

export function createFlashcardsBuilder() {
  /** @type {Record<string, unknown>} */
  const state = {
    filters: {},
    single: false,
  };

  const builder = {
    select(columns) {
      // keep shape parity; do not log sensitive content here
      state.select = columns;
      return builder;
    },
    insert(row) {
      state.insert = row;
      state.single = true;
      return builder;
    },
    update(update) {
      state.update = update;
      state.single = true;
      return builder;
    },
    delete() {
      state.operation = 'delete';
      state.single = true;
      return builder;
    },
    eq(column, value) {
      state.filters[column] = value;
      return builder;
    },
    order(column, options) {
      state.order = { column, ascending: options?.ascending !== false };
      return builder;
    },
    single() {
      state.single = true;
      return builder;
    },
    then(resolve, reject) {
      try {
        let result;
        if (state.insert) {
          result = resolveFlashcardsInsert(state);
        } else if (state.update) {
          result = resolveFlashcardsUpdate(state);
        } else if (state.operation === 'delete') {
          result = resolveFlashcardsDelete(state);
        } else {
          result = resolveFlashcardsSelect(state);
        }
        resolve(result);
      } catch (err) {
        reject(err);
      }
    },
  };

  return builder;
}

export function createFlashcardsMockSupabaseClient() {
  const base = createStudyMaterialsMockSupabaseClient();
  const baseFrom = base.from.bind(base);

  return {
    ...base,
    from(table) {
      if (table === 'flashcards') {
        return createFlashcardsBuilder();
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

