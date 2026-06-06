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

  it('GlobalFlashcardsSection merges reviewed flashcard into local state', () => {
    assert.match(globalSectionSource, /id: card\.id/);
    assert.match(globalSectionSource, /onReviewOutcome=\{handleReviewOutcome\}/);
    assert.match(globalSectionSource, /setFlashcards\(\(prev\) =>[\s\S]*data\.flashcard\.id/);
    assert.match(globalSectionSource, /reviewFlashcard\(flashcardId, \{ outcome \}\)/);
  });
});
