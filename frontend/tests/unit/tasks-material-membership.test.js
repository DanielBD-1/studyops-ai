import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const frontendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

function readFrontendSource(relativePath) {
  return readFileSync(path.join(frontendRoot, relativePath), 'utf8');
}

describe('task list material membership components', () => {
  it('GlobalTasksSection renders API tasks without client material filtering', () => {
    const source = readFrontendSource('src/components/tasks/GlobalTasksSection.jsx');
    assert.match(source, /const displayedTasks = tasks;/);
    assert.doesNotMatch(source, /filterTasksByMaterial/);
    assert.match(source, /listAllTasks\(\{ courseId, status, deadline, materialId \}\)/);
  });

  it('CourseTasksSection renders API tasks without client material filtering', () => {
    const source = readFrontendSource('src/components/tasks/CourseTasksSection.jsx');
    assert.match(source, /const displayedTasks = tasks;/);
    assert.doesNotMatch(source, /filterTasksByMaterial/);
    assert.match(source, /listCourseTasks\(courseId, \{ status, deadline, materialId \}\)/);
  });

  it('MaterialRelatedTasksSection requests backend material filter', () => {
    const source = readFrontendSource('src/components/materials/MaterialRelatedTasksSection.jsx');
    assert.match(source, /listCourseTasks\(courseId, \{ materialId \}\)/);
    assert.doesNotMatch(source, /getMaterialLinkedTasks/);
  });
});
