export const COURSE_A = '11111111-1111-4111-8111-111111111111';
export const COURSE_B = '22222222-2222-4222-8222-222222222222';
export const MATERIAL_A = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
export const MATERIAL_B = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
export const UNKNOWN_COURSE = '33333333-3333-4333-8333-333333333333';
export const UNKNOWN_MATERIAL = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
export const FLASHCARD_A = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';
export const FLASHCARD_B = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee';
export const FLASHCARD_C = 'ffffffff-ffff-4fff-8fff-ffffffffffff';

export const TEST_TOKEN = 'test-access-token';

/** @type {import('../../src/services/courses.service.js').Course[]} */
export const coursesFixture = [
  { id: COURSE_A, title: 'Biology 101', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: COURSE_B, title: 'Chemistry 201', createdAt: '2026-01-02T00:00:00.000Z' },
];

/** @type {import('../../src/services/study-materials.service.js').MaterialSummary[]} */
export const materialsCourseAFixture = [
  { id: MATERIAL_A, title: 'Chapter 1', courseId: COURSE_A },
  { id: MATERIAL_B, title: 'Chapter 2', courseId: COURSE_A },
];

/**
 * @param {Partial<import('../../src/services/flashcards.service.js').Flashcard>} overrides
 */
export function makeFlashcard(overrides = {}) {
  return {
    id: FLASHCARD_A,
    courseId: COURSE_A,
    materialId: MATERIAL_A,
    question: 'What is photosynthesis?',
    answer: 'Photosynthesis converts light into chemical energy.',
    tags: ['biology'],
    source: 'manual',
    mastery: 'new',
    lastReviewedAt: null,
    reviewCount: 0,
    knownCount: 0,
    unknownCount: 0,
    nextReviewAt: null,
    reviewIntervalDays: 0,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

export const flashcardsFixture = [
  makeFlashcard({
    id: FLASHCARD_A,
    question: 'What is photosynthesis?',
    answer: 'Photosynthesis converts light into chemical energy.',
    mastery: 'new',
    nextReviewAt: null,
  }),
  makeFlashcard({
    id: FLASHCARD_B,
    question: 'What is mitosis?',
    answer: 'Mitosis is cell division that produces two identical daughter cells.',
    mastery: 'known',
    nextReviewAt: '2026-12-31T00:00:00.000Z',
  }),
  makeFlashcard({
    id: FLASHCARD_C,
    question: 'What is ATP?',
    answer: 'ATP stores and transfers energy in cells.',
    mastery: 'learning',
    nextReviewAt: null,
  }),
];
