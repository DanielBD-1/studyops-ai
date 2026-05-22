import { z } from 'zod';
import { ApiError } from '../errors/ApiError.js';

/** Align with document-service GeminiOutputSchema (PRD §8). */
export const generatedPlanSchema = z
  .object({
    summary: z.string().min(50).max(2000),
    keyTopics: z.array(z.string()).min(1).max(10),
    difficulty: z.enum(['easy', 'medium', 'hard']),
    tasks: z
      .array(
        z
          .object({
            title: z.string().min(3).max(200),
            description: z.string().min(0).max(1000),
            priority: z.enum(['low', 'medium', 'high']),
            estimatedMinutes: z.number().int().min(5).max(480),
            difficulty: z.enum(['easy', 'medium', 'hard']),
            tags: z.array(z.string()).max(5),
          })
          .strict()
      )
      .min(1)
      .max(20),
    flashcards: z
      .array(
        z
          .object({
            question: z.string().min(10).max(500),
            answer: z.string().min(10).max(2000),
            tags: z.array(z.string()).max(5),
          })
          .strict()
      )
      .min(1)
      .max(30),
  })
  .strict();

/**
 * @param {unknown} plan
 * @returns {z.infer<typeof generatedPlanSchema>}
 */
export function parseAndValidateGeneratedPlan(plan) {
  const parsed = generatedPlanSchema.safeParse(plan);
  if (!parsed.success) {
    throw new ApiError(
      'GEMINI_INVALID_RESPONSE',
      'Invalid response from AI, please try again',
      500
    );
  }
  return parsed.data;
}
