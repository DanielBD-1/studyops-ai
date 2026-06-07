import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  getMaterialLinkedTasks,
  selectLinkedTaskPreview,
  summarizeLinkedTaskCounts,
} from '../../src/utils/task-filters.js';
import {
  buildTasksPageMaterialLink,
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

  it('parses valid courseId and materialId', () => {
    assert.deepEqual(
      parseTasksPageSearchParams(`?courseId=${COURSE_A}&materialId=${MATERIAL_A}`),
      { courseId: COURSE_A, materialId: MATERIAL_A }
    );
  });

  it('ignores invalid UUID params', () => {
    assert.deepEqual(parseTasksPageSearchParams('?courseId=not-a-uuid&materialId=bad'), {});
  });
});

describe('resolveInitialTaskFilters', () => {
  it('returns all/all for empty search resolution input', () => {
    assert.deepEqual(
      resolveInitialTaskFilters({ courses, materials }),
      { courseFilter: 'all', materialFilter: 'all' }
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
      { courseFilter: COURSE_A, materialFilter: MATERIAL_A }
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
      { courseFilter: COURSE_A, materialFilter: 'all' }
    );
  });

  it('ignores materialId without a valid courseId', () => {
    assert.deepEqual(
      resolveInitialTaskFilters({
        courseId: undefined,
        materialId: MATERIAL_A,
        courses,
        materials,
      }),
      { courseFilter: 'all', materialFilter: 'all' }
    );
  });

  it('ignores unknown courseId', () => {
    assert.deepEqual(
      resolveInitialTaskFilters({
        courseId: UNKNOWN_COURSE,
        materialId: MATERIAL_A,
        courses,
        materials,
      }),
      { courseFilter: 'all', materialFilter: 'all' }
    );
  });

  it('applies known course and ignores unknown materialId', () => {
    assert.deepEqual(
      resolveInitialTaskFilters({
        courseId: COURSE_A,
        materialId: UNKNOWN_MATERIAL,
        courses,
        materials,
      }),
      { courseFilter: COURSE_A, materialFilter: 'all' }
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
