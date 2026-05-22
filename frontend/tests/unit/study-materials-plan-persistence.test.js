import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const detailSource = readFileSync(
  join(__dirname, '../../src/pages/StudyMaterialDetail.jsx'),
  'utf8'
);
const serviceSource = readFileSync(
  join(__dirname, '../../src/services/study-materials.service.js'),
  'utf8'
);

describe('generated plan persistence boundaries', () => {
  it('StudyMaterialDetail does not use localStorage or sessionStorage for plans', () => {
    assert.equal(detailSource.includes('localStorage'), false);
    assert.equal(detailSource.includes('sessionStorage'), false);
  });

  it('study-materials service generateMaterial sends strict empty JSON body', () => {
    assert.match(serviceSource, /generateMaterial[\s\S]*?body: JSON\.stringify\(\{\}\)/);
    assert.doesNotMatch(serviceSource, /JSON\.stringify\(\s*\{[^}]*plan/);
    assert.doesNotMatch(serviceSource, /JSON\.stringify\(\s*\{[^}]*studyText/);
  });
});
