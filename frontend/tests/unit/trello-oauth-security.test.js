import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '../../src');

/** @type {string[]} */
const oauthSources = [
  'utils/trello-oauth-callback.js',
  'utils/trello-connect-errors.js',
  'utils/trello-oauth-exchange-guard.js',
  'utils/trello-sync-errors.js',
  'pages/TrelloConnectCallbackPage.jsx',
  'components/trello/TrelloConnectionPanel.jsx',
  'services/trello.service.js',
];

/** @type {string[]} */
const manualSyncSources = [
  'components/trello/TrelloSyncSection.jsx',
  'components/trello/TrelloSyncForm.jsx',
  'components/trello/TrelloBoardListPicker.jsx',
  'components/trello/TrelloTaskSelector.jsx',
  'components/trello/TrelloSyncResults.jsx',
];

/**
 * @param {string} relativePath
 * @returns {string}
 */
function readSource(relativePath) {
  return readFileSync(join(root, relativePath), 'utf8');
}

describe('trello oauth security boundaries', () => {
  for (const relativePath of oauthSources) {
    it(`${relativePath} does not use localStorage or sessionStorage`, () => {
      const source = readSource(relativePath);

      assert.equal(source.includes('localStorage'), false);
      assert.equal(source.includes('sessionStorage'), false);
    });
  }

  for (const relativePath of oauthSources) {
    it(`${relativePath} does not log token/state/hash/full callback URL`, () => {
      const source = readSource(relativePath);

      assert.equal(/console\.log\s*\(\s*['"`]token/.test(source), false);
      assert.equal(/console\.log\s*\(\s*['"`]state/.test(source), false);
      assert.equal(/console\.log\s*\(\s*['"`]hash/.test(source), false);
      assert.equal(source.includes('console.log(window.location'), false);
      assert.equal(source.includes('console.log(fullCallbackUrl'), false);
    });
  }

  it('TrelloConnectCallbackPage does not store token/state in React state', () => {
    const source = readSource('pages/TrelloConnectCallbackPage.jsx');

    assert.equal(/useState\s*\(\s*['"`]/.test(source), false);
    assert.equal(source.includes('setToken'), false);
    assert.equal(source.includes('setState'), false);
  });

  it('trello-oauth-exchange-guard does not persist token or state at module scope', () => {
    const source = readSource('utils/trello-oauth-exchange-guard.js');

    assert.equal(source.includes('token'), false);
    assert.equal(source.includes('state'), false);
  });

  it('TrelloConnectionPanel does not render token/state values intentionally', () => {
    const source = readSource('components/trello/TrelloConnectionPanel.jsx');

    assert.equal(source.includes('{token}'), false);
    assert.equal(source.includes('{state}'), false);
    assert.equal(source.includes('trelloMemberId'), false);
  });

  for (const relativePath of manualSyncSources) {
    it(`${relativePath} does not import oauth connect helpers`, () => {
      const source = readSource(relativePath);

      assert.equal(source.includes('fetchTrelloConnection'), false);
      assert.equal(source.includes('completeTrelloConnection'), false);
      assert.equal(source.includes('fetchTrelloAuthorizeUrl'), false);
      assert.equal(source.includes('disconnectTrello'), false);
      assert.equal(source.includes('trelloConnectFlash'), false);
    });
  }

  it('TrelloSyncSection uses connected service calls without credential args', () => {
    const source = readSource('components/trello/TrelloSyncSection.jsx');

    assert.match(source, /fetchTrelloBoards\(\)/);
    assert.match(source, /fetchTrelloBoardLists\(\{\s*boardId\s*\}\)/);
    assert.match(source, /syncTasksToTrello\(\{\s*listId:/);
    assert.equal(source.includes('localStorage'), false);
    assert.equal(source.includes('sessionStorage'), false);
  });
});
