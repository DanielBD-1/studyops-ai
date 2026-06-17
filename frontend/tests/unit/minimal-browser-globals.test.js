import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  Document,
  HTMLElement as ShimHTMLElement,
  Node as ShimNode,
  Text as ShimText,
  installMinimalBrowser,
} from '../helpers/minimal-browser.js';

const GLOBAL_KEYS = [
  'HTMLElement',
  'HTMLSelectElement',
  'HTMLOptionElement',
  'HTMLIFrameElement',
  'HTMLBodyElement',
  'HTMLHtmlElement',
  'Node',
  'Text',
  'IS_REACT_ACT_ENVIRONMENT',
  'document',
  'Event',
  'window',
  'self',
  'top',
  'parent',
  'getComputedStyle',
  'location',
  'requestAnimationFrame',
  'cancelAnimationFrame',
  'addEventListener',
  'removeEventListener',
];

/**
 * @param {string} key
 */
function snapshotProcessGlobal(key) {
  const had = Object.prototype.hasOwnProperty.call(globalThis, key);
  return { had, value: had ? globalThis[key] : undefined };
}

/**
 * @param {string} key
 * @param {{ had: boolean, value: unknown }} snapshot
 */
function restoreProcessGlobal(key, snapshot) {
  try {
    if (snapshot.had) {
      globalThis[key] = snapshot.value;
    } else {
      // @ts-expect-error dynamic global cleanup in tests
      delete globalThis[key];
    }
  } catch {
    // Node may expose read-only globals (for example navigator) that the shim never mutates.
  }
}

/**
 * @returns {Record<string, { had: boolean, value: unknown }>}
 */
function snapshotAllTrackedGlobals() {
  /** @type {Record<string, { had: boolean, value: unknown }>} */
  const snapshots = {};
  for (const key of GLOBAL_KEYS) {
    snapshots[key] = snapshotProcessGlobal(key);
  }
  return snapshots;
}

/**
 * @param {Record<string, { had: boolean, value: unknown }>} snapshots
 */
function restoreAllTrackedGlobals(snapshots) {
  for (const key of GLOBAL_KEYS) {
    restoreProcessGlobal(key, snapshots[key]);
  }
}

describe('installMinimalBrowser global lifecycle', () => {
  it('exposes shim globals while the browser environment is active', () => {
    const processSnapshots = snapshotAllTrackedGlobals();

    try {
      const browser = installMinimalBrowser();

      try {
        assert.equal(globalThis.HTMLElement, ShimHTMLElement);
        assert.equal(globalThis.Node, ShimNode);
        assert.equal(globalThis.Text, ShimText);
        assert.equal(globalThis.IS_REACT_ACT_ENVIRONMENT, true);
        assert.ok(globalThis.document instanceof Document);
        assert.equal(globalThis.window, globalThis);
        assert.equal(typeof globalThis.addEventListener, 'function');
        assert.equal(typeof globalThis.removeEventListener, 'function');
        assert.ok(browser.container);
      } finally {
        browser.cleanup();
      }
    } finally {
      restoreAllTrackedGlobals(processSnapshots);
    }
  });

  it('removes globals that were absent before install', () => {
    const processSnapshots = snapshotAllTrackedGlobals();
    const sentinelHTMLElement = class SentinelHTMLElement {};
    const sentinelNode = class SentinelNode {};
    const sentinelText = class SentinelText {};

    const hadHTMLElement = processSnapshots.HTMLElement.had;
    const hadNode = processSnapshots.Node.had;
    const hadText = processSnapshots.Text.had;
    const hadActFlag = processSnapshots.IS_REACT_ACT_ENVIRONMENT.had;

    try {
      if (hadHTMLElement) {
        globalThis.HTMLElement = sentinelHTMLElement;
      } else {
        // @ts-expect-error dynamic global cleanup in tests
        delete globalThis.HTMLElement;
      }
      if (hadNode) {
        globalThis.Node = sentinelNode;
      } else {
        // @ts-expect-error dynamic global cleanup in tests
        delete globalThis.Node;
      }
      if (hadText) {
        globalThis.Text = sentinelText;
      } else {
        // @ts-expect-error dynamic global cleanup in tests
        delete globalThis.Text;
      }
      if (hadActFlag) {
        globalThis.IS_REACT_ACT_ENVIRONMENT = false;
      } else {
        // @ts-expect-error dynamic global cleanup in tests
        delete globalThis.IS_REACT_ACT_ENVIRONMENT;
      }

      const browser = installMinimalBrowser();
      assert.equal(globalThis.HTMLElement, ShimHTMLElement);
      assert.equal(globalThis.IS_REACT_ACT_ENVIRONMENT, true);
      browser.cleanup();

      if (hadHTMLElement) {
        assert.equal(globalThis.HTMLElement, sentinelHTMLElement);
      } else {
        assert.equal(Object.prototype.hasOwnProperty.call(globalThis, 'HTMLElement'), false);
      }
      if (hadNode) {
        assert.equal(globalThis.Node, sentinelNode);
      } else {
        assert.equal(Object.prototype.hasOwnProperty.call(globalThis, 'Node'), false);
      }
      if (hadText) {
        assert.equal(globalThis.Text, sentinelText);
      } else {
        assert.equal(Object.prototype.hasOwnProperty.call(globalThis, 'Text'), false);
      }
      if (hadActFlag) {
        assert.equal(globalThis.IS_REACT_ACT_ENVIRONMENT, false);
      } else {
        assert.equal(Object.prototype.hasOwnProperty.call(globalThis, 'IS_REACT_ACT_ENVIRONMENT'), false);
      }
    } finally {
      restoreAllTrackedGlobals(processSnapshots);
    }
  });

  it('restores pre-existing sentinel values exactly after cleanup', () => {
    const processSnapshots = snapshotAllTrackedGlobals();
    const sentinelAct = 'sentinel-act-flag';
    const sentinelDocument = { marker: 'sentinel-document' };
    const sentinelAddEventListener = () => 'sentinel-add';

    try {
      globalThis.IS_REACT_ACT_ENVIRONMENT = sentinelAct;
      globalThis.document = sentinelDocument;
      globalThis.addEventListener = sentinelAddEventListener;

      const browser = installMinimalBrowser();
      assert.notEqual(globalThis.IS_REACT_ACT_ENVIRONMENT, sentinelAct);
      assert.notEqual(globalThis.document, sentinelDocument);
      browser.cleanup();

      assert.equal(globalThis.IS_REACT_ACT_ENVIRONMENT, sentinelAct);
      assert.equal(globalThis.document, sentinelDocument);
      assert.equal(globalThis.addEventListener(), 'sentinel-add');
    } finally {
      restoreAllTrackedGlobals(processSnapshots);
    }
  });

  it('does not leak shim state across repeated install and cleanup cycles', () => {
    const processSnapshots = snapshotAllTrackedGlobals();

    try {
      const first = installMinimalBrowser();
      first.cleanup();

      const between = snapshotAllTrackedGlobals();
      for (const key of GLOBAL_KEYS) {
        assert.deepEqual(between[key], processSnapshots[key]);
      }

      const second = installMinimalBrowser();
      assert.equal(globalThis.HTMLElement, ShimHTMLElement);
      second.cleanup();

      const after = snapshotAllTrackedGlobals();
      for (const key of GLOBAL_KEYS) {
        assert.deepEqual(after[key], processSnapshots[key]);
      }
    } finally {
      restoreAllTrackedGlobals(processSnapshots);
    }
  });
});
