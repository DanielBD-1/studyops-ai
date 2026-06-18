import { getSupabaseAdmin } from '../../config/supabase.js';
import { ApiError } from '../../shared/errors/ApiError.js';
import { taskCheckValidationMessageFromError } from '../tasks/tasks.service.js';
import { getOwnedMaterialOrThrow } from './study-materials.service.js';

const PLAN_TASK_COLUMNS =
  'id, course_id, material_id, title, description, priority, estimated_minutes, difficulty, tags, status, source, due_date, created_at, updated_at';

const PLAN_FLASHCARD_COLUMNS =
  'id, course_id, material_id, question, answer, tags, source, created_at, updated_at';

/** Matches DB index: lower(trim(...)) */
function normalizePlanImportDedupeText(value) {
  return value.trim().toLowerCase();
}

/** @param {string} question @param {string} answer */
function planFlashcardDedupeKey(question, answer) {
  return `${normalizePlanImportDedupeText(question)}\0${normalizePlanImportDedupeText(answer)}`;
}

/**
 * @param {{ code?: string, message?: string, details?: string } | null} error
 * @param {'task' | 'flashcard'} kind
 * @returns {'duplicate' | 'validation' | 'fatal'}
 */
function classifyPlanImportInsertError(error, kind) {
  if (!error) return 'fatal';

  if (error.code === '23505') {
    return 'duplicate';
  }

  if (error.code === '23514') {
    return 'validation';
  }

  const haystack = `${error.message ?? ''} ${error.details ?? ''}`.toLowerCase();
  if (kind === 'task' && haystack.includes('study_tasks_plan_import_dedupe_idx')) {
    return 'duplicate';
  }
  if (kind === 'flashcard' && haystack.includes('flashcards_plan_import_dedupe_idx')) {
    return 'duplicate';
  }

  return 'fatal';
}

/**
 * @param {string} userId
 * @param {string} materialId
 * @param {Array<{
 *   title: string,
 *   description?: string,
 *   priority?: 'low' | 'medium' | 'high',
 *   estimatedMinutes: number,
 * }>} tasks
 */
export async function importPlanTasksForMaterial(userId, materialId, tasks) {
  const material = await getOwnedMaterialOrThrow(userId, materialId);
  const courseId = material.course_id;

  const { data: existingRows, error: listError } = await getSupabaseAdmin()
    .from('study_tasks')
    .select('title')
    .eq('user_id', userId)
    .eq('material_id', materialId)
    .eq('source', 'plan');

  if (listError) {
    throw new ApiError('DATABASE_ERROR', 'Failed to import plan tasks', 500);
  }

  const existingTitles = new Set(
    (existingRows ?? []).map((row) =>
      normalizePlanImportDedupeText(
        typeof row.title === 'string' ? row.title : String(row.title)
      )
    )
  );

  let imported = 0;
  let skipped = 0;
  let failed = 0;

  for (const task of tasks) {
    const title = task.title.trim();

    const dedupeKey = normalizePlanImportDedupeText(title);

    if (existingTitles.has(dedupeKey)) {
      skipped += 1;
      continue;
    }

    const { error } = await getSupabaseAdmin()
      .from('study_tasks')
      .insert({
        user_id: userId,
        course_id: courseId,
        material_id: materialId,
        title,
        description: task.description?.trim() ?? '',
        priority: task.priority ?? 'medium',
        estimated_minutes: task.estimatedMinutes,
        difficulty: 'medium',
        tags: [],
        source: 'plan',
        status: 'pending',
      })
      .select(PLAN_TASK_COLUMNS)
      .single();

    if (error) {
      const kind = classifyPlanImportInsertError(error, 'task');
      if (kind === 'duplicate') {
        skipped += 1;
        existingTitles.add(dedupeKey);
        continue;
      }
      if (kind === 'validation') {
        failed += 1;
        continue;
      }
      throw new ApiError(
        'DATABASE_ERROR',
        taskCheckValidationMessageFromError(error),
        500
      );
    }

    imported += 1;
    existingTitles.add(dedupeKey);
  }

  return {
    imported,
    skipped,
    failed,
    total: tasks.length,
  };
}

/**
 * @param {string} userId
 * @param {string} materialId
 * @param {Array<{
 *   question: string,
 *   answer: string,
 *   tags?: string[],
 * }>} flashcards
 */
export async function importPlanFlashcardsForMaterial(userId, materialId, flashcards) {
  const material = await getOwnedMaterialOrThrow(userId, materialId);
  const courseId = material.course_id;

  const { data: existingRows, error: listError } = await getSupabaseAdmin()
    .from('flashcards')
    .select('question, answer')
    .eq('user_id', userId)
    .eq('material_id', materialId)
    .eq('source', 'plan');

  if (listError) {
    throw new ApiError('DATABASE_ERROR', 'Failed to import plan flashcards', 500);
  }

  const existingFlashcardKeys = new Set(
    (existingRows ?? []).map((row) =>
      planFlashcardDedupeKey(
        typeof row.question === 'string' ? row.question : String(row.question),
        typeof row.answer === 'string' ? row.answer : String(row.answer ?? '')
      )
    )
  );

  let imported = 0;
  let skipped = 0;
  let failed = 0;

  for (const flashcard of flashcards) {
    const question = flashcard.question.trim();
    const answer = flashcard.answer.trim();

    const dedupeKey = planFlashcardDedupeKey(question, answer);

    if (existingFlashcardKeys.has(dedupeKey)) {
      skipped += 1;
      continue;
    }

    const { error } = await getSupabaseAdmin()
      .from('flashcards')
      .insert({
        user_id: userId,
        course_id: courseId,
        material_id: materialId,
        question,
        answer,
        tags: flashcard.tags ?? [],
        source: 'plan',
      })
      .select(PLAN_FLASHCARD_COLUMNS)
      .single();

    if (error) {
      const kind = classifyPlanImportInsertError(error, 'flashcard');
      if (kind === 'duplicate') {
        skipped += 1;
        existingFlashcardKeys.add(dedupeKey);
        continue;
      }
      if (kind === 'validation') {
        failed += 1;
        continue;
      }
      throw new ApiError('DATABASE_ERROR', 'Failed to import plan flashcards', 500);
    }

    imported += 1;
    existingFlashcardKeys.add(dedupeKey);
  }

  return {
    imported,
    skipped,
    failed,
    total: flashcards.length,
  };
}
