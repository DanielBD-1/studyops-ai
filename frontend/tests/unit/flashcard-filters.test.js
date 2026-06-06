import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  filterFlashcardsByReviewState,
  resolveFlashcardListFilters,
  resetMaterialFilterForCourseChange,
} from '../../src/utils/flashcard-filters.js';

const COURSE_A = '11111111-1111-4111-8111-111111111111';
const COURSE_B = '22222222-2222-4222-8222-222222222222';
const MATERIAL_A = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const MATERIAL_B = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const UNKNOWN_COURSE = '99999999-9999-4999-8999-999999999999';
const UNKNOWN_MATERIAL = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';

const courses = [{ id: COURSE_A }, { id: COURSE_B }];
const materials = [{ id: MATERIAL_A }, { id: MATERIAL_B }];

describe('resolveFlashcardListFilters', () => {
  it('returns empty object when course filter is all', () => {
    assert.deepEqual(
      resolveFlashcardListFilters({
        courseFilter: 'all',
        materialFilter: MATERIAL_A,
        courses,
        materials,
      }),
      {}
    );
  });

  it('returns courseId when owned course is selected and material is all', () => {
    assert.deepEqual(
      resolveFlashcardListFilters({
        courseFilter: COURSE_A,
        materialFilter: 'all',
        courses,
        materials,
      }),
      { courseId: COURSE_A }
    );
  });

  it('returns empty object for unknown course id', () => {
    assert.deepEqual(
      resolveFlashcardListFilters({
        courseFilter: UNKNOWN_COURSE,
        materialFilter: 'all',
        courses,
        materials,
      }),
      {}
    );
  });

  it('returns courseId and materialId when both are owned', () => {
    assert.deepEqual(
      resolveFlashcardListFilters({
        courseFilter: COURSE_A,
        materialFilter: MATERIAL_A,
        courses,
        materials,
      }),
      { courseId: COURSE_A, materialId: MATERIAL_A }
    );
  });

  it('returns courseId only when material id is unknown', () => {
    assert.deepEqual(
      resolveFlashcardListFilters({
        courseFilter: COURSE_A,
        materialFilter: UNKNOWN_MATERIAL,
        courses,
        materials,
      }),
      { courseId: COURSE_A }
    );
  });

  it('ignores material filter when course is all', () => {
    assert.deepEqual(
      resolveFlashcardListFilters({
        courseFilter: 'all',
        materialFilter: MATERIAL_A,
        courses,
        materials,
      }),
      {}
    );
  });

  it('returns courseId only when material filter is all with course selected', () => {
    assert.deepEqual(
      resolveFlashcardListFilters({
        courseFilter: COURSE_B,
        materialFilter: 'all',
        courses,
        materials: [],
      }),
      { courseId: COURSE_B }
    );
  });
});

describe('resetMaterialFilterForCourseChange', () => {
  it('returns all', () => {
    assert.equal(resetMaterialFilterForCourseChange(), 'all');
  });
});

const reviewCards = [
  { id: '1', mastery: 'new' },
  { id: '2', mastery: 'learning' },
  { id: '3', mastery: 'known' },
  { id: '4', mastery: 'new' },
];

describe('filterFlashcardsByReviewState', () => {
  it('returns all cards for all filter', () => {
    assert.deepEqual(filterFlashcardsByReviewState(reviewCards, 'all'), reviewCards);
  });

  it('returns new and learning cards for needs_review', () => {
    assert.deepEqual(filterFlashcardsByReviewState(reviewCards, 'needs_review'), [
      { id: '1', mastery: 'new' },
      { id: '2', mastery: 'learning' },
      { id: '4', mastery: 'new' },
    ]);
  });

  it('returns only new cards for new filter', () => {
    assert.deepEqual(filterFlashcardsByReviewState(reviewCards, 'new'), [
      { id: '1', mastery: 'new' },
      { id: '4', mastery: 'new' },
    ]);
  });

  it('returns only learning cards for learning filter', () => {
    assert.deepEqual(filterFlashcardsByReviewState(reviewCards, 'learning'), [
      { id: '2', mastery: 'learning' },
    ]);
  });

  it('returns only known cards for known filter', () => {
    assert.deepEqual(filterFlashcardsByReviewState(reviewCards, 'known'), [
      { id: '3', mastery: 'known' },
    ]);
  });

  it('returns all cards for unknown filter value', () => {
    assert.deepEqual(filterFlashcardsByReviewState(reviewCards, 'invalid'), reviewCards);
  });

  it('returns empty array for empty input', () => {
    assert.deepEqual(filterFlashcardsByReviewState([], 'needs_review'), []);
  });
});
