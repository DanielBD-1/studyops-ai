-- StudyOps AI — Phase 3B-b: public.flashcards + RLS + Data API grants
-- Applied manually in Supabase SQL Editor on 2026-05-26 (Success. No rows returned.).
-- Verified manually after apply (catalog + behavioral probes; see docs/database/006-flashcards-schema-and-rls.md).
-- Scope: flashcards table only. No API routes, UI, flashcard import, or known/unknown tracking.
-- Prerequisite: migrations 001–005 applied (profiles, courses, study_materials, material_generated_plans, study_tasks).
-- Not in this phase: backend API, frontend UI, flashcard import, spaced repetition, Trello/focus/dashboard/admin.
-- Do not re-apply on environments where public.flashcards already exists.

-- =============================================================================
-- Table: public.flashcards
-- Student-owned flashcards owned by user_id; scoped to course_id and optional material_id.
-- source is 'manual' only for this phase.
-- =============================================================================

create table public.flashcards (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users (id) on delete cascade,
  course_id         uuid not null references public.courses (id) on delete cascade,
  material_id       uuid references public.study_materials (id) on delete set null,
  question          text not null,
  answer            text not null,
  tags              text[] not null default '{}',
  source            text not null default 'manual',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  constraint flashcards_question_length check (
    char_length(trim(question)) >= 10
    and char_length(trim(question)) <= 500
  ),
  constraint flashcards_answer_length check (
    char_length(trim(answer)) >= 10
    and char_length(trim(answer)) <= 2000
  ),
  constraint flashcards_tags_cardinality check (
    cardinality(tags) <= 5
  ),
  constraint flashcards_source_allowed check (
    source in ('manual')
  )
);

comment on table public.flashcards is
  'Student-owned flashcards. Normalized storage for later DB-backed flashcard UI/API phases.';

comment on column public.flashcards.user_id is
  'Owner; must equal courses.user_id for course_id (trigger-enforced). Same uuid as auth.uid().';

comment on column public.flashcards.course_id is
  'Parent course; must belong to user_id via courses.user_id.';

comment on column public.flashcards.material_id is
  'Optional link to study material; when set, must belong to course_id. Cleared on material delete (SET NULL).';

comment on column public.flashcards.question is
  'Flashcard question text; CHECKed for 10–500 chars after trim.';

comment on column public.flashcards.answer is
  'Flashcard answer text; CHECKed for 10–2000 chars after trim.';

comment on column public.flashcards.tags is
  'Stored tag array (max 5). Not editable in this phase; used for later import/UI.';

comment on column public.flashcards.source is
  'Source of flashcard content. Only manual source is allowed in this phase.';

create index flashcards_user_id_created_at_idx
  on public.flashcards (user_id, created_at desc);

create index flashcards_course_id_created_at_idx
  on public.flashcards (course_id, created_at desc);

create index flashcards_material_id_idx
  on public.flashcards (material_id)
  where material_id is not null;

-- =============================================================================
-- Trigger: maintain updated_at on row update
-- =============================================================================

create or replace function public.set_flashcards_updated_at()
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

create trigger flashcards_set_updated_at
  before update on public.flashcards
  for each row
  execute function public.set_flashcards_updated_at();

-- =============================================================================
-- Trigger: user_id must match courses.user_id for course_id
-- =============================================================================

create or replace function public.enforce_flashcard_user_course_owner()
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

create trigger flashcards_enforce_user_course_owner
  before insert or update on public.flashcards
  for each row
  execute function public.enforce_flashcard_user_course_owner();

-- =============================================================================
-- Trigger: material_id must belong to course_id when material_id is not null
-- =============================================================================

create or replace function public.enforce_flashcard_course_material_match()
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

create trigger flashcards_enforce_course_material_match
  before insert or update on public.flashcards
  for each row
  execute function public.enforce_flashcard_course_material_match();

-- =============================================================================
-- Row Level Security (student owns rows via user_id + course/material alignment)
-- Policies apply to authenticated only. service_role bypasses RLS — app must filter.
-- =============================================================================

alter table public.flashcards enable row level security;

create policy flashcards_select_own
  on public.flashcards
  for select
  to authenticated
  using (user_id = auth.uid());

create policy flashcards_insert_own
  on public.flashcards
  for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1
      from public.courses c
      where c.id = flashcards.course_id
        and c.user_id = auth.uid()
    )
    and (
      material_id is null
      or exists (
        select 1
        from public.study_materials sm
        where sm.id = flashcards.material_id
          and sm.course_id = flashcards.course_id
      )
    )
  );

create policy flashcards_update_own
  on public.flashcards
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and exists (
      select 1
      from public.courses c
      where c.id = flashcards.course_id
        and c.user_id = auth.uid()
    )
    and (
      material_id is null
      or exists (
        select 1
        from public.study_materials sm
        where sm.id = flashcards.material_id
          and sm.course_id = flashcards.course_id
      )
    )
  );

create policy flashcards_delete_own
  on public.flashcards
  for delete
  to authenticated
  using (user_id = auth.uid());

-- =============================================================================
-- Data API grants (required when "Automatically expose new tables" is OFF)
-- GRANT = role may access table via PostgREST; RLS = which rows are allowed.
-- =============================================================================

revoke all on table public.flashcards from anon;
revoke all on table public.flashcards from authenticated;
revoke all on table public.flashcards from service_role;

grant select, insert, update, delete
  on table public.flashcards
  to authenticated;

grant select, insert, update, delete
  on table public.flashcards
  to service_role;

