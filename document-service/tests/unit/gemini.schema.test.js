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
});
