/** @type {Promise<void> | null} */
let inFlightExchange = null;

/**
 * Runs {@link exchangeFn} at most once while an exchange is in-flight. Subsequent
 * calls return the same promise (StrictMode remount) without invoking {@link exchangeFn}
 * again. The guard clears after the promise settles so a later callback visit can run anew.
 *
 * @param {() => Promise<void>} exchangeFn
 * @returns {Promise<void>}
 */
export function beginOAuthExchange(exchangeFn) {
  if (!inFlightExchange) {
    inFlightExchange = exchangeFn().finally(() => {
      inFlightExchange = null;
    });
  }
  return inFlightExchange;
}

/**
 * Resets the module guard for test isolation only.
 */
export function __resetOAuthExchangeGuardForTests() {
  inFlightExchange = null;
}
