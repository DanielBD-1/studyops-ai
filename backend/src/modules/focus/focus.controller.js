import {
  startFocusBodySchema,
  completeFocusParamsSchema,
  completeFocusBodySchema,
} from '../../shared/validation/focus.schema.js';
import { sendSuccess, sendValidationError } from '../../shared/utils/response.js';
import { startFocusSession, completeFocusSession } from './focus.service.js';

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function start(req, res, next) {
  const bodyParsed = startFocusBodySchema.safeParse(req.body ?? {});
  if (!bodyParsed.success) {
    sendValidationError(res, bodyParsed.error);
    return;
  }

  try {
    const session = await startFocusSession(req.user.id, bodyParsed.data);
    sendSuccess(res, { session }, 201);
  } catch (err) {
    next(err);
  }
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function complete(req, res, next) {
  const paramsParsed = completeFocusParamsSchema.safeParse(req.params);
  if (!paramsParsed.success) {
    sendValidationError(res, paramsParsed.error);
    return;
  }

  const bodyParsed = completeFocusBodySchema.safeParse(req.body ?? {});
  if (!bodyParsed.success) {
    sendValidationError(res, bodyParsed.error);
    return;
  }

  try {
    const result = await completeFocusSession(
      req.user.id,
      paramsParsed.data.sessionId,
      bodyParsed.data
    );
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}
