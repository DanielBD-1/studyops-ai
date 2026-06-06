-- StudyOps AI — Phase FLASHCARD-REVIEW-A4a: SRS-lite scheduling columns on flashcards
-- DRAFT: Not applied to any Supabase project until human approval to run.
-- Scope: add next_review_at and review_interval_days to public.flashcards only.
-- Prerequisite: 013_flashcard_review_state.sql applied.
-- Not in this phase: review history table, ease_factor, SM-2, frontend due UI, dashboard due cards.

-- =============================================================================
-- public.flashcards: SRS-lite scheduling (one row per card)
-- =============================================================================

alter table public.flashcards
  add column next_review_at timestamptz null,
  add column review_interval_days integer not null default 0
    constraint flashcards_review_interval_days_nonneg check (review_interval_days >= 0);

comment on column public.flashcards.next_review_at is
  'When this card is next due for review. NULL means due immediately (e.g. never reviewed). Updated only via POST /api/flashcards/:flashcardId/review.';

comment on column public.flashcards.review_interval_days is
  'Current whole-day review interval after last successful known outcome. Used to grow schedule on repeated known reviews. Not SM-2 ease factor.';
