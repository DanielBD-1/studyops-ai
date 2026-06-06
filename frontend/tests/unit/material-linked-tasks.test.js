import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  getMaterialLinkedTasks,
  selectLinkedTaskPreview,
  summarizeLinkedTaskCounts,
} from '../../src/utils/task-filters.js';

const MATERIAL_A = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const MATERIAL_B = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

const materials = [{ id: MATERIAL_A, title: 'Chapter 1' }];

const linkedTasks = [
  { id: '1', materialId: MATERIAL_A, status: 'completed', title: 'Done task' },
  { id: '2', materialId: MATERIAL_A, status: 'pending', title: 'Open task' },
  { id: '3', materialId: MATERIAL_A, status: 'pending', title: 'Another open' },
];

describe('getMaterialLinkedTasks', () => {
  it('returns only tasks linked to the material', () => {
    const courseTasks = [
      ...linkedTasks,
      { id: '4', materialId: MATERIAL_B, status: 'pending' },
      { id: '5', materialId: null, status: 'pending' },
    ];

    assert.deepEqual(getMaterialLinkedTasks(courseTasks, MATERIAL_A, materials), linkedTasks);
  });
});

describe('summarizeLinkedTaskCounts', () => {
  it('counts pending, completed, and total', () => {
    assert.deepEqual(summarizeLinkedTaskCounts(linkedTasks), {
      total: 3,
      pending: 2,
      completed: 1,
    });
  });

  it('treats missing status as pending', () => {
    assert.deepEqual(summarizeLinkedTaskCounts([{ status: undefined }, { status: 'completed' }]), {
      total: 2,
      pending: 1,
      completed: 1,
    });
  });

  it('returns zeros for an empty list', () => {
    assert.deepEqual(summarizeLinkedTaskCounts([]), {
      total: 0,
      pending: 0,
      completed: 0,
    });
  });
});

describe('selectLinkedTaskPreview', () => {
  it('orders pending tasks before completed tasks', () => {
    const preview = selectLinkedTaskPreview(linkedTasks, 5);
    assert.deepEqual(
      preview.map((task) => task.id),
      ['2', '3', '1']
    );
  });

  it('caps the preview list at the limit', () => {
    const preview = selectLinkedTaskPreview(linkedTasks, 2);
    assert.equal(preview.length, 2);
    assert.deepEqual(
      preview.map((task) => task.id),
      ['2', '3']
    );
  });

  it('returns an empty array when limit is zero', () => {
    assert.deepEqual(selectLinkedTaskPreview(linkedTasks, 0), []);
  });

  it('returns an empty array when tasks is empty', () => {
    assert.deepEqual(selectLinkedTaskPreview([], 5), []);
  });
});
