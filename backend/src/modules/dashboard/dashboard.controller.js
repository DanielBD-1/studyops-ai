import { sendSuccess } from '../../shared/utils/response.js';
import { getDashboardStats } from './dashboard.service.js';

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function getStats(req, res, next) {
  try {
    const stats = await getDashboardStats(req.user.id);
    sendSuccess(res, stats);
  } catch (err) {
    next(err);
  }
}
