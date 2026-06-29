export const COURSE_A = '11111111-1111-4111-8111-111111111111';
export const COURSE_B = '22222222-2222-4222-8222-222222222222';
export const MATERIAL_A = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
export const MATERIAL_B = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
export const UNKNOWN_MATERIAL = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
export const TASK_A = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';
export const TASK_B = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee';

export const TEST_TOKEN = 'test-access-token';

/** @type {import('../../src/services/courses.service.js').Course[]} */
export const coursesFixture = [
  {
    id: COURSE_A,
    title: 'Biology 101',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: COURSE_B,
    title: 'Chemistry 201',
    createdAt: '2026-01-02T00:00:00.000Z',
    updatedAt: '2026-01-02T00:00:00.000Z',
  },
];

/** @type {import('../../src/services/study-materials.service.js').MaterialSummary[]} */
export const materialsCourseAFixture = [
  { id: MATERIAL_A, title: 'Chapter 1', courseId: COURSE_A },
  { id: MATERIAL_B, title: 'Chapter 2', courseId: COURSE_A },
];

/** @type {import('../../src/services/study-materials.service.js').MaterialSummary[]} */
export const materialsCourseBFixture = [
  {
    id: 'ffffffff-ffff-4fff-8fff-ffffffffffff',
    title: 'Lab notes',
    courseId: COURSE_B,
  },
];

export const MATERIAL_B_COURSE_B = 'ffffffff-ffff-4fff-8fff-ffffffffffff';

/**
 * @param {Partial<import('../../src/services/tasks.service.js').StudyTask>} overrides
 */
export function makeStudyTask(overrides = {}) {
  return {
    id: TASK_A,
    courseId: COURSE_A,
    materialId: MATERIAL_A,
    title: 'Review chapter',
    description: '',
    priority: 'medium',
    estimatedMinutes: 30,
    difficulty: 'medium',
    tags: [],
    status: 'pending',
    source: 'manual',
    dueDate: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

export const tasksCourseAFixture = [
  makeStudyTask({
    id: TASK_A,
    title: 'Review chapter',
    materialId: MATERIAL_A,
    status: 'pending',
  }),
  makeStudyTask({
    id: TASK_B,
    title: 'Complete worksheet',
    materialId: MATERIAL_B,
    status: 'pending',
  }),
];
