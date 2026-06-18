import { z } from 'zod';
import { ISO_CALENDAR_DATE_MESSAGE, isValidIsoCalendarDate } from './calendar-date.js';

export const taskDueDateSchema = z
  .string()
  .refine((value) => isValidIsoCalendarDate(value), {
    message: ISO_CALENDAR_DATE_MESSAGE,
  });

export const taskTitleSchema = z
  .string()
  .trim()
  .min(3, 'Task title must be between 3 and 200 characters')
  .max(200, 'Task title must be between 3 and 200 characters');

export const taskDescriptionSchema = z
  .string()
  .trim()
  .max(1000, 'Task description must be at most 1000 characters');

export const taskPrioritySchema = z.enum(['low', 'medium', 'high'], {
  message: 'Priority must be low, medium, or high',
});

export const estimatedMinutesSchema = z
  .number()
  .int('Estimated minutes must be a whole number')
  .min(5, 'Estimated minutes must be between 5 and 480')
  .max(480, 'Estimated minutes must be between 5 and 480');

export const materialIdSchema = z.string().uuid('Invalid material id');

export const createTaskBodySchema = z
  .object({
    title: taskTitleSchema,
    description: taskDescriptionSchema.optional(),
    priority: taskPrioritySchema.optional(),
    estimatedMinutes: estimatedMinutesSchema,
    materialId: materialIdSchema.optional(),
    dueDate: taskDueDateSchema.nullable().optional(),
  })
  .strict();

export const updateTaskBodySchema = z
  .object({
    title: taskTitleSchema.optional(),
    description: taskDescriptionSchema.optional(),
    priority: taskPrioritySchema.optional(),
    estimatedMinutes: estimatedMinutesSchema.optional(),
    materialId: materialIdSchema.nullable().optional(),
    dueDate: taskDueDateSchema.nullable().optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  });

export const taskIdParamSchema = z
  .object({
    taskId: z.string().uuid('Invalid task id'),
  })
  .strict();

export const listTasksQuerySchema = z
  .object({
    courseId: z.string().uuid('Invalid course id').optional(),
    status: z.enum(['pending', 'completed'], {
      message: 'Status must be pending or completed',
    }).optional(),
  })
  .strict();

export const listCourseTasksQuerySchema = z
  .object({
    status: z.enum(['pending', 'completed'], {
      message: 'Status must be pending or completed',
    }).optional(),
  })
  .strict();

export const completeTaskBodySchema = z.object({}).strict();
