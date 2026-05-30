-- StudyOps AI — Phase 11A-1: material_generated_plans active history + retention
-- DRAFT: Not applied to any Supabase project until human approval to run.
-- Scope: multiple rows per study_material_id; one active row; max 10 rows per material.
-- Prerequisite: 004_material_generated_plans.sql applied.

-- =============================================================================
-- Evolve table: is_active + drop one-row-per-material UNIQUE
-- =============================================================================

alter table public.material_generated_plans
  add column if not exists is_active boolean not null default false;

comment on column public.material_generated_plans.is_active is
  'True for the single current plan shown in GET /generated-plan; at most one active row per study_material_id.';

update public.material_generated_plans
set is_active = true
where is_active = false;

alter table public.material_generated_plans
  drop constraint if exists material_generated_plans_study_material_id_key;

comment on table public.material_generated_plans is
  'Validated AI-generated study plans per study material. Multiple historical rows; one active row per material (Phase 11A-1).';

comment on column public.material_generated_plans.study_material_id is
  'Parent study material; multiple plan versions allowed; exactly one row with is_active = true per material.';

-- =============================================================================
-- Indexes: active lookup, inactive prune ordering, one active per material
-- =============================================================================

create unique index if not exists material_generated_plans_one_active_per_material_idx
  on public.material_generated_plans (study_material_id)
  where is_active = true;

create index if not exists material_generated_plans_active_lookup_idx
  on public.material_generated_plans (study_material_id, course_id)
  where is_active = true;

create index if not exists material_generated_plans_inactive_prune_idx
  on public.material_generated_plans (study_material_id, course_id, created_at)
  where is_active = false;

-- =============================================================================
-- RPC: deactivate prior active, insert new active, prune oldest inactive (atomic)
-- Called by backend service role after Zod validation only.
-- =============================================================================

create or replace function public.activate_material_generated_plan(
  p_study_material_id uuid,
  p_course_id uuid,
  p_plan jsonb,
  p_max_rows int default 10
)
returns table (plan_id uuid, saved_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_plan_id uuid;
  v_saved_at timestamptz;
  v_row_count int;
  v_excess int;
begin
  if p_max_rows < 1 then
    raise exception 'p_max_rows must be at least 1' using errcode = '22023';
  end if;

  update public.material_generated_plans
  set is_active = false
  where study_material_id = p_study_material_id
    and course_id = p_course_id
    and is_active = true;

  insert into public.material_generated_plans (
    study_material_id,
    course_id,
    plan,
    is_active
  )
  values (
    p_study_material_id,
    p_course_id,
    p_plan,
    true
  )
  returning id, updated_at into v_plan_id, v_saved_at;

  select count(*)::int
  into v_row_count
  from public.material_generated_plans
  where study_material_id = p_study_material_id
    and course_id = p_course_id;

  v_excess := v_row_count - p_max_rows;

  if v_excess > 0 then
    delete from public.material_generated_plans mgp
    where mgp.id in (
      select candidate.id
      from public.material_generated_plans candidate
      where candidate.study_material_id = p_study_material_id
        and candidate.course_id = p_course_id
        and candidate.is_active = false
      order by candidate.created_at asc
      limit v_excess
    );
  end if;

  return query select v_plan_id, v_saved_at;
end;
$$;

comment on function public.activate_material_generated_plan(uuid, uuid, jsonb, int) is
  'Atomically deactivate prior active plan, insert new active plan, and prune oldest inactive rows over p_max_rows per material.';

revoke all on function public.activate_material_generated_plan(uuid, uuid, jsonb, int) from public;
grant execute on function public.activate_material_generated_plan(uuid, uuid, jsonb, int) to service_role;
