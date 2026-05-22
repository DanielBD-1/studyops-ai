import { AppError } from '../errors.js';
import { sendError } from '../shared/utils/response.js';
import { logGeminiEvent } from '../utils/logger.js';

export function notFoundHandler(_req, res) {
  sendError(res, 'NOT_FOUND', 'Not found', 404);
}

/**
 * @param {unknown} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} _next
 */
export function errorHandler(err, req, res, _next) {
  if (err instanceof AppError) {
    sendError(res, err.code, err.message, err.status, err.details);
    return;
  }

  logGeminiEvent('error', {
    event: 'unhandled_error',
    path: req.path,
    method: req.method,
    errorCode: 'SERVER_ERROR',
  });

  sendError(res, 'SERVER_ERROR', 'An unexpected error occurred', 500);
}
