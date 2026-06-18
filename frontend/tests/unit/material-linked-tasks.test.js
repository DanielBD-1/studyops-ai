import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  getMaterialLinkedTasks,
  selectLinkedTaskPreview,
  summarizeLinkedTaskCounts,
} from '../../src/utils/task-filters.js';
import {
  buildTasksPageCoursePendingLink,
  buildTasksPageDueTodayLink,
  buildTasksPageMaterialLink,
  buildTasksPageOverdueLink,
  buildTasksPagePendingLink,
  buildTasksPageSearchParams,
  parseTasksPageSearchParams,
  resolveInitialTaskFilters,
} from '../../src/utils/task-nav-query.js';

const COURSE_A = '11111111-1111-4111-8111-111111111111';
const MATERIAL_A = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const MATERIAL_B = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const UNKNOWN_COURSE = '22222222-2222-4222-8222-222222222222';
const UNKNOWN_MATERIAL = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';

const courses = [{ id: COURSE_A, title: 'Biology 101' }];

const materials = [{ id: MATERIAL_A, title: 'Chapter 1' }];

const linkedTasks = [
  { id: '1', materialId: MATERIAL_A, status: 'completed', title: 'Done task' },
  { id: '2', materialId: MATERIAL_A, status: 'pending', title: 'Open task' },
  { id: '3', materialId: MATERIAL_A, status: 'pending', title: 'Another open' },
];

describe('getMaterialLinkedTasks', () => {
  it('returns only tasks linked to the material', () => {
    const courseTasks = [
      ...linkedTasks,
      { id: '4', materialId: MATERIAL_B, status: 'pending' },
      { id: '5', materialId: null, status: 'pending' },
    ];

    assert.deepEqual(getMaterialLinkedTasks(courseTasks, MATERIAL_A, materials), linkedTasks);
  });
});

describe('summarizeLinkedTaskCounts', () => {
  it('counts pending, completed, and total', () => {
    assert.deepEqual(summarizeLinkedTaskCounts(linkedTasks), {
      total: 3,
      pending: 2,
      completed: 1,
    });
  });

  it('treats missing status as pending', () => {
    assert.deepEqual(summarizeLinkedTaskCounts([{ status: undefined }, { status: 'completed' }]), {
      total: 2,
      pending: 1,
      completed: 1,
    });
  });

  it('returns zeros for an empty list', () => {
    assert.deepEqual(summarizeLinkedTaskCounts([]), {
      total: 0,
      pending: 0,
      completed: 0,
    });
  });
});

describe('parseTasksPageSearchParams', () => {
  it('returns empty params for an empty search string', () => {
    assert.deepEqual(parseTasksPageSearchParams(''), {});
    assert.deepEqual(parseTasksPageSearchParams('?'), {});
  });

  it('parses valid courseId, materialId, and status=pending', () => {
    assert.deepEqual(
      parseTasksPageSearchParams(
        `?courseId=${COURSE_A}&materialId=${MATERIAL_A}&status=pending`
      ),
      { courseId: COURSE_A, materialId: MATERIAL_A, status: 'pending' }
    );
  });

  it('parses valid courseId and materialId', () => {
    assert.deepEqual(
      parseTasksPageSearchParams(`?courseId=${COURSE_A}&materialId=${MATERIAL_A}`),
      { courseId: COURSE_A, materialId: MATERIAL_A }
    );
  });

  it('parses valid status=pending only', () => {
    assert.deepEqual(parseTasksPageSearchParams('?status=pending'), { status: 'pending' });
  });

  it('parses valid status=completed only', () => {
    assert.deepEqual(parseTasksPageSearchParams('?status=completed'), { status: 'completed' });
  });

  it('ignores invalid UUID params', () => {
    assert.deepEqual(parseTasksPageSearchParams('?courseId=not-a-uuid&materialId=bad'), {});
  });

  it('parses materialId=none when courseId is present', () => {
    assert.deepEqual(
      parseTasksPageSearchParams(`?courseId=${COURSE_A}&materialId=none`),
      { courseId: COURSE_A, materialId: 'none' }
    );
  });

  it('parses materialId=none without courseId in raw parse (resolve falls back)', () => {
    assert.deepEqual(parseTasksPageSearchParams('?materialId=none'), { materialId: 'none' });
  });

  it('ignores invalid status values', () => {
    assert.deepEqual(parseTasksPageSearchParams('?status=all'), {});
    assert.deepEqual(parseTasksPageSearchParams('?status=in_progress'), {});
    assert.deepEqual(parseTasksPageSearchParams('?status='), {});
  });

  it('parses valid deadline=overdue', () => {
    assert.deepEqual(parseTasksPageSearchParams('?deadline=overdue'), { deadline: 'overdue' });
  });

  it('parses valid deadline=due_today with status', () => {
    assert.deepEqual(parseTasksPageSearchParams('?status=pending&deadline=due_today'), {
      status: 'pending',
      deadline: 'due_today',
    });
  });

  it('ignores invalid deadline values', () => {
    assert.deepEqual(parseTasksPageSearchParams('?deadline=all'), {});
    assert.deepEqual(parseTasksPageSearchParams('?deadline=due_soon'), {});
  });

  it('ignores unknown query params', () => {
    assert.deepEqual(
      parseTasksPageSearchParams(`?courseId=${COURSE_A}&foo=bar&status=pending`),
      { courseId: COURSE_A, status: 'pending' }
    );
  });
});

describe('buildTasksPageSearchParams', () => {
  it('returns empty string for all defaults', () => {
    assert.equal(buildTasksPageSearchParams(), '');
    assert.equal(
      buildTasksPageSearchParams({
        courseFilter: 'all',
        materialFilter: 'all',
        statusFilter: 'all',
        deadlineFilter: 'all',
      }),
      ''
    );
  });

  it('builds course only', () => {
    assert.equal(buildTasksPageSearchParams({ courseFilter: COURSE_A }), `courseId=${COURSE_A}`);
  });

  it('builds status only', () => {
    assert.equal(buildTasksPageSearchParams({ statusFilter: 'pending' }), 'status=pending');
  });

  it('builds course + material + status with stable key order', () => {
    assert.equal(
      buildTasksPageSearchParams({
        courseFilter: COURSE_A,
        materialFilter: MATERIAL_A,
        statusFilter: 'pending',
        deadlineFilter: 'all',
      }),
      `courseId=${COURSE_A}&materialId=${MATERIAL_A}&status=pending`
    );
  });

  it('omits all/default values', () => {
    assert.equal(
      buildTasksPageSearchParams({
        courseFilter: COURSE_A,
        materialFilter: 'all',
        statusFilter: 'all',
        deadlineFilter: 'all',
      }),
      `courseId=${COURSE_A}`
    );
  });

  it('does not emit materialId without courseId', () => {
    assert.equal(
      buildTasksPageSearchParams({
        courseFilter: 'all',
        materialFilter: MATERIAL_A,
        statusFilter: 'pending',
        deadlineFilter: 'all',
      }),
      'status=pending'
    );
  });

  it('builds course + materialId=none', () => {
    assert.equal(
      buildTasksPageSearchParams({
        courseFilter: COURSE_A,
        materialFilter: 'none',
      }),
      `courseId=${COURSE_A}&materialId=none`
    );
  });

  it('builds overdue deadline with pending status', () => {
    assert.equal(
      buildTasksPageSearchParams({ deadlineFilter: 'overdue' }),
      'status=pending&deadline=overdue'
    );
  });

  it('builds due_today with course and material composition', () => {
    assert.equal(
      buildTasksPageSearchParams({
        courseFilter: COURSE_A,
        materialFilter: MATERIAL_A,
        deadlineFilter: 'due_today',
      }),
      `courseId=${COURSE_A}&materialId=${MATERIAL_A}&status=pending&deadline=due_today`
    );
  });

  it('drops deadline when building completed status', () => {
    assert.equal(
      buildTasksPageSearchParams({
        statusFilter: 'completed',
        deadlineFilter: 'overdue',
      }),
      'status=completed'
    );
  });
});

describe('buildTasksPageOverdueLink', () => {
  it('returns exact overdue filtered tasks page link', () => {
    assert.equal(buildTasksPageOverdueLink(), '/tasks?status=pending&deadline=overdue');
  });
});

describe('buildTasksPageDueTodayLink', () => {
  it('returns exact due-today filtered tasks page link', () => {
    assert.equal(buildTasksPageDueTodayLink(), '/tasks?status=pending&deadline=due_today');
  });
});

describe('buildTasksPagePendingLink', () => {
  it('returns pending-only tasks page link', () => {
    assert.equal(buildTasksPagePendingLink(), '/tasks?status=pending');
  });
});

describe('buildTasksPageCoursePendingLink', () => {
  it('returns course-scoped pending tasks link with stable parameter order', () => {
    assert.equal(
      buildTasksPageCoursePendingLink(COURSE_A),
      `/tasks?courseId=${COURSE_A}&status=pending`
    );
  });
});

describe('resolveInitialTaskFilters', () => {
  it('returns all/all/all for empty search resolution input', () => {
    assert.deepEqual(resolveInitialTaskFilters({ courses, materials }), {
      courseFilter: 'all',
      materialFilter: 'all',
      statusFilter: 'all',
      deadlineFilter: 'all',
    });
  });

  it('deadline alone canonicalizes to pending with overdue filter', () => {
    assert.deepEqual(
      resolveInitialTaskFilters({
        deadline: 'overdue',
        courses,
        materials,
      }),
      {
        courseFilter: 'all',
        materialFilter: 'all',
        statusFilter: 'pending',
        deadlineFilter: 'overdue',
      }
    );
  });

  it('completed plus deadline drops deadline filter', () => {
    assert.deepEqual(
      resolveInitialTaskFilters({
        status: 'completed',
        deadline: 'overdue',
        courses,
        materials,
      }),
      {
        courseFilter: 'all',
        materialFilter: 'all',
        statusFilter: 'completed',
        deadlineFilter: 'all',
      }
    );
  });

  it('applies valid courseId, materialId, and status', () => {
    assert.deepEqual(
      resolveInitialTaskFilters({
        courseId: COURSE_A,
        materialId: MATERIAL_A,
        status: 'pending',
        courses,
        materials,
      }),
      {
        courseFilter: COURSE_A,
        materialFilter: MATERIAL_A,
        statusFilter: 'pending',
        deadlineFilter: 'all',
      }
    );
  });

  it('applies valid courseId and materialId', () => {
    assert.deepEqual(
      resolveInitialTaskFilters({
        courseId: COURSE_A,
        materialId: MATERIAL_A,
        courses,
        materials,
      }),
      {
        courseFilter: COURSE_A,
        materialFilter: MATERIAL_A,
        statusFilter: 'all',
        deadlineFilter: 'all',
      }
    );
  });

  it('applies valid courseId only', () => {
    assert.deepEqual(
      resolveInitialTaskFilters({
        courseId: COURSE_A,
        materialId: undefined,
        courses,
        materials,
      }),
      {
        courseFilter: COURSE_A,
        materialFilter: 'all',
        statusFilter: 'all',
        deadlineFilter: 'all',
      }
    );
  });

  it('ignores materialId without a valid courseId but keeps valid status', () => {
    assert.deepEqual(
      resolveInitialTaskFilters({
        courseId: undefined,
        materialId: MATERIAL_A,
        status: 'pending',
        courses,
        materials,
      }),
      {
        courseFilter: 'all',
        materialFilter: 'all',
        statusFilter: 'pending',
        deadlineFilter: 'all',
      }
    );
  });

  it('ignores unknown courseId but keeps valid status', () => {
    assert.deepEqual(
      resolveInitialTaskFilters({
        courseId: UNKNOWN_COURSE,
        materialId: MATERIAL_A,
        status: 'completed',
        courses,
        materials,
      }),
      {
        courseFilter: 'all',
        materialFilter: 'all',
        statusFilter: 'completed',
        deadlineFilter: 'all',
      }
    );
  });

  it('applies known course and ignores unknown materialId', () => {
    assert.deepEqual(
      resolveInitialTaskFilters({
        courseId: COURSE_A,
        materialId: UNKNOWN_MATERIAL,
        status: 'pending',
        courses,
        materials,
      }),
      {
        courseFilter: COURSE_A,
        materialFilter: 'all',
        statusFilter: 'pending',
        deadlineFilter: 'all',
      }
    );
  });

  it('falls back invalid status to all', () => {
    assert.deepEqual(
      resolveInitialTaskFilters({
        courseId: COURSE_A,
        status: 'in_progress',
        courses,
        materials,
      }),
      {
        courseFilter: COURSE_A,
        materialFilter: 'all',
        statusFilter: 'all',
        deadlineFilter: 'all',
      }
    );
  });

  it('applies materialFilter none when course is valid and materialId is none', () => {
    assert.deepEqual(
      resolveInitialTaskFilters({
        courseId: COURSE_A,
        materialId: 'none',
        courses,
        materials: [],
      }),
      {
        courseFilter: COURSE_A,
        materialFilter: 'none',
        statusFilter: 'all',
        deadlineFilter: 'all',
      }
    );
  });

  it('falls back to all/all when course is unknown and materialId is none', () => {
    assert.deepEqual(
      resolveInitialTaskFilters({
        courseId: UNKNOWN_COURSE,
        materialId: 'none',
        status: 'pending',
        courses,
        materials,
      }),
      {
        courseFilter: 'all',
        materialFilter: 'all',
        statusFilter: 'pending',
        deadlineFilter: 'all',
      }
    );
  });

  it('ignores materialId=none without a valid courseId but keeps valid status', () => {
    assert.deepEqual(
      resolveInitialTaskFilters({
        courseId: undefined,
        materialId: 'none',
        status: 'pending',
        courses,
        materials,
      }),
      {
        courseFilter: 'all',
        materialFilter: 'all',
        statusFilter: 'pending',
        deadlineFilter: 'all',
      }
    );
  });
});

describe('buildTasksPageMaterialLink', () => {
  it('returns /tasks with courseId and materialId query params', () => {
    assert.equal(
      buildTasksPageMaterialLink(COURSE_A, MATERIAL_A),
      `/tasks?courseId=${encodeURIComponent(COURSE_A)}&materialId=${encodeURIComponent(MATERIAL_A)}`
    );
  });
});

describe('selectLinkedTaskPreview', () => {
  it('orders pending tasks before completed tasks', () => {
    const preview = selectLinkedTaskPreview(linkedTasks, 5);
    assert.deepEqual(
      preview.map((task) => task.id),
      ['2', '3', '1']
    );
  });

  it('caps the preview list at the limit', () => {
    const preview = selectLinkedTaskPreview(linkedTasks, 2);
    assert.equal(preview.length, 2);
    assert.deepEqual(
      preview.map((task) => task.id),
      ['2', '3']
    );
  });

  it('returns an empty array when limit is zero', () => {
    assert.deepEqual(selectLinkedTaskPreview(linkedTasks, 0), []);
  });

  it('returns an empty array when tasks is empty', () => {
    assert.deepEqual(selectLinkedTaskPreview([], 5), []);
  });
});
