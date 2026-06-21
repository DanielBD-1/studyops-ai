import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { resetMaterialFilterForCourseChange } from '../../src/utils/task-filters.js';

describe('resetMaterialFilterForCourseChange', () => {
  it('returns all', () => {
    assert.equal(resetMaterialFilterForCourseChange(), 'all');
  });
});
