import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ProcessRequestSchema } from '../../src/schemas/process.request.schema.js';
import { VALID_STUDY_TEXT } from '../helpers/fixtures.js';

describe('ProcessRequestSchema', () => {
  it('accepts valid studyText length', () => {
    const result = ProcessRequestSchema.safeParse({ studyText: VALID_STUDY_TEXT });
    assert.equal(result.success, true);
  });

  it('trims whitespace before length check', () => {
    const result = ProcessRequestSchema.safeParse({
      studyText: `  ${VALID_STUDY_TEXT}  `,
    });
    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.data.studyText.length, 100);
    }
  });

  it('rejects studyText shorter than 100 characters after trim', () => {
    const result = ProcessRequestSchema.safeParse({ studyText: 'x'.repeat(99) });
    assert.equal(result.success, false);
  });

  it('rejects studyText longer than 50000 characters', () => {
    const result = ProcessRequestSchema.safeParse({ studyText: 'x'.repeat(50001) });
    assert.equal(result.success, false);
  });

  it('rejects unknown body fields (strict)', () => {
    const result = ProcessRequestSchema.safeParse({
      studyText: VALID_STUDY_TEXT,
      courseId: 'evil',
    });
    assert.equal(result.success, false);
  });
});
