export const VALID_STUDY_TEXT = 'x'.repeat(100);

export const PRD_VALID_GEMINI_OUTPUT = {
  summary:
    'This study material covers the fundamentals of calculus including limits, derivatives, and integrals. Key concepts include the definition of a limit, derivative rules, and basic integration techniques.',
  keyTopics: [
    'Limits',
    'Derivatives',
    'Integration',
    'Chain Rule',
    'Fundamental Theorem of Calculus',
  ],
  difficulty: 'medium',
  tasks: [
    {
      title: 'Practice limit problems',
      description:
        "Solve 10 limit problems from chapter 2, focusing on indeterminate forms and L'Hôpital's rule",
      priority: 'high',
      estimatedMinutes: 45,
      difficulty: 'medium',
      tags: ['limits', 'practice'],
    },
    {
      title: 'Review derivative rules',
      description:
        'Study and memorize power rule, product rule, quotient rule, and chain rule',
      priority: 'medium',
      estimatedMinutes: 30,
      difficulty: 'easy',
      tags: ['derivatives', 'rules'],
    },
  ],
  flashcards: [
    {
      question: 'What is the definition of a limit?',
      answer:
        'The limit of f(x) as x approaches a is L if f(x) gets arbitrarily close to L as x gets arbitrarily close to a',
      tags: ['limits', 'definition'],
    },
    {
      question: 'State the power rule for derivatives',
      answer: "If f(x) = x^n, then f'(x) = n*x^(n-1)",
      tags: ['derivatives', 'power rule'],
    },
  ],
};
