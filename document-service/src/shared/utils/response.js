/** PRD §8.5 standard API response envelope. */

function shouldIncludeErrorDetails() {
  return process.env.NODE_ENV !== 'production';
}

export function timestamp() {
  return new Date().toISOString();
}

/**
 * @param {import('express').Response} res
 * @param {unknown} data
 * @param {number} [status]
 */
export function sendSuccess(res, data, status = 200) {
  res.status(status).json({
    success: true,
    data,
    meta: { timestamp: timestamp() },
  });
}

/**
 * @param {import('express').Response} res
 * @param {string} code
 * @param {string} message
 * @param {number} status
 * @param {Record<string, unknown>} [details]
 */
export function sendError(res, code, message, status, details) {
  const includeDetails =
    shouldIncludeErrorDetails() && details && Object.keys(details).length > 0;
  res.status(status).json({
    success: false,
    error: {
      code,
      message,
      ...(includeDetails ? { details } : {}),
    },
    meta: { timestamp: timestamp() },
  });
}

/**
 * @param {import('express').Response} res
 * @param {import('zod').ZodError} zodError
 */
export function sendValidationError(res, zodError) {
  sendError(res, 'VALIDATION_ERROR', 'Invalid request data', 400, {
    issues: zodError.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    })),
  });
}
