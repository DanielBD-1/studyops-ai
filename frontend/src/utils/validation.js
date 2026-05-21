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
