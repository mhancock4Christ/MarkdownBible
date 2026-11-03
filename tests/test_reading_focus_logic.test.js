const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../static/app.js'), 'utf8');
const start = source.indexOf('function normalizeReferenceForUrl');
assert.notStrictEqual(start, -1, 'normalizeReferenceForUrl helper is missing');

const shouldKeepIndex = source.indexOf('function shouldKeepReadingFocus');
assert.notStrictEqual(shouldKeepIndex, -1, 'shouldKeepReadingFocus helper is missing');

const nextFnIndex = source.indexOf('\n  function ', shouldKeepIndex + 1);
const snippet = source.slice(start, nextFnIndex === -1 ? undefined : nextFnIndex);
const context = vm.createContext({
  BOOK_NAME_BY_NUMBER: {
    1: 'Genesis',
    2: 'Exodus',
    43: 'John'
  },
  BOOK_NUMBER_BY_NAME: {
    genesis: 1,
    exodus: 2,
    john: 43
  },
  bookNumberFromName: (name) => {
    const value = String(name || '').trim().toLowerCase();
    if (value === 'john') return 43;
    if (value === 'genesis') return 1;
    if (value === 'exodus') return 2;
    return null;
  }
});
vm.runInContext(`${snippet}; this.shouldKeepReadingFocus = shouldKeepReadingFocus;`, context);

const shouldKeepReadingFocus = context.shouldKeepReadingFocus;

test('keeps focus for reading-mode verse views', () => {
  assert.equal(shouldKeepReadingFocus('John 1:16', 'Verse', {}), true);
  assert.equal(shouldKeepReadingFocus('John 1:16', 'Passage', {}), true);
  assert.equal(shouldKeepReadingFocus('', 'Verse', {}), false);
  assert.equal(shouldKeepReadingFocus('John 1:16', 'Verse', { focus: undefined }), true);
});

test('URL overrides take precedence over default checkbox and select values', () => {
  const start = source.indexOf('function normalizeBooleanQueryValue');
  const end = source.indexOf('\n  function applyReadingVerseFocus', start);
  assert.notStrictEqual(start, -1, 'normalizeBooleanQueryValue helper is missing');
  assert.notStrictEqual(end, -1, 'applyReadingVerseFocus helper is missing');

  const snippet = source.slice(start, end);
  const context = vm.createContext({
    URLSearchParams,
    window: {
      location: {
        search: '?granularity=Passage&newLineVerse=0&highlight=0&showRedLetters=0&showReferenceLinks=1&reference_style=Standard&reference_position=Ref%20Last'
      }
    },
    granularitySelect: { value: 'Verse' },
    inlineVerseNumbersToggle: { checked: true },
    highlightToggle: { checked: true },
    redLetterToggle: { checked: true },
    referenceLinkToggle: { checked: false },
    referenceStyle: { value: 'Wikilink' },
    referencePosition: { value: 'Ref First' }
  });

  vm.runInContext(`${snippet}; this.getUrlReadSettings = getUrlReadSettings; this.normalizeBooleanQueryValue = normalizeBooleanQueryValue;`, context);

  assert.equal(typeof context.normalizeBooleanQueryValue, 'function');
  assert.equal(context.normalizeBooleanQueryValue('0'), false);
  assert.equal(context.normalizeBooleanQueryValue('1'), true);
  assert.equal(context.getUrlReadSettings().newLineVerse, false);
  assert.equal(context.getUrlReadSettings().highlight, false);
  assert.equal(context.getUrlReadSettings().showRedLetters, false);
  assert.equal(context.getUrlReadSettings().showReferenceLinks, true);
  assert.equal(context.getUrlReadSettings().granularity, 'Passage');
  assert.equal(context.getUrlReadSettings().reference_style, 'Standard');
  assert.equal(context.getUrlReadSettings().reference_position, 'Ref Last');
});

test('HTML defaults remain active when the URL omits a setting', () => {
  const start = source.indexOf('function normalizeBooleanQueryValue');
  const end = source.indexOf('\n  function applyReadingVerseFocus', start);
  const snippet = source.slice(start, end);
  const context = vm.createContext({
    URLSearchParams,
    window: {
      location: {
        search: ''
      }
    },
    granularitySelect: { value: 'Passage' },
    inlineVerseNumbersToggle: { checked: true },
    highlightToggle: { checked: true },
    redLetterToggle: { checked: true },
    referenceLinkToggle: { checked: true },
    referenceStyle: { value: 'Standard' },
    referencePosition: { value: 'Ref Last' }
  });

  vm.runInContext(`${snippet}; this.getUrlReadSettings = getUrlReadSettings; this.normalizeBooleanQueryValue = normalizeBooleanQueryValue;`, context);

  const settings = context.getUrlReadSettings();
  assert.equal(settings.granularity, 'Passage');
  assert.equal(settings.newLineVerse, true);
  assert.equal(settings.highlight, true);
  assert.equal(settings.showRedLetters, true);
  assert.equal(settings.showReferenceLinks, true);
  assert.equal(settings.reference_style, 'Standard');
  assert.equal(settings.reference_position, 'Ref Last');
});

test('reading view stays in Passage mode and does not trigger from Verse focus alone', () => {
  const gate = source.includes("Array.isArray(data.reading_items) && data.reading_items.length && isPassageMode");
  assert.equal(gate, true, 'Verse mode should not turn on reading view simply because focus is set');
});

test('single-verse focus keeps the active granularity selected', () => {
  const line = "granularity: activeGranularity,";
  assert.equal(source.includes(line), true, 'single-verse focus should retain the user-selected granularity instead of forcing Passage');
});

test('verse-mode result lists keep focus and scroll to the selected verse', () => {
  const focusLogic = source.includes("const queryReference = normalizeReferenceForUrl") && source.includes("window.__READING_FOCUS_SCROLL_INITIALIZED__ = true;");
  assert.equal(focusLogic, true, 'Verse-mode result lists should follow the same focus-scroll pattern as reading mode');
});

test('changed verse focus scrolls again after the first focus has initialized', () => {
  const start = source.indexOf('function shouldCenterOnReadingFocus');
  const end = source.indexOf('\n  function ', start + 1);
  assert.notStrictEqual(start, -1, 'shouldCenterOnReadingFocus helper is missing');

  const snippet = source.slice(start, end);
  const context = vm.createContext({
    normalizeReferenceForUrl: (reference) => String(reference || '').trim(),
    window: {
      __READING_FOCUS_INITIALIZED__: 'John 3:16',
      __READING_FOCUS_SCROLL_INITIALIZED__: true
    }
  });
  vm.runInContext(`${snippet}; this.shouldCenterOnReadingFocus = shouldCenterOnReadingFocus;`, context);

  assert.equal(context.shouldCenterOnReadingFocus('John 3:20'), true);
  assert.equal(context.window.__READING_FOCUS_INITIALIZED__, 'John 3:20');
  assert.equal(context.shouldCenterOnReadingFocus('John 3:20'), false);
});

test('browser tab title uses the first search term or abbreviated displayed reference', () => {
  const start = source.indexOf('function updateBrowserTabTitle');
  const end = source.indexOf('\n  const highlightToggle', start + 1);
  assert.notStrictEqual(start, -1, 'updateBrowserTabTitle helper is missing');

  const snippet = source.slice(start, end);
  const context = vm.createContext({
    document: { title: '' },
    looksLikeReferenceQuery: (query) => /^John\s+\d+/i.test(query)
  });
  vm.runInContext(`${snippet}; this.updateBrowserTabTitle = updateBrowserTabTitle;`, context);

  context.updateBrowserTabTitle('hope peace', 'search');
  assert.equal(context.document.title, 'hope | Bible Study Search');

  context.updateBrowserTabTitle('John 3:16', 'reference', {
    reading_items: [{ reference: '[[John 3.1-36]]' }]
  });
  assert.equal(context.document.title, 'Jn 3:16 | Bible Study Search');
});
