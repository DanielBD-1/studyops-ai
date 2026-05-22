export const MOCK_GEMINI_PLAN = {
  summary:
    'This study material covers the fundamentals of calculus including limits, derivatives, and integrals. Key concepts include the definition of a limit, derivative rules, and basic integration techniques.',
  keyTopics: ['Limits', 'Derivatives', 'Integration'],
  difficulty: 'medium',
  tasks: [
    {
      title: 'Practice limit problems',
      description: 'Solve limit problems from chapter 2',
      priority: 'high',
      estimatedMinutes: 45,
      difficulty: 'medium',
      tags: ['limits'],
    },
  ],
  flashcards: [
    {
      question: 'What is the definition of a limit?',
      answer: 'The limit describes the value approached as the input approaches some value.',
      tags: ['limits'],
    },
  ],
};

/**
 * @param {unknown} data
 */
export function documentServiceSuccessEnvelope(data) {
  return {
    success: true,
    data,
    meta: { timestamp: '2026-05-22T12:00:00.000Z' },
  };
}

/**
 * @param {string} code
 * @param {string} message
 * @param {number} status
 */
export function documentServiceErrorEnvelope(code, message, status) {
  return {
    success: false,
    error: { code, message },
    meta: { timestamp: '2026-05-22T12:00:00.000Z' },
    _httpStatus: status,
  };
}
