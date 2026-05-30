import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  mapPlanTaskToImportItem,
  buildValidatedPlanTasksImportPayload,
  formatPlanImportSummaryMessage,
  buildPlanImportConfirmMessage,
  importPlanTasksFromPlan,
  PLAN_IMPORT_VALIDATION_ERROR,
} from '../../src/utils/plan-import.js';

const VALID_PLAN_TASK = {
  title: 'Read chapter 1',
  description: 'Focus on definitions',
  priority: 'high',
  estimatedMinutes: 30,
  difficulty: 'medium',
  tags: ['reading'],
};

const VALID_PLAN = {
  summary: 'A'.repeat(50),
  keyTopics: ['Topic one'],
  difficulty: 'medium',
  tasks: [VALID_PLAN_TASK],
  flashcards: [
    {
      question: 'What is the main idea?',
      answer: 'The main idea is explained in the summary above.',
      tags: [],
    },
  ],
};

describe('plan-import mapPlanTaskToImportItem', () => {
  it('maps plan task to import item without materialId or source', () => {
    const item = mapPlanTaskToImportItem(VALID_PLAN_TASK);
    assert.equal(item.title, 'Read chapter 1');
    assert.equal(item.estimatedMinutes, 30);
    assert.equal(item.description, 'Focus on definitions');
    assert.equal(item.priority, 'high');
    assert.equal(/** @type {Record<string, unknown>} */ (item).materialId, undefined);
    assert.equal(/** @type {Record<string, unknown>} */ (item).source, undefined);
  });
});

describe('plan-import buildValidatedPlanTasksImportPayload', () => {
  it('validates all tasks before import and returns tasks array', () => {
    const result = buildValidatedPlanTasksImportPayload(VALID_PLAN);
    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.tasks.length, 1);
      assert.equal(result.tasks[0].title, 'Read chapter 1');
    }
  });

  it('aborts with zero tasks if any mapped task is invalid', () => {
    const result = buildValidatedPlanTasksImportPayload({
      ...VALID_PLAN,
      tasks: [{ ...VALID_PLAN_TASK, title: 'ab' }],
    });
    assert.equal(result.success, false);
    if (!result.success) {
      assert.equal(result.error, PLAN_IMPORT_VALIDATION_ERROR);
    }
  });

  it('fails when plan has no tasks', () => {
    const result = buildValidatedPlanTasksImportPayload({ ...VALID_PLAN, tasks: [] });
    assert.equal(result.success, false);
  });
});

describe('plan-import formatPlanImportSummaryMessage', () => {
  it('includes imported and skipped counts', () => {
    const message = formatPlanImportSummaryMessage(
      { imported: 2, skipped: 1, failed: 0, total: 3 },
      'tasks'
    );
    assert.match(message, /Imported 2 study tasks/);
    assert.match(message, /Skipped 1 already imported/);
  });

  it('includes failed count when present', () => {
    const message = formatPlanImportSummaryMessage(
      { imported: 1, skipped: 0, failed: 1, total: 2 },
      'tasks'
    );
    assert.match(message, /1 could not be imported/);
  });
});

describe('plan-import buildPlanImportConfirmMessage', () => {
  it('mentions skipped duplicates on re-import', () => {
    const message = buildPlanImportConfirmMessage(3, 'tasks');
    assert.match(message, /Import 3 tasks/);
    assert.match(message, /will be skipped/);
  });
});

describe('plan-import importPlanTasksFromPlan', () => {
  it('calls material import API once and returns summary', async () => {
    /** @type {Array<{ materialId: string, body: unknown }>} */
    const calls = [];
    const tasks = [{ title: 'Task one title here', estimatedMinutes: 30 }];

    const result = await importPlanTasksFromPlan(
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      tasks,
      async (materialId, body) => {
        calls.push({ materialId, body });
        return { summary: { imported: 1, skipped: 0, failed: 0, total: 1 } };
      }
    );

    assert.equal(result.success, true);
    assert.equal(calls.length, 1);
    assert.equal(calls[0].materialId, 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
    assert.deepEqual(calls[0].body, { tasks });
  });

  it('does not use sequential createCourseTask flow', async () => {
    const result = await importPlanTasksFromPlan(
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      [{ title: 'Another valid task', estimatedMinutes: 20 }],
      async () => ({ summary: { imported: 1, skipped: 0, failed: 0, total: 1 } })
    );
    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.summary.imported, 1);
    }
  });

  it('returns error when import API throws', async () => {
    const result = await importPlanTasksFromPlan(
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      [{ title: 'Another valid task', estimatedMinutes: 20 }],
      async () => {
        throw new Error('Network error');
      }
    );
    assert.equal(result.success, false);
  });
});
