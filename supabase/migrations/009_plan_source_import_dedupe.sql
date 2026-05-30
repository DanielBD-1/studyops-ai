-- StudyOps AI — Phase 10B: plan-sourced import deduplication
-- DRAFT: Not applied to any Supabase project until human approval to run.
-- Scope: allow source = 'plan' on study_tasks and flashcards; partial unique indexes
-- for material-scoped plan import dedupe. No API or app code in this file.
-- Prerequisite: 005_study_tasks.sql and 006_flashcards.sql applied.

-- =============================================================================
-- study_tasks: allow source = 'plan'
-- =============================================================================

alter table public.study_tasks
  drop constraint if exists study_tasks_source_allowed;

alter table public.study_tasks
  add constraint study_tasks_source_allowed
  check (source in ('manual', 'plan'));

comment on column public.study_tasks.source is
  'manual for user-created tasks; plan for material-scoped AI plan imports (Phase 10B).';

-- Race-safe dedupe: one plan-sourced task title per user per material (trimmed, case-insensitive)
create unique index if not exists study_tasks_plan_import_dedupe_idx
  on public.study_tasks (user_id, material_id, lower(trim(title)))
  where source = 'plan' and material_id is not null;

-- =============================================================================
-- flashcards: allow source = 'plan'
-- =============================================================================

alter table public.flashcards
  drop constraint if exists flashcards_source_allowed;

alter table public.flashcards
  add constraint flashcards_source_allowed
  check (source in ('manual', 'plan'));

comment on column public.flashcards.source is
  'manual for user-created flashcards; plan for material-scoped AI plan imports (Phase 10B).';

-- Race-safe dedupe: one plan-sourced Q+A pair per user per material (trimmed, case-insensitive)
create unique index if not exists flashcards_plan_import_dedupe_idx
  on public.flashcards (user_id, material_id, lower(trim(question)), lower(trim(answer)))
  where source = 'plan' and material_id is not null;
