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
 * Client-side review-state filter for flashcards already loaded from the API.
 * Unknown filter values return all cards (defensive).
 *
 * @param {{ mastery?: string }[]} flashcards
 * @param {'all' | 'needs_review' | 'new' | 'learning' | 'known' | string} reviewFilter
 * @returns {{ mastery?: string }[]}
 */
export function filterFlashcardsByReviewState(flashcards, reviewFilter) {
  if (!Array.isArray(flashcards) || flashcards.length === 0) {
    return [];
  }

  switch (reviewFilter) {
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
