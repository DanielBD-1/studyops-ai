import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { applyTestEnv } from '../helpers/testEnv.js';
import { setSupabaseAdminClientForTests } from '../../src/config/supabase.js';
import {
  createStudyMaterialsMockSupabaseClient,
  setStudyMaterialsMockOverrides,
  resetStudyMaterialsMockOverrides,
  TEST_USER_ID,
  OWN_COURSE_ID,
  OWN_MATERIAL_ID,
  OTHER_USER_MATERIAL_ID,
  VALID_STUDY_CONTENT,
} from '../helpers/mockSupabaseStudyMaterials.js';
import { ApiError } from '../../src/shared/errors/ApiError.js';
import {
  mapMaterialSummary,
  mapMaterialDetail,
  materialCheckValidationMessageFromError,
  assertCourseOwned,
  getOwnedMaterialOrThrow,
  listMaterials,
  createMaterial,
  getMaterialById,
  updateMaterial,
  deleteMaterial,
  generateFromMaterial,
} from '../../src/modules/study-materials/study-materials.service.js';
import { getSupabaseAdmin } from '../../src/config/supabase.js';

applyTestEnv();
setSupabaseAdminClientForTests(createStudyMaterialsMockSupabaseClient());

describe('study-materials.service check constraint messages', () => {
  it('maps study_materials_title_length to title message', () => {
    const message = materialCheckValidationMessageFromError({
      message: 'violates check constraint "study_materials_title_length"',
    });
    assert.equal(message, 'Material title must be between 3 and 150 characters');
  });

  it('maps study_materials_content_length to content message', () => {
    const message = materialCheckValidationMessageFromError({
      details: 'Failing row contains study_materials_content_length',
    });
    assert.equal(message, 'Study material must be between 100 and 50,000 characters');
  });

  it('maps study_materials_source_type_allowed to source type message', () => {
    const message = materialCheckValidationMessageFromError({
      message: 'study_materials_source_type_allowed',
    });
    assert.equal(message, 'Source type must be manual or paste');
  });

  it('returns neutral message when constraint is unknown', () => {
    const message = materialCheckValidationMessageFromError({
      message: 'check constraint violated',
    });
    assert.equal(message, 'Invalid study material data');
  });
});

describe('study-materials.service mappers', () => {
  it('mapMaterialSummary omits content and snake_case fields', () => {
    const mapped = mapMaterialSummary({
      id: OWN_MATERIAL_ID,
      course_id: OWN_COURSE_ID,
      title: 'Chapter',
      source_type: 'manual',
      created_at: '2026-01-05T00:00:00.000Z',
      updated_at: '2026-01-05T00:00:00.000Z',
      content: VALID_STUDY_CONTENT,
    });

    assert.deepEqual(mapped, {
      id: OWN_MATERIAL_ID,
      courseId: OWN_COURSE_ID,
      title: 'Chapter',
      sourceType: 'manual',
      createdAt: '2026-01-05T00:00:00.000Z',
      updatedAt: '2026-01-05T00:00:00.000Z',
    });
    assert.equal('content' in mapped, false);
    assert.equal('course_id' in mapped, false);
  });

  it('mapMaterialDetail includes content in camelCase', () => {
    const mapped = mapMaterialDetail({
      id: OWN_MATERIAL_ID,
      course_id: OWN_COURSE_ID,
      title: 'Chapter',
      content: VALID_STUDY_CONTENT,
      source_type: 'paste',
      created_at: '2026-01-05T00:00:00.000Z',
      updated_at: '2026-01-05T00:00:00.000Z',
    });

    assert.equal(mapped.content, VALID_STUDY_CONTENT);
    assert.equal(mapped.sourceType, 'paste');
    assert.equal('source_type' in mapped, false);
  });
});

describe('study-materials.service ownership', () => {
  it('getOwnedMaterialOrThrow returns owned material with courses inner filter', async () => {
    const row = await getOwnedMaterialOrThrow(TEST_USER_ID, OWN_MATERIAL_ID);
    assert.equal(row.id, OWN_MATERIAL_ID);
    assert.equal(row.course_id, OWN_COURSE_ID);
    assert.equal('courses' in row, false);
  });

  it('getOwnedMaterialOrThrow throws 404 for another users material', async () => {
    await assert.rejects(
      () => getOwnedMaterialOrThrow(TEST_USER_ID, OTHER_USER_MATERIAL_ID),
      (err) => {
        assert.ok(err instanceof ApiError);
        assert.equal(err.status, 404);
        assert.equal(err.message, 'Study material not found');
        return true;
      }
    );
  });

  it('unfiltered study_materials select by id alone returns not found in mock', async () => {
    const { data, error } = await getSupabaseAdmin()
      .from('study_materials')
      .select('id, course_id, title, content, source_type, created_at, updated_at')
      .eq('id', OWN_MATERIAL_ID)
      .single();

    assert.equal(data, null);
    assert.equal(error?.code, 'PGRST116');
  });

  it('listMaterials returns summaries without content', async () => {
    const materials = await listMaterials(TEST_USER_ID, OWN_COURSE_ID);
    assert.equal(materials.length, 1);
    assert.equal(materials[0].id, OWN_MATERIAL_ID);
    assert.equal('content' in materials[0], false);
  });

  it('getMaterialById includes content for owned material', async () => {
    const material = await getMaterialById(TEST_USER_ID, OWN_MATERIAL_ID);
    assert.equal(material.content, VALID_STUDY_CONTENT);
  });

  it('createMaterial defaults sourceType to manual', async () => {
    const material = await createMaterial(TEST_USER_ID, OWN_COURSE_ID, {
      title: 'New material title',
      content: VALID_STUDY_CONTENT,
    });
    assert.equal(material.sourceType, 'manual');
    assert.equal(material.courseId, OWN_COURSE_ID);
    assert.equal(material.content, VALID_STUDY_CONTENT);
  });

  it('updateMaterial uses owned course_id guard', async () => {
    const material = await updateMaterial(TEST_USER_ID, OWN_MATERIAL_ID, {
      title: 'Updated material title',
    });
    assert.equal(material.title, 'Updated material title');
  });

  it('createMaterial maps title CHECK 23514 to title validation message', async () => {
    setStudyMaterialsMockOverrides({
      materialInsertError: {
        code: '23514',
        message: 'violates check constraint "study_materials_title_length"',
      },
    });
    try {
      await assert.rejects(
        () =>
          createMaterial(TEST_USER_ID, OWN_COURSE_ID, {
            title: 'Bad',
            content: VALID_STUDY_CONTENT,
          }),
        (err) => {
          assert.ok(err instanceof ApiError);
          assert.equal(err.status, 400);
          assert.equal(err.code, 'VALIDATION_ERROR');
          assert.equal(err.message, 'Material title must be between 3 and 150 characters');
          return true;
        }
      );
    } finally {
      resetStudyMaterialsMockOverrides();
    }
  });

  it('assertCourseOwned throws 404 when data is null without error', async () => {
    setStudyMaterialsMockOverrides({ courseOwnedSelectNullSuccess: true });
    try {
      await assert.rejects(
        () => assertCourseOwned(TEST_USER_ID, OWN_COURSE_ID),
        (err) => {
          assert.ok(err instanceof ApiError);
          assert.equal(err.status, 404);
          assert.equal(err.message, 'Course not found');
          return true;
        }
      );
    } finally {
      resetStudyMaterialsMockOverrides();
    }
  });

  it('getOwnedMaterialOrThrow throws 404 when data is null without error', async () => {
    setStudyMaterialsMockOverrides({ materialOwnedSelectNullSuccess: true });
    try {
      await assert.rejects(
        () => getOwnedMaterialOrThrow(TEST_USER_ID, OWN_MATERIAL_ID),
        (err) => {
          assert.ok(err instanceof ApiError);
          assert.equal(err.status, 404);
          assert.equal(err.message, 'Study material not found');
          return true;
        }
      );
    } finally {
      resetStudyMaterialsMockOverrides();
    }
  });

  it('createMaterial throws 404 when insert returns null data without error', async () => {
    setStudyMaterialsMockOverrides({ materialInsertNullSuccess: true });
    try {
      await assert.rejects(
        () =>
          createMaterial(TEST_USER_ID, OWN_COURSE_ID, {
            title: 'New material title',
            content: VALID_STUDY_CONTENT,
          }),
        (err) => {
          assert.ok(err instanceof ApiError);
          assert.equal(err.status, 404);
          assert.equal(err.message, 'Study material not found');
          return true;
        }
      );
    } finally {
      resetStudyMaterialsMockOverrides();
    }
  });

  it('updateMaterial throws 404 when update returns null data without error', async () => {
    setStudyMaterialsMockOverrides({ materialUpdateNullSuccess: true });
    try {
      await assert.rejects(
        () =>
          updateMaterial(TEST_USER_ID, OWN_MATERIAL_ID, {
            title: 'Updated again title',
          }),
        (err) => {
          assert.ok(err instanceof ApiError);
          assert.equal(err.status, 404);
          assert.equal(err.message, 'Study material not found');
          return true;
        }
      );
    } finally {
      resetStudyMaterialsMockOverrides();
    }
  });

  it('deleteMaterial throws 404 when delete returns null data without error', async () => {
    setStudyMaterialsMockOverrides({ materialDeleteNullSuccess: true });
    try {
      await assert.rejects(
        () => deleteMaterial(TEST_USER_ID, OWN_MATERIAL_ID),
        (err) => {
          assert.ok(err instanceof ApiError);
          assert.equal(err.status, 404);
          assert.equal(err.message, 'Study material not found');
          return true;
        }
      );
    } finally {
      resetStudyMaterialsMockOverrides();
    }
  });

  it('generateFromMaterial returns ephemeral plan without persisting', async () => {
    const { MOCK_GEMINI_PLAN } = await import('../helpers/mockDocumentService.js');
    const result = await generateFromMaterial(TEST_USER_ID, OWN_MATERIAL_ID, {
      processStudyTextFn: async () => MOCK_GEMINI_PLAN,
    });
    assert.equal(result.materialId, OWN_MATERIAL_ID);
    assert.equal(result.courseId, OWN_COURSE_ID);
    assert.equal(result.plan.difficulty, 'medium');
  });

  it('generateFromMaterial rejects short content before document-service', async () => {
    setStudyMaterialsMockOverrides({ ownMaterialGenerateContent: 'x'.repeat(99) });
    await assert.rejects(
      () =>
        generateFromMaterial(TEST_USER_ID, OWN_MATERIAL_ID, {
          processStudyTextFn: async () => {
            throw new Error('document-service must not be called');
          },
        }),
      (err) => err instanceof ApiError && err.code === 'VALIDATION_ERROR'
    );
    resetStudyMaterialsMockOverrides();
  });

  it('deleteMaterial removes owned material', async () => {
    const created = await createMaterial(TEST_USER_ID, OWN_COURSE_ID, {
      title: 'Temp material title',
      content: VALID_STUDY_CONTENT,
    });
    const result = await deleteMaterial(TEST_USER_ID, created.id);
    assert.equal(result.deleted, true);

    await assert.rejects(
      () => getMaterialById(TEST_USER_ID, created.id),
      (err) => err instanceof ApiError && err.status === 404
    );
  });
});
