import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { GeminiOutputSchema } from '../../src/schemas/gemini.schema.js';
import { PRD_VALID_GEMINI_OUTPUT } from '../helpers/fixtures.js';

describe('GeminiOutputSchema', () => {
  it('PRD example fixture passes validation', () => {
    const result = GeminiOutputSchema.safeParse(PRD_VALID_GEMINI_OUTPUT);
    assert.equal(result.success, true);
  });

  it('rejects output missing tasks', () => {
    const result = GeminiOutputSchema.safeParse({
      ...PRD_VALID_GEMINI_OUTPUT,
      tasks: [],
    });
    assert.equal(result.success, false);
  });

  it('rejects flashcard answer shorter than 10 characters', () => {
    const result = GeminiOutputSchema.safeParse({
      ...PRD_VALID_GEMINI_OUTPUT,
      flashcards: [
        {
          ...PRD_VALID_GEMINI_OUTPUT.flashcards[0],
          answer: 'short',
        },
      ],
    });
    assert.equal(result.success, false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join('.'));
      assert.ok(paths.some((p) => p.includes('flashcards') && p.includes('answer')));
    }
  });
});
