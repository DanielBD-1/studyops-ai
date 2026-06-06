/**
 * @param {number} currentIndex zero-based
 * @param {number} total
 * @returns {string}
 */
export function formatCardCounter(currentIndex, total) {
  return `Card ${currentIndex + 1} of ${total}`;
}

/**
 * @param {number} currentIndex
 * @param {number} total
 * @returns {number}
 */
export function getNextIndex(currentIndex, total) {
  if (total <= 1) {
    return 0;
  }
  return (currentIndex + 1) % total;
}

/**
 * @param {number} currentIndex
 * @param {number} total
 * @returns {number}
 */
export function getPreviousIndex(currentIndex, total) {
  if (total <= 1) {
    return 0;
  }
  return (currentIndex - 1 + total) % total;
}

/**
 * @param {number} total
 * @returns {boolean}
 */
export function canNavigateFlashcards(total) {
  return total > 1;
}

/**
 * Stable identity for a study deck — metadata-only updates keep the same key.
 * @param {Array<{ id?: string, question: string, answer: string }>} flashcards
 * @returns {string}
 */
export function buildStudySetKey(flashcards) {
  return flashcards.map((card) => card.id ?? `${card.question}\0${card.answer}`).join('\n');
}
