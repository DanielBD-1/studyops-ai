import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildFlashcardsPageDueNowLink,
  buildFlashcardsPageSearchParams,
  parseFlashcardsPageSearchParams,
  resolveInitialFlashcardFilters,
} from '../../src/utils/flashcard-nav-query.js';

const COURSE_A = '11111111-1111-4111-8111-111111111111';
const MATERIAL_A = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const MATERIAL_B = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const UNKNOWN_COURSE = '22222222-2222-4222-8222-222222222222';
const UNKNOWN_MATERIAL = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';

const courses = [{ id: COURSE_A, title: 'Biology 101' }];
const materials = [{ id: MATERIAL_A, title: 'Chapter 1' }];

describe('parseFlashcardsPageSearchParams', () => {
  it('returns empty params for an empty search string', () => {
    assert.deepEqual(parseFlashcardsPageSearchParams(''), {});
    assert.deepEqual(parseFlashcardsPageSearchParams('?'), {});
  });

  it('parses reviewState=due_now only', () => {
    assert.deepEqual(parseFlashcardsPageSearchParams('?reviewState=due_now'), {
      reviewState: 'due_now',
    });
  });

  it('parses valid courseId, materialId, and reviewState', () => {
    assert.deepEqual(
      parseFlashcardsPageSearchParams(
        `?courseId=${COURSE_A}&materialId=${MATERIAL_A}&reviewState=needs_review`
      ),
      { courseId: COURSE_A, materialId: MATERIAL_A, reviewState: 'needs_review' }
    );
  });

  it('parses each allowed reviewState value', () => {
    assert.deepEqual(parseFlashcardsPageSearchParams('?reviewState=needs_review'), {
      reviewState: 'needs_review',
    });
    assert.deepEqual(parseFlashcardsPageSearchParams('?reviewState=new'), { reviewState: 'new' });
    assert.deepEqual(parseFlashcardsPageSearchParams('?reviewState=learning'), {
      reviewState: 'learning',
    });
    assert.deepEqual(parseFlashcardsPageSearchParams('?reviewState=known'), { reviewState: 'known' });
  });

  it('ignores invalid UUID params', () => {
    assert.deepEqual(parseFlashcardsPageSearchParams('?courseId=not-a-uuid&materialId=bad'), {});
  });

  it('parses materialId without courseId in raw parse (resolve falls back)', () => {
    assert.deepEqual(parseFlashcardsPageSearchParams(`?materialId=${MATERIAL_A}`), {
      materialId: MATERIAL_A,
    });
  });

  it('ignores invalid reviewState values', () => {
    assert.deepEqual(parseFlashcardsPageSearchParams('?reviewState=all'), {});
    assert.deepEqual(parseFlashcardsPageSearchParams('?reviewState=due'), {});
    assert.deepEqual(parseFlashcardsPageSearchParams('?reviewState='), {});
  });

  it('ignores unknown query params', () => {
    assert.deepEqual(
      parseFlashcardsPageSearchParams(`?courseId=${COURSE_A}&foo=bar&reviewState=due_now`),
      { courseId: COURSE_A, reviewState: 'due_now' }
    );
  });
});

describe('buildFlashcardsPageSearchParams', () => {
  it('returns empty string for all defaults', () => {
    assert.equal(buildFlashcardsPageSearchParams(), '');
    assert.equal(
      buildFlashcardsPageSearchParams({
        courseFilter: 'all',
        materialFilter: 'all',
        reviewFilter: 'all',
      }),
      ''
    );
  });

  it('builds reviewState only', () => {
    assert.equal(buildFlashcardsPageSearchParams({ reviewFilter: 'due_now' }), 'reviewState=due_now');
  });

  it('builds course only', () => {
    assert.equal(buildFlashcardsPageSearchParams({ courseFilter: COURSE_A }), `courseId=${COURSE_A}`);
  });

  it('builds course + material + reviewState with stable key order', () => {
    assert.equal(
      buildFlashcardsPageSearchParams({
        courseFilter: COURSE_A,
        materialFilter: MATERIAL_A,
        reviewFilter: 'known',
      }),
      `courseId=${COURSE_A}&materialId=${MATERIAL_A}&reviewState=known`
    );
  });

  it('omits all/default values', () => {
    assert.equal(
      buildFlashcardsPageSearchParams({
        courseFilter: COURSE_A,
        materialFilter: 'all',
        reviewFilter: 'all',
      }),
      `courseId=${COURSE_A}`
    );
  });

  it('does not emit materialId without courseId', () => {
    assert.equal(
      buildFlashcardsPageSearchParams({
        courseFilter: 'all',
        materialFilter: MATERIAL_A,
        reviewFilter: 'due_now',
      }),
      'reviewState=due_now'
    );
  });
});

describe('resolveInitialFlashcardFilters', () => {
  it('returns all/all/all for empty search resolution input', () => {
    assert.deepEqual(resolveInitialFlashcardFilters({ courses, materials }), {
      courseFilter: 'all',
      materialFilter: 'all',
      reviewFilter: 'all',
    });
  });

  it('applies valid courseId, materialId, and reviewState', () => {
    assert.deepEqual(
      resolveInitialFlashcardFilters({
        courseId: COURSE_A,
        materialId: MATERIAL_A,
        reviewState: 'due_now',
        courses,
        materials,
      }),
      {
        courseFilter: COURSE_A,
        materialFilter: MATERIAL_A,
        reviewFilter: 'due_now',
      }
    );
  });

  it('applies reviewState only when course and material are absent', () => {
    assert.deepEqual(
      resolveInitialFlashcardFilters({
        reviewState: 'due_now',
        courses,
        materials,
      }),
      {
        courseFilter: 'all',
        materialFilter: 'all',
        reviewFilter: 'due_now',
      }
    );
  });

  it('falls back to all courses for unknown courseId but keeps valid reviewState', () => {
    assert.deepEqual(
      resolveInitialFlashcardFilters({
        courseId: UNKNOWN_COURSE,
        materialId: MATERIAL_A,
        reviewState: 'due_now',
        courses,
        materials,
      }),
      {
        courseFilter: 'all',
        materialFilter: 'all',
        reviewFilter: 'due_now',
      }
    );
  });

  it('falls back to all materials for unknown materialId with valid course', () => {
    assert.deepEqual(
      resolveInitialFlashcardFilters({
        courseId: COURSE_A,
        materialId: UNKNOWN_MATERIAL,
        reviewState: 'needs_review',
        courses,
        materials,
      }),
      {
        courseFilter: COURSE_A,
        materialFilter: 'all',
        reviewFilter: 'needs_review',
      }
    );
  });

  it('falls back reviewFilter to all for invalid reviewState', () => {
    assert.deepEqual(
      resolveInitialFlashcardFilters({
        reviewState: 'invalid',
        courses,
        materials,
      }),
      {
        courseFilter: 'all',
        materialFilter: 'all',
        reviewFilter: 'all',
      }
    );
  });

  it('ignores orphan materialId when courseId is absent', () => {
    assert.deepEqual(
      resolveInitialFlashcardFilters({
        materialId: MATERIAL_A,
        reviewState: 'new',
        courses,
        materials,
      }),
      {
        courseFilter: 'all',
        materialFilter: 'all',
        reviewFilter: 'new',
      }
    );
  });

  it('applies valid course only with reviewState when materials list is empty', () => {
    assert.deepEqual(
      resolveInitialFlashcardFilters({
        courseId: COURSE_A,
        materialId: MATERIAL_B,
        reviewState: 'learning',
        courses,
        materials: [],
      }),
      {
        courseFilter: COURSE_A,
        materialFilter: 'all',
        reviewFilter: 'learning',
      }
    );
  });
});

describe('buildFlashcardsPageDueNowLink', () => {
  it('returns the Due now deep link', () => {
    assert.equal(buildFlashcardsPageDueNowLink(), '/flashcards?reviewState=due_now');
  });
});
