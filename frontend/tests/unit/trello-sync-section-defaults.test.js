import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '../../src');

/**
 * @param {string} relativePath
 * @returns {string}
 */
function readSource(relativePath) {
  return readFileSync(join(root, relativePath), 'utf8');
}

describe('trello sync section defaults behavior', () => {
  it('TrelloSyncSection uses saved defaults helpers and save service in connected mode', () => {
    const source = readSource('components/trello/TrelloSyncSection.jsx');

    assert.match(source, /resolveSavedBoardPreselect/);
    assert.match(source, /resolveSavedListPreselect/);
    assert.match(source, /saveTrelloConnectionDefaults/);
    assert.match(source, /defaultBoardId/);
    assert.match(source, /defaultListId/);
    assert.equal(source.includes('localStorage'), false);
    assert.equal(source.includes('sessionStorage'), false);
  });

  it('TrelloSyncSection only saves defaults when connected', () => {
    const source = readSource('components/trello/TrelloSyncSection.jsx');

    assert.match(source, /if \(!isConnectedMode \|\| !boardId \|\| !listId\)/);
    assert.match(source, /if \(!isConnectedMode \|\| !listId \|\| !selectedBoardId\)/);
  });

  it('TrelloSyncSection connected sync still omits apiKey and token', () => {
    const source = readSource('components/trello/TrelloSyncSection.jsx');

    assert.match(source, /fetchTrelloBoards\(\)/);
    assert.match(source, /fetchTrelloBoardLists\(\{\s*boardId\s*\}\)/);
    assert.match(source, /syncTasksToTrello\(\{\s*listId:/);
  });
});
