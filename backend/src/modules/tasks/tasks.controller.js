import {
  courseIdParamSchema,
} from '../../shared/validation/schemas.js';
import {
  createTaskBodySchema,
  updateTaskBodySchema,
  taskIdParamSchema,
  listTasksQuerySchema,
  listCourseTasksQuerySchema,
  completeTaskBodySchema,
} from '../../shared/validation/task.schema.js';
import { sendSuccess, sendValidationError } from '../../shared/utils/response.js';
import {
  listTasksByCourse,
  createTask,
  listTasks,
  updateTask,
  completeTask,
  deleteTask,
} from './tasks.service.js';

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function listByCourse(req, res, next) {
  const paramsParsed = courseIdParamSchema.safeParse(req.params);
  if (!paramsParsed.success) {
    sendValidationError(res, paramsParsed.error);
    return;
  }

  const queryParsed = listCourseTasksQuerySchema.safeParse(req.query);
  if (!queryParsed.success) {
    sendValidationError(res, queryParsed.error);
    return;
  }

  try {
    const tasks = await listTasksByCourse(req.user.id, paramsParsed.data.id, queryParsed.data);
    sendSuccess(res, { tasks });
  } catch (err) {
    next(err);
  }
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function createForCourse(req, res, next) {
  const paramsParsed = courseIdParamSchema.safeParse(req.params);
  if (!paramsParsed.success) {
    sendValidationError(res, paramsParsed.error);
    return;
  }

  const bodyParsed = createTaskBodySchema.safeParse(req.body);
  if (!bodyParsed.success) {
    sendValidationError(res, bodyParsed.error);
    return;
  }

  try {
    const task = await createTask(req.user.id, paramsParsed.data.id, bodyParsed.data);
    sendSuccess(res, { task }, 201);
  } catch (err) {
    next(err);
  }
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function list(req, res, next) {
  const queryParsed = listTasksQuerySchema.safeParse(req.query);
  if (!queryParsed.success) {
    sendValidationError(res, queryParsed.error);
    return;
  }

  try {
    const tasks = await listTasks(req.user.id, queryParsed.data);
    sendSuccess(res, { tasks });
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
  const paramsParsed = taskIdParamSchema.safeParse(req.params);
  if (!paramsParsed.success) {
    sendValidationError(res, paramsParsed.error);
    return;
  }

  const bodyParsed = updateTaskBodySchema.safeParse(req.body);
  if (!bodyParsed.success) {
    sendValidationError(res, bodyParsed.error);
    return;
  }

  try {
    const task = await updateTask(req.user.id, paramsParsed.data.taskId, bodyParsed.data);
    sendSuccess(res, { task });
  } catch (err) {
    next(err);
  }
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function complete(req, res, next) {
  const paramsParsed = taskIdParamSchema.safeParse(req.params);
  if (!paramsParsed.success) {
    sendValidationError(res, paramsParsed.error);
    return;
  }

  const bodyParsed = completeTaskBodySchema.safeParse(req.body ?? {});
  if (!bodyParsed.success) {
    sendValidationError(res, bodyParsed.error);
    return;
  }

  try {
    const task = await completeTask(req.user.id, paramsParsed.data.taskId);
    sendSuccess(res, { task });
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
  const paramsParsed = taskIdParamSchema.safeParse(req.params);
  if (!paramsParsed.success) {
    sendValidationError(res, paramsParsed.error);
    return;
  }

  try {
    const result = await deleteTask(req.user.id, paramsParsed.data.taskId);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}
