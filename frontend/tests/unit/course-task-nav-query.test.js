import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildCoursePageMaterialLink,
  buildCoursePageSearchParams,
  buildTasksPageMaterialLink,
  parseCoursePageSearchParams,
  readCoursePageInitialTaskFilters,
  resolveCoursePageTaskFilters,
} from '../../src/utils/task-nav-query.js';

const COURSE_A = '11111111-1111-4111-8111-111111111111';
const MATERIAL_A = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const UNKNOWN_MATERIAL = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';

const materials = [{ id: MATERIAL_A, title: 'Chapter 1' }];

describe('parseCoursePageSearchParams', () => {
  it('returns empty params for an empty search string', () => {
    assert.deepEqual(parseCoursePageSearchParams(''), {});
    assert.deepEqual(parseCoursePageSearchParams('?'), {});
  });

  it('parses valid materialId and status without courseId', () => {
    assert.deepEqual(
      parseCoursePageSearchParams(`?materialId=${MATERIAL_A}&status=pending`),
      { materialId: MATERIAL_A, status: 'pending' }
    );
  });

  it('ignores courseId query param on course page parse', () => {
    assert.deepEqual(
      parseCoursePageSearchParams(`?courseId=${COURSE_A}&materialId=${MATERIAL_A}`),
      { materialId: MATERIAL_A }
    );
  });

  it('parses materialId=none', () => {
    assert.deepEqual(parseCoursePageSearchParams('?materialId=none'), { materialId: 'none' });
  });

  it('ignores invalid UUID materialId', () => {
    assert.deepEqual(parseCoursePageSearchParams('?materialId=bad'), {});
  });

  it('ignores invalid status and deadline values', () => {
    assert.deepEqual(parseCoursePageSearchParams('?status=all&deadline=due_soon'), {});
  });

  it('parses valid deadline values', () => {
    assert.deepEqual(parseCoursePageSearchParams('?deadline=overdue'), { deadline: 'overdue' });
    assert.deepEqual(parseCoursePageSearchParams('?status=pending&deadline=next_7_days'), {
      status: 'pending',
      deadline: 'next_7_days',
    });
  });
});

describe('buildCoursePageSearchParams', () => {
  it('returns empty string for all defaults', () => {
    assert.equal(buildCoursePageSearchParams(), '');
  });

  it('builds materialId without courseId in query', () => {
    assert.equal(
      buildCoursePageSearchParams({ materialFilter: MATERIAL_A }),
      `materialId=${MATERIAL_A}`
    );
  });

  it('builds materialId=none', () => {
    assert.equal(buildCoursePageSearchParams({ materialFilter: 'none' }), 'materialId=none');
  });

  it('builds status only', () => {
    assert.equal(buildCoursePageSearchParams({ statusFilter: 'pending' }), 'status=pending');
  });

  it('builds overdue deadline with pending status in stable order', () => {
    assert.equal(
      buildCoursePageSearchParams({ deadlineFilter: 'overdue' }),
      'status=pending&deadline=overdue'
    );
  });

  it('builds material, status, and deadline in stable order', () => {
    assert.equal(
      buildCoursePageSearchParams({
        materialFilter: MATERIAL_A,
        statusFilter: 'pending',
        deadlineFilter: 'due_today',
      }),
      `materialId=${MATERIAL_A}&status=pending&deadline=due_today`
    );
  });

  it('drops deadline when building completed status', () => {
    assert.equal(
      buildCoursePageSearchParams({
        statusFilter: 'completed',
        deadlineFilter: 'overdue',
      }),
      'status=completed'
    );
  });

  it('omits all/default values', () => {
    assert.equal(
      buildCoursePageSearchParams({
        materialFilter: 'all',
        statusFilter: 'all',
        deadlineFilter: 'all',
      }),
      ''
    );
  });
});

describe('readCoursePageInitialTaskFilters', () => {
  it('returns all defaults for an empty search string', () => {
    assert.deepEqual(readCoursePageInitialTaskFilters(''), {
      materialFilter: 'all',
      statusFilter: 'all',
      deadlineFilter: 'all',
    });
  });

  it('preserves valid material UUID before materials hydrate', () => {
    assert.deepEqual(
      readCoursePageInitialTaskFilters(`?materialId=${MATERIAL_A}&status=pending`),
      {
        materialFilter: MATERIAL_A,
        statusFilter: 'pending',
        deadlineFilter: 'all',
      }
    );
  });

  it('applies materialId=none immediately', () => {
    assert.deepEqual(readCoursePageInitialTaskFilters('?materialId=none'), {
      materialFilter: 'none',
      statusFilter: 'all',
      deadlineFilter: 'all',
    });
  });

  it('ignores malformed material UUID', () => {
    assert.deepEqual(readCoursePageInitialTaskFilters('?materialId=bad&status=pending'), {
      materialFilter: 'all',
      statusFilter: 'pending',
      deadlineFilter: 'all',
    });
  });

  it('deadline-only URL normalizes to pending with overdue filter', () => {
    assert.deepEqual(readCoursePageInitialTaskFilters('?deadline=overdue'), {
      materialFilter: 'all',
      statusFilter: 'pending',
      deadlineFilter: 'overdue',
    });
  });

  it('completed plus deadline drops deadline filter', () => {
    assert.deepEqual(readCoursePageInitialTaskFilters('?status=completed&deadline=overdue'), {
      materialFilter: 'all',
      statusFilter: 'completed',
      deadlineFilter: 'all',
    });
  });
});

describe('resolveCoursePageTaskFilters', () => {
  it('returns all defaults for empty input', () => {
    assert.deepEqual(resolveCoursePageTaskFilters({ materials }), {
      materialFilter: 'all',
      statusFilter: 'all',
      deadlineFilter: 'all',
    });
  });

  it('deadline alone canonicalizes to pending with overdue filter', () => {
    assert.deepEqual(
      resolveCoursePageTaskFilters({ deadline: 'overdue', materials }),
      {
        materialFilter: 'all',
        statusFilter: 'pending',
        deadlineFilter: 'overdue',
      }
    );
  });

  it('completed plus deadline drops deadline filter', () => {
    assert.deepEqual(
      resolveCoursePageTaskFilters({
        status: 'completed',
        deadline: 'overdue',
        materials,
      }),
      {
        materialFilter: 'all',
        statusFilter: 'completed',
        deadlineFilter: 'all',
      }
    );
  });

  it('applies valid materialId and status', () => {
    assert.deepEqual(
      resolveCoursePageTaskFilters({
        materialId: MATERIAL_A,
        status: 'pending',
        materials,
      }),
      {
        materialFilter: MATERIAL_A,
        statusFilter: 'pending',
        deadlineFilter: 'all',
      }
    );
  });

  it('applies materialFilter none', () => {
    assert.deepEqual(
      resolveCoursePageTaskFilters({
        materialId: 'none',
        materials: [],
      }),
      {
        materialFilter: 'none',
        statusFilter: 'all',
        deadlineFilter: 'all',
      }
    );
  });

  it('falls back unknown materialId to all', () => {
    assert.deepEqual(
      resolveCoursePageTaskFilters({
        materialId: UNKNOWN_MATERIAL,
        status: 'pending',
        materials,
      }),
      {
        materialFilter: 'all',
        statusFilter: 'pending',
        deadlineFilter: 'all',
      }
    );
  });
});

describe('buildCoursePageMaterialLink', () => {
  it('returns /courses/:courseId?materialId=<uuid>', () => {
    assert.equal(
      buildCoursePageMaterialLink(COURSE_A, MATERIAL_A),
      `/courses/${COURSE_A}?materialId=${encodeURIComponent(MATERIAL_A)}`
    );
  });
});

describe('material detail navigation links', () => {
  it('buildTasksPageMaterialLink remains the global tasks deep link', () => {
    assert.equal(
      buildTasksPageMaterialLink(COURSE_A, MATERIAL_A),
      `/tasks?courseId=${encodeURIComponent(COURSE_A)}&materialId=${encodeURIComponent(MATERIAL_A)}`
    );
  });
});
