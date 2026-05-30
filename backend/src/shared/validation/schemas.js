import { z } from 'zod';

const emailSchema = z
  .string()
  .trim()
  .min(1, 'Email is required')
  .email('Invalid email address');

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters with letters and numbers')
  .regex(/[a-zA-Z]/, 'Password must be at least 8 characters with letters and numbers')
  .regex(/[0-9]/, 'Password must be at least 8 characters with letters and numbers');

export const registerBodySchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
  })
  .strict();

export const loginBodySchema = z
  .object({
    email: emailSchema,
    password: z.string().min(1, 'Password is required'),
  })
  .strict();

const courseTitleSchema = z
  .string()
  .trim()
  .min(3, 'Course title must be between 3 and 100 characters')
  .max(100, 'Course title must be between 3 and 100 characters');

export const createCourseBodySchema = z
  .object({
    title: courseTitleSchema,
  })
  .strict();

export const updateCourseBodySchema = z
  .object({
    title: courseTitleSchema,
  })
  .strict();

export const courseIdParamSchema = z
  .object({
    id: z.string().uuid('Invalid course id'),
  })
  .strict();

const materialTitleSchema = z
  .string()
  .trim()
  .min(3, 'Material title must be between 3 and 150 characters')
  .max(150, 'Material title must be between 3 and 150 characters');

const materialContentSchema = z
  .string()
  .trim()
  .min(100, 'Study material must be between 100 and 50,000 characters')
  .max(50000, 'Study material must be between 100 and 50,000 characters');

const sourceTypeSchema = z.enum(['manual', 'paste']);

export const createStudyMaterialBodySchema = z
  .object({
    title: materialTitleSchema,
    content: materialContentSchema,
    sourceType: sourceTypeSchema.optional(),
  })
  .strict();

export const updateStudyMaterialBodySchema = z
  .object({
    title: materialTitleSchema.optional(),
    content: materialContentSchema.optional(),
    sourceType: sourceTypeSchema.optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  });

export const materialIdParamSchema = z
  .object({
    materialId: z.string().uuid('Invalid study material id'),
  })
  .strict();

export const materialPlanIdParamsSchema = z
  .object({
    materialId: z.string().uuid('Invalid study material id'),
    planId: z.string().uuid('Invalid generated plan id'),
  })
  .strict();

/** POST /api/study-materials/:materialId/generate — no client body fields */
export const generateStudyMaterialBodySchema = z.object({}).strict();

/** POST .../generated-plans/:planId/activate — no client body fields */
export const activateGeneratedPlanBodySchema = z.object({}).strict();
