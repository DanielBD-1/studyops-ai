import { z } from 'zod';
import { processStudyText } from '../../clients/document-service.client.js';
import { getSupabaseAdmin } from '../../config/supabase.js';
import { ApiError } from '../../shared/errors/ApiError.js';
import { parseAndValidateGeneratedPlan } from '../../shared/validation/generated-plan.schema.js';

const studyTextLengthSchema = z
  .string()
  .trim()
  .min(100, 'Study material must be between 100 and 50,000 characters')
  .max(50000, 'Study material must be between 100 and 50,000 characters');

const LIST_COLUMNS = 'id, course_id, title, source_type, created_at, updated_at';
const DETAIL_COLUMNS = 'id, course_id, title, content, source_type, created_at, updated_at';
const OWNED_SELECT = `${DETAIL_COLUMNS}, courses!inner(id)`;

const TITLE_VALIDATION_MESSAGE = 'Material title must be between 3 and 150 characters';
const CONTENT_VALIDATION_MESSAGE =
  'Study material must be between 100 and 50,000 characters';
const SOURCE_TYPE_VALIDATION_MESSAGE = 'Source type must be manual or paste';
const MATERIAL_DATA_VALIDATION_MESSAGE = 'Invalid study material data';

const MATERIAL_CHECK_CONSTRAINTS = {
  study_materials_title_length: TITLE_VALIDATION_MESSAGE,
  study_materials_content_length: CONTENT_VALIDATION_MESSAGE,
  study_materials_source_type_allowed: SOURCE_TYPE_VALIDATION_MESSAGE,
};

/**
 * @param {{ message?: string, details?: string } | null | undefined} error
 * @returns {string}
 */
export function materialCheckValidationMessageFromError(error) {
  const haystack = `${error?.message ?? ''} ${error?.details ?? ''}`.toLowerCase();

  for (const [constraint, message] of Object.entries(MATERIAL_CHECK_CONSTRAINTS)) {
    if (haystack.includes(constraint)) {
      return message;
    }
  }

  return MATERIAL_DATA_VALIDATION_MESSAGE;
}

/**
 * @param {{ message?: string, details?: string } | null | undefined} error
 * @returns {string}
 */
function courseCheckValidationMessageFromError(_error) {
  return TITLE_VALIDATION_MESSAGE;
}

/**
 * @param {{ code?: string, message?: string, details?: string } | null} error
 * @param {'course' | 'material'} kind
 */
function handleStudyMaterialError(error, kind) {
  if (!error) return;

  if (error.code === 'PGRST116') {
    const message =
      kind === 'course' ? 'Course not found' : 'Study material not found';
    throw new ApiError('NOT_FOUND', message, 404);
  }

  if (error.code === '23514') {
    const message =
      kind === 'course'
        ? courseCheckValidationMessageFromError(error)
        : materialCheckValidationMessageFromError(error);
    throw new ApiError('VALIDATION_ERROR', message, 400);
  }

  throw new ApiError(
    'DATABASE_ERROR',
    kind === 'course' ? 'Failed to access course' : 'Failed to access study material',
    500
  );
}

/**
 * @param {{ code?: string } | null} error
 */
function handleGeneratedPlanError(error) {
  if (!error) return;

  if (error.code === 'PGRST116') {
    throw new ApiError('NOT_FOUND', 'Generated plan not found', 404);
  }

  throw new ApiError('DATABASE_ERROR', 'Failed to access generated plan', 500);
}

/**
 * @param {string} materialId
 * @param {string} courseId
 * @param {{ plan: unknown, updated_at: string }} row
 */
function mapGeneratedPlanResponse(materialId, courseId, row) {
  return {
    materialId,
    courseId,
    plan: row.plan,
    savedAt: row.updated_at,
  };
}

/**
 * @param {unknown} data
 * @param {'course' | 'material'} kind
 */
function assertRowPresent(data, kind) {
  if (data != null && typeof data === 'object') {
    return;
  }
  const message =
    kind === 'course' ? 'Course not found' : 'Study material not found';
  throw new ApiError('NOT_FOUND', message, 404);
}

/**
 * @param {{ id: string, course_id: string, title: string, source_type: string, created_at: string, updated_at: string }} row
 */
export function mapMaterialSummary(row) {
  return {
    id: row.id,
    courseId: row.course_id,
    title: row.title,
    sourceType: row.source_type,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * @param {{ id: string, course_id: string, title: string, content: string, source_type: string, created_at: string, updated_at: string }} row
 */
export function mapMaterialDetail(row) {
  return {
    ...mapMaterialSummary(row),
    content: row.content,
  };
}

/**
 * @param {string} userId
 * @param {string} courseId
 */
export async function assertCourseOwned(userId, courseId) {
  const { data, error } = await getSupabaseAdmin()
    .from('courses')
    .select('id')
    .eq('id', courseId)
    .eq('user_id', userId)
    .single();

  if (error) {
    handleStudyMaterialError(error, 'course');
  }

  assertRowPresent(data, 'course');
}

/**
 * @param {string} userId
 * @param {string} materialId
 * @returns {Promise<{ id: string, course_id: string, title: string, content: string, source_type: string, created_at: string, updated_at: string }>}
 */
export async function getOwnedMaterialOrThrow(userId, materialId) {
  const { data, error } = await getSupabaseAdmin()
    .from('study_materials')
    .select(OWNED_SELECT)
    .eq('id', materialId)
    .eq('courses.user_id', userId)
    .single();

  if (error) {
    handleStudyMaterialError(error, 'material');
  }

  assertRowPresent(data, 'material');

  const { courses: _courses, ...material } = /** @type {Record<string, unknown>} */ (data);
  return material;
}

/**
 * @param {string} userId
 * @param {string} courseId
 */
export async function listMaterials(userId, courseId) {
  await assertCourseOwned(userId, courseId);

  const { data, error } = await getSupabaseAdmin()
    .from('study_materials')
    .select(LIST_COLUMNS)
    .eq('course_id', courseId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new ApiError('DATABASE_ERROR', 'Failed to list study materials', 500);
  }

  return (data ?? []).map(mapMaterialSummary);
}

/**
 * @param {string} userId
 * @param {string} courseId
 * @param {{ title: string, content: string, sourceType?: 'manual' | 'paste' }} input
 */
export async function createMaterial(userId, courseId, input) {
  await assertCourseOwned(userId, courseId);

  const source_type = input.sourceType ?? 'manual';

  const { data, error } = await getSupabaseAdmin()
    .from('study_materials')
    .insert({
      course_id: courseId,
      title: input.title,
      content: input.content,
      source_type,
    })
    .select(DETAIL_COLUMNS)
    .single();

  if (error) {
    handleStudyMaterialError(error, 'material');
  }

  assertRowPresent(data, 'material');

  return mapMaterialDetail(/** @type {Parameters<typeof mapMaterialDetail>[0]} */ (data));
}

/**
 * @param {string} userId
 * @param {string} materialId
 */
export async function getMaterialById(userId, materialId) {
  const row = await getOwnedMaterialOrThrow(userId, materialId);
  return mapMaterialDetail(row);
}

/**
 * @param {string} userId
 * @param {string} materialId
 * @param {{ title?: string, content?: string, sourceType?: 'manual' | 'paste' }} patch
 */
export async function updateMaterial(userId, materialId, patch) {
  const owned = await getOwnedMaterialOrThrow(userId, materialId);

  /** @type {Record<string, string>} */
  const dbPatch = {};
  if (patch.title !== undefined) dbPatch.title = patch.title;
  if (patch.content !== undefined) dbPatch.content = patch.content;
  if (patch.sourceType !== undefined) dbPatch.source_type = patch.sourceType;

  const { data, error } = await getSupabaseAdmin()
    .from('study_materials')
    .update(dbPatch)
    .eq('id', materialId)
    .eq('course_id', owned.course_id)
    .select(DETAIL_COLUMNS)
    .single();

  if (error) {
    handleStudyMaterialError(error, 'material');
  }

  assertRowPresent(data, 'material');

  return mapMaterialDetail(/** @type {Parameters<typeof mapMaterialDetail>[0]} */ (data));
}

/**
 * @param {string} userId
 * @param {string} materialId
 */
export async function deleteMaterial(userId, materialId) {
  const owned = await getOwnedMaterialOrThrow(userId, materialId);

  const { data, error } = await getSupabaseAdmin()
    .from('study_materials')
    .delete()
    .eq('id', materialId)
    .eq('course_id', owned.course_id)
    .select('id')
    .single();

  if (error) {
    handleStudyMaterialError(error, 'material');
  }

  assertRowPresent(data, 'material');

  return { deleted: true, id: /** @type {{ id: string }} */ (data).id };
}

/**
 * @param {string} studyText
 */
function assertStudyTextLength(studyText) {
  const parsed = studyTextLengthSchema.safeParse(studyText);
  if (!parsed.success) {
    const message =
      parsed.error.issues[0]?.message ??
      'Study material must be between 100 and 50,000 characters';
    throw new ApiError('VALIDATION_ERROR', message, 400);
  }
}

/**
 * @param {string} userId
 * @param {string} materialId
 * @param {{ processStudyTextFn?: typeof processStudyText }} [options]
 */
/**
 * @param {string} materialId
 * @param {string} courseId
 * @param {unknown} plan
 * @returns {Promise<string>}
 */
async function persistValidatedGeneratedPlan(materialId, courseId, plan) {
  const validatedPlan = parseAndValidateGeneratedPlan(plan);

  const { data, error } = await getSupabaseAdmin()
    .from('material_generated_plans')
    .upsert(
      {
        study_material_id: materialId,
        course_id: courseId,
        plan: validatedPlan,
      },
      { onConflict: 'study_material_id' }
    )
    .select('updated_at')
    .single();

  if (error) {
    throw new ApiError('DATABASE_ERROR', 'Failed to save generated plan', 500);
  }

  if (data == null || typeof data !== 'object' || typeof data.updated_at !== 'string') {
    throw new ApiError('DATABASE_ERROR', 'Failed to save generated plan', 500);
  }

  return /** @type {{ updated_at: string }} */ (data).updated_at;
}

/**
 * @param {string} userId
 * @param {string} materialId
 */
export async function getGeneratedPlanByMaterial(userId, materialId) {
  const owned = await getOwnedMaterialOrThrow(userId, materialId);

  const { data, error } = await getSupabaseAdmin()
    .from('material_generated_plans')
    .select('plan, updated_at')
    .eq('study_material_id', materialId)
    .eq('course_id', owned.course_id)
    .single();

  if (error) {
    handleGeneratedPlanError(error);
  }

  if (data == null || typeof data !== 'object') {
    throw new ApiError('NOT_FOUND', 'Generated plan not found', 404);
  }

  return mapGeneratedPlanResponse(materialId, owned.course_id, /** @type {{ plan: unknown, updated_at: string }} */ (data));
}

/**
 * @param {string} userId
 * @param {string} materialId
 */
export async function deleteGeneratedPlanByMaterial(userId, materialId) {
  const owned = await getOwnedMaterialOrThrow(userId, materialId);

  const { data, error } = await getSupabaseAdmin()
    .from('material_generated_plans')
    .delete()
    .eq('study_material_id', materialId)
    .eq('course_id', owned.course_id)
    .select('id')
    .single();

  if (error) {
    handleGeneratedPlanError(error);
  }

  if (data == null || typeof data !== 'object') {
    throw new ApiError('NOT_FOUND', 'Generated plan not found', 404);
  }

  return { deleted: true };
}

/**
 * @param {string} userId
 * @param {string} materialId
 * @param {{ processStudyTextFn?: typeof processStudyText }} [options]
 */
export async function generateFromMaterial(userId, materialId, options = {}) {
  const processFn = options.processStudyTextFn ?? processStudyText;
  const row = await getOwnedMaterialOrThrow(userId, materialId);
  const studyText = row.content.trim();
  assertStudyTextLength(studyText);

  const rawPlan = await processFn(studyText);
  const plan = parseAndValidateGeneratedPlan(rawPlan);
  const savedAt = await persistValidatedGeneratedPlan(row.id, row.course_id, plan);

  return {
    materialId: row.id,
    courseId: row.course_id,
    plan,
    savedAt,
  };
}
