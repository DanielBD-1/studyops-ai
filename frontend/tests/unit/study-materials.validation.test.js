import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  materialTitleSchema,
  materialContentSchema,
  createStudyMaterialFormSchema,
  updateStudyMaterialFormSchema,
} from '../../src/utils/validation.js';

const VALID_CONTENT = 'a'.repeat(100);

describe('study materials validation', () => {
  it('rejects title shorter than 3 characters', () => {
    assert.equal(materialTitleSchema.safeParse('ab').success, false);
  });

  it('rejects title longer than 150 characters', () => {
    assert.equal(materialTitleSchema.safeParse('a'.repeat(151)).success, false);
  });

  it('accepts valid title between 3 and 150 characters', () => {
    const result = materialTitleSchema.safeParse('  Chapter One  ');
    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.data, 'Chapter One');
    }
  });

  it('rejects content shorter than 100 characters', () => {
    assert.equal(materialContentSchema.safeParse('short').success, false);
  });

  it('rejects content longer than 50,000 characters', () => {
    assert.equal(materialContentSchema.safeParse('a'.repeat(50001)).success, false);
  });

  it('accepts valid content between 100 and 50,000 characters', () => {
    const result = materialContentSchema.safeParse(`  ${VALID_CONTENT}  `);
    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.data, VALID_CONTENT);
    }
  });

  it('createStudyMaterialFormSchema rejects forbidden fields (strict)', () => {
    const forbidden = [
      { courseId: '550e8400-e29b-41d4-a716-446655440000' },
      { course_id: '550e8400-e29b-41d4-a716-446655440000' },
      { userId: '11111111-1111-1111-1111-111111111111' },
      { user_id: '11111111-1111-1111-1111-111111111111' },
      { input_text: VALID_CONTENT },
      { studyText: VALID_CONTENT },
      { summary: 'x'.repeat(100) },
      { key_topics: ['a'] },
      { difficulty: 'easy' },
    ];

    for (const extra of forbidden) {
      const result = createStudyMaterialFormSchema.safeParse({
        title: 'Valid title',
        content: VALID_CONTENT,
        ...extra,
      });
      assert.equal(result.success, false, JSON.stringify(extra));
    }
  });

  it('updateStudyMaterialFormSchema rejects courseId and course_id', () => {
    assert.equal(
      updateStudyMaterialFormSchema.safeParse({
        title: 'Updated title',
        courseId: '550e8400-e29b-41d4-a716-446655440000',
      }).success,
      false
    );
    assert.equal(
      updateStudyMaterialFormSchema.safeParse({
        title: 'Updated title',
        course_id: '550e8400-e29b-41d4-a716-446655440000',
      }).success,
      false
    );
  });

  it('updateStudyMaterialFormSchema requires at least one field', () => {
    assert.equal(updateStudyMaterialFormSchema.safeParse({}).success, false);
  });
});
