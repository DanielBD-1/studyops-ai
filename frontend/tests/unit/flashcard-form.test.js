import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseFlashcardTagsInput,
  buildCreateFlashcardBody,
  buildUpdateFlashcardBody,
  truncateFlashcardQuestion,
} from '../../src/utils/flashcard-form.js';

const MATERIAL_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

const VALID_QUESTION = 'What is integration by parts?';
const VALID_ANSWER =
  'Integration by parts is a technique based on the product rule for differentiation.';

describe('parseFlashcardTagsInput', () => {
  it('parses comma-separated tags', () => {
    assert.deepEqual(parseFlashcardTagsInput('calculus, integration, review'), [
      'calculus',
      'integration',
      'review',
    ]);
  });

  it('trims whitespace and filters empty segments', () => {
    assert.deepEqual(parseFlashcardTagsInput('  calculus ,  , integration  '), [
      'calculus',
      'integration',
    ]);
  });

  it('returns empty array for blank input', () => {
    assert.deepEqual(parseFlashcardTagsInput(''), []);
    assert.deepEqual(parseFlashcardTagsInput('   '), []);
  });
});

describe('buildCreateFlashcardBody', () => {
  it('includes materialId and omits tags when none provided', () => {
    const result = buildCreateFlashcardBody(
      VALID_QUESTION,
      VALID_ANSWER,
      '',
      MATERIAL_ID
    );
    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.body.materialId, MATERIAL_ID);
      assert.equal(result.body.question, VALID_QUESTION);
      assert.equal('tags' in result.body, false);
      assert.equal('userId' in result.body, false);
      assert.equal('courseId' in result.body, false);
      assert.equal('source' in result.body, false);
      assert.equal('createdAt' in result.body, false);
      assert.equal('updatedAt' in result.body, false);
    }
  });

  it('includes tags when provided', () => {
    const result = buildCreateFlashcardBody(
      VALID_QUESTION,
      VALID_ANSWER,
      'calculus, review',
      MATERIAL_ID
    );
    assert.equal(result.success, true);
    if (result.success) {
      assert.deepEqual(result.body.tags, ['calculus', 'review']);
    }
  });

  it('rejects invalid question length', () => {
    const result = buildCreateFlashcardBody('short', VALID_ANSWER, '', MATERIAL_ID);
    assert.equal(result.success, false);
  });

  it('rejects too many tags', () => {
    const result = buildCreateFlashcardBody(
      VALID_QUESTION,
      VALID_ANSWER,
      'a, b, c, d, e, f',
      MATERIAL_ID
    );
    assert.equal(result.success, false);
  });
});

describe('buildUpdateFlashcardBody', () => {
  it('returns question, answer, and tags without materialId', () => {
    const result = buildUpdateFlashcardBody(
      VALID_QUESTION,
      VALID_ANSWER,
      'calculus'
    );
    assert.equal(result.success, true);
    if (result.success) {
      assert.deepEqual(result.body.tags, ['calculus']);
      assert.equal('materialId' in result.body, false);
      assert.equal('userId' in result.body, false);
      assert.equal('courseId' in result.body, false);
      assert.equal('source' in result.body, false);
      assert.equal('createdAt' in result.body, false);
      assert.equal('updatedAt' in result.body, false);
    }
  });

  it('uses empty tags array when input is blank', () => {
    const result = buildUpdateFlashcardBody(VALID_QUESTION, VALID_ANSWER, '');
    assert.equal(result.success, true);
    if (result.success) {
      assert.deepEqual(result.body.tags, []);
    }
  });

  it('rejects short answer', () => {
    const result = buildUpdateFlashcardBody(VALID_QUESTION, 'tiny', '');
    assert.equal(result.success, false);
  });
});

describe('truncateFlashcardQuestion', () => {
  it('truncates long questions with ellipsis', () => {
    const long = 'a'.repeat(100);
    const result = truncateFlashcardQuestion(long, 80);
    assert.equal(result.length, 81);
    assert.ok(result.endsWith('…'));
  });
});
