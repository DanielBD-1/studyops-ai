import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createTaskFormSchema, updateTaskFormSchema } from '../../src/utils/validation.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const courseTasksSource = readFileSync(
  join(__dirname, '../../src/components/tasks/CourseTasksSection.jsx'),
  'utf8'
);
const globalTasksSource = readFileSync(
  join(__dirname, '../../src/components/tasks/GlobalTasksSection.jsx'),
  'utf8'
);

function buildCreateBody(parsed) {
  /** @type {Record<string, unknown>} */
  const body = {
    title: parsed.data.title,
    estimatedMinutes: parsed.data.estimatedMinutes,
  };
  if (parsed.data.description !== undefined) {
    body.description = parsed.data.description;
  }
  if (parsed.data.priority !== undefined) {
    body.priority = parsed.data.priority;
  }
  if (parsed.data.materialId !== undefined) {
    body.materialId = parsed.data.materialId;
  }
  if (parsed.data.dueDate) {
    body.dueDate = parsed.data.dueDate;
  }
  return body;
}

function buildUpdateBody(parsed, editPriority) {
  return {
    title: parsed.data.title,
    estimatedMinutes: parsed.data.estimatedMinutes,
    description: parsed.data.description?.trim() ?? '',
    priority: parsed.data.priority ?? editPriority,
    materialId: parsed.data.materialId ?? null,
    dueDate: parsed.data.dueDate ? parsed.data.dueDate : null,
  };
}

describe('task form due date body building', () => {
  it('sends valid create dueDate and omits empty create field', () => {
    const empty = createTaskFormSchema.safeParse({
      title: 'Valid title',
      estimatedMinutes: 30,
      dueDate: '',
    });
    assert.equal(empty.success, true);
    if (empty.success) {
      const body = buildCreateBody(empty);
      assert.equal('dueDate' in body, false);
    }

    const withDate = createTaskFormSchema.safeParse({
      title: 'Valid title',
      estimatedMinutes: 30,
      dueDate: '2026-06-24',
    });
    assert.equal(withDate.success, true);
    if (withDate.success) {
      const body = buildCreateBody(withDate);
      assert.equal(body.dueDate, '2026-06-24');
    }
  });

  it('rejects invalid create dueDate before service call', () => {
    const result = createTaskFormSchema.safeParse({
      title: 'Valid title',
      estimatedMinutes: 30,
      dueDate: '2026-02-30',
    });
    assert.equal(result.success, false);
  });

  it('sends dueDate null when edit field is cleared', () => {
    const result = updateTaskFormSchema.safeParse({
      title: 'Valid title',
      estimatedMinutes: 30,
      dueDate: '',
    });
    assert.equal(result.success, true);
    if (result.success) {
      const body = buildUpdateBody(result, 'medium');
      assert.equal(body.dueDate, null);
    }
  });

  it('sends valid update dueDate', () => {
    const result = updateTaskFormSchema.safeParse({
      title: 'Valid title',
      estimatedMinutes: 30,
      dueDate: '2026-08-10',
    });
    assert.equal(result.success, true);
    if (result.success) {
      const body = buildUpdateBody(result, 'medium');
      assert.equal(body.dueDate, '2026-08-10');
    }
  });
});

describe('course and global task forms due date UX', () => {
  it('initializes edit due date from task.dueDate ?? empty string in both forms', () => {
    assert.match(courseTasksSource, /setEditDueDate\(task\.dueDate \?\? ''\)/);
    assert.match(globalTasksSource, /setEditDueDate\(task\.dueDate \?\? ''\)/);
  });

  it('uses Due date (optional) date inputs near priority fields', () => {
    assert.match(courseTasksSource, /label="Due date \(optional\)"/);
    assert.match(globalTasksSource, /label="Due date \(optional\)"/);
    assert.match(courseTasksSource, /type="date"/);
    assert.match(globalTasksSource, /type="date"/);
  });

  it('resets create due date state on cancel and successful create', () => {
    assert.match(courseTasksSource, /setCreateDueDate\(''\)/);
    assert.match(globalTasksSource, /setCreateDueDate\(''\)/);
  });
});
