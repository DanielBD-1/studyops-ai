import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { dashboardStatsQuerySchema } from '../../src/shared/validation/dashboard.schema.js';

describe('dashboardStatsQuerySchema', () => {
  it('accepts omitted referenceDate', () => {
    const parsed = dashboardStatsQuerySchema.safeParse({});
    assert.equal(parsed.success, true);
    assert.equal(parsed.data.referenceDate, undefined);
  });

  it('accepts valid YYYY-MM-DD referenceDate', () => {
    const parsed = dashboardStatsQuerySchema.safeParse({ referenceDate: '2026-06-18' });
    assert.equal(parsed.success, true);
    assert.equal(parsed.data.referenceDate, '2026-06-18');
  });

  it('accepts past and future valid calendar dates', () => {
    assert.equal(dashboardStatsQuerySchema.safeParse({ referenceDate: '1999-01-01' }).success, true);
    assert.equal(dashboardStatsQuerySchema.safeParse({ referenceDate: '2099-12-31' }).success, true);
  });

  it('rejects empty referenceDate', () => {
    const parsed = dashboardStatsQuerySchema.safeParse({ referenceDate: '' });
    assert.equal(parsed.success, false);
  });

  it('rejects malformed referenceDate', () => {
    assert.equal(dashboardStatsQuerySchema.safeParse({ referenceDate: '2026/06/18' }).success, false);
    assert.equal(dashboardStatsQuerySchema.safeParse({ referenceDate: '20260618' }).success, false);
  });

  it('rejects impossible referenceDate', () => {
    assert.equal(dashboardStatsQuerySchema.safeParse({ referenceDate: '2026-02-30' }).success, false);
  });

  it('rejects timestamp referenceDate', () => {
    assert.equal(
      dashboardStatsQuerySchema.safeParse({ referenceDate: '2026-06-18T00:00:00.000Z' }).success,
      false
    );
  });

  it('rejects unknown query keys', () => {
    const parsed = dashboardStatsQuerySchema.safeParse({
      referenceDate: '2026-06-18',
      extra: 'nope',
    });
    assert.equal(parsed.success, false);
  });
});
