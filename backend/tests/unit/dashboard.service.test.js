import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  aggregateCourseStats,
  aggregateMaterialPendingTasks,
  computeLast7DaysThresholdIso,
  sumCompletedFocusMinutes,
} from '../../src/modules/dashboard/dashboard.service.js';

describe('dashboard.service computeLast7DaysThresholdIso', () => {
  it('returns an ISO timestamp exactly 168 hours before the given instant', () => {
    const now = new Date('2026-06-17T12:00:00.000Z');
    const threshold = computeLast7DaysThresholdIso(now);

    assert.equal(threshold, '2026-06-10T12:00:00.000Z');
    assert.match(threshold, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  });
});

describe('dashboard.service sumCompletedFocusMinutes', () => {
  it('returns 0 for empty input', () => {
    assert.equal(sumCompletedFocusMinutes([]), 0);
  });

  it('sums duration_minutes from completed session rows', () => {
    assert.equal(
      sumCompletedFocusMinutes([{ duration_minutes: 18 }, { duration_minutes: 12 }]),
      30
    );
  });

  it('returns zero for empty last-seven-days session rows', () => {
    assert.equal(sumCompletedFocusMinutes([]), 0);
  });

  it('includes sessions with ended_at exactly equal to the rolling threshold', () => {
    const threshold = '2026-06-10T12:00:00.000Z';
    const sessions = [
      { duration_minutes: 10, ended_at: threshold },
      { duration_minutes: 20, ended_at: '2026-06-10T11:59:59.999Z' },
    ];
    const included = sessions.filter(
      (session) => session.ended_at != null && session.ended_at >= threshold
    );

    assert.equal(included.length, 1);
    assert.equal(sumCompletedFocusMinutes(included), 10);
  });
});

describe('dashboard.service aggregateCourseStats', () => {
  const courses = [
    { id: 'course-a', title: 'Course A' },
    { id: 'course-b', title: 'Course B' },
  ];

  it('returns zero counts for empty task and flashcard input', () => {
    assert.deepEqual(aggregateCourseStats(courses, [], []), [
      {
        courseId: 'course-a',
        courseName: 'Course A',
        totalTasks: 0,
        completedTasks: 0,
        totalFlashcards: 0,
      },
      {
        courseId: 'course-b',
        courseName: 'Course B',
        totalTasks: 0,
        completedTasks: 0,
        totalFlashcards: 0,
      },
    ]);
  });

  it('aggregates per-course task and flashcard counts', () => {
    const tasks = [
      { course_id: 'course-a', status: 'pending' },
      { course_id: 'course-a', status: 'completed' },
      { course_id: 'course-b', status: 'completed' },
    ];
    const flashcards = [
      { course_id: 'course-a' },
      { course_id: 'course-a' },
      { course_id: 'course-b' },
    ];

    assert.deepEqual(aggregateCourseStats(courses, tasks, flashcards), [
      {
        courseId: 'course-a',
        courseName: 'Course A',
        totalTasks: 2,
        completedTasks: 1,
        totalFlashcards: 2,
      },
      {
        courseId: 'course-b',
        courseName: 'Course B',
        totalTasks: 1,
        completedTasks: 1,
        totalFlashcards: 1,
      },
    ]);
  });
});

describe('dashboard.service aggregateMaterialPendingTasks', () => {
  const courseId = '33333333-3333-4333-8333-333333333333';
  const materialA = {
    id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    title: 'Alpha Material',
    course_id: courseId,
  };
  const materialB = {
    id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    title: 'Beta Material',
    course_id: courseId,
  };
  const materialC = {
    id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
    title: 'Gamma Material',
    course_id: courseId,
  };

  it('returns zero and empty list for empty rows', () => {
    assert.deepEqual(aggregateMaterialPendingTasks([], []), {
      materialsWithPendingTasks: 0,
      topMaterialsByPendingTasks: [],
    });
  });

  it('groups multiple task rows for one material', () => {
    const result = aggregateMaterialPendingTasks(
      [
        { material_id: materialA.id, course_id: courseId },
        { material_id: materialA.id, course_id: courseId },
        { material_id: materialA.id, course_id: courseId },
      ],
      [materialA]
    );

    assert.equal(result.materialsWithPendingTasks, 1);
    assert.deepEqual(result.topMaterialsByPendingTasks, [
      {
        materialId: materialA.id,
        courseId,
        materialTitle: 'Alpha Material',
        pendingTasks: 3,
      },
    ]);
  });

  it('orders materials by pending count descending', () => {
    const result = aggregateMaterialPendingTasks(
      [
        { material_id: materialA.id, course_id: courseId },
        { material_id: materialA.id, course_id: courseId },
        { material_id: materialB.id, course_id: courseId },
        { material_id: materialB.id, course_id: courseId },
        { material_id: materialB.id, course_id: courseId },
        { material_id: materialB.id, course_id: courseId },
        { material_id: materialB.id, course_id: courseId },
      ],
      [materialA, materialB]
    );

    assert.equal(result.materialsWithPendingTasks, 2);
    assert.equal(result.topMaterialsByPendingTasks[0].materialId, materialB.id);
    assert.equal(result.topMaterialsByPendingTasks[0].pendingTasks, 5);
    assert.equal(result.topMaterialsByPendingTasks[1].materialId, materialA.id);
    assert.equal(result.topMaterialsByPendingTasks[1].pendingTasks, 2);
  });

  it('caps the top list at five materials', () => {
    const materials = Array.from({ length: 6 }, (_, index) => ({
      id: `11111111-1111-4111-8111-11111111111${index}`,
      title: `Material ${index}`,
      course_id: courseId,
    }));
    const tasks = materials.map((material) => ({
      material_id: material.id,
      course_id: courseId,
    }));

    const result = aggregateMaterialPendingTasks(tasks, materials);

    assert.equal(result.materialsWithPendingTasks, 6);
    assert.equal(result.topMaterialsByPendingTasks.length, 5);
  });

  it('breaks equal counts by title ascending', () => {
    const result = aggregateMaterialPendingTasks(
      [
        { material_id: materialB.id, course_id: courseId },
        { material_id: materialA.id, course_id: courseId },
      ],
      [materialA, materialB]
    );

    assert.equal(result.topMaterialsByPendingTasks[0].materialTitle, 'Alpha Material');
    assert.equal(result.topMaterialsByPendingTasks[1].materialTitle, 'Beta Material');
  });

  it('breaks equal counts and titles by material ID ascending', () => {
    const sharedTitle = 'Shared Title';
    const materialLower = {
      id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      title: sharedTitle,
      course_id: courseId,
    };
    const materialHigher = {
      id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      title: sharedTitle,
      course_id: courseId,
    };

    const result = aggregateMaterialPendingTasks(
      [
        { material_id: materialHigher.id, course_id: courseId },
        { material_id: materialLower.id, course_id: courseId },
      ],
      [materialLower, materialHigher]
    );

    assert.equal(result.topMaterialsByPendingTasks[0].materialId, materialLower.id);
    assert.equal(result.topMaterialsByPendingTasks[1].materialId, materialHigher.id);
  });

  it('excludes unknown material IDs', () => {
    const result = aggregateMaterialPendingTasks(
      [{ material_id: '99999999-9999-4999-8999-999999999999', course_id: courseId }],
      [materialA]
    );

    assert.deepEqual(result, {
      materialsWithPendingTasks: 0,
      topMaterialsByPendingTasks: [],
    });
  });

  it('excludes task/material course mismatches', () => {
    const otherCourseId = '22222222-2222-4222-8222-222222222222';
    const result = aggregateMaterialPendingTasks(
      [{ material_id: materialA.id, course_id: otherCourseId }],
      [materialA]
    );

    assert.deepEqual(result, {
      materialsWithPendingTasks: 0,
      topMaterialsByPendingTasks: [],
    });
  });

  it('returns only approved response fields on each item', () => {
    const result = aggregateMaterialPendingTasks(
      [{ material_id: materialC.id, course_id: courseId }],
      [materialC]
    );

    assert.deepEqual(result.topMaterialsByPendingTasks, [
      {
        materialId: materialC.id,
        courseId,
        materialTitle: 'Gamma Material',
        pendingTasks: 1,
      },
    ]);
    assert.deepEqual(Object.keys(result.topMaterialsByPendingTasks[0]).sort(), [
      'courseId',
      'materialId',
      'materialTitle',
      'pendingTasks',
    ]);
  });
});
