import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  createStudyMaterialBodySchema,
  updateStudyMaterialBodySchema,
  materialIdParamSchema,
  generateStudyMaterialBodySchema,
} from '../../src/shared/validation/schemas.js';
import { VALID_STUDY_CONTENT } from '../helpers/mockSupabaseStudyMaterials.js';

describe('study materials validation schemas', () => {
  it('createStudyMaterialBodySchema accepts valid body and trims fields', () => {
    const result = createStudyMaterialBodySchema.safeParse({
      title: '  Chapter One  ',
      content: `  ${VALID_STUDY_CONTENT}  `,
      sourceType: 'paste',
    });
    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.data.title, 'Chapter One');
      assert.equal(result.data.content, VALID_STUDY_CONTENT);
      assert.equal(result.data.sourceType, 'paste');
    }
  });

  it('createStudyMaterialBodySchema rejects short content', () => {
    const result = createStudyMaterialBodySchema.safeParse({
      title: 'Valid title',
      content: 'short',
    });
    assert.equal(result.success, false);
  });

  it('createStudyMaterialBodySchema rejects forbidden fields (strict)', () => {
    const forbidden = [
      { courseId: '550e8400-e29b-41d4-a716-446655440000' },
      { course_id: '550e8400-e29b-41d4-a716-446655440000' },
      { userId: '11111111-1111-1111-1111-111111111111' },
      { user_id: '11111111-1111-1111-1111-111111111111' },
      { input_text: VALID_STUDY_CONTENT },
      { studyText: VALID_STUDY_CONTENT },
      { summary: 'x'.repeat(100) },
      { key_topics: ['a'] },
      { difficulty: 'easy' },
    ];

    for (const extra of forbidden) {
      const result = createStudyMaterialBodySchema.safeParse({
        title: 'Valid title',
        content: VALID_STUDY_CONTENT,
        ...extra,
      });
      assert.equal(result.success, false, JSON.stringify(extra));
    }
  });

  it('updateStudyMaterialBodySchema requires at least one field', () => {
    assert.equal(updateStudyMaterialBodySchema.safeParse({}).success, false);
    assert.equal(
      updateStudyMaterialBodySchema.safeParse({ title: 'New title here' }).success,
      true
    );
  });

  it('updateStudyMaterialBodySchema rejects courseId in body', () => {
    const result = updateStudyMaterialBodySchema.safeParse({
      title: 'Updated title',
      courseId: '550e8400-e29b-41d4-a716-446655440000',
    });
    assert.equal(result.success, false);
  });

  it('updateStudyMaterialBodySchema rejects course_id in body', () => {
    const result = updateStudyMaterialBodySchema.safeParse({
      title: 'Updated title',
      course_id: '550e8400-e29b-41d4-a716-446655440000',
    });
    assert.equal(result.success, false);
  });

  it('materialIdParamSchema accepts uuid', () => {
    const result = materialIdParamSchema.safeParse({
      materialId: '550e8400-e29b-41d4-a716-446655440000',
    });
    assert.equal(result.success, true);
  });

  it('materialIdParamSchema rejects invalid id', () => {
    const result = materialIdParamSchema.safeParse({ materialId: 'not-a-uuid' });
    assert.equal(result.success, false);
  });

  it('generateStudyMaterialBodySchema accepts empty object', () => {
    const result = generateStudyMaterialBodySchema.safeParse({});
    assert.equal(result.success, true);
  });

  it('generateStudyMaterialBodySchema rejects studyText in body', () => {
    const result = generateStudyMaterialBodySchema.safeParse({
      studyText: VALID_STUDY_CONTENT,
    });
    assert.equal(result.success, false);
  });

  it('generateStudyMaterialBodySchema rejects courseId in body', () => {
    const result = generateStudyMaterialBodySchema.safeParse({
      courseId: '550e8400-e29b-41d4-a716-446655440000',
    });
    assert.equal(result.success, false);
  });
});
