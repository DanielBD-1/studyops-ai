-- StudyOps AI — Phase 4A-0: public.trello_sync_logs + RLS + Data API grants
-- Applied manually in Supabase SQL Editor (2026-05-26). Success. No rows returned.
-- Scope: trello_sync_logs table only. No Trello API routes, UI, or credential storage.
-- Never stores Trello apiKey, token, listId, or raw API bodies — sanitized outcomes only.
-- Prerequisite: migrations 001–006 applied (profiles, courses, study_materials, material_generated_plans, study_tasks, flashcards).
-- Not in this phase: backend POST /api/trello/sync, frontend /trello page, credential persistence, api_logs.
-- Do not re-apply on environments where public.trello_sync_logs already exists.

-- =============================================================================
-- Table: public.trello_sync_logs
-- Append-only audit of per-task Trello sync attempts for the authenticated owner.
-- Stores sanitized outcomes only — never Trello apiKey, token, listId, or raw API bodies.
-- =============================================================================

create table public.trello_sync_logs (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users (id) on delete cascade,
  task_id         uuid not null references public.study_tasks (id) on delete cascade,
  status          text not null,
  trello_card_id  text,
  error_message   text,
  created_at      timestamptz not null default now(),
  constraint trello_sync_logs_status_allowed check (
    status in ('success', 'failed', 'skipped')
  ),
  constraint trello_sync_logs_error_message_length check (
    error_message is null
    or char_length(trim(error_message)) between 1 and 500
  )
);

comment on table public.trello_sync_logs is
  'Per-task Trello sync attempt log for Phase 4A+. Sanitized messages only; credentials are never stored.';

comment on column public.trello_sync_logs.user_id is
  'Owner; must match study_tasks.user_id for task_id (trigger-enforced). Same uuid as auth.uid().';

comment on column public.trello_sync_logs.task_id is
  'Study task that was selected for sync. Deleted when task is deleted (CASCADE).';

comment on column public.trello_sync_logs.status is
  'success: card created and trello_card_id saved; failed: sync error; skipped: not sent (e.g. already synced).';

comment on column public.trello_sync_logs.trello_card_id is
  'Trello card id returned on success; null on failed or skipped.';

comment on column public.trello_sync_logs.error_message is
  'Optional sanitized user-facing error (max 500 chars). Never store apiKey, token, or raw Trello responses.';

create index trello_sync_logs_user_id_idx
  on public.trello_sync_logs (user_id);

create index trello_sync_logs_task_id_idx
  on public.trello_sync_logs (task_id);

create index trello_sync_logs_created_at_idx
  on public.trello_sync_logs (created_at desc);

create index trello_sync_logs_user_id_created_at_idx
  on public.trello_sync_logs (user_id, created_at desc);

-- =============================================================================
-- Trigger: user_id must match study_tasks.user_id for task_id
-- =============================================================================

create or replace function public.enforce_trello_sync_log_task_owner()
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
  ) then
    raise exception 'user_id must match the owner of task_id'
      using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger trello_sync_logs_enforce_task_owner
  before insert on public.trello_sync_logs
  for each row
  execute function public.enforce_trello_sync_log_task_owner();

-- =============================================================================
-- Row Level Security
-- Authenticated: SELECT own rows only (future read-only UI/admin analytics).
-- No INSERT/UPDATE/DELETE policies for authenticated — backend inserts via service_role.
-- service_role bypasses RLS — backend must always filter by user_id on reads/writes.
-- =============================================================================

alter table public.trello_sync_logs enable row level security;

create policy trello_sync_logs_select_own
  on public.trello_sync_logs
  for select
  to authenticated
  using (user_id = auth.uid());

-- =============================================================================
-- Data API grants (required when "Automatically expose new tables" is OFF)
-- GRANT = role may access table via PostgREST; RLS = which rows are allowed.
-- =============================================================================

revoke all on table public.trello_sync_logs from anon;
revoke all on table public.trello_sync_logs from authenticated;
revoke all on table public.trello_sync_logs from service_role;

grant select
  on table public.trello_sync_logs
  to authenticated;

grant select, insert
  on table public.trello_sync_logs
  to service_role;
