import { getSupabaseAdmin } from '../../config/supabase.js';
import { ApiError } from '../../shared/errors/ApiError.js';
import { assertCourseOwned } from '../study-materials/study-materials.service.js';

const FLASHCARD_COLUMNS =
  'id, course_id, material_id, question, answer, tags, source, mastery, last_reviewed_at, review_count, known_count, unknown_count, created_at, updated_at';

const MATERIAL_OWNERSHIP_SELECT = 'id, course_id, courses!inner(id)';

const FLASHCARD_CHECK_CONSTRAINTS = {
  flashcards_question_length: 'Question must be between 10 and 500 characters',
  flashcards_answer_length: 'Answer must be between 10 and 2000 characters',
  flashcards_tags_cardinality: 'You can specify at most 5 tags',
  flashcards_source_allowed: 'Invalid flashcard source',
};

const FLASHCARD_DATA_VALIDATION_MESSAGE = 'Invalid flashcard data';

/**
 * @param {{ message?: string, details?: string } | null | undefined} error
 * @returns {string}
 */
function flashcardCheckValidationMessageFromError(error) {
  const haystack = `${error?.message ?? ''} ${error?.details ?? ''}`.toLowerCase();

  for (const [constraint, message] of Object.entries(FLASHCARD_CHECK_CONSTRAINTS)) {
    if (haystack.includes(constraint)) {
      return message;
    }
  }

  return FLASHCARD_DATA_VALIDATION_MESSAGE;
}

/**
 * @param {{ code?: string, message?: string, details?: string } | null} error
 */
function handleFlashcardError(error) {
  if (!error) return;

  if (error.code === 'PGRST116') {
    throw new ApiError('NOT_FOUND', 'Flashcard not found', 404);
  }

  if (error.code === '23514') {
    throw new ApiError('VALIDATION_ERROR', flashcardCheckValidationMessageFromError(error), 400);
  }

  throw new ApiError('DATABASE_ERROR', 'Failed to access flashcards', 500);
}

/**
 * @param {{
 *   id: string,
 *   course_id: string,
 *   material_id: string | null,
 *   question: string,
 *   answer: string,
 *   tags: string[] | null,
 *   source: string,
 *   mastery?: string,
 *   last_reviewed_at?: string | null,
 *   review_count?: number,
 *   known_count?: number,
 *   unknown_count?: number,
 *   created_at: string,
 *   updated_at: string,
 * }} row
 */
export function mapFlashcard(row) {
  return {
    id: row.id,
    courseId: row.course_id,
    materialId: row.material_id,
    question: row.question,
    answer: row.answer,
    tags: row.tags ?? [],
    source: row.source,
    mastery: row.mastery ?? 'new',
    lastReviewedAt: row.last_reviewed_at ?? null,
    reviewCount: row.review_count ?? 0,
    knownCount: row.known_count ?? 0,
    unknownCount: row.unknown_count ?? 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * @param {string} userId
 * @param {string} courseId
 */
async function assertCourseOwnedForFlashcards(userId, courseId) {
  await assertCourseOwned(userId, courseId);
}

/**
 * @param {string} userId
 * @param {string} materialId
 */
async function assertMaterialOwnedForFlashcards(userId, materialId) {
  const { data, error } = await getSupabaseAdmin()
    .from('study_materials')
    .select('id, course_id, courses!inner(id)')
    .eq('id', materialId)
    .eq('courses.user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new ApiError('NOT_FOUND', 'Study material not found', 404);
    }
    throw new ApiError('DATABASE_ERROR', 'Failed to access study material', 500);
  }

  if (!data) {
    throw new ApiError('NOT_FOUND', 'Study material not found', 404);
  }
}

/**
 * @param {string} userId
 * @param {string} courseId
 * @param {string} materialId
 */
async function assertMaterialBelongsToOwnedCourseForFlashcards(userId, courseId, materialId) {
  await assertCourseOwnedForFlashcards(userId, courseId);

  const { data, error } = await getSupabaseAdmin()
    .from('study_materials')
    .select(MATERIAL_OWNERSHIP_SELECT)
    .eq('id', materialId)
    .eq('course_id', courseId)
    .eq('courses.user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new ApiError('NOT_FOUND', 'Study material not found', 404);
    }
    throw new ApiError('DATABASE_ERROR', 'Failed to access study material', 500);
  }

  if (!data) {
    throw new ApiError('NOT_FOUND', 'Study material not found', 404);
  }
}

/**
 * @param {string} userId
 * @param {{ courseId?: string, materialId?: string }} [query]
 */
export async function listFlashcards(userId, query = {}) {
  if (query.courseId) {
    await assertCourseOwnedForFlashcards(userId, query.courseId);
  }

  if (query.materialId) {
    if (query.courseId) {
      await assertMaterialBelongsToOwnedCourseForFlashcards(
        userId,
        query.courseId,
        query.materialId,
      );
    } else {
      await assertMaterialOwnedForFlashcards(userId, query.materialId);
    }
  }

  let builder = getSupabaseAdmin()
    .from('flashcards')
    .select(FLASHCARD_COLUMNS)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (query.courseId) {
    builder = builder.eq('course_id', query.courseId);
  }

  if (query.materialId) {
    builder = builder.eq('material_id', query.materialId);
  }

  const { data, error } = await builder;

  if (error) {
    throw new ApiError('DATABASE_ERROR', 'Failed to list flashcards', 500);
  }

  return (data ?? []).map(mapFlashcard);
}

/**
 * @param {string} userId
 * @param {string} courseId
 * @param {{
 *   question: string,
 *   answer: string,
 *   tags?: string[],
 *   materialId?: string | null,
 * }} input
 */
export async function createFlashcard(userId, courseId, input) {
  await assertCourseOwnedForFlashcards(userId, courseId);

  if (input.materialId) {
    await assertMaterialBelongsToOwnedCourseForFlashcards(userId, courseId, input.materialId);
  }

  const insertRow = {
    user_id: userId,
    course_id: courseId,
    material_id: input.materialId ?? null,
    question: input.question.trim(),
    answer: input.answer.trim(),
    tags: input.tags ?? [],
  };

  const { data, error } = await getSupabaseAdmin()
    .from('flashcards')
    .insert(insertRow)
    .select(FLASHCARD_COLUMNS)
    .single();

  if (error) {
    handleFlashcardError(error);
  }

  if (!data) {
    throw new ApiError('DATABASE_ERROR', 'Failed to create flashcard', 500);
  }

  return mapFlashcard(data);
}

/**
 * @param {string} userId
 * @param {string} flashcardId
 */
export async function getOwnedFlashcardOrThrow(userId, flashcardId) {
  const { data, error } = await getSupabaseAdmin()
    .from('flashcards')
    .select(FLASHCARD_COLUMNS)
    .eq('id', flashcardId)
    .eq('user_id', userId)
    .single();

  if (error) {
    handleFlashcardError(error);
  }

  if (!data) {
    throw new ApiError('NOT_FOUND', 'Flashcard not found', 404);
  }

  return mapFlashcard(data);
}

/**
 * @param {string} userId
 * @param {string} flashcardId
 * @param {{
 *   question?: string,
 *   answer?: string,
 *   tags?: string[],
 *   materialId?: string | null,
 * }} input
 */
export async function updateFlashcard(userId, flashcardId, input) {
  const existing = await getOwnedFlashcardOrThrow(userId, flashcardId);

  if (Object.prototype.hasOwnProperty.call(input, 'materialId')) {
    if (input.materialId) {
      await assertMaterialBelongsToOwnedCourseForFlashcards(
        userId,
        existing.courseId,
        input.materialId,
      );
    }
  }

  /** @type {Record<string, unknown>} */
  const updateRow = {};

  if (input.question !== undefined) {
    updateRow.question = input.question.trim();
  }
  if (input.answer !== undefined) {
    updateRow.answer = input.answer.trim();
  }
  if (input.tags !== undefined) {
    updateRow.tags = input.tags;
  }
  if (Object.prototype.hasOwnProperty.call(input, 'materialId')) {
    updateRow.material_id = input.materialId ?? null;
  }

  const { data, error } = await getSupabaseAdmin()
    .from('flashcards')
    .update(updateRow)
    .eq('id', flashcardId)
    .eq('user_id', userId)
    .select(FLASHCARD_COLUMNS)
    .single();

  if (error) {
    handleFlashcardError(error);
  }

  if (!data) {
    throw new ApiError('NOT_FOUND', 'Flashcard not found', 404);
  }

  return mapFlashcard(data);
}

/**
 * @param {string} userId
 * @param {string} flashcardId
 */
export async function deleteFlashcard(userId, flashcardId) {
  const { data, error } = await getSupabaseAdmin()
    .from('flashcards')
    .delete()
    .eq('id', flashcardId)
    .eq('user_id', userId)
    .select('id')
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new ApiError('NOT_FOUND', 'Flashcard not found', 404);
    }
    throw new ApiError('DATABASE_ERROR', 'Failed to delete flashcard', 500);
  }

  if (!data) {
    throw new ApiError('NOT_FOUND', 'Flashcard not found', 404);
  }

  return { deleted: true };
}

/**
 * @param {string} userId
 * @param {string} flashcardId
 * @param {{ outcome: 'known' | 'unknown' }} input
 */
export async function reviewFlashcard(userId, flashcardId, input) {
  const existing = await getOwnedFlashcardOrThrow(userId, flashcardId);
  const isKnown = input.outcome === 'known';
  const now = new Date().toISOString();

  const updateRow = {
    mastery: isKnown ? 'known' : 'learning',
    last_reviewed_at: now,
    review_count: existing.reviewCount + 1,
    known_count: existing.knownCount + (isKnown ? 1 : 0),
    unknown_count: existing.unknownCount + (isKnown ? 0 : 1),
  };

  const { data, error } = await getSupabaseAdmin()
    .from('flashcards')
    .update(updateRow)
    .eq('id', flashcardId)
    .eq('user_id', userId)
    .select(FLASHCARD_COLUMNS)
    .single();

  if (error) {
    handleFlashcardError(error);
  }

  if (!data) {
    throw new ApiError('NOT_FOUND', 'Flashcard not found', 404);
  }

  return mapFlashcard(data);
}

