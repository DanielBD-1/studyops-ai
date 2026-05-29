import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const focusPageSource = readFileSync(
  join(__dirname, '../../src/pages/FocusPage.jsx'),
  'utf8'
);
const focusServiceSource = readFileSync(
  join(__dirname, '../../src/services/focus.service.js'),
  'utf8'
);

describe('focus persistence boundaries', () => {
  it('FocusPage does not use localStorage or sessionStorage', () => {
    assert.equal(focusPageSource.includes('localStorage'), false);
    assert.equal(focusPageSource.includes('sessionStorage'), false);
  });

  it('focus.service does not use localStorage or sessionStorage', () => {
    assert.equal(focusServiceSource.includes('localStorage'), false);
    assert.equal(focusServiceSource.includes('sessionStorage'), false);
  });
});
