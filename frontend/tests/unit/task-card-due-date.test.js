import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { renderTaskCardHarness } from '../helpers/render-task-card.jsx';

const __dirname = dirname(fileURLToPath(import.meta.url));
const materialRelatedSource = readFileSync(
  join(__dirname, '../../src/components/materials/MaterialRelatedTasksSection.jsx'),
  'utf8'
);

const BASE_TASK = {
  id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  courseId: '33333333-3333-4333-8333-333333333333',
  materialId: null,
  title: 'Sample task',
  description: '',
  priority: 'medium',
  estimatedMinutes: 30,
  difficulty: 'medium',
  tags: [],
  source: 'manual',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

/** @type {Awaited<ReturnType<typeof renderTaskCardHarness>> | null} */
let view = null;

afterEach(async () => {
  if (view) {
    await view.unmount();
    view = null;
  }
});

describe('TaskCard due date rendering', () => {
  it('renders no due-date line when dueDate is null', async () => {
    view = await renderTaskCardHarness({
      task: { ...BASE_TASK, status: 'pending', dueDate: null },
    });
    assert.equal(view.getDueDateLine(), null);
  });

  it('renders future pending due date with time element', async () => {
    view = await renderTaskCardHarness({
      task: { ...BASE_TASK, status: 'pending', dueDate: '2099-12-31' },
    });
    const time = view.getDueDateTime();
    assert.ok(time);
    assert.equal(time.getAttribute('dateTime'), '2099-12-31');
    assert.match(time.textContent ?? '', /^Due /);
    assert.doesNotMatch(time.textContent ?? '', /Overdue/i);
  });

  it('renders due today label for pending task', async () => {
    const { getLocalTodayIsoCalendarDate } = await import('../../src/utils/task-due-date.js');
    const today = getLocalTodayIsoCalendarDate();
    view = await renderTaskCardHarness({
      task: { ...BASE_TASK, status: 'pending', dueDate: today },
    });
    const time = view.getDueDateTime();
    assert.ok(time);
    assert.equal(time.textContent, 'Due today');
    assert.equal(time.getAttribute('dateTime'), today);
  });

  it('renders overdue text for past pending task', async () => {
    view = await renderTaskCardHarness({
      task: { ...BASE_TASK, status: 'pending', dueDate: '2020-01-01' },
    });
    const line = view.getDueDateLine();
    assert.ok(line);
    assert.match(line.className, /task-card__due-date--overdue/);
    const time = view.getDueDateTime();
    assert.ok(time);
    assert.match(time.textContent ?? '', /^Overdue · Due /);
  });

  it('renders neutral completed due date without overdue class', async () => {
    view = await renderTaskCardHarness({
      task: { ...BASE_TASK, status: 'completed', dueDate: '2020-01-01' },
    });
    const line = view.getDueDateLine();
    assert.ok(line);
    assert.match(line.className, /task-card__due-date--completed/);
    assert.doesNotMatch(line.className, /--overdue/);
    const time = view.getDueDateTime();
    assert.ok(time);
    assert.doesNotMatch(time.textContent ?? '', /Overdue/i);
  });
});

describe('MaterialRelatedTasksSection due date display', () => {
  it('reuses shared due-date presentation utility', () => {
    assert.match(materialRelatedSource, /getTaskDueDatePresentation/);
    assert.match(materialRelatedSource, /material-related-tasks__due-date/);
    assert.match(materialRelatedSource, /<time dateTime=\{dueDatePresentation\.dateTime\}>/);
  });
});
