import { trelloSyncBodySchema } from '../../shared/validation/trello.schema.js';
import { sendSuccess, sendValidationError } from '../../shared/utils/response.js';
import { syncTasksToTrello } from './trello.service.js';

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
