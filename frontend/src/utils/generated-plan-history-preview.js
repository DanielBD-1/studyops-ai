/**
 * @param {import('../services/study-materials.service.js').StudyPlan | null | undefined} plan
 */
export function getPlanPreviewStats(plan) {
  const keyTopics = Array.isArray(plan?.keyTopics) ? plan.keyTopics : [];
  const tasks = Array.isArray(plan?.tasks) ? plan.tasks : [];
  const flashcards = Array.isArray(plan?.flashcards) ? plan.flashcards : [];

  return {
    keyTopicCount: keyTopics.length,
    taskCount: tasks.length,
    flashcardCount: flashcards.length,
    difficulty: typeof plan?.difficulty === 'string' ? plan.difficulty : null,
  };
}

/**
 * Plain-text summary snippet for compact preview (no HTML).
 * @param {import('../services/study-materials.service.js').StudyPlan | null | undefined} plan
 * @param {number} [maxLength]
 */
export function getPlanSummarySnippet(plan, maxLength = 120) {
  const summary = typeof plan?.summary === 'string' ? plan.summary.trim() : '';
  if (!summary) return '';
  if (summary.length <= maxLength) return summary;
  return `${summary.slice(0, maxLength - 1).trimEnd()}…`;
}

/**
 * @param {ReturnType<typeof getPlanPreviewStats>} stats
 */
export function formatPlanPreviewMeta(stats) {
  const parts = [
    `${stats.keyTopicCount} topic${stats.keyTopicCount === 1 ? '' : 's'}`,
    `${stats.taskCount} task${stats.taskCount === 1 ? '' : 's'}`,
    `${stats.flashcardCount} flashcard${stats.flashcardCount === 1 ? '' : 's'}`,
  ];

  if (stats.difficulty) {
    parts.push(stats.difficulty);
  }

  return parts.join(' · ');
}
