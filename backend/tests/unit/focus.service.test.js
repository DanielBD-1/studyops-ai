import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculateActualFocusMinutes } from '../../src/modules/focus/focus.service.js';

describe('focus.service calculateActualFocusMinutes', () => {
  const started = new Date('2026-06-01T12:00:00.000Z');

  it('uses elapsed minutes when below ceiling', () => {
    const ended = new Date('2026-06-01T12:08:00.000Z');
    assert.equal(calculateActualFocusMinutes(started, ended, 25), 8);
  });

  it('minimum is 1 minute for sub-minute elapsed', () => {
    const ended = new Date('2026-06-01T12:00:30.000Z');
    assert.equal(calculateActualFocusMinutes(started, ended, 25), 1);
  });

  it('does not exceed session ceiling', () => {
    const ended = new Date('2026-06-01T15:00:00.000Z');
    assert.equal(calculateActualFocusMinutes(started, ended, 25), 25);
  });

  it('does not exceed global maximum of 120', () => {
    const ended = new Date('2026-06-02T12:00:00.000Z');
    assert.equal(calculateActualFocusMinutes(started, ended, 120), 120);
  });

  it('caps elapsed by session ceiling before global max', () => {
    const ended = new Date('2026-06-02T12:00:00.000Z');
    assert.equal(calculateActualFocusMinutes(started, ended, 30), 30);
  });
});
