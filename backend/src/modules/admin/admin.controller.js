import { sendSuccess } from '../../shared/utils/response.js';
import { getAdminStats } from './admin.service.js';

/**
 * @param {import('express').Request} _req
 * @param {import('express').Response} res
 */
export function accessCheck(_req, res) {
  sendSuccess(res, { admin: true });
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function getStats(req, res, next) {
  try {
    const stats = await getAdminStats();
    sendSuccess(res, stats);
  } catch (err) {
    next(err);
  }
}
