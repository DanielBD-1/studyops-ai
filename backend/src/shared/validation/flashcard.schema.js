import { z } from 'zod';

export const flashcardIdParamSchema = z
  .object({
    flashcardId: z.string().uuid('Invalid flashcard id'),
  })
  .strict();

export const listFlashcardsQuerySchema = z
  .object({
    courseId: z.string().uuid('Invalid course id').optional(),
    materialId: z.string().uuid('Invalid study material id').optional(),
  })
  .strict();

export const flashcardQuestionSchema = z
  .string()
  .trim()
  .min(10, 'Question must be between 10 and 500 characters')
  .max(500, 'Question must be between 10 and 500 characters');

export const flashcardAnswerSchema = z
  .string()
  .trim()
  .min(10, 'Answer must be between 10 and 2000 characters')
  .max(2000, 'Answer must be between 10 and 2000 characters');

export const flashcardTagSchema = z
  .string()
  .trim()
  .min(1, 'Tags must be non-empty strings')
  .max(50, 'Tags must be at most 50 characters');

export const flashcardTagsSchema = z
  .array(flashcardTagSchema)
  .max(5, 'You can specify at most 5 tags');

export const flashcardMaterialIdSchema = z.string().uuid('Invalid study material id');

export const createFlashcardBodySchema = z
  .object({
    question: flashcardQuestionSchema,
    answer: flashcardAnswerSchema,
    tags: flashcardTagsSchema.optional(),
    materialId: flashcardMaterialIdSchema.nullable().optional(),
  })
  .strict();

export const updateFlashcardBodySchema = z
  .object({
    question: flashcardQuestionSchema.optional(),
    answer: flashcardAnswerSchema.optional(),
    tags: flashcardTagsSchema.optional(),
    materialId: flashcardMaterialIdSchema.nullable().optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  });

export const flashcardOutcomeSchema = z.enum(['known', 'unknown']);

export const reviewFlashcardBodySchema = z
  .object({
    outcome: flashcardOutcomeSchema,
  })
  .strict();

