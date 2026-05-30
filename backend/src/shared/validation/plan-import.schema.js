import { z } from 'zod';
import {
  taskTitleSchema,
  taskDescriptionSchema,
  taskPrioritySchema,
  estimatedMinutesSchema,
} from './task.schema.js';
import {
  flashcardQuestionSchema,
  flashcardAnswerSchema,
  flashcardTagsSchema,
} from './flashcard.schema.js';

export const importPlanTaskItemSchema = z
  .object({
    title: taskTitleSchema,
    description: taskDescriptionSchema.optional(),
    priority: taskPrioritySchema.optional(),
    estimatedMinutes: estimatedMinutesSchema,
  })
  .strict();

export const importPlanTasksBodySchema = z
  .object({
    tasks: z.array(importPlanTaskItemSchema).min(1).max(20),
  })
  .strict();

export const importPlanFlashcardItemSchema = z
  .object({
    question: flashcardQuestionSchema,
    answer: flashcardAnswerSchema,
    tags: flashcardTagsSchema.optional(),
  })
  .strict();

export const importPlanFlashcardsBodySchema = z
  .object({
    flashcards: z.array(importPlanFlashcardItemSchema).min(1).max(30),
  })
  .strict();
