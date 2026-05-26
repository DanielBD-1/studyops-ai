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
