-- StudyOps AI — Phase 3A-a: public.study_tasks + RLS + Data API grants
-- DRAFT: Not applied to any Supabase project until human approval to run.
-- Scope: study_tasks table only. No API routes, UI, AI import, Trello, or flashcards.
-- Prerequisite: 001_profiles.sql, 002_courses.sql, and 003_study_materials.sql applied.
-- Not in this phase: backend API, frontend UI, difficulty/tags edit surfaces (defaults only).

-- =============================================================================
-- Table: public.study_tasks
-- Manual study tasks owned by user_id; scoped to course_id; optional material_id.
-- difficulty and tags are stored for PRD/future import; Phase 3A defaults only.
-- =============================================================================

create table public.study_tasks (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users (id) on delete cascade,
  course_id         uuid not null references public.courses (id) on delete cascade,
  material_id       uuid references public.study_materials (id) on delete set null,
  title             text not null,
  description       text not null default '',
  priority          text not null default 'medium',
  estimated_minutes integer not null,
  difficulty        text not null default 'medium',
  tags              text[] not null default '{}',
  status            text not null default 'pending',
  source            text not null default 'manual',
  trello_card_id    text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  constraint study_tasks_title_length check (
    char_length(trim(title)) >= 3
    and char_length(trim(title)) <= 200
  ),
  constraint study_tasks_description_length check (
    char_length(trim(description)) >= 0
    and char_length(trim(description)) <= 1000
  ),
  constraint study_tasks_priority_allowed check (
    priority in ('low', 'medium', 'high')
  ),
  constraint study_tasks_estimated_minutes_range check (
    estimated_minutes >= 5
    and estimated_minutes <= 480
  ),
  constraint study_tasks_difficulty_allowed check (
    difficulty in ('easy', 'medium', 'hard')
  ),
  constraint study_tasks_tags_cardinality check (
    cardinality(tags) <= 5
  ),
  constraint study_tasks_status_allowed check (
    status in ('pending', 'completed')
  ),
  constraint study_tasks_source_allowed check (
    source in ('manual')
  )
);

comment on table public.study_tasks is
  'Student-owned study tasks. Manual create in Phase 3A; optional material link. difficulty/tags stored with defaults until a later product phase.';

comment on column public.study_tasks.user_id is
  'Owner; must equal courses.user_id for course_id (trigger-enforced). Same uuid as auth.uid().';

comment on column public.study_tasks.course_id is
  'Parent course; must belong to user_id via courses.user_id.';

comment on column public.study_tasks.material_id is
  'Optional link to study material; when set, must belong to course_id. Cleared on material delete (SET NULL).';

comment on column public.study_tasks.title is
  'Task title; 3–200 chars after trim.';

comment on column public.study_tasks.description is
  'Task description; 0–1000 chars after trim.';

comment on column public.study_tasks.priority is
  'low, medium, or high.';

comment on column public.study_tasks.estimated_minutes is
  'Estimated study time; 5–480 minutes.';

comment on column public.study_tasks.difficulty is
  'Stored for PRD/import compatibility; default medium for manual tasks. Not editable in Phase 3A API/UI.';

comment on column public.study_tasks.tags is
  'Stored text array (max 5); default empty for manual tasks. Not editable in Phase 3A API/UI.';

comment on column public.study_tasks.status is
  'pending or completed only in Phase 3A-a.';

comment on column public.study_tasks.source is
  'manual only in Phase 3A-a; future phases may add ai_imported.';

comment on column public.study_tasks.trello_card_id is
  'Nullable Trello card id; no sync logic in Phase 3A-a.';

create index study_tasks_user_id_created_at_idx
  on public.study_tasks (user_id, created_at desc);

create index study_tasks_user_id_status_idx
  on public.study_tasks (user_id, status);

create index study_tasks_course_id_created_at_idx
  on public.study_tasks (course_id, created_at desc);

create index study_tasks_material_id_idx
  on public.study_tasks (material_id)
  where material_id is not null;

-- =============================================================================
-- Trigger: maintain updated_at on row update
-- =============================================================================

create or replace function public.set_study_tasks_updated_at()
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

create trigger study_tasks_set_updated_at
  before update on public.study_tasks
  for each row
  execute function public.set_study_tasks_updated_at();

-- =============================================================================
-- Trigger: user_id must match courses.user_id for course_id
-- =============================================================================

create or replace function public.enforce_study_task_user_course_owner()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if not exists (
    select 1
    from public.courses c
    where c.id = new.course_id
      and c.user_id = new.user_id
  ) then
    raise exception 'user_id must match the owner of course_id'
      using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger study_tasks_enforce_user_course_owner
  before insert or update on public.study_tasks
  for each row
  execute function public.enforce_study_task_user_course_owner();

-- =============================================================================
-- Trigger: material_id must belong to course_id when material_id is not null
-- =============================================================================

create or replace function public.enforce_study_task_course_material_match()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if new.material_id is not null
    and not exists (
      select 1
      from public.study_materials sm
      where sm.id = new.material_id
        and sm.course_id = new.course_id
    )
  then
    raise exception 'material_id must belong to course_id'
      using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger study_tasks_enforce_course_material_match
  before insert or update on public.study_tasks
  for each row
  execute function public.enforce_study_task_course_material_match();

-- =============================================================================
-- Row Level Security (student owns rows via user_id + course/material alignment)
-- Policies apply to authenticated only. service_role bypasses RLS — app must filter.
-- No admin policies in Phase 3A-a.
-- =============================================================================

alter table public.study_tasks enable row level security;

create policy study_tasks_select_own
  on public.study_tasks
  for select
  to authenticated
  using (user_id = auth.uid());

create policy study_tasks_insert_own
  on public.study_tasks
  for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1
      from public.courses c
      where c.id = study_tasks.course_id
        and c.user_id = auth.uid()
    )
    and (
      material_id is null
      or exists (
        select 1
        from public.study_materials sm
        where sm.id = study_tasks.material_id
          and sm.course_id = study_tasks.course_id
      )
    )
  );

create policy study_tasks_update_own
  on public.study_tasks
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and exists (
      select 1
      from public.courses c
      where c.id = study_tasks.course_id
        and c.user_id = auth.uid()
    )
    and (
      material_id is null
      or exists (
        select 1
        from public.study_materials sm
        where sm.id = study_tasks.material_id
          and sm.course_id = study_tasks.course_id
      )
    )
  );

create policy study_tasks_delete_own
  on public.study_tasks
  for delete
  to authenticated
  using (user_id = auth.uid());

-- =============================================================================
-- Data API grants (required when "Automatically expose new tables" is OFF)
-- GRANT = role may access table via PostgREST; RLS = which rows are allowed.
-- Revoke all from each role first, then grant only SELECT/INSERT/UPDATE/DELETE.
-- service_role is for backend server only — never in frontend env.
-- =============================================================================

revoke all on table public.study_tasks from anon;
revoke all on table public.study_tasks from authenticated;
revoke all on table public.study_tasks from service_role;

grant select, insert, update, delete
  on table public.study_tasks
  to authenticated;

grant select, insert, update, delete
  on table public.study_tasks
  to service_role;
