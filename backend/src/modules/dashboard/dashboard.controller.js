import { getUtcTodayIsoCalendarDate } from '../../shared/validation/calendar-date.js';
import { dashboardStatsQuerySchema } from '../../shared/validation/dashboard.schema.js';
import { sendSuccess, sendValidationError } from '../../shared/utils/response.js';
import { getDashboardStats } from './dashboard.service.js';

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function getStats(req, res, next) {
  const queryParsed = dashboardStatsQuerySchema.safeParse(req.query);
  if (!queryParsed.success) {
    sendValidationError(res, queryParsed.error);
    return;
  }

  const deadlineReferenceDate =
    queryParsed.data.referenceDate ?? getUtcTodayIsoCalendarDate();

  try {
    const stats = await getDashboardStats(req.user.id, deadlineReferenceDate);
    sendSuccess(res, stats);
  } catch (err) {
    next(err);
  }
}
