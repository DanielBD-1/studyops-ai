/**
 * Minimal browser globals for React 18 client rendering in Node tests.
 * Not a full DOM — only what GlobalFlashcardsSection / FlashcardStudy need.
 */

/** @type {Record<string, HTMLElement>} */
const byId = {};

/** @type {Document | null} */
let activeDocument = null;

export class Node {
  static ELEMENT_NODE = 1;
  static TEXT_NODE = 3;

  /** @param {number} nodeType */
  constructor(nodeType) {
    this.nodeType = nodeType;
    this.parentNode = null;
  }
}

export class HTMLElement extends Node {
  /** @param {string} tag */
  constructor(tag) {
    super(Node.ELEMENT_NODE);
    this.tagName = tag.toUpperCase();
    this.nodeName = tag.toUpperCase();
    this.localName = tag;
    this.namespaceURI = 'http://www.w3.org/1999/xhtml';
    /** @type {HTMLElement[]} */
    this.children = [];
    /** @type {HTMLElement[]} */
    this.childNodes = [];
    /** @type {Record<string, string>} */
    this.attributes = {};
    this.style = {};
    this.classList = {
      add() {},
      remove() {},
      contains() {
        return false;
      },
    };
    this.ownerDocument = null;
    /** @type {Record<string, Function[]> | undefined} */
    this._listeners = undefined;
    this._value = '';
  }

  /** @param {HTMLElement} child */
  appendChild(child) {
    this.children.push(child);
    this.childNodes.push(child);
    child.parentNode = this;
    return child;
  }

  /** @param {HTMLElement} child */
  removeChild(child) {
    const index = this.children.indexOf(child);
    if (index >= 0) {
      this.children.splice(index, 1);
      this.childNodes.splice(index, 1);
      child.parentNode = null;
    }
    return child;
  }

  /** @param {HTMLElement} node */
  insertBefore(node) {
    return this.appendChild(node);
  }

  /** @param {HTMLElement} node @param {HTMLElement} oldNode */
  replaceChild(node, oldNode) {
    this.removeChild(oldNode);
    return this.appendChild(node);
  }

  /** @param {Node | null | undefined} node */
  contains(node) {
    let current = node;
    while (current) {
      if (current === this) {
        return true;
      }
      current = current.parentNode;
    }
    return false;
  }

  /** @param {string} name @param {string} value */
  setAttribute(name, value) {
    this.attributes[name] = String(value);
    if (name === 'id') {
      byId[String(value)] = this;
    }
    if (name === 'value') {
      this._value = String(value);
    }
  }

  /** @param {string} name */
  getAttribute(name) {
    return this.attributes[name] ?? null;
  }

  /** @param {string} name */
  hasAttribute(name) {
    return Object.prototype.hasOwnProperty.call(this.attributes, name);
  }

  /** @param {string} name */
  removeAttribute(name) {
    if (name === 'id') {
      delete byId[this.attributes.id];
    }
    delete this.attributes[name];
  }

  /** @param {string} type @param {Function} listener */
  addEventListener(type, listener) {
    if (!this._listeners) {
      this._listeners = {};
    }
    if (!this._listeners[type]) {
      this._listeners[type] = [];
    }
    this._listeners[type].push(listener);
  }

  /** @param {string} type @param {Function} listener */
  removeEventListener(type, listener) {
    const listeners = this._listeners?.[type];
    if (!listeners) {
      return;
    }
    const index = listeners.indexOf(listener);
    if (index >= 0) {
      listeners.splice(index, 1);
    }
  }

  /** @param {{ type: string, bubbles?: boolean }} event */
  dispatchEvent(event) {
    let node = this;
    while (node) {
      const listeners = node._listeners?.[event.type];
      if (listeners) {
        for (const listener of [...listeners]) {
          listener.call(node, event);
        }
      }
      if (!event.bubbles) {
        break;
      }
      node = node.parentNode;
    }
    return true;
  }

  focus() {
    if (activeDocument) {
      activeDocument.activeElement = this;
    }
  }

  blur() {
    if (activeDocument?.activeElement === this) {
      activeDocument.activeElement = null;
    }
  }

  click() {
    const event = new globalThis.Event('click', { bubbles: true });
    Object.defineProperty(event, 'target', { value: this, enumerable: true });
    this.dispatchEvent(event);
  }

  /** @param {string} selector */
  querySelector(selector) {
    return queryOne(this, selector);
  }

  /** @param {string} selector */
  querySelectorAll(selector) {
    return queryAll(this, selector);
  }

  getRootNode() {
    return activeDocument ?? this;
  }

  get textContent() {
    return this.children.map((child) => child.textContent ?? child.nodeValue ?? '').join('');
  }

  /** @param {string} value */
  set textContent(value) {
    const textNode = new Text(value);
    textNode.parentNode = this;
    this.children = [textNode];
    this.childNodes = [textNode];
  }

  get className() {
    return this.attributes.class ?? '';
  }

  /** @param {string} value */
  set className(value) {
    this.attributes.class = String(value);
  }
}

export class HTMLSelectElement extends HTMLElement {
  /** @param {string} tag */
  constructor(tag = 'select') {
    super(tag);
  }

  get options() {
    return this.children.filter((child) => child.tagName === 'OPTION');
  }

  get value() {
    const selected = this.options.find((option) => option.selected);
    if (selected) {
      return selected.value;
    }
    return this._value || this.attributes.value || '';
  }

  /** @param {string} next */
  set value(next) {
    const normalized = String(next);
    this._value = normalized;
    this.attributes.value = normalized;
    for (const option of this.options) {
      option.selected = option.value === normalized;
    }
  }
}

export class HTMLOptionElement extends HTMLElement {
  constructor() {
    super('option');
    this._selected = false;
  }

  get value() {
    return this.attributes.value ?? this.textContent ?? '';
  }

  /** @param {string} next */
  set value(next) {
    this.setAttribute('value', String(next));
  }

  get selected() {
    return this._selected;
  }

  /** @param {boolean} next */
  set selected(next) {
    this._selected = Boolean(next);
  }
}

export class Text extends Node {
  /** @param {string} value */
  constructor(value) {
    super(Node.TEXT_NODE);
    this.nodeValue = value;
    this.textContent = value;
  }
}

/**
 * @param {HTMLElement} root
 * @param {string} selector
 */
function queryOne(root, selector) {
  if (selector.startsWith('#')) {
    const id = selector.slice(1);
    return findById(root, id);
  }

  if (selector.startsWith('.')) {
    const className = selector.slice(1);
    return findFirst(root, (node) => hasClassName(node, className));
  }

  if (selector.startsWith('[')) {
    const attrMatch = selector.match(/\[([^=\]]+)(?:="([^"]*)")?\]/);
    if (!attrMatch) {
      return null;
    }
    const [, attr, expected] = attrMatch;
    return findFirst(root, (node) => {
      const value = node.getAttribute?.(attr);
      if (expected === undefined) {
        return value !== null;
      }
      return value === expected;
    });
  }

  const tag = selector.toUpperCase();
  return findFirst(root, (node) => node.tagName === tag);
}

/**
 * @param {HTMLElement} root
 * @param {string} selector
 */
function queryAll(root, selector) {
  /** @type {HTMLElement[]} */
  const matches = [];

  if (selector.startsWith('#')) {
    const id = selector.slice(1);
    walk(root, (node) => {
      if (node.id === id || node.attributes?.id === id) {
        matches.push(node);
      }
    });
    return matches;
  }

  if (selector.startsWith('.')) {
    const className = selector.slice(1);
    walk(root, (node) => {
      if (hasClassName(node, className)) {
        matches.push(node);
      }
    });
    return matches;
  }

  const tag = selector.toUpperCase();
  walk(root, (node) => {
    if (node.tagName === tag) {
      matches.push(node);
    }
  });
  return matches;
}

/**
 * @param {HTMLElement} node
 * @param {string} className
 */
function hasClassName(node, className) {
  const raw = node.className ?? node.attributes?.class ?? '';
  return String(raw).split(/\s+/).filter(Boolean).includes(className);
}

/**
 * @param {HTMLElement} root
 * @param {string} id
 */
function findById(root, id) {
  return findFirst(root, (node) => node.getAttribute?.('id') === id);
}

/**
 * @param {HTMLElement} root
 * @param {(node: HTMLElement) => boolean} predicate
 */
function findFirst(root, predicate) {
  /** @type {HTMLElement | null} */
  let found = null;
  walk(root, (node) => {
    if (!found && predicate(node)) {
      found = node;
    }
  });
  return found;
}

/**
 * @param {HTMLElement} root
 * @param {(node: HTMLElement) => void} visit
 */
function walk(root, visit) {
  visit(root);
  for (const child of root.children ?? []) {
    walk(child, visit);
  }
}

export class HTMLIFrameElement extends HTMLElement {
  constructor() {
    super('iframe');
    this.contentWindow = null;
  }
}

export class HTMLBodyElement extends HTMLElement {
  constructor() {
    super('body');
  }
}

export class HTMLHtmlElement extends HTMLElement {
  constructor() {
    super('html');
  }
}

export class Document extends Node {
  constructor() {
    super(Node.ELEMENT_NODE);
    this.nodeType = 9;
    /** @type {Record<string, Function[]>} */
    this._listeners = {};
    this.body = new HTMLBodyElement();
    this.documentElement = new HTMLHtmlElement();
    this.documentElement.appendChild(this.body);
    this.activeElement = null;
    this.body.ownerDocument = this;
    this.documentElement.ownerDocument = this;
  }

  /** @param {string} type @param {Function} listener */
  addEventListener(type, listener) {
    if (!this._listeners[type]) {
      this._listeners[type] = [];
    }
    this._listeners[type].push(listener);
  }

  /** @param {string} type @param {Function} listener */
  removeEventListener(type, listener) {
    const listeners = this._listeners[type];
    if (!listeners) {
      return;
    }
    const index = listeners.indexOf(listener);
    if (index >= 0) {
      listeners.splice(index, 1);
    }
  }

  /** @param {string} tag */
  createElement(tag) {
    const normalized = tag.toLowerCase();
    let element;
    if (normalized === 'select') {
      element = new HTMLSelectElement();
    } else if (normalized === 'option') {
      element = new HTMLOptionElement();
    } else {
      element = new HTMLElement(tag);
    }
    element.ownerDocument = this;
    return element;
  }

  /** @param {string} id */
  getElementById(id) {
    return byId[id] ?? null;
  }

  /** @param {string} text */
  createTextNode(text) {
    const node = new Text(text);
    node.ownerDocument = this;
    return node;
  }

  /** @param {string} type */
  createEvent(type) {
    return new globalThis.Event(type, { bubbles: true });
  }
}

/**
 * @typedef {{ had: boolean, value: unknown }} GlobalSnapshot
 */

/**
 * @param {string} key
 * @returns {GlobalSnapshot}
 */
function snapshotGlobal(key) {
  const had = Object.prototype.hasOwnProperty.call(globalThis, key);
  return { had, value: had ? globalThis[key] : undefined };
}

/**
 * @param {string} key
 * @param {GlobalSnapshot} snapshot
 */
function restoreGlobal(key, snapshot) {
  if (snapshot.had) {
    globalThis[key] = snapshot.value;
  } else {
    // @ts-expect-error dynamic global cleanup in tests
    delete globalThis[key];
  }
}

/**
 * @param {Record<string, GlobalSnapshot>} snapshots
 * @param {Set<string>} touched
 * @param {string} key
 * @param {unknown} value
 */
function installGlobal(snapshots, touched, key, value) {
  snapshots[key] = snapshotGlobal(key);
  globalThis[key] = value;
  touched.add(key);
}

/**
 * Install minimal document/window globals for React client rendering.
 */
export function installMinimalBrowser() {
  for (const key of Object.keys(byId)) {
    delete byId[key];
  }

  /** @type {Record<string, GlobalSnapshot>} */
  const snapshots = {};
  /** @type {Set<string>} */
  const touched = new Set();

  installGlobal(snapshots, touched, 'HTMLElement', HTMLElement);
  installGlobal(snapshots, touched, 'HTMLSelectElement', HTMLSelectElement);
  installGlobal(snapshots, touched, 'HTMLOptionElement', HTMLOptionElement);
  installGlobal(snapshots, touched, 'HTMLIFrameElement', HTMLIFrameElement);
  installGlobal(snapshots, touched, 'HTMLBodyElement', HTMLBodyElement);
  installGlobal(snapshots, touched, 'HTMLHtmlElement', HTMLHtmlElement);
  installGlobal(snapshots, touched, 'Node', Node);
  installGlobal(snapshots, touched, 'Text', Text);
  installGlobal(snapshots, touched, 'IS_REACT_ACT_ENVIRONMENT', true);

  const document = new Document();
  const container = document.createElement('div');
  container.id = 'root';
  byId.root = container;
  document.body.appendChild(container);

  installGlobal(snapshots, touched, 'document', document);
  installGlobal(
    snapshots,
    touched,
    'Event',
    class Event {
      /** @param {string} type @param {{ bubbles?: boolean }} [options] */
      constructor(type, options = {}) {
        this.type = type;
        this.bubbles = options.bubbles ?? false;
      }
    }
  );
  installGlobal(snapshots, touched, 'window', globalThis);
  installGlobal(snapshots, touched, 'self', globalThis);
  installGlobal(snapshots, touched, 'top', globalThis);
  installGlobal(snapshots, touched, 'parent', globalThis);
  installGlobal(snapshots, touched, 'getComputedStyle', () => ({}));
  installGlobal(snapshots, touched, 'location', {
    href: 'http://localhost/flashcards',
    search: '',
    pathname: '/flashcards',
  });

  snapshots.navigator = snapshotGlobal('navigator');
  if (!snapshots.navigator.had) {
    installGlobal(snapshots, touched, 'navigator', { userAgent: 'node' });
  }

  snapshots.requestAnimationFrame = snapshotGlobal('requestAnimationFrame');
  if (!snapshots.requestAnimationFrame.had) {
    installGlobal(snapshots, touched, 'requestAnimationFrame', (callback) =>
      setTimeout(callback, 0)
    );
  }

  snapshots.cancelAnimationFrame = snapshotGlobal('cancelAnimationFrame');
  if (!snapshots.cancelAnimationFrame.had) {
    installGlobal(snapshots, touched, 'cancelAnimationFrame', (id) => clearTimeout(id));
  }

  installGlobal(
    snapshots,
    touched,
    'addEventListener',
    (type, listener) => document.addEventListener(type, listener)
  );
  installGlobal(
    snapshots,
    touched,
    'removeEventListener',
    (type, listener) => document.removeEventListener(type, listener)
  );
  activeDocument = document;

  return {
    document,
    container,
    cleanup() {
      activeDocument = null;

      for (const key of touched) {
        restoreGlobal(key, snapshots[key]);
      }

      for (const key of Object.keys(byId)) {
        delete byId[key];
      }
    },
  };
}

/**
 * @param {HTMLSelectElement} select
 * @param {string} value
 */
export function changeSelectValue(select, value) {
  select.value = value;
  for (const option of select.options ?? []) {
    option.selected = option.value === value;
  }
  const event = new globalThis.Event('change', { bubbles: true });
  Object.defineProperty(event, 'target', { value: select, enumerable: true });
  Object.defineProperty(event, 'currentTarget', { value: select, enumerable: true });
  select.dispatchEvent(event);
}

/**
 * @param {HTMLElement} root
 * @param {string} text
 */
export function findButtonByText(root, text) {
  return findFirst(root, (node) => node.tagName === 'BUTTON' && node.textContent === text);
}

/**
 * @param {HTMLElement} element
 * @returns {Record<string, unknown> | null}
 */
export function getReactElementProps(element) {
  if (!element || typeof element !== 'object') {
    return null;
  }

  const fiberKey = Object.keys(element).find(
    (key) => key.startsWith('__reactFiber$') || key.startsWith('__reactInternalInstance$')
  );
  if (!fiberKey) {
    return null;
  }

  /** @type {{ memoizedProps?: Record<string, unknown>, return?: unknown } | undefined} */
  let fiber = element[fiberKey];
  while (fiber) {
    if (fiber.memoizedProps && ('to' in fiber.memoizedProps || 'state' in fiber.memoizedProps)) {
      return fiber.memoizedProps;
    }
    fiber = fiber.return;
  }

  return null;
}

/**
 * @param {HTMLElement} element
 */
export function clickElement(element) {
  element.click();
}

/**
 * @param {() => boolean} predicate
 * @param {{ timeoutMs?: number }} [options]
 */
export async function waitFor(predicate, options = {}) {
  const { timeoutMs = 2000 } = options;
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    if (predicate()) {
      return;
    }
    await flushUpdates();
  }
  throw new Error('waitFor timed out');
}

/**
 * @returns {Promise<void>}
 */
export async function flushUpdates() {
  await new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
  await new Promise((resolve) => {
    queueMicrotask(resolve);
  });
  await new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}
