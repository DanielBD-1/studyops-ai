import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  courseTitleSchema,
  createCourseFormSchema,
  updateCourseFormSchema,
} from '../../src/utils/validation.js';

describe('course title validation', () => {
  it('rejects title shorter than 3 characters', () => {
    const result = courseTitleSchema.safeParse('ab');
    assert.equal(result.success, false);
  });

  it('rejects title longer than 100 characters', () => {
    const result = courseTitleSchema.safeParse('a'.repeat(101));
    assert.equal(result.success, false);
  });

  it('trims whitespace before length check', () => {
    const result = courseTitleSchema.safeParse('  ab  ');
    assert.equal(result.success, false);
  });

  it('accepts valid title between 3 and 100 characters', () => {
    const result = courseTitleSchema.safeParse('  Math 101  ');
    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.data, 'Math 101');
    }
  });

  it('createCourseFormSchema rejects unknown keys', () => {
    const result = createCourseFormSchema.safeParse({
      title: 'History',
      user_id: '00000000-0000-0000-0000-000000000000',
    });
    assert.equal(result.success, false);
  });

  it('updateCourseFormSchema rejects userId in body', () => {
    const result = updateCourseFormSchema.safeParse({
      title: 'History',
      userId: '00000000-0000-0000-0000-000000000000',
    });
    assert.equal(result.success, false);
  });
});
