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
