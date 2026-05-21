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

export const registerFormSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const loginFormSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

const COURSE_TITLE_MESSAGE = 'Course title must be between 3 and 100 characters';

export const courseTitleSchema = z
  .string()
  .trim()
  .min(3, COURSE_TITLE_MESSAGE)
  .max(100, COURSE_TITLE_MESSAGE);

export const createCourseFormSchema = z
  .object({
    title: courseTitleSchema,
  })
  .strict();

export const updateCourseFormSchema = z
  .object({
    title: courseTitleSchema,
  })
  .strict();

const MATERIAL_TITLE_MESSAGE = 'Material title must be between 3 and 150 characters';
const MATERIAL_CONTENT_MESSAGE =
  'Study material must be between 100 and 50,000 characters';

export const materialTitleSchema = z
  .string()
  .trim()
  .min(3, MATERIAL_TITLE_MESSAGE)
  .max(150, MATERIAL_TITLE_MESSAGE);

export const materialContentSchema = z
  .string()
  .trim()
  .min(100, MATERIAL_CONTENT_MESSAGE)
  .max(50000, MATERIAL_CONTENT_MESSAGE);

export const sourceTypeSchema = z.enum(['manual', 'paste']);

export const createStudyMaterialFormSchema = z
  .object({
    title: materialTitleSchema,
    content: materialContentSchema,
    sourceType: sourceTypeSchema.optional(),
  })
  .strict();

export const updateStudyMaterialFormSchema = z
  .object({
    title: materialTitleSchema.optional(),
    content: materialContentSchema.optional(),
    sourceType: sourceTypeSchema.optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  });
