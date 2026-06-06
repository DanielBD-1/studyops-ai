import {
  listFlashcardsQuerySchema,
  createFlashcardBodySchema,
  updateFlashcardBodySchema,
  reviewFlashcardBodySchema,
  flashcardIdParamSchema,
} from '../../shared/validation/flashcard.schema.js';
import { courseIdParamSchema } from '../../shared/validation/schemas.js';
import { sendSuccess, sendValidationError } from '../../shared/utils/response.js';
import {
  listFlashcards,
  createFlashcard,
  updateFlashcard,
  deleteFlashcard,
  reviewFlashcard,
} from './flashcards.service.js';

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function list(req, res, next) {
  const queryParsed = listFlashcardsQuerySchema.safeParse(req.query);
  if (!queryParsed.success) {
    sendValidationError(res, queryParsed.error);
    return;
  }

  try {
    const flashcards = await listFlashcards(req.user.id, queryParsed.data);
    sendSuccess(res, { flashcards });
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

  const bodyParsed = createFlashcardBodySchema.safeParse(req.body);
  if (!bodyParsed.success) {
    sendValidationError(res, bodyParsed.error);
    return;
  }

  try {
    const flashcard = await createFlashcard(req.user.id, paramsParsed.data.id, bodyParsed.data);
    sendSuccess(res, { flashcard }, 201);
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
  const paramsParsed = flashcardIdParamSchema.safeParse(req.params);
  if (!paramsParsed.success) {
    sendValidationError(res, paramsParsed.error);
    return;
  }

  const bodyParsed = updateFlashcardBodySchema.safeParse(req.body);
  if (!bodyParsed.success) {
    sendValidationError(res, bodyParsed.error);
    return;
  }

  try {
    const flashcard = await updateFlashcard(
      req.user.id,
      paramsParsed.data.flashcardId,
      bodyParsed.data,
    );
    sendSuccess(res, { flashcard });
  } catch (err) {
    next(err);
  }
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function review(req, res, next) {
  const paramsParsed = flashcardIdParamSchema.safeParse(req.params);
  if (!paramsParsed.success) {
    sendValidationError(res, paramsParsed.error);
    return;
  }

  const bodyParsed = reviewFlashcardBodySchema.safeParse(req.body ?? {});
  if (!bodyParsed.success) {
    sendValidationError(res, bodyParsed.error);
    return;
  }

  try {
    const flashcard = await reviewFlashcard(
      req.user.id,
      paramsParsed.data.flashcardId,
      bodyParsed.data,
    );
    sendSuccess(res, { flashcard });
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
  const paramsParsed = flashcardIdParamSchema.safeParse(req.params);
  if (!paramsParsed.success) {
    sendValidationError(res, paramsParsed.error);
    return;
  }

  try {
    const result = await deleteFlashcard(req.user.id, paramsParsed.data.flashcardId);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

