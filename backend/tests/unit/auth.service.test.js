import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mapSession, mapUser } from '../../src/modules/auth/auth.service.js';

describe('auth.service mappers', () => {
  it('mapSession returns token fields when session exists', () => {
    const mapped = mapSession({
      access_token: 'access',
      refresh_token: 'refresh',
      expires_in: 3600,
      token_type: 'bearer',
    });
    assert.deepEqual(mapped, {
      access_token: 'access',
      refresh_token: 'refresh',
      expires_in: 3600,
      token_type: 'bearer',
    });
  });

  it('mapSession returns null when session is null', () => {
    assert.equal(mapSession(null), null);
  });

  it('mapUser maps profile fields', () => {
    assert.deepEqual(
      mapUser({ id: 'uuid', email: 'a@b.com', role: 'student' }),
      { id: 'uuid', email: 'a@b.com', role: 'student' }
    );
  });
});
