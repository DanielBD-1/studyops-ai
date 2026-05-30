import { getSupabaseAdmin } from '../../config/supabase.js';
import { ApiError } from '../../shared/errors/ApiError.js';
import { parseAndValidateGeneratedPlan } from '../../shared/validation/generated-plan.schema.js';

/** Max persisted plan rows per study material (active + inactive), including active. */
export const MAX_GENERATED_PLANS_PER_MATERIAL = 10;

export const ACTIVATE_GENERATED_PLAN_RPC = 'activate_material_generated_plan';

/**
 * @param {string} materialId
 * @param {string} courseId
 * @param {unknown} plan
 * @returns {Promise<string>}
 */
export async function persistValidatedGeneratedPlan(materialId, courseId, plan) {
  const validatedPlan = parseAndValidateGeneratedPlan(plan);

  const { data, error } = await getSupabaseAdmin().rpc(ACTIVATE_GENERATED_PLAN_RPC, {
    p_study_material_id: materialId,
    p_course_id: courseId,
    p_plan: validatedPlan,
    p_max_rows: MAX_GENERATED_PLANS_PER_MATERIAL,
  });

  if (error) {
    throw new ApiError('DATABASE_ERROR', 'Failed to save generated plan', 500);
  }

  const row = Array.isArray(data) ? data[0] : null;
  const savedAt =
    row != null && typeof row === 'object' && typeof row.saved_at === 'string'
      ? row.saved_at
      : null;

  if (savedAt == null) {
    throw new ApiError('DATABASE_ERROR', 'Failed to save generated plan', 500);
  }

  return savedAt;
}
