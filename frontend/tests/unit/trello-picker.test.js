import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mapTrelloNamedOptions } from '../../src/utils/trello-picker.js';

describe('trello-picker', () => {
  it('mapTrelloNamedOptions returns id and name labels only', () => {
    const options = mapTrelloNamedOptions([
      { id: 'board-abc', name: 'Study Board' },
      { id: 'list-xyz', name: 'Backlog' },
    ]);

    assert.deepEqual(options, [
      { value: 'board-abc', label: 'Study Board' },
      { value: 'list-xyz', label: 'Backlog' },
    ]);
  });

  it('mapTrelloNamedOptions does not include credential fields', () => {
    const options = mapTrelloNamedOptions([{ id: 'b1', name: 'Board' }]);
    const serialized = JSON.stringify(options);

    assert.equal(serialized.includes('apiKey'), false);
    assert.equal(serialized.includes('token'), false);
    assert.equal(serialized.includes('listId'), false);
    assert.equal('apiKey' in options[0], false);
    assert.equal('token' in options[0], false);
  });
});
