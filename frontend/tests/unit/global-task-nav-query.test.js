import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildTasksPageMaterialLink,
  readTasksPageInitialTaskFilters,
} from '../../src/utils/task-nav-query.js';

const COURSE_A = '11111111-1111-4111-8111-111111111111';
const MATERIAL_A = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

describe('readTasksPageInitialTaskFilters', () => {
  it('returns all defaults for an empty search string', () => {
    assert.deepEqual(readTasksPageInitialTaskFilters(''), {
      courseFilter: 'all',
      materialFilter: 'all',
      statusFilter: 'all',
      deadlineFilter: 'all',
    });
  });

  it('preserves valid course UUID before courses hydrate', () => {
    assert.deepEqual(readTasksPageInitialTaskFilters(`?courseId=${COURSE_A}`), {
      courseFilter: COURSE_A,
      materialFilter: 'all',
      statusFilter: 'all',
      deadlineFilter: 'all',
    });
  });

  it('preserves valid course and material UUIDs before lists hydrate', () => {
    assert.deepEqual(
      readTasksPageInitialTaskFilters(`?courseId=${COURSE_A}&materialId=${MATERIAL_A}&status=pending`),
      {
        courseFilter: COURSE_A,
        materialFilter: MATERIAL_A,
        statusFilter: 'pending',
        deadlineFilter: 'all',
      }
    );
  });

  it('applies materialId=none immediately', () => {
    assert.deepEqual(readTasksPageInitialTaskFilters(`?courseId=${COURSE_A}&materialId=none`), {
      courseFilter: COURSE_A,
      materialFilter: 'none',
      statusFilter: 'all',
      deadlineFilter: 'all',
    });
  });

  it('ignores malformed course and material UUIDs', () => {
    assert.deepEqual(
      readTasksPageInitialTaskFilters('?courseId=bad&materialId=bad&status=pending'),
      {
        courseFilter: 'all',
        materialFilter: 'all',
        statusFilter: 'pending',
        deadlineFilter: 'all',
      }
    );
  });

  it('deadline-only URL normalizes to pending with overdue filter', () => {
    assert.deepEqual(readTasksPageInitialTaskFilters('?deadline=overdue'), {
      courseFilter: 'all',
      materialFilter: 'all',
      statusFilter: 'pending',
      deadlineFilter: 'overdue',
    });
  });

  it('completed plus deadline drops deadline filter', () => {
    assert.deepEqual(readTasksPageInitialTaskFilters('?status=completed&deadline=overdue'), {
      courseFilter: 'all',
      materialFilter: 'all',
      statusFilter: 'completed',
      deadlineFilter: 'all',
    });
  });

  it('omits defaults when only valid course is present', () => {
    const filters = readTasksPageInitialTaskFilters(`?courseId=${COURSE_A}`);
    assert.equal(filters.courseFilter, COURSE_A);
    assert.equal(filters.materialFilter, 'all');
    assert.equal(filters.statusFilter, 'all');
    assert.equal(filters.deadlineFilter, 'all');
  });
});

describe('buildTasksPageMaterialLink', () => {
  it('returns /tasks?courseId=<courseId>&materialId=<materialId>', () => {
    assert.equal(
      buildTasksPageMaterialLink(COURSE_A, MATERIAL_A),
      `/tasks?courseId=${encodeURIComponent(COURSE_A)}&materialId=${encodeURIComponent(MATERIAL_A)}`
    );
  });
});
