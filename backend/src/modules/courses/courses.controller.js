import {
  createCourseBodySchema,
  updateCourseBodySchema,
  courseIdParamSchema,
} from '../../shared/validation/schemas.js';
import { sendSuccess, sendValidationError } from '../../shared/utils/response.js';
import {
  listCourses,
  createCourse,
  getCourseById,
  updateCourse,
  deleteCourse,
} from './courses.service.js';

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function list(req, res, next) {
  try {
    const courses = await listCourses(req.user.id);
    sendSuccess(res, { courses });
  } catch (err) {
    next(err);
  }
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function create(req, res, next) {
  const parsed = createCourseBodySchema.safeParse(req.body);
  if (!parsed.success) {
    sendValidationError(res, parsed.error);
    return;
  }

  try {
    const course = await createCourse(req.user.id, parsed.data.title);
    sendSuccess(res, { course }, 201);
  } catch (err) {
    next(err);
  }
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function getById(req, res, next) {
  const parsed = courseIdParamSchema.safeParse(req.params);
  if (!parsed.success) {
    sendValidationError(res, parsed.error);
    return;
  }

  try {
    const result = await getCourseById(req.user.id, parsed.data.id);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function update(req, res, next) {
  const paramsParsed = courseIdParamSchema.safeParse(req.params);
  if (!paramsParsed.success) {
    sendValidationError(res, paramsParsed.error);
    return;
  }

  const bodyParsed = updateCourseBodySchema.safeParse(req.body);
  if (!bodyParsed.success) {
    sendValidationError(res, bodyParsed.error);
    return;
  }

  try {
    const course = await updateCourse(
      req.user.id,
      paramsParsed.data.id,
      bodyParsed.data.title
    );
    sendSuccess(res, { course });
  } catch (err) {
    next(err);
  }
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function remove(req, res, next) {
  const parsed = courseIdParamSchema.safeParse(req.params);
  if (!parsed.success) {
    sendValidationError(res, parsed.error);
    return;
  }

  try {
    const result = await deleteCourse(req.user.id, parsed.data.id);
    sendSuccess(res, { deleted: result.deleted });
  } catch (err) {
    next(err);
  }
}
