import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  filterTasksByMaterial,
  resetMaterialFilterForCourseChange,
} from '../../src/utils/task-filters.js';

const MATERIAL_A = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const MATERIAL_B = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const UNKNOWN_MATERIAL = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';

const materials = [
  { id: MATERIAL_A, title: 'Chapter 1' },
  { id: MATERIAL_B, title: 'Chapter 2' },
];

const tasks = [
  { id: '1', materialId: MATERIAL_A },
  { id: '2', materialId: MATERIAL_B },
  { id: '3', materialId: null },
  { id: '4' },
];

describe('filterTasksByMaterial', () => {
  it('returns all tasks when material filter is all', () => {
    assert.deepEqual(filterTasksByMaterial(tasks, 'all', materials), tasks);
  });

  it('returns tasks linked to the selected material', () => {
    assert.deepEqual(filterTasksByMaterial(tasks, MATERIAL_A, materials), [
      { id: '1', materialId: MATERIAL_A },
    ]);
  });

  it('excludes unlinked tasks when a specific material is selected', () => {
    const filtered = filterTasksByMaterial(tasks, MATERIAL_B, materials);
    assert.equal(filtered.length, 1);
    assert.equal(filtered[0].id, '2');
  });

  it('returns the unchanged list for an unknown material id', () => {
    assert.deepEqual(filterTasksByMaterial(tasks, UNKNOWN_MATERIAL, materials), tasks);
  });

  it('returns the unchanged list when materials list is empty', () => {
    assert.deepEqual(filterTasksByMaterial(tasks, MATERIAL_A, []), tasks);
  });

  it('returns an empty array when tasks is empty', () => {
    assert.deepEqual(filterTasksByMaterial([], MATERIAL_A, materials), []);
  });

  it('returns an empty array when tasks is empty and filter is all', () => {
    assert.deepEqual(filterTasksByMaterial([], 'all', materials), []);
  });
});

describe('resetMaterialFilterForCourseChange', () => {
  it('returns all', () => {
    assert.equal(resetMaterialFilterForCourseChange(), 'all');
  });
});
