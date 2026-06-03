import {
  trelloBoardIdParamSchema,
  trelloBoardListsBodySchema,
  trelloBoardsBodySchema,
  trelloConnectCompleteBodySchema,
  trelloDisconnectBodySchema,
  trelloSyncBodySchema,
} from '../../shared/validation/trello.schema.js';
import { sendSuccess, sendValidationError } from '../../shared/utils/response.js';
import {
  buildAuthorizeUrl,
  completeConnection,
  disconnectConnection,
  getConnectionStatus,
} from './trello-connection.service.js';
import { listTrelloBoardLists, listTrelloBoards, syncTasksToTrello } from './trello.service.js';

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function boards(req, res, next) {
  const bodyParsed = trelloBoardsBodySchema.safeParse(req.body);
  if (!bodyParsed.success) {
    sendValidationError(res, bodyParsed.error);
    return;
  }

  try {
    const data = await listTrelloBoards(bodyParsed.data);
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

  const bodyParsed = trelloBoardListsBodySchema.safeParse(req.body);
  if (!bodyParsed.success) {
    sendValidationError(res, bodyParsed.error);
    return;
  }

  try {
    const data = await listTrelloBoardLists({
      ...bodyParsed.data,
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
  const bodyParsed = trelloSyncBodySchema.safeParse(req.body);
  if (!bodyParsed.success) {
    sendValidationError(res, bodyParsed.error);
    return;
  }

  try {
    const data = await syncTasksToTrello(req.user.id, bodyParsed.data);
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
