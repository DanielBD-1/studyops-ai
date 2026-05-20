import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { timestamp } from '../../src/shared/utils/response.js';

describe('response helpers', () => {
  it('timestamp returns ISO-8601 string', () => {
    const value = timestamp();
    assert.match(value, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });
});
