import { z } from 'zod';
import { taskDueDateSchema } from './task.schema.js';

export const dashboardStatsQuerySchema = z
  .object({
    referenceDate: taskDueDateSchema.optional(),
  })
  .strict();
