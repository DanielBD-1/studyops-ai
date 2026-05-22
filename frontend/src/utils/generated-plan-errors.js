import { ApiRequestError } from '../services/courses.service.js';

const GENERATED_PLAN_NOT_FOUND_MESSAGE = 'Generated plan not found';
const STUDY_MATERIAL_NOT_FOUND_MESSAGE = 'Study material not found';

/**
 * @param {unknown} err
 * @returns {boolean}
 */
export function isGeneratedPlanNotFound(err) {
  return (
    err instanceof ApiRequestError &&
    err.code === 'NOT_FOUND' &&
    err.message === GENERATED_PLAN_NOT_FOUND_MESSAGE
  );
}

/**
 * @param {unknown} err
 * @returns {boolean}
 */
export function isStudyMaterialNotFound(err) {
  return (
    err instanceof ApiRequestError &&
    err.code === 'NOT_FOUND' &&
    err.message === STUDY_MATERIAL_NOT_FOUND_MESSAGE
  );
}
