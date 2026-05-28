import { z } from 'zod';

const trelloCredentialSchema = (label) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .max(128, `${label} must be at most 128 characters`);

export const trelloSyncBodySchema = z
  .object({
    apiKey: trelloCredentialSchema('API key'),
    token: trelloCredentialSchema('Token'),
    listId: z
      .string()
      .trim()
      .min(1, 'List ID is required')
      .max(64, 'List ID must be at most 64 characters'),
    taskIds: z
      .array(z.string().uuid('Invalid task id'))
      .min(1, 'At least one task id is required')
      .max(50, 'At most 50 task ids are allowed'),
  })
  .strict()
  .refine((data) => new Set(data.taskIds).size === data.taskIds.length, {
    message: 'taskIds must not contain duplicates',
    path: ['taskIds'],
  });
