import {
  trelloBoardIdParamSchema,
  trelloConnectCompleteBodySchema,
  trelloConnectionDefaultsBodySchema,
  trelloDisconnectBodySchema,
} from '../../shared/validation/trello.schema.js';
import { sendSuccess, sendValidationError } from '../../shared/utils/response.js';
import {
  resolveTrelloBoardListsCredentials,
  resolveTrelloDiscoveryCredentials,
  resolveTrelloSyncRequest,
} from './trello-credentials.resolver.js';
import {
  buildAuthorizeUrl,
  completeConnection,
  disconnectConnection,
  getConnectionStatus,
  updateConnectionDefaults,
} from './trello-connection.service.js';
import { listTrelloBoardLists, listTrelloBoards, syncTasksToTrello } from './trello.service.js';

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function boards(req, res, next) {
  try {
    const { apiKey, token } = await resolveTrelloDiscoveryCredentials(req.user.id, req.body);
    const data = await listTrelloBoards({ apiKey, token });
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function boardLists(req, res, next) {
  const paramsParsed = trelloBoardIdParamSchema.safeParse(req.params);
  if (!paramsParsed.success) {
    sendValidationError(res, paramsParsed.error);
    return;
  }

  try {
    const { apiKey, token } = await resolveTrelloBoardListsCredentials(req.user.id, req.body);
    const data = await listTrelloBoardLists({
      apiKey,
      token,
      boardId: paramsParsed.data.boardId,
    });
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function sync(req, res, next) {
  try {
    const { apiKey, token, listId, taskIds } = await resolveTrelloSyncRequest(
      req.user.id,
      req.body
    );
    const data = await syncTasksToTrello(req.user.id, { apiKey, token, listId, taskIds });
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function connectionStatus(req, res, next) {
  try {
    const data = await getConnectionStatus(req.user.id);
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function authorizeUrl(req, res, next) {
  try {
    const data = buildAuthorizeUrl(req.user.id);
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function connectComplete(req, res, next) {
  const bodyParsed = trelloConnectCompleteBodySchema.safeParse(req.body);
  if (!bodyParsed.success) {
    sendValidationError(res, bodyParsed.error);
    return;
  }

  try {
    const data = await completeConnection(
      req.user.id,
      bodyParsed.data.token,
      bodyParsed.data.state
    );
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function updateDefaults(req, res, next) {
  const bodyParsed = trelloConnectionDefaultsBodySchema.safeParse(req.body);
  if (!bodyParsed.success) {
    sendValidationError(res, bodyParsed.error);
    return;
  }

  try {
    const data = await updateConnectionDefaults(
      req.user.id,
      bodyParsed.data.boardId,
      bodyParsed.data.listId
    );
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function disconnect(req, res, next) {
  const bodyParsed = trelloDisconnectBodySchema.safeParse(req.body);
  if (!bodyParsed.success) {
    sendValidationError(res, bodyParsed.error);
    return;
  }

  try {
    const data = await disconnectConnection(req.user.id);
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
}
