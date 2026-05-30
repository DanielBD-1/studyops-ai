import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  formatPlanPreviewMeta,
  getPlanPreviewStats,
  getPlanSummarySnippet,
} from '../../src/utils/generated-plan-history-preview.js';

describe('generated-plan-history-preview', () => {
  it('counts tasks, flashcards, and key topics', () => {
    const stats = getPlanPreviewStats({
      summary: 'Summary text here for testing preview stats output',
      keyTopics: ['A', 'B'],
      difficulty: 'hard',
      tasks: [{ title: 'Task one', description: 'd', priority: 'low', estimatedMinutes: 10, difficulty: 'easy', tags: [] }],
      flashcards: [{ question: 'Q?', answer: 'A.', tags: [] }, { question: 'Q2?', answer: 'A2.', tags: [] }],
    });

    assert.equal(stats.keyTopicCount, 2);
    assert.equal(stats.taskCount, 1);
    assert.equal(stats.flashcardCount, 2);
    assert.equal(stats.difficulty, 'hard');
  });

  it('handles missing arrays safely', () => {
    const stats = getPlanPreviewStats({
      summary: 'Only summary',
      difficulty: 'medium',
    });

    assert.equal(stats.keyTopicCount, 0);
    assert.equal(stats.taskCount, 0);
    assert.equal(stats.flashcardCount, 0);
    assert.equal(stats.difficulty, 'medium');
  });

  it('summary snippet is safe plain text without HTML', () => {
    const plan = {
      summary: '<script>alert(1)</script> Plain summary text for preview.',
      keyTopics: [],
      difficulty: 'easy',
      tasks: [],
      flashcards: [],
    };

    const snippet = getPlanSummarySnippet(plan, 40);
    assert.equal(snippet.includes('<script>'), true);
    assert.equal(snippet.endsWith('…'), true);
    assert.match(formatPlanPreviewMeta(getPlanPreviewStats(plan)), /0 topics · 0 tasks · 0 flashcards · easy/);
  });

  it('returns empty snippet for missing summary', () => {
    assert.equal(getPlanSummarySnippet(null), '');
    assert.equal(getPlanSummarySnippet({ summary: '   ' }), '');
  });
});
