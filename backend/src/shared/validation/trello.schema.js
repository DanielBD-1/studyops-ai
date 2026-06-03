import { z } from 'zod';

const trelloCredentialSchema = (label) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .max(128, `${label} must be at most 128 characters`);

const trelloCredentialsFields = {
  apiKey: trelloCredentialSchema('API key'),
  token: trelloCredentialSchema('Token'),
};

export const trelloBoardsBodySchema = z.object(trelloCredentialsFields).strict();

export const trelloBoardListsBodySchema = z.object(trelloCredentialsFields).strict();

export const trelloBoardIdParamSchema = z
  .object({
    boardId: z
      .string()
      .trim()
      .min(1, 'Board ID is required')
      .max(64, 'Board ID must be at most 64 characters')
      .regex(/^[a-zA-Z0-9]+$/, 'Invalid board id'),
  })
  .strict();

export const trelloSyncBodySchema = z
  .object({
    ...trelloCredentialsFields,
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

export const trelloConnectCompleteBodySchema = z
  .object({
    token: trelloCredentialSchema('Token'),
  })
  .strict();

export const trelloDisconnectBodySchema = z.object({}).strict();
