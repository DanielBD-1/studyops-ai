export const STUDY_MATERIAL_CONTENT_MIN = 100;
export const STUDY_MATERIAL_CONTENT_MAX = 50000;

/** @typedef {'ready' | 'save_first' | 'too_short' | 'no_material'} GenerateReadinessStatus */
/** @typedef {'ok' | 'too_short' | 'too_long'} DraftContentLengthStatus */

/**
 * @param {string} text
 */
export function getDraftContentLength(text) {
  return text.trim().length;
}

/**
 * @param {string} text
 * @returns {DraftContentLengthStatus}
 */
export function getDraftContentLengthStatus(text) {
  const length = getDraftContentLength(text);
  if (length < STUDY_MATERIAL_CONTENT_MIN) return 'too_short';
  if (length > STUDY_MATERIAL_CONTENT_MAX) return 'too_long';
  return 'ok';
}

/**
 * @param {{ savedContent: string | null | undefined, hasUnsavedChanges: boolean }} params
 * @returns {{ status: GenerateReadinessStatus, savedLength: number, message: string }}
 */
export function getStudyMaterialReadiness({ savedContent, hasUnsavedChanges }) {
  if (savedContent == null) {
    return {
      status: 'no_material',
      savedLength: 0,
      message: 'Loading material…',
    };
  }

  const savedLength = savedContent.trim().length;

  if (hasUnsavedChanges) {
    return {
      status: 'save_first',
      savedLength,
      message: 'Save changes before generating — generation uses your last saved material.',
    };
  }

  if (savedLength < STUDY_MATERIAL_CONTENT_MIN) {
    return {
      status: 'too_short',
      savedLength,
      message: `Saved material must be at least ${STUDY_MATERIAL_CONTENT_MIN} characters before generating.`,
    };
  }

  return {
    status: 'ready',
    savedLength,
    message: 'Ready to generate from your saved material.',
  };
}

/**
 * @param {GenerateReadinessStatus} status
 */
export function isGenerateReady(status) {
  return status === 'ready';
}
