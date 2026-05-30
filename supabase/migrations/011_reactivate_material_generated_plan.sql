-- StudyOps AI — Phase 11A-2: reactivate historical generated plan (atomic)
-- Applied manually on Supabase — 2026-05-30 (Phase 11A-2 complete).
-- Scope: RPC only — no table/schema changes beyond this function.
-- Prerequisite: 010_material_generated_plans_active_history.sql applied.

-- =============================================================================
-- RPC: deactivate current active, activate selected plan (no insert, no prune)
-- Called by backend service role after ownership checks only.
-- =============================================================================

create or replace function public.reactivate_material_generated_plan(
  p_study_material_id uuid,
  p_course_id uuid,
  p_plan_id uuid
)
returns table (plan_id uuid, saved_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_target_active boolean;
  v_saved_at timestamptz;
  v_row_count int;
begin
  select mgp.is_active, mgp.updated_at
  into v_target_active, v_saved_at
  from public.material_generated_plans mgp
  where mgp.id = p_plan_id
    and mgp.study_material_id = p_study_material_id
    and mgp.course_id = p_course_id;

  if not found then
    return;
  end if;

  if v_target_active then
    return query select p_plan_id, v_saved_at;
    return;
  end if;

  update public.material_generated_plans
  set is_active = false
  where study_material_id = p_study_material_id
    and course_id = p_course_id
    and is_active = true;

  update public.material_generated_plans
  set is_active = true
  where id = p_plan_id
    and study_material_id = p_study_material_id
    and course_id = p_course_id;

  get diagnostics v_row_count = row_count;
  if v_row_count <> 1 then
    raise exception 'reactivate target not found' using errcode = 'P0002';
  end if;

  select mgp.updated_at
  into v_saved_at
  from public.material_generated_plans mgp
  where mgp.id = p_plan_id;

  return query select p_plan_id, v_saved_at;
end;
$$;

comment on function public.reactivate_material_generated_plan(uuid, uuid, uuid) is
  'Atomically deactivate the current active plan and activate an existing historical plan for the material. No insert or retention prune.';

revoke all on function public.reactivate_material_generated_plan(uuid, uuid, uuid) from public;
revoke execute on function public.reactivate_material_generated_plan(uuid, uuid, uuid) from anon;
revoke execute on function public.reactivate_material_generated_plan(uuid, uuid, uuid) from authenticated;
grant execute on function public.reactivate_material_generated_plan(uuid, uuid, uuid) to service_role;
