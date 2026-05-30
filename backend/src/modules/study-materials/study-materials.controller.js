import {
  createStudyMaterialBodySchema,
  updateStudyMaterialBodySchema,
  courseIdParamSchema,
  materialIdParamSchema,
  generateStudyMaterialBodySchema,
} from '../../shared/validation/schemas.js';
import {
  importPlanTasksBodySchema,
  importPlanFlashcardsBodySchema,
} from '../../shared/validation/plan-import.schema.js';
import { sendSuccess, sendValidationError } from '../../shared/utils/response.js';
import {
  listMaterials,
  createMaterial,
  getMaterialById,
  updateMaterial,
  deleteMaterial,
  generateFromMaterial,
  getGeneratedPlanByMaterial,
  deleteGeneratedPlanByMaterial,
} from './study-materials.service.js';
import {
  importPlanTasksForMaterial,
  importPlanFlashcardsForMaterial,
} from './plan-import.service.js';

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function listByCourse(req, res, next) {
  const parsed = courseIdParamSchema.safeParse(req.params);
  if (!parsed.success) {
    sendValidationError(res, parsed.error);
    return;
  }

  try {
    const materials = await listMaterials(req.user.id, parsed.data.id);
    sendSuccess(res, { materials });
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

  const bodyParsed = createStudyMaterialBodySchema.safeParse(req.body);
  if (!bodyParsed.success) {
    sendValidationError(res, bodyParsed.error);
    return;
  }

  try {
    const material = await createMaterial(req.user.id, paramsParsed.data.id, bodyParsed.data);
    sendSuccess(res, { material }, 201);
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
  const parsed = materialIdParamSchema.safeParse(req.params);
  if (!parsed.success) {
    sendValidationError(res, parsed.error);
    return;
  }

  try {
    const material = await getMaterialById(req.user.id, parsed.data.materialId);
    sendSuccess(res, { material });
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
  const paramsParsed = materialIdParamSchema.safeParse(req.params);
  if (!paramsParsed.success) {
    sendValidationError(res, paramsParsed.error);
    return;
  }

  const bodyParsed = updateStudyMaterialBodySchema.safeParse(req.body);
  if (!bodyParsed.success) {
    sendValidationError(res, bodyParsed.error);
    return;
  }

  try {
    const material = await updateMaterial(
      req.user.id,
      paramsParsed.data.materialId,
      bodyParsed.data
    );
    sendSuccess(res, { material });
  } catch (err) {
    next(err);
  }
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function getGeneratedPlan(req, res, next) {
  const parsed = materialIdParamSchema.safeParse(req.params);
  if (!parsed.success) {
    sendValidationError(res, parsed.error);
    return;
  }

  try {
    const result = await getGeneratedPlanByMaterial(req.user.id, parsed.data.materialId);
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
export async function deleteGeneratedPlan(req, res, next) {
  const parsed = materialIdParamSchema.safeParse(req.params);
  if (!parsed.success) {
    sendValidationError(res, parsed.error);
    return;
  }

  try {
    const result = await deleteGeneratedPlanByMaterial(req.user.id, parsed.data.materialId);
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
export async function generate(req, res, next) {
  const paramsParsed = materialIdParamSchema.safeParse(req.params);
  if (!paramsParsed.success) {
    sendValidationError(res, paramsParsed.error);
    return;
  }

  const bodyParsed = generateStudyMaterialBodySchema.safeParse(req.body ?? {});
  if (!bodyParsed.success) {
    sendValidationError(res, bodyParsed.error);
    return;
  }

  try {
    const result = await generateFromMaterial(
      req.user.id,
      paramsParsed.data.materialId
    );
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
export async function remove(req, res, next) {
  const parsed = materialIdParamSchema.safeParse(req.params);
  if (!parsed.success) {
    sendValidationError(res, parsed.error);
    return;
  }

  try {
    await deleteMaterial(req.user.id, parsed.data.materialId);
    sendSuccess(res, { deleted: true });
  } catch (err) {
    next(err);
  }
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function importPlanTasks(req, res, next) {
  const paramsParsed = materialIdParamSchema.safeParse(req.params);
  if (!paramsParsed.success) {
    sendValidationError(res, paramsParsed.error);
    return;
  }

  const bodyParsed = importPlanTasksBodySchema.safeParse(req.body);
  if (!bodyParsed.success) {
    sendValidationError(res, bodyParsed.error);
    return;
  }

  try {
    const summary = await importPlanTasksForMaterial(
      req.user.id,
      paramsParsed.data.materialId,
      bodyParsed.data.tasks
    );
    sendSuccess(res, { summary });
  } catch (err) {
    next(err);
  }
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function importPlanFlashcards(req, res, next) {
  const paramsParsed = materialIdParamSchema.safeParse(req.params);
  if (!paramsParsed.success) {
    sendValidationError(res, paramsParsed.error);
    return;
  }

  const bodyParsed = importPlanFlashcardsBodySchema.safeParse(req.body);
  if (!bodyParsed.success) {
    sendValidationError(res, bodyParsed.error);
    return;
  }

  try {
    const summary = await importPlanFlashcardsForMaterial(
      req.user.id,
      paramsParsed.data.materialId,
      bodyParsed.data.flashcards
    );
    sendSuccess(res, { summary });
  } catch (err) {
    next(err);
  }
}
