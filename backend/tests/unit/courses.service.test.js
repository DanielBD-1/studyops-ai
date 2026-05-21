import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mapCourse } from '../../src/modules/courses/courses.service.js';

describe('courses.service mapCourse', () => {
  it('maps snake_case row to camelCase API shape without user_id', () => {
    const mapped = mapCourse({
      id: '550e8400-e29b-41d4-a716-446655440000',
      title: 'Math 101',
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-02T00:00:00.000Z',
      user_id: '11111111-1111-1111-1111-111111111111',
    });

    assert.deepEqual(mapped, {
      id: '550e8400-e29b-41d4-a716-446655440000',
      title: 'Math 101',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
    });
    assert.equal('user_id' in mapped, false);
    assert.equal('userId' in mapped, false);
  });
});
