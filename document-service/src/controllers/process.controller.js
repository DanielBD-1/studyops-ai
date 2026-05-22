import { ProcessRequestSchema } from '../schemas/process.request.schema.js';
import { sendSuccess, sendValidationError } from '../shared/utils/response.js';
import { generateStudyPlan } from '../services/gemini.service.js';

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function postProcess(req, res, next) {
  try {
    const parsed = ProcessRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      sendValidationError(res, parsed.error);
      return;
    }

    const generate =
      typeof req.app.locals.geminiGenerate === 'function'
        ? req.app.locals.geminiGenerate
        : generateStudyPlan;

    const data = await generate(parsed.data.studyText);
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
}
