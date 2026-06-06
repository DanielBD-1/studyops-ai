import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const flashcardStudySource = readFileSync(
  join(__dirname, '../../src/components/materials/FlashcardStudy.jsx'),
  'utf8'
);
const generatedPlanSource = readFileSync(
  join(__dirname, '../../src/components/materials/GeneratedPlanSection.jsx'),
  'utf8'
);
const dbSectionSource = readFileSync(
  join(__dirname, '../../src/components/materials/DbFlashcardsSection.jsx'),
  'utf8'
);
const globalSectionSource = readFileSync(
  join(__dirname, '../../src/components/flashcards/GlobalFlashcardsSection.jsx'),
  'utf8'
);

describe('FlashcardStudy review UI gates', () => {
  it('shows Known / Unknown only when onReviewOutcome, revealed, and card.id are present', () => {
    assert.match(flashcardStudySource, /const canReview = Boolean\(onReviewOutcome && revealed && card\.id\)/);
    assert.match(flashcardStudySource, /\{canReview \? \(/);
    assert.match(flashcardStudySource, />\s*\{reviewBusy \? 'Saving…' : 'Known'\}/);
    assert.match(flashcardStudySource, />\s*\{reviewBusy \? 'Saving…' : 'Unknown'\}/);
  });

  it('does not render review buttons before answer reveal', () => {
    assert.match(flashcardStudySource, /!revealed \? \([\s\S]*Show answer/);
    assert.match(
      flashcardStudySource,
      /\{canReview \? \([\s\S]*'Known'[\s\S]*'Unknown'/
    );
  });

  it('disables review and navigation buttons while reviewing', () => {
    assert.match(flashcardStudySource, /disabled=\{reviewBusy\}/);
  });

  it('resets index only when study set identity or length changes', () => {
    assert.match(flashcardStudySource, /buildStudySetKey\(flashcards\)/);
    assert.match(flashcardStudySource, /from '\.\.\/\.\.\/utils\/flashcard-study\.js'/);
    assert.match(flashcardStudySource, /useEffect\([\s\S]*?\[studySetKey, flashcards\.length\]/);
  });

  it('shows review error and success feedback without hiding the card', () => {
    assert.match(flashcardStudySource, /reviewSuccessMessage/);
    assert.match(flashcardStudySource, /reviewError \? <ErrorMessage/);
  });
});

describe('plan JSON flashcards remain review-free', () => {
  it('GeneratedPlanSection does not pass onReviewOutcome to FlashcardStudy', () => {
    assert.doesNotMatch(generatedPlanSource, /onReviewOutcome/);
    assert.match(generatedPlanSource, /<FlashcardStudy[\s\S]*className="flashcard-study--plan"/);
  });
});

describe('saved DB flashcard parent wiring', () => {
  it('DbFlashcardsSection passes ids and review handler to FlashcardStudy', () => {
    assert.match(dbSectionSource, /id: card\.id/);
    assert.match(dbSectionSource, /onReviewOutcome=\{handleReviewOutcome\}/);
    assert.match(dbSectionSource, /reviewFlashcard\(flashcardId, \{ outcome \}\)/);
    assert.match(dbSectionSource, /onFlashcardUpdated\?\.\(data\.flashcard\)/);
  });

  it('DbFlashcardsSection filters saved cards by review state before study and manage list', () => {
    assert.match(dbSectionSource, /filterFlashcardsByReviewState/);
    assert.match(dbSectionSource, /displayedFlashcards = filterFlashcardsByReviewState/);
    assert.match(dbSectionSource, /value="due_now">Due now</);
    assert.match(dbSectionSource, /value="needs_review">New \+ Learning</);
    assert.match(dbSectionSource, /No flashcards are due for review right now\./);
    assert.match(dbSectionSource, /No flashcards match the selected filters\./);
  });

  it('GlobalFlashcardsSection merges reviewed flashcard into local state', () => {
    assert.match(globalSectionSource, /id: card\.id/);
    assert.match(globalSectionSource, /onReviewOutcome=\{handleReviewOutcome\}/);
    assert.match(globalSectionSource, /setFlashcards\(\(prev\) =>[\s\S]*data\.flashcard\.id/);
    assert.match(globalSectionSource, /reviewFlashcard\(flashcardId, \{ outcome \}\)/);
  });

  it('GlobalFlashcardsSection filters saved cards by review state before study and manage list', () => {
    assert.match(globalSectionSource, /filterFlashcardsByReviewState/);
    assert.match(globalSectionSource, /displayedFlashcards = filterFlashcardsByReviewState/);
    assert.match(globalSectionSource, /value="due_now">Due now</);
    assert.match(globalSectionSource, /value="needs_review">New \+ Learning</);
    assert.match(globalSectionSource, /No flashcards are due for review right now\./);
    assert.match(globalSectionSource, /Review state/);
  });
});

describe('dashboard stats invalidation after review', () => {
  it('DbFlashcardsSection refreshes dashboard stats only after successful review', () => {
    assert.match(
      dbSectionSource,
      /async function handleReviewOutcome[\s\S]*?await reviewFlashcard[\s\S]*?onFlashcardUpdated\?\.\(data\.flashcard\)[\s\S]*?refreshStats\(\)[\s\S]*?} catch/
    );
    assert.doesNotMatch(
      dbSectionSource,
      /async function handleReviewOutcome[\s\S]*?refreshStats\(\)[\s\S]*?await reviewFlashcard/
    );
  });

  it('GlobalFlashcardsSection refreshes dashboard stats only after successful review', () => {
    assert.match(
      globalSectionSource,
      /async function handleReviewOutcome[\s\S]*?await reviewFlashcard[\s\S]*?setFlashcards\(\(prev\) =>[\s\S]*?refreshStats\(\)[\s\S]*?} catch/
    );
    assert.doesNotMatch(
      globalSectionSource,
      /async function handleReviewOutcome[\s\S]*?refreshStats\(\)[\s\S]*?await reviewFlashcard/
    );
  });
});
