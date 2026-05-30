import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  importPlanTasksBodySchema,
  importPlanFlashcardsBodySchema,
} from '../../src/shared/validation/plan-import.schema.js';

const VALID_TASK = {
  title: 'Valid plan task title',
  estimatedMinutes: 30,
};

const VALID_FLASHCARD = {
  question: 'What is a valid flashcard question?',
  answer: 'This is a valid flashcard answer for testing.',
};

describe('plan-import.schema importPlanTasksBodySchema', () => {
  it('accepts valid tasks array', () => {
    const parsed = importPlanTasksBodySchema.safeParse({ tasks: [VALID_TASK] });
    assert.equal(parsed.success, true);
  });

  it('rejects source at top level', () => {
    const parsed = importPlanTasksBodySchema.safeParse({
      tasks: [VALID_TASK],
      source: 'plan',
    });
    assert.equal(parsed.success, false);
  });

  it('rejects userId at top level', () => {
    const parsed = importPlanTasksBodySchema.safeParse({
      tasks: [VALID_TASK],
      userId: '11111111-1111-4111-8111-111111111111',
    });
    assert.equal(parsed.success, false);
  });

  it('rejects courseId at top level', () => {
    const parsed = importPlanTasksBodySchema.safeParse({
      tasks: [VALID_TASK],
      courseId: '33333333-3333-4333-8333-333333333333',
    });
    assert.equal(parsed.success, false);
  });

  it('rejects source on task item', () => {
    const parsed = importPlanTasksBodySchema.safeParse({
      tasks: [{ ...VALID_TASK, source: 'plan' }],
    });
    assert.equal(parsed.success, false);
  });
});

describe('plan-import.schema importPlanFlashcardsBodySchema', () => {
  it('accepts valid flashcards array', () => {
    const parsed = importPlanFlashcardsBodySchema.safeParse({
      flashcards: [VALID_FLASHCARD],
    });
    assert.equal(parsed.success, true);
  });

  it('rejects source at top level', () => {
    const parsed = importPlanFlashcardsBodySchema.safeParse({
      flashcards: [VALID_FLASHCARD],
      source: 'plan',
    });
    assert.equal(parsed.success, false);
  });

  it('rejects userId at top level', () => {
    const parsed = importPlanFlashcardsBodySchema.safeParse({
      flashcards: [VALID_FLASHCARD],
      userId: '11111111-1111-4111-8111-111111111111',
    });
    assert.equal(parsed.success, false);
  });

  it('rejects courseId at top level', () => {
    const parsed = importPlanFlashcardsBodySchema.safeParse({
      flashcards: [VALID_FLASHCARD],
      courseId: '33333333-3333-4333-8333-333333333333',
    });
    assert.equal(parsed.success, false);
  });
});
