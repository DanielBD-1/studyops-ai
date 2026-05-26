import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  mapPlanFlashcardToCreateBody,
  buildValidatedFlashcardImportBodies,
  importPlanFlashcardsSequentially,
  PLAN_FLASHCARD_IMPORT_VALIDATION_ERROR,
} from '../../src/utils/plan-flashcard-import.js';

const MATERIAL_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const COURSE_ID = '33333333-3333-4333-8333-333333333333';

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

describe('plan-flashcard-import mapPlanFlashcardToCreateBody', () => {
  it('maps plan flashcard to create body with materialId', () => {
    const body = mapPlanFlashcardToCreateBody(VALID_PLAN_FLASHCARD, MATERIAL_ID);
    assert.equal(body.question, 'What is the main idea?');
    assert.equal(body.answer, 'The main idea is explained in the summary above.');
    assert.deepEqual(body.tags, ['topic']);
    assert.equal(body.materialId, MATERIAL_ID);
    assert.equal(body.userId, undefined);
    assert.equal(body.courseId, undefined);
    assert.equal(body.source, undefined);
  });

  it('trims question, answer, and tags', () => {
    const body = mapPlanFlashcardToCreateBody(
      {
        question: '  What is X here?  ',
        answer: '  X is a valid answer here.  ',
        tags: ['  calculus  ', ''],
      },
      MATERIAL_ID
    );
    assert.equal(body.question, 'What is X here?');
    assert.equal(body.answer, 'X is a valid answer here.');
    assert.deepEqual(body.tags, ['calculus']);
  });

  it('omits empty tags array', () => {
    const body = mapPlanFlashcardToCreateBody(
      { ...VALID_PLAN_FLASHCARD, tags: [] },
      MATERIAL_ID
    );
    assert.equal(body.tags, undefined);
  });
});

describe('plan-flashcard-import buildValidatedFlashcardImportBodies', () => {
  it('validates all flashcards before import and returns bodies', () => {
    const result = buildValidatedFlashcardImportBodies(VALID_PLAN, MATERIAL_ID);
    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.bodies.length, 1);
      assert.equal(result.bodies[0].materialId, MATERIAL_ID);
    }
  });

  it('fails when plan has no flashcards', () => {
    const result = buildValidatedFlashcardImportBodies({ ...VALID_PLAN, flashcards: [] }, MATERIAL_ID);
    assert.equal(result.success, false);
    if (!result.success) {
      assert.equal(result.error, PLAN_FLASHCARD_IMPORT_VALIDATION_ERROR);
    }
  });

  it('fails when flashcards are missing', () => {
    const result = buildValidatedFlashcardImportBodies(
      { ...VALID_PLAN, flashcards: undefined },
      MATERIAL_ID
    );
    assert.equal(result.success, false);
  });

  it('rejects short question before any POST', () => {
    const result = buildValidatedFlashcardImportBodies(
      {
        ...VALID_PLAN,
        flashcards: [{ ...VALID_PLAN_FLASHCARD, question: 'short' }],
      },
      MATERIAL_ID
    );
    assert.equal(result.success, false);
    if (!result.success) {
      assert.equal(result.error, PLAN_FLASHCARD_IMPORT_VALIDATION_ERROR);
    }
  });

  it('rejects short answer before any POST', () => {
    const result = buildValidatedFlashcardImportBodies(
      {
        ...VALID_PLAN,
        flashcards: [{ ...VALID_PLAN_FLASHCARD, answer: 'short' }],
      },
      MATERIAL_ID
    );
    assert.equal(result.success, false);
  });

  it('rejects too many tags before any POST', () => {
    const result = buildValidatedFlashcardImportBodies(
      {
        ...VALID_PLAN,
        flashcards: [
          {
            ...VALID_PLAN_FLASHCARD,
            tags: ['one', 'two', 'three', 'four', 'five', 'six'],
          },
        ],
      },
      MATERIAL_ID
    );
    assert.equal(result.success, false);
  });

  it('rejects tag longer than 50 before any POST', () => {
    const result = buildValidatedFlashcardImportBodies(
      {
        ...VALID_PLAN,
        flashcards: [
          {
            ...VALID_PLAN_FLASHCARD,
            tags: ['a'.repeat(51)],
          },
        ],
      },
      MATERIAL_ID
    );
    assert.equal(result.success, false);
  });

  it('aborts with zero bodies if any mapped flashcard is invalid', () => {
    const result = buildValidatedFlashcardImportBodies(
      {
        ...VALID_PLAN,
        flashcards: [
          VALID_PLAN_FLASHCARD,
          { ...VALID_PLAN_FLASHCARD, question: 'too short' },
        ],
      },
      MATERIAL_ID
    );
    assert.equal(result.success, false);
  });
});

describe('plan-flashcard-import importPlanFlashcardsSequentially', () => {
  it('imports all flashcards sequentially on success', async () => {
    /** @type {Array<{ courseId: string, body: unknown }>} */
    const createCalls = [];
    const bodies = [
      {
        question: 'Question one here?',
        answer: 'Answer one is long enough.',
        materialId: MATERIAL_ID,
      },
      {
        question: 'Question two here?',
        answer: 'Answer two is long enough.',
        materialId: MATERIAL_ID,
      },
    ];

    const result = await importPlanFlashcardsSequentially(
      COURSE_ID,
      bodies,
      async (courseId, body) => {
        createCalls.push({ courseId, body });
      }
    );

    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.imported, 2);
    }
    assert.equal(createCalls.length, 2);
    assert.equal(createCalls[0].courseId, COURSE_ID);
    assert.equal(createCalls[0].body.materialId, MATERIAL_ID);
  });

  it('stops on first create failure and reports partial count', async () => {
    const bodies = [
      {
        question: 'Question one here?',
        answer: 'Answer one is long enough.',
        materialId: MATERIAL_ID,
      },
      {
        question: 'Question two here?',
        answer: 'Answer two is long enough.',
        materialId: MATERIAL_ID,
      },
    ];

    let callCount = 0;
    const result = await importPlanFlashcardsSequentially(COURSE_ID, bodies, async () => {
      callCount += 1;
      if (callCount === 2) {
        throw new Error('Server error');
      }
    });

    assert.equal(result.success, false);
    if (!result.success) {
      assert.equal(result.imported, 1);
      assert.equal(result.total, 2);
      assert.ok(result.error instanceof Error);
    }
    assert.equal(callCount, 2);
  });

  it('invokes progress callback with correct counts', async () => {
    const bodies = [
      {
        question: 'Question one here?',
        answer: 'Answer one is long enough.',
        materialId: MATERIAL_ID,
      },
      {
        question: 'Question two here?',
        answer: 'Answer two is long enough.',
        materialId: MATERIAL_ID,
      },
    ];

    /** @type {Array<[number, number]>} */
    const progress = [];

    await importPlanFlashcardsSequentially(COURSE_ID, bodies, async () => {}, (current, total) => {
      progress.push([current, total]);
    });

    assert.deepEqual(progress, [
      [1, 2],
      [2, 2],
    ]);
  });

  it('does not mutate the plan object', async () => {
    const plan = structuredClone(VALID_PLAN);
    const before = JSON.stringify(plan);

    buildValidatedFlashcardImportBodies(plan, MATERIAL_ID);

    assert.equal(JSON.stringify(plan), before);
  });
});
