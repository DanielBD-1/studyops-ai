import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { applyTestEnv } from '../helpers/testEnv.js';
import { setSupabaseAdminClientForTests } from '../../src/config/supabase.js';
import {
  createFlashcardsMockSupabaseClient,
  TEST_USER_ID,
  OWN_COURSE_ID,
  OTHER_USER_COURSE_ID,
  OWN_MATERIAL_ID,
  OWN_FLASHCARD_ID,
  OTHER_USER_FLASHCARD_ID,
  OTHER_USER_MATERIAL_ID,
  getMockFlashcards,
} from '../helpers/mockSupabaseFlashcards.js';
import { ApiError } from '../../src/shared/errors/ApiError.js';
import {
  mapFlashcard,
  listFlashcards,
  createFlashcard,
  updateFlashcard,
  deleteFlashcard,
  getOwnedFlashcardOrThrow,
} from '../../src/modules/flashcards/flashcards.service.js';

applyTestEnv();
setSupabaseAdminClientForTests(createFlashcardsMockSupabaseClient());

describe('flashcards.service', () => {
  beforeEach(() => {
    // nothing to reset yet; mock client holds state for simple checks
  });

  it('mapFlashcard omits userId and maps fields', () => {
    const [row] = getMockFlashcards();
    const mapped = mapFlashcard(row);
    assert.equal('userId' in mapped, false);
    assert.equal('user_id' in mapped, false);
    assert.equal(mapped.courseId, row.course_id);
    assert.equal(mapped.materialId, row.material_id);
    assert.equal(mapped.question, row.question);
    assert.equal(mapped.answer, row.answer);
  });

  it('listFlashcards returns only own flashcards', async () => {
    const all = await listFlashcards(TEST_USER_ID, {});
    assert.ok(all.length >= 1);
    for (const card of all) {
      assert.equal('userId' in card, false);
      assert.equal(card.courseId, OWN_COURSE_ID);
    }
  });

  it('listFlashcards with owned courseId filters results', async () => {
    const cards = await listFlashcards(TEST_USER_ID, { courseId: OWN_COURSE_ID });
    assert.ok(cards.length >= 1);
    for (const card of cards) {
      assert.equal(card.courseId, OWN_COURSE_ID);
    }
  });

  it('listFlashcards with wrong-owner courseId returns 404', async () => {
    await assert.rejects(
      () => listFlashcards(TEST_USER_ID, { courseId: OTHER_USER_COURSE_ID }),
      (err) => {
        assert.ok(err instanceof ApiError);
        assert.equal(err.status, 404);
        assert.equal(err.message, 'Course not found');
        return true;
      },
    );
  });

  it('listFlashcards with owned materialId filters results', async () => {
    const cards = await listFlashcards(TEST_USER_ID, { materialId: OWN_MATERIAL_ID });
    assert.ok(cards.length >= 1);
    for (const card of cards) {
      assert.equal(card.materialId, OWN_MATERIAL_ID);
    }
  });

  it('listFlashcards with wrong-owner materialId returns 404', async () => {
    await assert.rejects(
      () => listFlashcards(TEST_USER_ID, { materialId: OTHER_USER_MATERIAL_ID }),
      (err) => {
        assert.ok(err instanceof ApiError);
        assert.equal(err.status, 404);
        assert.equal(err.message, 'Study material not found');
        return true;
      },
    );
  });

  it('listFlashcards with courseId and cross-course materialId returns 404', async () => {
    await assert.rejects(
      () =>
        listFlashcards(TEST_USER_ID, {
          courseId: OWN_COURSE_ID,
          materialId: OTHER_USER_MATERIAL_ID,
        }),
      (err) => {
        assert.ok(err instanceof ApiError);
        assert.equal(err.status, 404);
        assert.equal(err.message, 'Study material not found');
        return true;
      },
    );
  });

  it('createFlashcard sets defaults and user_id via service', async () => {
    const created = await createFlashcard(TEST_USER_ID, OWN_COURSE_ID, {
      question: 'What is X in flashcards?',
      answer: 'X is a concept.',
      tags: ['tag1'],
    });
    assert.equal(created.courseId, OWN_COURSE_ID);
    assert.deepEqual(created.tags, ['tag1']);
    assert.equal(created.source, 'manual');
    assert.equal('userId' in created, false);
  });

  it('createFlashcard with cross-course material returns 404', async () => {
    await assert.rejects(
      () =>
        createFlashcard(TEST_USER_ID, OWN_COURSE_ID, {
          question: 'Bad material link?',
          answer: 'Bad link answer.',
          tags: [],
          materialId: OTHER_USER_MATERIAL_ID,
        }),
      (err) => {
        assert.ok(err instanceof ApiError);
        assert.equal(err.status, 404);
        assert.equal(err.message, 'Study material not found');
        return true;
      },
    );
  });

  it('getOwnedFlashcardOrThrow returns 404 for another users flashcard', async () => {
    await assert.rejects(
      () => getOwnedFlashcardOrThrow(TEST_USER_ID, OTHER_USER_FLASHCARD_ID),
      (err) => {
        assert.ok(err instanceof ApiError);
        assert.equal(err.status, 404);
        assert.equal(err.message, 'Flashcard not found');
        return true;
      },
    );
  });

  it('updateFlashcard allows clearing materialId with null', async () => {
    const updated = await updateFlashcard(TEST_USER_ID, OWN_FLASHCARD_ID, { materialId: null });
    assert.equal(updated.materialId, null);
  });

  it('deleteFlashcard returns deleted true for owned card', async () => {
    const result = await deleteFlashcard(TEST_USER_ID, OWN_FLASHCARD_ID);
    assert.deepEqual(result, { deleted: true });
  });

  it('deleteFlashcard returns 404 for another users flashcard', async () => {
    await assert.rejects(
      () => deleteFlashcard(TEST_USER_ID, OTHER_USER_FLASHCARD_ID),
      (err) => {
        assert.ok(err instanceof ApiError);
        assert.equal(err.status, 404);
        assert.equal(err.message, 'Flashcard not found');
        return true;
      },
    );
  });
});

