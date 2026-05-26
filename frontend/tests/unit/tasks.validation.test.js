import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createTaskFormSchema, updateTaskFormSchema } from '../../src/utils/validation.js';

const MATERIAL_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

describe('createTaskFormSchema', () => {
  it('accepts valid create payload', () => {
    const result = createTaskFormSchema.safeParse({
      title: 'Read chapter 1',
      estimatedMinutes: 30,
      description: 'Optional notes',
      priority: 'high',
    });
    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.data.title, 'Read chapter 1');
      assert.equal(result.data.estimatedMinutes, 30);
    }
  });

  it('rejects title shorter than 3 characters', () => {
    const result = createTaskFormSchema.safeParse({
      title: 'ab',
      estimatedMinutes: 30,
    });
    assert.equal(result.success, false);
  });

  it('rejects estimatedMinutes out of range', () => {
    const result = createTaskFormSchema.safeParse({
      title: 'Valid title',
      estimatedMinutes: 4,
    });
    assert.equal(result.success, false);
  });

  it('rejects description longer than 1000 characters', () => {
    const result = createTaskFormSchema.safeParse({
      title: 'Valid title',
      estimatedMinutes: 30,
      description: 'a'.repeat(1001),
    });
    assert.equal(result.success, false);
  });

  it('accepts valid materialId on create', () => {
    const result = createTaskFormSchema.safeParse({
      title: 'Valid title',
      estimatedMinutes: 30,
      materialId: MATERIAL_ID,
    });
    assert.equal(result.success, true);
  });

  it('rejects invalid materialId on create', () => {
    const result = createTaskFormSchema.safeParse({
      title: 'Valid title',
      estimatedMinutes: 30,
      materialId: 'not-a-uuid',
    });
    assert.equal(result.success, false);
  });

  it('rejects unknown keys', () => {
    const result = createTaskFormSchema.safeParse({
      title: 'Valid title',
      estimatedMinutes: 30,
      userId: '00000000-0000-0000-0000-000000000000',
    });
    assert.equal(result.success, false);
  });

  it('coerces estimatedMinutes from string input', () => {
    const result = createTaskFormSchema.safeParse({
      title: 'Valid title',
      estimatedMinutes: '45',
    });
    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.data.estimatedMinutes, 45);
    }
  });
});

describe('updateTaskFormSchema', () => {
  it('accepts valid update payload', () => {
    const result = updateTaskFormSchema.safeParse({
      title: 'Updated task title',
      estimatedMinutes: 60,
      description: 'Updated notes',
      priority: 'low',
    });
    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.data.title, 'Updated task title');
      assert.equal(result.data.estimatedMinutes, 60);
    }
  });

  it('rejects status in PATCH payload', () => {
    const result = updateTaskFormSchema.safeParse({
      title: 'Valid title',
      estimatedMinutes: 30,
      status: 'completed',
    });
    assert.equal(result.success, false);
  });

  it('accepts materialId UUID on PATCH payload', () => {
    const result = updateTaskFormSchema.safeParse({
      title: 'Valid title',
      estimatedMinutes: 30,
      materialId: MATERIAL_ID,
    });
    assert.equal(result.success, true);
  });

  it('accepts materialId:null on PATCH payload', () => {
    const result = updateTaskFormSchema.safeParse({
      title: 'Valid title',
      estimatedMinutes: 30,
      materialId: null,
    });
    assert.equal(result.success, true);
  });

  it('rejects invalid materialId in PATCH payload', () => {
    const result = updateTaskFormSchema.safeParse({
      title: 'Valid title',
      estimatedMinutes: 30,
      materialId: 'not-a-uuid',
    });
    assert.equal(result.success, false);
  });
});
