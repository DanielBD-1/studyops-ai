-- StudyOps AI — Phase 2A: public.study_materials + RLS + Data API grants
-- DRAFT: Not applied to any Supabase project until human approval to run.
-- Scope: study_materials table only. No API routes, UI, tasks, flashcards, or Gemini columns.
-- Prerequisite: 001_profiles.sql and 002_courses.sql applied.
-- Ownership: course-chain only (no study_materials.user_id).

-- =============================================================================
-- Table: public.study_materials
-- study_materials.course_id → courses.id → courses.user_id = auth.uid()
-- content = pasted study body (PRD input_text / API studyText)
-- =============================================================================

create table public.study_materials (
  id           uuid primary key default gen_random_uuid(),
  course_id    uuid not null references public.courses (id) on delete cascade,
  title        text not null,
  content      text not null,
  source_type  text not null default 'manual',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint study_materials_title_length check (
    char_length(trim(title)) >= 3
    and char_length(trim(title)) <= 150
  ),
  constraint study_materials_content_length check (
    char_length(trim(content)) >= 100
    and char_length(trim(content)) <= 50000
  ),
  constraint study_materials_source_type_allowed check (
    source_type in ('manual', 'paste')
  )
);

comment on table public.study_materials is
  'Study material under a course. Ownership via courses.user_id (no user_id on this table).';

comment on column public.study_materials.course_id is
  'Parent course; must belong to auth.uid() via courses.user_id.';

comment on column public.study_materials.title is
  'Short label; 3–150 chars after trim.';

comment on column public.study_materials.content is
  'Stored study text; 100–50000 chars after trim. Maps to PRD input_text / API studyText.';

comment on column public.study_materials.source_type is
  'How material was added: manual or paste only in Phase 2A.';

create index study_materials_course_id_idx
  on public.study_materials (course_id);

create index study_materials_course_id_created_at_idx
  on public.study_materials (course_id, created_at desc);

-- =============================================================================
-- Trigger: maintain updated_at on row update
-- =============================================================================

create or replace function public.set_study_materials_updated_at()
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

create trigger study_materials_set_updated_at
  before update on public.study_materials
  for each row
  execute function public.set_study_materials_updated_at();

-- =============================================================================
-- Row Level Security (ownership via parent course)
-- Policies use EXISTS on public.courses. No admin policies in Phase 2A.
-- =============================================================================

alter table public.study_materials enable row level security;

create policy study_materials_select_own_course
  on public.study_materials
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.courses c
      where c.id = study_materials.course_id
        and c.user_id = auth.uid()
    )
  );

create policy study_materials_insert_own_course
  on public.study_materials
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.courses c
      where c.id = study_materials.course_id
        and c.user_id = auth.uid()
    )
  );

create policy study_materials_update_own_course
  on public.study_materials
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.courses c
      where c.id = study_materials.course_id
        and c.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.courses c
      where c.id = study_materials.course_id
        and c.user_id = auth.uid()
    )
  );

create policy study_materials_delete_own_course
  on public.study_materials
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.courses c
      where c.id = study_materials.course_id
        and c.user_id = auth.uid()
    )
  );

-- =============================================================================
-- Data API grants (required when "Automatically expose new tables" is OFF)
-- GRANT = role may access table via PostgREST; RLS = which rows are allowed.
-- Revoke all from each role first, then grant only SELECT/INSERT/UPDATE/DELETE
-- (no REFERENCES, TRIGGER, TRUNCATE, or GRANT ALL).
-- =============================================================================

revoke all on table public.study_materials from anon;
revoke all on table public.study_materials from authenticated;
revoke all on table public.study_materials from service_role;

grant select, insert, update, delete
  on table public.study_materials
  to authenticated;

grant select, insert, update, delete
  on table public.study_materials
  to service_role;
