import { registerBodySchema, loginBodySchema } from '../../shared/validation/schemas.js';
import { sendSuccess, sendValidationError } from '../../shared/utils/response.js';
import { registerUser, loginUser, getMe } from './auth.service.js';

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function register(req, res, next) {
  const parsed = registerBodySchema.safeParse(req.body);
  if (!parsed.success) {
    sendValidationError(res, parsed.error);
    return;
  }

  const { email, password } = parsed.data;

  try {
    const result = await registerUser(email, password);
    const payload = {
      user: result.user,
      session: result.session,
      ...(result.message ? { message: result.message } : {}),
    };
    sendSuccess(res, payload, 201);
  } catch (err) {
    next(err);
  }
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function login(req, res, next) {
  const parsed = loginBodySchema.safeParse(req.body);
  if (!parsed.success) {
    sendValidationError(res, parsed.error);
    return;
  }

  const { email, password } = parsed.data;

  try {
    const result = await loginUser(email, password);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

/**
 * @param {import('express').Request} _req
 * @param {import('express').Response} res
 */
export function logout(_req, res) {
  sendSuccess(res, { loggedOut: true });
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function me(req, res, next) {
  try {
    const result = await getMe(req.user.id);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}
