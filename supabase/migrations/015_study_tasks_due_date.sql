-- StudyOps AI — Phase DASHBOARD-DEPTH-P0: optional due_date on study_tasks
-- Status: Applied manually and verified on Supabase for DASHBOARD-DEPTH-P0.
-- Prerequisite: 005_study_tasks.sql applied.
-- Scope: add optional day-level due_date to public.study_tasks.
-- No RLS, index, trigger, backfill, or dashboard deadline behavior changes.

alter table public.study_tasks
  add column due_date date null;

comment on column public.study_tasks.due_date is
  'Optional user-set calendar due date (day-level). NULL means no deadline.';
