-- StudyOps AI — Phase 2L-a: public.material_generated_plans + RLS + Data API grants
-- DRAFT: Not applied to any Supabase project until human approval to run.
-- Scope: persisted latest AI-generated study plan per study material (jsonb only).
-- Prerequisite: 001_profiles.sql, 002_courses.sql, and 003_study_materials.sql applied.
-- Not in this phase: backend API, frontend UI, study_tasks, flashcards, plan history, raw Gemini storage.

-- =============================================================================
-- Table: public.material_generated_plans
-- One latest validated plan per study_material_id (UNIQUE).
-- Ownership: course-chain via material_generated_plans.course_id → courses.user_id
-- No user_id column; no study material content duplication; no raw model responses.
-- =============================================================================

create table public.material_generated_plans (
  id                uuid primary key default gen_random_uuid(),
  study_material_id uuid not null unique references public.study_materials (id) on delete cascade,
  course_id         uuid not null references public.courses (id) on delete cascade,
  plan              jsonb not null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  constraint material_generated_plans_plan_is_object check (
    jsonb_typeof(plan) = 'object'
  ),
  constraint material_generated_plans_plan_size check (
    pg_column_size(plan) <= 262144
  )
);

comment on table public.material_generated_plans is
  'Latest AI-generated study plan per study material. One row per study_material_id; validated plan jsonb only.';

comment on column public.material_generated_plans.study_material_id is
  'Parent study material; UNIQUE — at most one persisted plan per material.';

comment on column public.material_generated_plans.course_id is
  'Denormalized parent course for RLS and ownership checks; must match study_materials.course_id.';

comment on column public.material_generated_plans.plan is
  'Server-validated plan object (summary, keyTopics, tasks, flashcards, difficulty). Untrusted until backend Zod validation before write.';

create index material_generated_plans_course_id_idx
  on public.material_generated_plans (course_id);

-- =============================================================================
-- Trigger: maintain updated_at on row update
-- =============================================================================

create or replace function public.set_material_generated_plans_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger material_generated_plans_set_updated_at
  before update on public.material_generated_plans
  for each row
  execute function public.set_material_generated_plans_updated_at();

-- =============================================================================
-- Trigger: study_material_id must belong to course_id (integrity for service_role)
-- =============================================================================

create or replace function public.enforce_material_generated_plan_course_match()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if not exists (
    select 1
    from public.study_materials sm
    where sm.id = new.study_material_id
      and sm.course_id = new.course_id
  ) then
    raise exception 'study_material_id must belong to course_id'
      using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger material_generated_plans_enforce_course_match
  before insert or update on public.material_generated_plans
  for each row
  execute function public.enforce_material_generated_plan_course_match();

-- =============================================================================
-- Row Level Security (ownership via parent course + material course match)
-- Policies apply to authenticated only. service_role bypasses RLS — app must filter.
-- =============================================================================

alter table public.material_generated_plans enable row level security;

create policy material_generated_plans_select_own_course
  on public.material_generated_plans
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.courses c
      where c.id = material_generated_plans.course_id
        and c.user_id = auth.uid()
    )
    and exists (
      select 1
      from public.study_materials sm
      where sm.id = material_generated_plans.study_material_id
        and sm.course_id = material_generated_plans.course_id
    )
  );

create policy material_generated_plans_insert_own_course
  on public.material_generated_plans
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.courses c
      where c.id = material_generated_plans.course_id
        and c.user_id = auth.uid()
    )
    and exists (
      select 1
      from public.study_materials sm
      where sm.id = material_generated_plans.study_material_id
        and sm.course_id = material_generated_plans.course_id
    )
  );

create policy material_generated_plans_update_own_course
  on public.material_generated_plans
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.courses c
      where c.id = material_generated_plans.course_id
        and c.user_id = auth.uid()
    )
    and exists (
      select 1
      from public.study_materials sm
      where sm.id = material_generated_plans.study_material_id
        and sm.course_id = material_generated_plans.course_id
    )
  )
  with check (
    exists (
      select 1
      from public.courses c
      where c.id = material_generated_plans.course_id
        and c.user_id = auth.uid()
    )
    and exists (
      select 1
      from public.study_materials sm
      where sm.id = material_generated_plans.study_material_id
        and sm.course_id = material_generated_plans.course_id
    )
  );

create policy material_generated_plans_delete_own_course
  on public.material_generated_plans
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.courses c
      where c.id = material_generated_plans.course_id
        and c.user_id = auth.uid()
    )
    and exists (
      select 1
      from public.study_materials sm
      where sm.id = material_generated_plans.study_material_id
        and sm.course_id = material_generated_plans.course_id
    )
  );

-- =============================================================================
-- Data API grants (required when "Automatically expose new tables" is OFF)
-- GRANT = role may access table via PostgREST; RLS = which rows are allowed.
-- Revoke all from each role first, then grant only SELECT/INSERT/UPDATE/DELETE.
-- service_role is for backend server only — never in frontend env.
-- =============================================================================

revoke all on table public.material_generated_plans from anon;
revoke all on table public.material_generated_plans from authenticated;
revoke all on table public.material_generated_plans from service_role;

grant select, insert, update, delete
  on table public.material_generated_plans
  to authenticated;

grant select, insert, update, delete
  on table public.material_generated_plans
  to service_role;
