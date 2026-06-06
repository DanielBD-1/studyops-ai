import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const taskCardSource = readFileSync(
  join(__dirname, '../../src/components/tasks/TaskCard.jsx'),
  'utf8'
);

describe('TaskCard material link', () => {
  it('renders material link to /study-materials/:materialId when materialId exists', () => {
    assert.match(taskCardSource, /task\.materialId\s*\?/);
    assert.match(taskCardSource, /to=\{`\/study-materials\/\$\{task\.materialId\}`\}/);
  });

  it('uses source-card__link class on material link', () => {
    assert.match(
      taskCardSource,
      /Material:\{' '\}[\s\S]*?<Link[\s\S]*?className="source-card__link"[\s\S]*?to=\{`\/study-materials\/\$\{task\.materialId\}`\}/
    );
  });

  it('uses materialLabel with View study material fallback', () => {
    assert.match(taskCardSource, /\{materialLabel \?\? 'View study material'\}/);
  });

  it('does not use unavailable as linked-material fallback text', () => {
    assert.doesNotMatch(taskCardSource, /materialLabel \?\? 'unavailable'/);
  });

  it('gates material line on task.materialId', () => {
    assert.match(taskCardSource, /\{task\.materialId \? \(/);
    assert.match(taskCardSource, /\) : null\}/);
  });

  it('keeps course link to /courses/:courseId unchanged', () => {
    assert.match(
      taskCardSource,
      /<Link className="source-card__link" to=\{`\/courses\/\$\{courseLabel\.courseId\}`\}>/
    );
    assert.match(taskCardSource, /\{courseLabel\.title\}/);
  });
});
