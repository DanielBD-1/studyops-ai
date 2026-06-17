import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  aggregateCourseStats,
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
