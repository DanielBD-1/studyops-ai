import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  getDraftContentLength,
  getDraftContentLengthStatus,
  getStudyMaterialReadiness,
  isGenerateReady,
  STUDY_MATERIAL_CONTENT_MAX,
  STUDY_MATERIAL_CONTENT_MIN,
} from '../../src/utils/study-material-readiness.js';

describe('study-material-readiness', () => {
  it('getDraftContentLength trims whitespace', () => {
    assert.equal(getDraftContentLength('  hello  '), 5);
    assert.equal(getDraftContentLength('\n\t'), 0);
  });

  it('getDraftContentLengthStatus reflects validation thresholds', () => {
    const minText = 'a'.repeat(STUDY_MATERIAL_CONTENT_MIN);
    const maxText = 'a'.repeat(STUDY_MATERIAL_CONTENT_MAX);

    assert.equal(getDraftContentLengthStatus(''), 'too_short');
    assert.equal(getDraftContentLengthStatus('a'.repeat(99)), 'too_short');
    assert.equal(getDraftContentLengthStatus(minText), 'ok');
    assert.equal(getDraftContentLengthStatus(maxText), 'ok');
    assert.equal(getDraftContentLengthStatus('a'.repeat(STUDY_MATERIAL_CONTENT_MAX + 1)), 'too_long');
  });

  it('getStudyMaterialReadiness returns no_material when saved content is missing', () => {
    const result = getStudyMaterialReadiness({
      savedContent: undefined,
      hasUnsavedChanges: false,
    });

    assert.equal(result.status, 'no_material');
    assert.equal(result.savedLength, 0);
    assert.equal(isGenerateReady(result.status), false);
  });

  it('getStudyMaterialReadiness returns save_first when there are unsaved changes', () => {
    const saved = 'a'.repeat(STUDY_MATERIAL_CONTENT_MIN);
    const result = getStudyMaterialReadiness({
      savedContent: saved,
      hasUnsavedChanges: true,
    });

    assert.equal(result.status, 'save_first');
    assert.equal(result.savedLength, STUDY_MATERIAL_CONTENT_MIN);
    assert.match(result.message, /Save changes before generating/);
    assert.equal(isGenerateReady(result.status), false);
  });

  it('getStudyMaterialReadiness returns too_short when saved content is below minimum', () => {
    const result = getStudyMaterialReadiness({
      savedContent: 'short text',
      hasUnsavedChanges: false,
    });

    assert.equal(result.status, 'too_short');
    assert.equal(result.savedLength, 'short text'.length);
    assert.match(result.message, /at least 100 characters/);
    assert.equal(isGenerateReady(result.status), false);
  });

  it('getStudyMaterialReadiness returns ready when saved content is valid and saved', () => {
    const saved = 'a'.repeat(STUDY_MATERIAL_CONTENT_MIN);
    const result = getStudyMaterialReadiness({
      savedContent: saved,
      hasUnsavedChanges: false,
    });

    assert.equal(result.status, 'ready');
    assert.equal(result.savedLength, STUDY_MATERIAL_CONTENT_MIN);
    assert.match(result.message, /Ready to generate/);
    assert.equal(isGenerateReady(result.status), true);
  });

  it('isGenerateReady is true only for ready status', () => {
    assert.equal(isGenerateReady('ready'), true);
    assert.equal(isGenerateReady('save_first'), false);
    assert.equal(isGenerateReady('too_short'), false);
    assert.equal(isGenerateReady('no_material'), false);
  });
});
