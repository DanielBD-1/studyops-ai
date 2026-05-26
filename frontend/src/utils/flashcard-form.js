import {
  createFlashcardFormSchema,
  updateFlashcardFormSchema,
} from './validation.js';

/**
 * @param {string} input
 * @returns {string[]}
 */
export function parseFlashcardTagsInput(input) {
  if (typeof input !== 'string' || input.trim() === '') {
    return [];
  }

  return input
    .split(',')
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
}

/**
 * @param {string} tagsInput
 * @returns {string[] | undefined}
 */
function tagsForCreateBody(tagsInput) {
  const tags = parseFlashcardTagsInput(tagsInput);
  return tags.length > 0 ? tags : undefined;
}

/**
 * @param {string} question
 * @param {string} answer
 * @param {string} tagsInput
 * @param {string} materialId
 * @returns {{
 *   success: true,
 *   body: { question: string, answer: string, materialId: string, tags?: string[] },
 * } | { success: false, error: string }}
 */
export function buildCreateFlashcardBody(question, answer, tagsInput, materialId) {
  const tags = tagsForCreateBody(tagsInput);

  /** @type {Record<string, unknown>} */
  const candidate = {
    question,
    answer,
    materialId,
  };
  if (tags) {
    candidate.tags = tags;
  }

  const parsed = createFlashcardFormSchema.safeParse(candidate);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Invalid input',
    };
  }

  /** @type {{ question: string, answer: string, materialId: string, tags?: string[] }} */
  const body = {
    question: parsed.data.question,
    answer: parsed.data.answer,
    materialId: parsed.data.materialId,
  };
  if (parsed.data.tags !== undefined) {
    body.tags = parsed.data.tags;
  }

  return { success: true, body };
}

/**
 * @param {string} question
 * @param {string} answer
 * @param {string} tagsInput
 * @returns {{
 *   success: true,
 *   body: { question: string, answer: string, tags: string[] },
 * } | { success: false, error: string }}
 */
export function buildUpdateFlashcardBody(question, answer, tagsInput) {
  const tags = parseFlashcardTagsInput(tagsInput);

  const parsed = updateFlashcardFormSchema.safeParse({
    question,
    answer,
    tags,
  });
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Invalid input',
    };
  }

  return {
    success: true,
    body: {
      question: parsed.data.question,
      answer: parsed.data.answer,
      tags: parsed.data.tags,
    },
  };
}

/**
 * @param {string} question
 * @param {number} [maxLength=80]
 */
export function truncateFlashcardQuestion(question, maxLength = 80) {
  if (question.length <= maxLength) {
    return question;
  }
  return `${question.slice(0, maxLength)}…`;
}
