import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  createFlashcardFormSchema,
  updateFlashcardFormSchema,
} from '../../src/utils/validation.js';

const MATERIAL_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

const VALID_QUESTION = 'What is integration by parts?';
const VALID_ANSWER =
  'Integration by parts is a technique based on the product rule for differentiation.';

describe('createFlashcardFormSchema', () => {
  it('accepts valid question, answer, tags, and materialId', () => {
    const result = createFlashcardFormSchema.safeParse({
      question: VALID_QUESTION,
      answer: VALID_ANSWER,
      tags: ['calculus', 'integration'],
      materialId: MATERIAL_ID,
    });
    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.data.question, VALID_QUESTION);
      assert.equal(result.data.materialId, MATERIAL_ID);
      assert.deepEqual(result.data.tags, ['calculus', 'integration']);
    }
  });

  it('accepts valid question and answer without materialId', () => {
    const result = createFlashcardFormSchema.safeParse({
      question: VALID_QUESTION,
      answer: VALID_ANSWER,
    });
    assert.equal(result.success, true);
    if (result.success) {
      assert.equal('materialId' in result.data, false);
    }
  });

  it('rejects question shorter than 10 characters', () => {
    const result = createFlashcardFormSchema.safeParse({
      question: 'short',
      answer: VALID_ANSWER,
      materialId: MATERIAL_ID,
    });
    assert.equal(result.success, false);
  });

  it('rejects answer shorter than 10 characters', () => {
    const result = createFlashcardFormSchema.safeParse({
      question: VALID_QUESTION,
      answer: 'tiny',
      materialId: MATERIAL_ID,
    });
    assert.equal(result.success, false);
  });

  it('rejects more than 5 tags', () => {
    const result = createFlashcardFormSchema.safeParse({
      question: VALID_QUESTION,
      answer: VALID_ANSWER,
      tags: ['a', 'b', 'c', 'd', 'e', 'f'],
      materialId: MATERIAL_ID,
    });
    assert.equal(result.success, false);
  });

  it('rejects tag longer than 50 characters', () => {
    const result = createFlashcardFormSchema.safeParse({
      question: VALID_QUESTION,
      answer: VALID_ANSWER,
      tags: ['x'.repeat(51)],
      materialId: MATERIAL_ID,
    });
    assert.equal(result.success, false);
  });

  it('rejects unknown keys', () => {
    const result = createFlashcardFormSchema.safeParse({
      question: VALID_QUESTION,
      answer: VALID_ANSWER,
      materialId: MATERIAL_ID,
      userId: '00000000-0000-0000-0000-000000000000',
    });
    assert.equal(result.success, false);
  });
});

describe('updateFlashcardFormSchema', () => {
  it('accepts valid question, answer, and tags', () => {
    const result = updateFlashcardFormSchema.safeParse({
      question: VALID_QUESTION,
      answer: VALID_ANSWER,
      tags: ['calculus'],
    });
    assert.equal(result.success, true);
  });

  it('accepts empty tags array', () => {
    const result = updateFlashcardFormSchema.safeParse({
      question: VALID_QUESTION,
      answer: VALID_ANSWER,
      tags: [],
    });
    assert.equal(result.success, true);
  });

  it('rejects short question', () => {
    const result = updateFlashcardFormSchema.safeParse({
      question: 'short',
      answer: VALID_ANSWER,
      tags: [],
    });
    assert.equal(result.success, false);
  });

  it('rejects short answer', () => {
    const result = updateFlashcardFormSchema.safeParse({
      question: VALID_QUESTION,
      answer: 'short',
      tags: [],
    });
    assert.equal(result.success, false);
  });

  it('rejects forbidden fields', () => {
    const result = updateFlashcardFormSchema.safeParse({
      question: VALID_QUESTION,
      answer: VALID_ANSWER,
      tags: [],
      materialId: MATERIAL_ID,
      courseId: MATERIAL_ID,
      source: 'manual',
      userId: '00000000-0000-0000-0000-000000000000',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });
    assert.equal(result.success, false);
  });

  it('does not require materialId', () => {
    const result = updateFlashcardFormSchema.safeParse({
      question: VALID_QUESTION,
      answer: VALID_ANSWER,
      tags: ['one'],
    });
    assert.equal(result.success, true);
    if (result.success) {
      assert.equal('materialId' in result.data, false);
    }
  });
});
