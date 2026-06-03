import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseTrelloOAuthCallback,
  sanitizeOAuthCallbackUrl,
} from '../../src/utils/trello-oauth-callback.js';
import {
  beginOAuthExchange,
  __resetOAuthExchangeGuardForTests,
} from '../../src/utils/trello-oauth-exchange-guard.js';

describe('trello-oauth-callback', () => {
  it('parses state from query string', () => {
    const result = parseTrelloOAuthCallback('?state=signed-state-value', '');

    assert.equal(result.state, 'signed-state-value');
    assert.equal(result.token, null);
  });

  it('parses token from hash fragment', () => {
    const result = parseTrelloOAuthCallback('', '#token=trello-token-value');

    assert.equal(result.state, null);
    assert.equal(result.token, 'trello-token-value');
  });

  it('parses state and token together', () => {
    const result = parseTrelloOAuthCallback(
      '?state=signed-state',
      '#token=trello-token&other=ignored'
    );

    assert.equal(result.state, 'signed-state');
    assert.equal(result.token, 'trello-token');
  });

  it('does not parse token from query string', () => {
    const result = parseTrelloOAuthCallback('?token=query-token&state=signed-state', '');

    assert.equal(result.state, 'signed-state');
    assert.equal(result.token, null);
  });

  it('returns null for missing token', () => {
    const result = parseTrelloOAuthCallback('?state=signed-state', '#');

    assert.equal(result.token, null);
  });

  it('returns null for missing state', () => {
    const result = parseTrelloOAuthCallback('', '#token=trello-token');

    assert.equal(result.state, null);
    assert.equal(result.token, 'trello-token');
  });

  it('treats empty values as null', () => {
    const result = parseTrelloOAuthCallback('?state=%20%20', '#token=%20');

    assert.equal(result.state, null);
    assert.equal(result.token, null);
  });

  it('decodes encoded values', () => {
    const result = parseTrelloOAuthCallback(
      '?state=signed%2Bstate%2Fvalue',
      '#token=abc%3D123'
    );

    assert.equal(result.state, 'signed+state/value');
    assert.equal(result.token, 'abc=123');
  });

  it('trims parsed values', () => {
    const result = parseTrelloOAuthCallback('?state=%20signed%20', '#token=%20token%20');

    assert.equal(result.state, 'signed');
    assert.equal(result.token, 'token');
  });

  it('sanitizeOAuthCallbackUrl clears query and hash to pathname only', () => {
    /** @type {{ replaceState: (data: unknown, unused: string, url: string) => void, lastUrl?: string }} */
    const historyLike = {
      replaceState(_data, _unused, url) {
        historyLike.lastUrl = url;
      },
    };

    sanitizeOAuthCallbackUrl('/trello/connect/callback', historyLike);

    assert.equal(historyLike.lastUrl, '/trello/connect/callback');
  });
});

describe('trello oauth exchange guard strict mode', () => {
  beforeEach(() => {
    __resetOAuthExchangeGuardForTests();
  });

  it('runs exchangeFn only once when beginOAuthExchange is invoked twice', async () => {
    let exchangeRuns = 0;

    const exchangeFn = async () => {
      exchangeRuns += 1;
      await Promise.resolve();
    };

    const first = beginOAuthExchange(exchangeFn);
    const second = beginOAuthExchange(async () => {
      exchangeRuns += 1;
    });

    await Promise.all([first, second]);

    assert.equal(exchangeRuns, 1);
  });

  it('simulates StrictMode remount: second invocation reuses in-flight exchange', async () => {
    /** @type {Array<'start' | 'sanitize' | 'post' | 'navigate'>>} */
    const steps = [];
    let completeCalls = 0;
    let navigatedTo = null;

    const pathname = '/trello/connect/callback';
    const search = '?state=signed-state';
    const hash = '#token=trello-token';

    /**
     * Mirrors TrelloConnectCallbackPage effect body (parse outside, exchange inside).
     */
    function runCallbackEffect() {
      const parsed = parseTrelloOAuthCallback(search, hash);

      return beginOAuthExchange(async () => {
        steps.push('start');
        sanitizeOAuthCallbackUrl(pathname, {
          replaceState(_data, _unused, url) {
            steps.push('sanitize');
            assert.equal(url, pathname);
          },
        });

        if (!parsed.state || !parsed.token) {
          return;
        }

        steps.push('post');
        completeCalls += 1;
        await Promise.resolve();

        steps.push('navigate');
        navigatedTo = '/trello';
      });
    }

    const firstEffect = runCallbackEffect();
    const secondEffect = runCallbackEffect();

    await Promise.all([firstEffect, secondEffect]);

    assert.equal(completeCalls, 1);
    assert.equal(navigatedTo, '/trello');
    assert.deepEqual(steps, ['start', 'sanitize', 'post', 'navigate']);
  });

  it('does not leave callers pending when first exchange completes after second join', async () => {
    /** @type {(() => void) | null} */
    let resolvePost = null;
    let completeCalls = 0;
    let settled = false;

    const exchangeFn = async () => {
      completeCalls += 1;
      await new Promise((resolve) => {
        resolvePost = resolve;
      });
      settled = true;
    };

    const first = beginOAuthExchange(exchangeFn);
    const second = beginOAuthExchange(async () => {
      completeCalls += 1;
    });

    assert.equal(completeCalls, 1);

    resolvePost?.();
    await Promise.all([first, second]);

    assert.equal(completeCalls, 1);
    assert.equal(settled, true);
  });

  it('runs a new exchange after the previous one settles (SPA back navigation)', async () => {
    const pathname = '/trello/connect/callback';
    let completeCalls = 0;
    let redirectFlash = null;

    function runCallbackEffect(search, hash) {
      const parsed = parseTrelloOAuthCallback(search, hash);

      return beginOAuthExchange(async () => {
        sanitizeOAuthCallbackUrl(pathname, {
          replaceState() {},
        });

        if (!parsed.state || !parsed.token) {
          redirectFlash = 'error';
          return;
        }

        completeCalls += 1;
        await Promise.resolve();
        redirectFlash = 'success';
      });
    }

    await runCallbackEffect('?state=signed-state', '#token=trello-token');

    assert.equal(completeCalls, 1);
    assert.equal(redirectFlash, 'success');

    await runCallbackEffect('', '');

    assert.equal(completeCalls, 1);
    assert.equal(redirectFlash, 'error');
  });
});
