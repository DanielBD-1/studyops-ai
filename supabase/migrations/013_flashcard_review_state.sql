-- StudyOps AI — Phase FLASHCARD-REVIEW-A1: aggregate review state on flashcards (not SRS)
-- DRAFT: Not applied to any Supabase project until human approval to run.
-- Scope: add minimal mastery/counter columns to public.flashcards only.
-- Prerequisite: 006_flashcards.sql and 009_plan_source_import_dedupe.sql applied.
-- Not in this phase: next_review_at, SRS scheduling, flashcard_reviews history table, API/UI.

-- =============================================================================
-- public.flashcards: aggregate review state (one row per card)
-- =============================================================================

alter table public.flashcards
  add column mastery text not null default 'new'
    constraint flashcards_mastery_allowed
    check (mastery in ('new', 'learning', 'known')),
  add column last_reviewed_at timestamptz null,
  add column review_count integer not null default 0
    constraint flashcards_review_count_nonneg check (review_count >= 0),
  add column known_count integer not null default 0
    constraint flashcards_known_count_nonneg check (known_count >= 0),
  add column unknown_count integer not null default 0
    constraint flashcards_unknown_count_nonneg check (unknown_count >= 0);

comment on column public.flashcards.mastery is
  'Aggregate study state: new (never reviewed), learning (last outcome unknown or re-learning), known (last outcome known). Not SRS scheduling.';

comment on column public.flashcards.last_reviewed_at is
  'Timestamp of the most recent review via POST /api/flashcards/:flashcardId/review.';

comment on column public.flashcards.review_count is
  'Total number of review attempts recorded for this card.';

comment on column public.flashcards.known_count is
  'Total number of reviews with outcome known.';

comment on column public.flashcards.unknown_count is
  'Total number of reviews with outcome unknown.';
