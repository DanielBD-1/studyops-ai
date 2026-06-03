import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  resolveSavedBoardPreselect,
  resolveSavedListPreselect,
} from '../../src/utils/trello-defaults.js';

describe('trello-defaults', () => {
  it('resolveSavedBoardPreselect selects board when available', () => {
    const result = resolveSavedBoardPreselect(
      [{ id: 'board123', name: 'Study' }],
      'board123'
    );

    assert.equal(result.boardId, 'board123');
    assert.equal(result.notice, null);
  });

  it('resolveSavedBoardPreselect returns notice when board is missing', () => {
    const result = resolveSavedBoardPreselect(
      [{ id: 'board123', name: 'Study' }],
      'missingBoard'
    );

    assert.equal(result.boardId, '');
    assert.match(result.notice, /saved board is no longer available/i);
  });

  it('resolveSavedListPreselect selects list when available', () => {
    const result = resolveSavedListPreselect(
      [{ id: 'list456', name: 'To Do' }],
      'list456'
    );

    assert.equal(result.listId, 'list456');
    assert.equal(result.notice, null);
  });

  it('resolveSavedListPreselect returns notice when list is missing', () => {
    const result = resolveSavedListPreselect(
      [{ id: 'list456', name: 'To Do' }],
      'missingList'
    );

    assert.equal(result.listId, '');
    assert.match(result.notice, /saved list is no longer on this board/i);
  });
});
