import { z } from 'zod';

export const focusDurationMinutesSchema = z
  .number()
  .int('Duration minutes must be a whole number')
  .min(5, 'Duration minutes must be between 5 and 120')
  .max(120, 'Duration minutes must be between 5 and 120');

export const startFocusBodySchema = z
  .object({
    taskId: z.string().uuid('Invalid task id'),
    durationMinutes: focusDurationMinutesSchema.optional().default(25),
  })
  .strict();

export const completeFocusParamsSchema = z
  .object({
    sessionId: z.string().uuid('Invalid focus session id'),
  })
  .strict();

export const completeFocusBodySchema = z
  .object({
    completedTask: z.boolean({ message: 'completedTask must be a boolean' }),
  })
  .strict();
