import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  __setAccessTokenForTests as setFlashcardsToken,
  __setApiFetchForTests as setFlashcardsApiFetch,
} from '../../src/services/flashcards.service.js';
import {
  __setAccessTokenForTests as setMaterialsToken,
  __setApiFetchForTests as setMaterialsApiFetch,
} from '../../src/services/study-materials.service.js';
import { waitFor } from '../helpers/minimal-browser.js';
import { renderGlobalFlashcardsSection } from '../helpers/render-flashcards-section.jsx';
import {
  COURSE_A,
  COURSE_B,
  MATERIAL_A,
  UNKNOWN_COURSE,
  UNKNOWN_MATERIAL,
  TEST_TOKEN,
  coursesFixture,
  flashcardsFixture,
  materialsCourseAFixture,
} from '../helpers/flashcards-test-fixtures.js';

/** @type {import('../../src/services/flashcards.service.js').Flashcard[]} */
let flashcardsResponse = flashcardsFixture;

beforeEach(() => {
  flashcardsResponse = flashcardsFixture;

  const apiHandler = async (path) => {
    if (path === '/api/flashcards' || path.startsWith('/api/flashcards?')) {
      return {
        success: true,
        data: { flashcards: flashcardsResponse },
        meta: { timestamp: '2026-06-07T00:00:00.000Z' },
      };
    }

    const materialsMatch = path.match(/^\/api\/courses\/([^/]+)\/materials$/);
    if (materialsMatch) {
      const courseId = materialsMatch[1];
      const materials =
        courseId === COURSE_A
          ? materialsCourseAFixture
          : courseId === COURSE_B
            ? []
            : [];
      return {
        success: true,
        data: { materials },
        meta: { timestamp: '2026-06-07T00:00:00.000Z' },
      };
    }

    return {
      success: true,
      data: {},
      meta: { timestamp: '2026-06-07T00:00:00.000Z' },
    };
  };

  setFlashcardsToken(TEST_TOKEN);
  setMaterialsToken(TEST_TOKEN);
  setFlashcardsApiFetch(apiHandler);
  setMaterialsApiFetch(apiHandler);
});

afterEach(() => {
  setFlashcardsApiFetch(null);
  setMaterialsApiFetch(null);
  setFlashcardsToken(null);
  setMaterialsToken(null);
});

/**
 * @param {Awaited<ReturnType<typeof renderGlobalFlashcardsSection>>} view
 * @param {string} selectId
 */
function getSelectValue(view, selectId) {
  const select = view.query(selectId);
  assert.ok(select, `expected select ${selectId}`);
  return select.value || 'all';
}

/**
 * @param {Awaited<ReturnType<typeof renderGlobalFlashcardsSection>>} view
 */
function getReviewFilterValue(view) {
  return getSelectValue(view, '#global-flashcards-review-filter');
}

/**
 * @param {Awaited<ReturnType<typeof renderGlobalFlashcardsSection>>} view
 */
function getCourseFilterValue(view) {
  return getSelectValue(view, '#global-flashcards-course-filter');
}

/**
 * @param {Awaited<ReturnType<typeof renderGlobalFlashcardsSection>>} view
 */
function getMaterialFilterValue(view) {
  return getSelectValue(view, '#global-flashcards-material-filter');
}

describe('GlobalFlashcardsSection URL filter synchronization', () => {
  describe('deep-link initialization', () => {
    it('initializes reviewState=due_now from the URL after courses load', async () => {
      const view = await renderGlobalFlashcardsSection({
        initialEntry: '/flashcards?reviewState=due_now',
        courses: coursesFixture,
      });

      try {
        await waitFor(() => view.getSearchString() === '?reviewState=due_now');
        assert.equal(view.getSearchString(), '?reviewState=due_now');
        assert.match(view.container.textContent ?? '', /Card 1 of 2/);
        assert.match(view.container.textContent ?? '', /What is photosynthesis/);
      } finally {
        await view.unmount();
      }
    });

    it('initializes course, material, and review filters from a valid deep link', async () => {
      const view = await renderGlobalFlashcardsSection({
        initialEntry: `/flashcards?courseId=${COURSE_A}&materialId=${MATERIAL_A}&reviewState=known`,
        courses: coursesFixture,
      });

      try {
        await waitFor(() => view.getSearchString().includes(`courseId=${COURSE_A}`));
        await waitFor(() => view.getSearchString().includes('reviewState=known'));
        await waitFor(() => view.query('#global-flashcards-material-filter') !== null);
        await waitFor(() => view.container.textContent?.includes('What is mitosis') ?? false);

        assert.match(view.container.textContent ?? '', /What is mitosis/);
        assert.doesNotMatch(view.container.textContent ?? '', /What is photosynthesis/);
      } finally {
        await view.unmount();
      }
    });
  });

  describe('manual filter changes update the URL', () => {
    it('adds courseId when a course is selected', async () => {
      const view = await renderGlobalFlashcardsSection({
        initialEntry: '/flashcards',
        courses: coursesFixture,
      });

      try {
        await view.changeSelect('#global-flashcards-course-filter', COURSE_A);
        await waitFor(() => view.getSearchString() === `?courseId=${COURSE_A}`);

        assert.equal(getCourseFilterValue(view), COURSE_A);
        assert.equal(view.getSearchString(), `?courseId=${COURSE_A}`);
        assert.ok(view.query('#global-flashcards-material-filter'));
      } finally {
        await view.unmount();
      }
    });

    it('adds materialId when a material is selected', async () => {
      const view = await renderGlobalFlashcardsSection({
        initialEntry: `/flashcards?courseId=${COURSE_A}`,
        courses: coursesFixture,
      });

      try {
        await waitFor(() => view.query('#global-flashcards-material-filter') !== null);

        await view.changeSelect('#global-flashcards-material-filter', MATERIAL_A);
        await waitFor(
          () =>
            view.getSearchString() ===
            `?courseId=${COURSE_A}&materialId=${MATERIAL_A}`
        );

        assert.equal(getMaterialFilterValue(view), MATERIAL_A);
        assert.equal(
          view.getSearchString(),
          `?courseId=${COURSE_A}&materialId=${MATERIAL_A}`
        );
      } finally {
        await view.unmount();
      }
    });

    it('adds reviewState when a review filter is selected', async () => {
      const view = await renderGlobalFlashcardsSection({
        initialEntry: '/flashcards',
        courses: coursesFixture,
      });

      try {
        await view.changeSelect('#global-flashcards-review-filter', 'needs_review');
        await waitFor(() => view.getSearchString() === '?reviewState=needs_review');

        assert.equal(getReviewFilterValue(view), 'needs_review');
        assert.equal(view.getSearchString(), '?reviewState=needs_review');
        assert.match(view.container.textContent ?? '', /What is photosynthesis/);
        assert.match(view.container.textContent ?? '', /What is ATP/);
        assert.doesNotMatch(view.container.textContent ?? '', /What is mitosis/);
      } finally {
        await view.unmount();
      }
    });

    it('removes reviewState when All is selected', async () => {
      const view = await renderGlobalFlashcardsSection({
        initialEntry: '/flashcards?reviewState=due_now',
        courses: coursesFixture,
      });

      try {
        await waitFor(() => view.getSearchString() === '?reviewState=due_now');

        await view.changeSelect('#global-flashcards-review-filter', 'all');
        await waitFor(() => view.getSearchString() === '');

        assert.equal(getReviewFilterValue(view), 'all');
        assert.equal(view.getSearchString(), '');
        assert.match(view.container.textContent ?? '', /Card 1 of 3/);
      } finally {
        await view.unmount();
      }
    });

    it('resets material filter and removes materialId when the course changes', async () => {
      const view = await renderGlobalFlashcardsSection({
        initialEntry: `/flashcards?courseId=${COURSE_A}&materialId=${MATERIAL_A}&reviewState=due_now`,
        courses: coursesFixture,
      });

      try {
        await waitFor(() => view.getSearchString().includes(`courseId=${COURSE_A}`));
        await waitFor(() => view.query('#global-flashcards-material-filter') !== null);

        await view.changeSelect('#global-flashcards-course-filter', COURSE_B);
        await waitFor(
          () => view.getSearchString() === `?courseId=${COURSE_B}&reviewState=due_now`
        );

        assert.equal(getCourseFilterValue(view), COURSE_B);
        assert.doesNotMatch(view.getSearchString(), /materialId=/);
        assert.equal(view.getSearchString(), `?courseId=${COURSE_B}&reviewState=due_now`);
        assert.ok(view.query('#global-flashcards-material-filter'));
      } finally {
        await view.unmount();
      }
    });
  });

  describe('browser Back/Forward restoration', () => {
    it('restores filter state when router history moves back and forward', async () => {
      const view = await renderGlobalFlashcardsSection({
        initialEntry: '/flashcards',
        courses: coursesFixture,
      });

      try {
        await view.changeSelect('#global-flashcards-review-filter', 'due_now');
        await waitFor(() => view.getSearchString() === '?reviewState=due_now');
        assert.match(view.container.textContent ?? '', /Card 1 of 2/);

        await view.changeSelect('#global-flashcards-review-filter', 'known');
        await waitFor(() => view.getSearchString() === '?reviewState=known');
        assert.match(view.container.textContent ?? '', /Card 1 of 1/);

        await view.goBack();
        await waitFor(() => view.getSearchString() === '?reviewState=due_now');
        assert.match(view.container.textContent ?? '', /Card 1 of 2/);

        await view.goForward();
        await waitFor(() => view.getSearchString() === '?reviewState=known');
        assert.match(view.container.textContent ?? '', /Card 1 of 1/);
        assert.match(view.container.textContent ?? '', /What is mitosis/);
      } finally {
        await view.unmount();
      }
    });
  });

  describe('invalid and stale URL canonicalization', () => {
    it('strips invalid reviewState and falls back to All', async () => {
      const view = await renderGlobalFlashcardsSection({
        initialEntry: '/flashcards?reviewState=invalid',
        courses: coursesFixture,
      });

      try {
        await waitFor(() => view.getSearchString() === '');

        assert.equal(view.getSearchString(), '');
        assert.match(view.container.textContent ?? '', /Card 1 of 3/);
      } finally {
        await view.unmount();
      }
    });

    it('treats reviewState=all as default and omits it from the URL', async () => {
      const view = await renderGlobalFlashcardsSection({
        initialEntry: '/flashcards?reviewState=all',
        courses: coursesFixture,
      });

      try {
        await waitFor(() => view.getSearchString() === '');

        assert.equal(view.getSearchString(), '');
        assert.match(view.container.textContent ?? '', /Card 1 of 3/);
      } finally {
        await view.unmount();
      }
    });

    it('falls back unknown courseId to all courses and removes it from the URL', async () => {
      const view = await renderGlobalFlashcardsSection({
        initialEntry: `/flashcards?courseId=${UNKNOWN_COURSE}&reviewState=due_now`,
        courses: coursesFixture,
      });

      try {
        await waitFor(() => view.getSearchString() === '?reviewState=due_now');

        assert.equal(view.getSearchString(), '?reviewState=due_now');
        assert.doesNotMatch(view.getSearchString(), /courseId=/);
        assert.match(view.container.textContent ?? '', /Card 1 of 2/);
      } finally {
        await view.unmount();
      }
    });

    it('falls back unknown materialId to all materials while keeping a valid course', async () => {
      const view = await renderGlobalFlashcardsSection({
        initialEntry: `/flashcards?courseId=${COURSE_A}&materialId=${UNKNOWN_MATERIAL}&reviewState=new`,
        courses: coursesFixture,
      });

      try {
        await waitFor(
          () => view.getSearchString() === `?courseId=${COURSE_A}&reviewState=new`
        );

        assert.equal(view.getSearchString(), `?courseId=${COURSE_A}&reviewState=new`);
        assert.doesNotMatch(view.getSearchString(), /materialId=/);
        await waitFor(() => view.query('#global-flashcards-material-filter') !== null);
        assert.match(view.container.textContent ?? '', /What is photosynthesis/);
        assert.doesNotMatch(view.container.textContent ?? '', /What is mitosis/);
      } finally {
        await view.unmount();
      }
    });

    it('removes orphan materialId when courseId is absent', async () => {
      const view = await renderGlobalFlashcardsSection({
        initialEntry: `/flashcards?materialId=${MATERIAL_A}&reviewState=learning`,
        courses: coursesFixture,
      });

      try {
        await waitFor(() => view.getSearchString() === '?reviewState=learning');

        assert.equal(view.getSearchString(), '?reviewState=learning');
        assert.doesNotMatch(view.getSearchString(), /materialId=/);
        assert.doesNotMatch(view.getSearchString(), /courseId=/);
        assert.equal(view.query('#global-flashcards-material-filter'), null);
        assert.match(view.container.textContent ?? '', /What is ATP/);
      } finally {
        await view.unmount();
      }
    });
  });
});
