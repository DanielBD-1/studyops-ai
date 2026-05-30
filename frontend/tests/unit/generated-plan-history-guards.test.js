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
const historySectionSource = readFileSync(
  join(__dirname, '../../src/components/materials/GeneratedPlanHistorySection.jsx'),
  'utf8'
);
const serviceSource = readFileSync(
  join(__dirname, '../../src/services/study-materials.service.js'),
  'utf8'
);

describe('generated plan history persistence guards', () => {
  it('StudyMaterialDetail and history section do not use localStorage or sessionStorage', () => {
    assert.equal(detailSource.includes('localStorage'), false);
    assert.equal(detailSource.includes('sessionStorage'), false);
    assert.equal(historySectionSource.includes('localStorage'), false);
    assert.equal(historySectionSource.includes('sessionStorage'), false);
  });

  it('history section does not auto-fetch full plan for every list item on load', () => {
    assert.doesNotMatch(historySectionSource, /useEffect[\s\S]*getGeneratedPlanById/);
    assert.doesNotMatch(historySectionSource, /plans\.map[\s\S]*getGeneratedPlanById/);
    assert.match(historySectionSource, /getGeneratedPlanById\(materialId, planId\)/);
  });

  it('activateGeneratedPlan sends strict empty JSON body', () => {
    assert.match(
      serviceSource,
      /activateGeneratedPlan[\s\S]*?body: JSON\.stringify\(\{\}\)/
    );
  });

  it('StudyMaterialDetail loads history metadata via listGeneratedPlans only', () => {
    assert.match(detailSource, /listGeneratedPlans\(materialId\)/);
    assert.doesNotMatch(detailSource, /getGeneratedPlanById/);
  });

  it('GeneratedPlanHistorySection renders neutral empty state when plans are empty', () => {
    assert.match(
      historySectionSource,
      /No saved plan versions yet\. Generate a study plan to create one\./
    );
    assert.doesNotMatch(historySectionSource, /plans\.length === 0[\s\S]*return null/);
  });

  it('history section shows clear row headings and status badges', () => {
    assert.match(historySectionSource, /Generated plan version/);
    assert.match(historySectionSource, /Saved \{savedAtLabel\}/);
    assert.match(historySectionSource, /plan-history__badge--active[\s\S]*Active/);
    assert.match(historySectionSource, /plan-history__badge--inactive[\s\S]*Previous version/);
    assert.match(historySectionSource, /plan-history__action--activate/);
  });
});
