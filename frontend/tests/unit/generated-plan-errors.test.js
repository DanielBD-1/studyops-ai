import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ApiRequestError } from '../../src/services/courses.service.js';
import {
  isGeneratedPlanNotFound,
  isStudyMaterialNotFound,
  isActivePlanDeleteConflict,
} from '../../src/utils/generated-plan-errors.js';

describe('generated-plan-errors', () => {
  it('isGeneratedPlanNotFound matches NOT_FOUND with generated plan message', () => {
    const err = new ApiRequestError('NOT_FOUND', 'Generated plan not found');
    assert.equal(isGeneratedPlanNotFound(err), true);
    assert.equal(isStudyMaterialNotFound(err), false);
  });

  it('isStudyMaterialNotFound matches NOT_FOUND with study material message', () => {
    const err = new ApiRequestError('NOT_FOUND', 'Study material not found');
    assert.equal(isStudyMaterialNotFound(err), true);
    assert.equal(isGeneratedPlanNotFound(err), false);
  });

  it('rejects other NOT_FOUND messages', () => {
    const err = new ApiRequestError('NOT_FOUND', 'Course not found');
    assert.equal(isGeneratedPlanNotFound(err), false);
    assert.equal(isStudyMaterialNotFound(err), false);
  });

  it('rejects non-ApiRequestError values', () => {
    assert.equal(isGeneratedPlanNotFound(new Error('Generated plan not found')), false);
    assert.equal(isStudyMaterialNotFound(null), false);
  });

  it('isActivePlanDeleteConflict matches CONFLICT for active plan delete', () => {
    const err = new ApiRequestError('CONFLICT', 'Cannot delete the active generated plan');
    assert.equal(isActivePlanDeleteConflict(err), true);
    assert.equal(isActivePlanDeleteConflict(new ApiRequestError('NOT_FOUND', 'x')), false);
  });
});
