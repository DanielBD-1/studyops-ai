import { ApiError } from '../../shared/errors/ApiError.js';
import {
  classifyTrelloCredentialMode,
  trelloBoardListsBodySchema,
  trelloBoardListsStoredBodySchema,
  trelloBoardsBodySchema,
  trelloBoardsStoredBodySchema,
  trelloSyncBodySchema,
  trelloSyncStoredBodySchema,
} from '../../shared/validation/trello.schema.js';
import {
  decryptTokenForUser,
  getConnectionByUserId,
} from './trello-connection.repository.js';
import { requireTrelloApiKey } from './trello-connection.service.js';

const TRELLO_NOT_CONNECTED_MESSAGE =
  'Connect your Trello account or provide API credentials.';
const TRELLO_INTEGRATION_UNAVAILABLE_MESSAGE = 'Trello integration is not available.';
const TRELLO_MANUAL_CREDENTIALS_NOT_ALLOWED_MESSAGE =
  'Use your connected Trello account, or disconnect before using manual credentials.';

/**
 * @param {import('zod').SafeParseReturnType<unknown, unknown>} parsed
 * @returns {never}
 */
function throwValidationErrorFromZod(parsed) {
  if (parsed.success) {
    throw new Error('Expected Zod validation failure');
  }

  const details = {
    issues: parsed.error.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    })),
  };

  throw new ApiError('VALIDATION_ERROR', 'Invalid request data', 400, details);
}

/**
 * @param {import('zod').ZodType} schema
 * @param {unknown} body
 */
function parseBodyOrThrow(schema, body) {
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throwValidationErrorFromZod(parsed);
  }
  return parsed.data;
}

/**
 * @returns {never}
 */
function throwPartialCredentialsError() {
  throw new ApiError('VALIDATION_ERROR', 'Invalid request data', 400, {
    issues: [
      {
        path: 'apiKey',
        message: 'Both API key and token are required when providing credentials',
      },
    ],
  });
}

/**
 * @param {string} userId
 * @returns {Promise<void>}
 */
async function assertManualCredentialsAllowed(userId) {
  const metadata = await getConnectionByUserId(userId);
  if (metadata) {
    throw new ApiError(
      'TRELLO_MANUAL_CREDENTIALS_NOT_ALLOWED',
      TRELLO_MANUAL_CREDENTIALS_NOT_ALLOWED_MESSAGE,
      400
    );
  }
}

/**
 * @param {string} userId
 * @returns {Promise<{ apiKey: string, token: string }>}
 */
async function resolveStoredCredentials(userId) {
  const metadata = await getConnectionByUserId(userId);
  if (!metadata) {
    throw new ApiError('TRELLO_NOT_CONNECTED', TRELLO_NOT_CONNECTED_MESSAGE, 400);
  }

  const apiKey = requireTrelloApiKey();

  /** @type {string | null} */
  let token;
  try {
    token = await decryptTokenForUser(userId);
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError('SERVER_ERROR', TRELLO_INTEGRATION_UNAVAILABLE_MESSAGE, 500);
  }

  if (!token) {
    throw new ApiError('TRELLO_NOT_CONNECTED', TRELLO_NOT_CONNECTED_MESSAGE, 400);
  }

  return { apiKey, token };
}

/**
 * @param {string} userId
 * @param {unknown} body
 * @returns {Promise<{ apiKey: string, token: string }>}
 */
export async function resolveTrelloDiscoveryCredentials(userId, body) {
  const mode = classifyTrelloCredentialMode(body);

  if (mode === 'partial') {
    throwPartialCredentialsError();
  }

  if (mode === 'manual') {
    await assertManualCredentialsAllowed(userId);
    const parsed = parseBodyOrThrow(trelloBoardsBodySchema, body);
    return { apiKey: parsed.apiKey, token: parsed.token };
  }

  parseBodyOrThrow(trelloBoardsStoredBodySchema, body);
  return resolveStoredCredentials(userId);
}

/**
 * @param {string} userId
 * @param {unknown} body
 * @returns {Promise<{ apiKey: string, token: string }>}
 */
export async function resolveTrelloBoardListsCredentials(userId, body) {
  const mode = classifyTrelloCredentialMode(body);

  if (mode === 'partial') {
    throwPartialCredentialsError();
  }

  if (mode === 'manual') {
    await assertManualCredentialsAllowed(userId);
    const parsed = parseBodyOrThrow(trelloBoardListsBodySchema, body);
    return { apiKey: parsed.apiKey, token: parsed.token };
  }

  parseBodyOrThrow(trelloBoardListsStoredBodySchema, body);
  return resolveStoredCredentials(userId);
}

/**
 * @param {string} userId
 * @param {unknown} body
 * @returns {Promise<{ apiKey: string, token: string, listId: string, taskIds: string[] }>}
 */
export async function resolveTrelloSyncRequest(userId, body) {
  const mode = classifyTrelloCredentialMode(body);

  if (mode === 'partial') {
    throwPartialCredentialsError();
  }

  if (mode === 'manual') {
    await assertManualCredentialsAllowed(userId);
    const parsed = parseBodyOrThrow(trelloSyncBodySchema, body);
    return {
      apiKey: parsed.apiKey,
      token: parsed.token,
      listId: parsed.listId,
      taskIds: parsed.taskIds,
    };
  }

  const parsed = parseBodyOrThrow(trelloSyncStoredBodySchema, body);
  const { apiKey, token } = await resolveStoredCredentials(userId);
  return {
    apiKey,
    token,
    listId: parsed.listId,
    taskIds: parsed.taskIds,
  };
}
