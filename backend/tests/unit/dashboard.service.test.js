import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  aggregateCourseStats,
  sumCompletedFocusMinutes,
} from '../../src/modules/dashboard/dashboard.service.js';

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
