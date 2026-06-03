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

const trelloSyncPayloadFields = {
  listId: z
    .string()
    .trim()
    .min(1, 'List ID is required')
    .max(64, 'List ID must be at most 64 characters'),
  taskIds: z
    .array(z.string().uuid('Invalid task id'))
    .min(1, 'At least one task id is required')
    .max(50, 'At most 50 task ids are allowed'),
};

const trelloSyncPayloadRefine = (data) => new Set(data.taskIds).size === data.taskIds.length;

const trelloSyncPayloadRefineConfig = {
  message: 'taskIds must not contain duplicates',
  path: ['taskIds'],
};

export const trelloBoardsBodySchema = z.object(trelloCredentialsFields).strict();

export const trelloBoardListsBodySchema = z.object(trelloCredentialsFields).strict();

export const trelloBoardsStoredBodySchema = z.object({}).strict();

export const trelloBoardListsStoredBodySchema = z.object({}).strict();

export const trelloSyncStoredBodySchema = z
  .object(trelloSyncPayloadFields)
  .strict()
  .refine(trelloSyncPayloadRefine, trelloSyncPayloadRefineConfig);

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
    ...trelloSyncPayloadFields,
  })
  .strict()
  .refine(trelloSyncPayloadRefine, trelloSyncPayloadRefineConfig);

export const trelloConnectCompleteBodySchema = z
  .object({
    token: trelloCredentialSchema('Token'),
    state: z
      .string()
      .trim()
      .min(1, 'State is required')
      .max(2048, 'State must be at most 2048 characters'),
  })
  .strict();

export const trelloDisconnectBodySchema = z.object({}).strict();

const trelloResourceIdSchema = (label) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .max(64, `${label} must be at most 64 characters`)
    .regex(/^[a-zA-Z0-9]+$/, `Invalid ${label.toLowerCase()}`);

export const trelloConnectionDefaultsBodySchema = z
  .object({
    boardId: trelloResourceIdSchema('Board ID'),
    listId: trelloResourceIdSchema('List ID'),
  })
  .strict();

/** @typedef {'stored' | 'manual' | 'partial'} TrelloCredentialMode */

/**
 * @param {unknown} body
 * @returns {TrelloCredentialMode}
 */
export function classifyTrelloCredentialMode(body) {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return 'partial';
  }

  const record = /** @type {Record<string, unknown>} */ (body);
  const hasApiKey = Object.prototype.hasOwnProperty.call(record, 'apiKey');
  const hasToken = Object.prototype.hasOwnProperty.call(record, 'token');

  if (!hasApiKey && !hasToken) {
    return 'stored';
  }

  if (hasApiKey && hasToken) {
    return 'manual';
  }

  return 'partial';
}
