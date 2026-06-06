/**
 * @param {string} courseId
 * @param {{ id: string }[]} courses
 */
function courseIdIsOwned(courseId, courses) {
  return courses.some((c) => c.id === courseId);
}

/**
 * @param {string} materialId
 * @param {{ id: string }[]} materials
 */
function materialIdIsOwned(materialId, materials) {
  return materials.some((m) => m.id === materialId);
}

/**
 * Resolves safe listFlashcards query filters from UI state.
 * Only returns courseId/materialId values present in owned course/material lists.
 *
 * @param {{
 *   courseFilter: 'all' | string,
 *   materialFilter: 'all' | string,
 *   courses: { id: string }[],
 *   materials: { id: string }[],
 * }} params
 * @returns {{ courseId?: string, materialId?: string }}
 */
export function resolveFlashcardListFilters({
  courseFilter,
  materialFilter,
  courses,
  materials,
}) {
  if (courseFilter === 'all' || !courseIdIsOwned(courseFilter, courses)) {
    return {};
  }

  /** @type {{ courseId: string, materialId?: string }} */
  const filters = { courseId: courseFilter };

  if (
    materialFilter !== 'all' &&
    materialIdIsOwned(materialFilter, materials)
  ) {
    filters.materialId = materialFilter;
  }

  return filters;
}

/**
 * When the course filter changes, material filter must reset to "all".
 *
 * @returns {'all'}
 */
export function resetMaterialFilterForCourseChange() {
  return 'all';
}

/**
 * Whether a saved DB flashcard is due for review based on SRS-lite nextReviewAt.
 *
 * @param {{ nextReviewAt?: string | null }} card
 * @param {Date} [now]
 * @returns {boolean}
 */
export function isFlashcardDueNow(card, now = new Date()) {
  const { nextReviewAt } = card;
  if (nextReviewAt == null || nextReviewAt === '') {
    return true;
  }
  const ts = Date.parse(nextReviewAt);
  if (Number.isNaN(ts)) {
    return true;
  }
  return ts <= now.getTime();
}

/**
 * Client-side review-state filter for flashcards already loaded from the API.
 * Unknown filter values return all cards (defensive).
 *
 * @param {{ mastery?: string, nextReviewAt?: string | null }[]} flashcards
 * @param {'all' | 'due_now' | 'needs_review' | 'new' | 'learning' | 'known' | string} reviewFilter
 * @returns {{ mastery?: string, nextReviewAt?: string | null }[]}
 */
export function filterFlashcardsByReviewState(flashcards, reviewFilter) {
  if (!Array.isArray(flashcards) || flashcards.length === 0) {
    return [];
  }

  switch (reviewFilter) {
    case 'due_now':
      return flashcards.filter((card) => isFlashcardDueNow(card));
    case 'needs_review':
      return flashcards.filter(
        (card) => card.mastery === 'new' || card.mastery === 'learning'
      );
    case 'new':
      return flashcards.filter((card) => card.mastery === 'new');
    case 'learning':
      return flashcards.filter((card) => card.mastery === 'learning');
    case 'known':
      return flashcards.filter((card) => card.mastery === 'known');
    case 'all':
    default:
      return flashcards;
  }
}
