-- StudyOps AI — Phase 4C-0: public.focus_sessions + RLS + Data API grants
-- DRAFT: Not applied to any Supabase project until human approval to run.
-- Scope: focus_sessions table only. No backend API, frontend /focus page, or dashboard stats.
-- Prerequisite: migrations 001–007 applied (profiles, courses, study_materials,
--   material_generated_plans, study_tasks, flashcards, trello_sync_logs).
-- Not in this phase: POST /api/focus routes, frontend timer UI, dashboard totalFocusMinutes.
-- Do not re-apply on environments where public.focus_sessions already exists.

-- =============================================================================
-- Table: public.focus_sessions
-- Pomodoro-style focus sessions tied to an owned study task.
-- duration_minutes: provisional session ceiling while ended_at IS NULL;
--   actual completed focus minutes after ended_at is set (backend overwrites on complete).
-- Rows with ended_at IS NULL are in-progress/abandoned — excluded from dashboard totals.
-- =============================================================================

create table public.focus_sessions (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users (id) on delete cascade,
  course_id         uuid not null references public.courses (id) on delete cascade,
  task_id           uuid not null references public.study_tasks (id) on delete cascade,
  duration_minutes  integer not null,
  completed_task    boolean not null default false,
  started_at        timestamptz not null default now(),
  ended_at          timestamptz,
  constraint focus_sessions_duration_minutes_range check (
    duration_minutes >= 1
    and duration_minutes <= 120
  ),
  constraint focus_sessions_ended_at_after_started check (
    ended_at is null
    or ended_at >= started_at
  )
);

comment on table public.focus_sessions is
  'Per-task focus sessions for Phase 4C+. Actual minutes stored after completion; in-progress rows excluded from dashboard sums.';

comment on column public.focus_sessions.user_id is
  'Owner; must match study_tasks.user_id for task_id (trigger-enforced). Same uuid as auth.uid().';

comment on column public.focus_sessions.course_id is
  'Course scope; must match study_tasks.course_id for task_id (trigger-enforced).';

comment on column public.focus_sessions.task_id is
  'Study task the student focused on. Deleted when task is deleted (CASCADE).';

comment on column public.focus_sessions.duration_minutes is
  'While ended_at IS NULL: provisional session ceiling (planned Pomodoro length, 1–120).
   After ended_at is set: actual completed focus minutes (backend overwrites on complete from started_at/ended_at).';

comment on column public.focus_sessions.completed_task is
  'Whether the student chose to mark the related task completed when finishing the session (set on complete).';

comment on column public.focus_sessions.started_at is
  'Server timestamp when the session started. Used with ended_at to compute actual minutes on complete.';

comment on column public.focus_sessions.ended_at is
  'NULL while in progress or abandoned. Set when the session completes. Dashboard sums only rows where ended_at IS NOT NULL.';

create index focus_sessions_user_id_idx
  on public.focus_sessions (user_id);

create index focus_sessions_user_id_ended_at_idx
  on public.focus_sessions (user_id, ended_at);

create index focus_sessions_task_id_idx
  on public.focus_sessions (task_id);

create index focus_sessions_course_id_idx
  on public.focus_sessions (course_id);

-- =============================================================================
-- Trigger: user_id and course_id must match study_tasks for task_id
-- =============================================================================

create or replace function public.enforce_focus_session_task_owner()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if not exists (
    select 1
    from public.study_tasks t
    where t.id = new.task_id
      and t.user_id = new.user_id
      and t.course_id = new.course_id
  ) then
    raise exception 'user_id and course_id must match the owner and course of task_id'
      using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger focus_sessions_enforce_task_owner
  before insert or update on public.focus_sessions
  for each row
  execute function public.enforce_focus_session_task_owner();

-- =============================================================================
-- Row Level Security (student owns rows via user_id + task alignment)
-- Policies apply to authenticated only. service_role bypasses RLS — app must filter.
-- No DELETE policy for students in MVP.
-- =============================================================================

alter table public.focus_sessions enable row level security;

create policy focus_sessions_select_own
  on public.focus_sessions
  for select
  to authenticated
  using (user_id = auth.uid());

create policy focus_sessions_insert_own
  on public.focus_sessions
  for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1
      from public.courses c
      where c.id = focus_sessions.course_id
        and c.user_id = auth.uid()
    )
  );

create policy focus_sessions_update_own
  on public.focus_sessions
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and exists (
      select 1
      from public.courses c
      where c.id = focus_sessions.course_id
        and c.user_id = auth.uid()
    )
  );

-- =============================================================================
-- Data API grants (required when "Automatically expose new tables" is OFF)
-- GRANT = role may access table via PostgREST; RLS = which rows are allowed.
-- =============================================================================

revoke all on table public.focus_sessions from anon;
revoke all on table public.focus_sessions from authenticated;
revoke all on table public.focus_sessions from service_role;

grant select, insert, update
  on table public.focus_sessions
  to authenticated;

grant select, insert, update
  on table public.focus_sessions
  to service_role;
