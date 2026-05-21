-- StudyOps AI — Phase 1E: public.courses + RLS + Data API grants
-- DRAFT: Not applied to any Supabase project until human approval to run.
-- Scope: courses table only. No API routes, UI, tasks, flashcards, or materials.
-- Prerequisite: 001_profiles.sql applied.

-- =============================================================================
-- Table: public.courses
-- courses.user_id = auth.uid() = profiles.id = auth.users.id
-- =============================================================================

create table public.courses (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  title       text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint courses_title_length check (
    char_length(trim(title)) >= 3
    and char_length(trim(title)) <= 100
  )
);

comment on table public.courses is
  'Student-owned course. user_id = auth.users.id = profiles.id = auth.uid().';

comment on column public.courses.user_id is
  'Owner; same uuid as auth.uid() and public.profiles.id.';

comment on column public.courses.title is
  'Course title; 3–100 chars after trim (DB check; app validates in API phase).';

create index courses_user_id_idx on public.courses (user_id);

create index courses_user_id_created_at_idx on public.courses (user_id, created_at desc);

-- =============================================================================
-- Trigger: maintain updated_at on row update
-- =============================================================================

create or replace function public.set_courses_updated_at()
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

create trigger courses_set_updated_at
  before update on public.courses
  for each row
  execute function public.set_courses_updated_at();

-- =============================================================================
-- Row Level Security (student owns rows via user_id)
-- No admin policies in Phase 1E.
-- =============================================================================

alter table public.courses enable row level security;

create policy courses_select_own
  on public.courses
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy courses_insert_own
  on public.courses
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy courses_update_own
  on public.courses
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy courses_delete_own
  on public.courses
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- =============================================================================
-- Data API grants (required when "Automatically expose new tables" is OFF)
-- GRANT = role may access table via PostgREST; RLS = which rows are allowed.
-- =============================================================================

revoke all on table public.courses from anon;

grant select, insert, update, delete
  on table public.courses
  to authenticated;

grant select, insert, update, delete
  on table public.courses
  to service_role;
