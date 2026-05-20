import { getAuthUserFromToken } from './auth.service.js';
import { sendError } from '../../shared/utils/response.js';
import { ApiError } from '../../shared/errors/ApiError.js';

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    sendError(res, 'AUTH_REQUIRED', 'Authentication required', 401);
    return;
  }

  const token = header.slice(7).trim();
  if (!token) {
    sendError(res, 'AUTH_REQUIRED', 'Authentication required', 401);
    return;
  }

  try {
    req.user = await getAuthUserFromToken(token);
    next();
  } catch (err) {
    if (err instanceof ApiError) {
      sendError(res, err.code, err.message, err.status, err.details);
      return;
    }
    next(err);
  }
}
