import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  createCourseBodySchema,
  updateCourseBodySchema,
  courseIdParamSchema,
} from '../../src/shared/validation/schemas.js';

describe('courses validation schemas', () => {
  it('createCourseBodySchema accepts valid title', () => {
    const result = createCourseBodySchema.safeParse({ title: '  Math 101  ' });
    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.data.title, 'Math 101');
    }
  });

  it('createCourseBodySchema rejects short title', () => {
    const result = createCourseBodySchema.safeParse({ title: 'ab' });
    assert.equal(result.success, false);
  });

  it('createCourseBodySchema rejects user_id and userId (strict)', () => {
    assert.equal(
      createCourseBodySchema.safeParse({ title: 'Valid title', user_id: 'x' }).success,
      false
    );
    assert.equal(
      createCourseBodySchema.safeParse({ title: 'Valid title', userId: 'x' }).success,
      false
    );
  });

  it('updateCourseBodySchema rejects createdAt in body (strict)', () => {
    const result = updateCourseBodySchema.safeParse({
      title: 'Updated',
      createdAt: '2026-01-01T00:00:00.000Z',
    });
    assert.equal(result.success, false);
  });

  it('courseIdParamSchema accepts uuid', () => {
    const result = courseIdParamSchema.safeParse({
      id: '550e8400-e29b-41d4-a716-446655440000',
    });
    assert.equal(result.success, true);
  });

  it('courseIdParamSchema rejects invalid id', () => {
    const result = courseIdParamSchema.safeParse({ id: 'not-a-uuid' });
    assert.equal(result.success, false);
  });
});
