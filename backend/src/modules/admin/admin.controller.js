import { sendSuccess } from '../../shared/utils/response.js';

/**
 * @param {import('express').Request} _req
 * @param {import('express').Response} res
 */
export function accessCheck(_req, res) {
  sendSuccess(res, { admin: true });
}
