import { getProfileByUserId } from '../auth/auth.service.js';
import { ApiError } from '../../shared/errors/ApiError.js';
import { sendError } from '../../shared/utils/response.js';

/**
 * Requires an authenticated admin user. Must run after requireAuth.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function requireAdmin(req, res, next) {
  try {
    let profile;
    try {
      profile = await getProfileByUserId(req.user.id);
    } catch (err) {
      if (err instanceof ApiError && err.code === 'NOT_FOUND') {
        throw new ApiError('FORBIDDEN', 'Admin access required', 403);
      }
      throw err;
    }

    if (profile.role !== 'admin') {
      throw new ApiError('FORBIDDEN', 'Admin access required', 403);
    }

    req.user.role = 'admin';
    next();
  } catch (err) {
    if (err instanceof ApiError) {
      sendError(res, err.code, err.message, err.status, err.details);
      return;
    }
    next(err);
  }
}
