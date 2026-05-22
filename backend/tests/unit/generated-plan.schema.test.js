import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ApiError } from '../../src/shared/errors/ApiError.js';
import {
  generatedPlanSchema,
  parseAndValidateGeneratedPlan,
} from '../../src/shared/validation/generated-plan.schema.js';
import { MOCK_GEMINI_PLAN } from '../helpers/mockDocumentService.js';

describe('generatedPlanSchema', () => {
  it('accepts MOCK_GEMINI_PLAN', () => {
    const result = generatedPlanSchema.safeParse(MOCK_GEMINI_PLAN);
    assert.equal(result.success, true);
  });

  it('parseAndValidateGeneratedPlan returns parsed plan', () => {
    const plan = parseAndValidateGeneratedPlan(MOCK_GEMINI_PLAN);
    assert.equal(plan.difficulty, 'medium');
    assert.ok(Array.isArray(plan.tasks));
  });

  it('rejects summary shorter than 50 characters', () => {
    assert.throws(
      () =>
        parseAndValidateGeneratedPlan({
          ...MOCK_GEMINI_PLAN,
          summary: 'too short',
        }),
      (err) => err instanceof ApiError && err.code === 'GEMINI_INVALID_RESPONSE'
    );
  });

  it('rejects empty tasks array', () => {
    assert.throws(
      () =>
        parseAndValidateGeneratedPlan({
          ...MOCK_GEMINI_PLAN,
          tasks: [],
        }),
      (err) => err instanceof ApiError && err.code === 'GEMINI_INVALID_RESPONSE'
    );
  });

  it('rejects unexpected top-level keys', () => {
    assert.throws(
      () =>
        parseAndValidateGeneratedPlan({
          ...MOCK_GEMINI_PLAN,
          extraField: true,
        }),
      (err) => err instanceof ApiError && err.code === 'GEMINI_INVALID_RESPONSE'
    );
  });
});
