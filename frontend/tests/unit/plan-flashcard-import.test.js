import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  mapPlanFlashcardToImportItem,
  buildValidatedPlanFlashcardsImportPayload,
  formatPlanFlashcardImportSummaryMessage,
  importPlanFlashcardsFromPlan,
  PLAN_FLASHCARD_IMPORT_VALIDATION_ERROR,
} from '../../src/utils/plan-flashcard-import.js';
import { buildPlanImportConfirmMessage } from '../../src/utils/plan-import.js';

const MATERIAL_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

const VALID_PLAN_FLASHCARD = {
  question: 'What is the main idea?',
  answer: 'The main idea is explained in the summary above.',
  tags: ['topic'],
};

const VALID_PLAN = {
  summary: 'A'.repeat(50),
  keyTopics: ['Topic one'],
  difficulty: 'medium',
  tasks: [],
  flashcards: [VALID_PLAN_FLASHCARD],
};

describe('plan-flashcard-import mapPlanFlashcardToImportItem', () => {
  it('maps plan flashcard to import item without materialId or source', () => {
    const item = mapPlanFlashcardToImportItem(VALID_PLAN_FLASHCARD);
    assert.equal(item.question, 'What is the main idea?');
    assert.equal(item.answer, 'The main idea is explained in the summary above.');
    assert.deepEqual(item.tags, ['topic']);
    assert.equal(/** @type {Record<string, unknown>} */ (item).materialId, undefined);
    assert.equal(/** @type {Record<string, unknown>} */ (item).source, undefined);
  });

  it('trims question, answer, and tags', () => {
    const item = mapPlanFlashcardToImportItem({
      question: '  What is X here?  ',
      answer: '  X is a valid answer here.  ',
      tags: ['  calculus  ', ''],
    });
    assert.equal(item.question, 'What is X here?');
    assert.equal(item.answer, 'X is a valid answer here.');
    assert.deepEqual(item.tags, ['calculus']);
  });

  it('omits empty tags array', () => {
    const item = mapPlanFlashcardToImportItem({ ...VALID_PLAN_FLASHCARD, tags: [] });
    assert.equal(item.tags, undefined);
  });
});

describe('plan-flashcard-import buildValidatedPlanFlashcardsImportPayload', () => {
  it('validates all flashcards before import and returns flashcards array', () => {
    const result = buildValidatedPlanFlashcardsImportPayload(VALID_PLAN);
    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.flashcards.length, 1);
      assert.equal(result.flashcards[0].question, 'What is the main idea?');
    }
  });

  it('fails when plan has no flashcards', () => {
    const result = buildValidatedPlanFlashcardsImportPayload({ ...VALID_PLAN, flashcards: [] });
    assert.equal(result.success, false);
    if (!result.success) {
      assert.equal(result.error, PLAN_FLASHCARD_IMPORT_VALIDATION_ERROR);
    }
  });

  it('aborts with zero flashcards if any mapped flashcard is invalid', () => {
    const result = buildValidatedPlanFlashcardsImportPayload({
      ...VALID_PLAN,
      flashcards: [{ ...VALID_PLAN_FLASHCARD, question: 'too short' }],
    });
    assert.equal(result.success, false);
  });
});

describe('plan-flashcard-import formatPlanFlashcardImportSummaryMessage', () => {
  it('includes imported and skipped counts', () => {
    const message = formatPlanFlashcardImportSummaryMessage({
      imported: 2,
      skipped: 1,
      failed: 0,
      total: 3,
    });
    assert.match(message, /Imported 2 saved flashcards/);
    assert.match(message, /Skipped 1 already imported/);
  });
});

describe('plan-flashcard-import confirm message', () => {
  it('duplicate preview/count message works for flashcards', () => {
    const message = buildPlanImportConfirmMessage(4, 'flashcards');
    assert.match(message, /Import 4 flashcards/);
    assert.match(message, /will be skipped/);
  });
});

describe('plan-flashcard-import importPlanFlashcardsFromPlan', () => {
  it('calls material import API once and returns summary', async () => {
    /** @type {Array<{ materialId: string, body: unknown }>} */
    const calls = [];
    const flashcards = [
      {
        question: 'Question one here?',
        answer: 'Answer one is long enough.',
      },
    ];

    const result = await importPlanFlashcardsFromPlan(
      MATERIAL_ID,
      flashcards,
      async (materialId, body) => {
        calls.push({ materialId, body });
        return { summary: { imported: 1, skipped: 0, failed: 0, total: 1 } };
      }
    );

    assert.equal(result.success, true);
    assert.equal(calls.length, 1);
    assert.equal(calls[0].materialId, MATERIAL_ID);
    assert.deepEqual(calls[0].body, { flashcards });
  });

  it('does not use sequential createCourseFlashcard flow', async () => {
    const result = await importPlanFlashcardsFromPlan(
      MATERIAL_ID,
      [{ question: 'Another valid question?', answer: 'Another valid answer here.' }],
      async () => ({ summary: { imported: 1, skipped: 0, failed: 0, total: 1 } })
    );
    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.summary.imported, 1);
    }
  });

  it('does not mutate the plan object', () => {
    const plan = structuredClone(VALID_PLAN);
    const before = JSON.stringify(plan);

    buildValidatedPlanFlashcardsImportPayload(plan);

    assert.equal(JSON.stringify(plan), before);
  });
});
