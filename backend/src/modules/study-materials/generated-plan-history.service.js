import { getSupabaseAdmin } from '../../config/supabase.js';
import { ApiError } from '../../shared/errors/ApiError.js';
import { parseAndValidateGeneratedPlan } from '../../shared/validation/generated-plan.schema.js';
import { getOwnedMaterialOrThrow } from './study-materials.service.js';

export const REACTIVATE_GENERATED_PLAN_RPC = 'reactivate_material_generated_plan';

const HISTORY_LIST_COLUMNS = 'id, created_at, updated_at, is_active';
const HISTORY_DETAIL_COLUMNS = 'id, plan, updated_at';

/**
 * @param {{ code?: string } | null} error
 */
function handleGeneratedPlanHistoryError(error) {
  if (!error) return;

  if (error.code === 'PGRST116') {
    throw new ApiError('NOT_FOUND', 'Generated plan not found', 404);
  }

  throw new ApiError('DATABASE_ERROR', 'Failed to access generated plan', 500);
}

/**
 * @param {{ id: string, created_at: string, updated_at: string, is_active: boolean }} row
 */
function mapHistoryListItem(row) {
  return {
    planId: row.id,
    savedAt: row.updated_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    isActive: row.is_active,
  };
}

/**
 * @param {string} userId
 * @param {string} materialId
 */
export async function listGeneratedPlansForMaterial(userId, materialId) {
  const owned = await getOwnedMaterialOrThrow(userId, materialId);

  const { data, error } = await getSupabaseAdmin()
    .from('material_generated_plans')
    .select(HISTORY_LIST_COLUMNS)
    .eq('study_material_id', materialId)
    .eq('course_id', owned.course_id)
    .order('created_at', { ascending: false });

  if (error) {
    throw new ApiError('DATABASE_ERROR', 'Failed to list generated plans', 500);
  }

  const plans = (data ?? []).map((row) =>
    mapHistoryListItem(/** @type {Parameters<typeof mapHistoryListItem>[0]} */ (row))
  );

  return { materialId, plans };
}

/**
 * @param {string} userId
 * @param {string} materialId
 * @param {string} planId
 */
export async function getGeneratedPlanByIdForMaterial(userId, materialId, planId) {
  const owned = await getOwnedMaterialOrThrow(userId, materialId);

  const { data, error } = await getSupabaseAdmin()
    .from('material_generated_plans')
    .select(HISTORY_DETAIL_COLUMNS)
    .eq('id', planId)
    .eq('study_material_id', materialId)
    .eq('course_id', owned.course_id)
    .single();

  if (error) {
    handleGeneratedPlanHistoryError(error);
  }

  if (data == null || typeof data !== 'object') {
    throw new ApiError('NOT_FOUND', 'Generated plan not found', 404);
  }

  const row = /** @type {{ id: string, plan: unknown, updated_at: string }} */ (data);
  const plan = parseAndValidateGeneratedPlan(row.plan);

  return {
    materialId,
    courseId: owned.course_id,
    planId: row.id,
    plan,
    savedAt: row.updated_at,
  };
}

/**
 * @param {string} userId
 * @param {string} materialId
 * @param {string} planId
 */
export async function activateGeneratedPlanForMaterial(userId, materialId, planId) {
  const owned = await getOwnedMaterialOrThrow(userId, materialId);

  const { data, error } = await getSupabaseAdmin().rpc(REACTIVATE_GENERATED_PLAN_RPC, {
    p_study_material_id: materialId,
    p_course_id: owned.course_id,
    p_plan_id: planId,
  });

  if (error) {
    throw new ApiError('DATABASE_ERROR', 'Failed to activate generated plan', 500);
  }

  const row = Array.isArray(data) ? data[0] : null;
  const activatedPlanId =
    row != null && typeof row === 'object' && typeof row.plan_id === 'string'
      ? row.plan_id
      : null;

  if (activatedPlanId == null) {
    throw new ApiError('NOT_FOUND', 'Generated plan not found', 404);
  }

  return getGeneratedPlanByIdForMaterial(userId, materialId, activatedPlanId);
}

/**
 * @param {string} userId
 * @param {string} materialId
 * @param {string} planId
 */
export async function deleteGeneratedPlanVersionForMaterial(userId, materialId, planId) {
  const owned = await getOwnedMaterialOrThrow(userId, materialId);

  const { data: existing, error: fetchError } = await getSupabaseAdmin()
    .from('material_generated_plans')
    .select('id, is_active')
    .eq('id', planId)
    .eq('study_material_id', materialId)
    .eq('course_id', owned.course_id)
    .single();

  if (fetchError) {
    handleGeneratedPlanHistoryError(fetchError);
  }

  if (existing == null || typeof existing !== 'object') {
    throw new ApiError('NOT_FOUND', 'Generated plan not found', 404);
  }

  if (/** @type {{ is_active: boolean }} */ (existing).is_active) {
    throw new ApiError('CONFLICT', 'Cannot delete the active generated plan', 409);
  }

  const { data, error } = await getSupabaseAdmin()
    .from('material_generated_plans')
    .delete()
    .eq('id', planId)
    .eq('study_material_id', materialId)
    .eq('course_id', owned.course_id)
    .eq('is_active', false)
    .select('id')
    .single();

  if (error) {
    handleGeneratedPlanHistoryError(error);
  }

  if (data == null || typeof data !== 'object') {
    throw new ApiError('NOT_FOUND', 'Generated plan not found', 404);
  }

  return { deleted: true, planId: /** @type {{ id: string }} */ (data).id };
}
