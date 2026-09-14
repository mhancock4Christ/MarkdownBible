document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('searchForm');
  const input = document.getElementById('searchInput');
  const status = document.getElementById('status');
  const results = document.getElementById('results');
  const searchButton = document.getElementById('searchButton');
  const referenceButton = document.getElementById('referenceButton');
  const searchType = document.getElementById('searchType');
  const bookGroup = document.getElementById('bookGroup');
  const referenceStyle = document.getElementById('referenceStyle');
  const granularity = document.getElementById('granularity');
  const referencePosition = document.getElementById('referencePosition');
  const contextWindow = document.getElementById('contextWindow');
  const caseSensitive = document.getElementById('caseSensitive');
  const suppressParagraphs = document.getElementById('suppressParagraphs');
  if (suppressParagraphs) {
    suppressParagraphs.checked = true;
  }
  const accordionToggles = document.querySelectorAll('.accordion-toggle');
  const themeToggle = document.getElementById('themeToggle');
  const exportFormat = document.getElementById('exportFormat');
  const copyButton = document.getElementById('copyButton');
  const exportButton = document.getElementById('exportButton');
  const inlineVerseNumbersRow = document.getElementById('inlineVerseNumbersRow');
  const inlineVerseNumbersToggle = document.getElementById('showInlineVerseNumbers');
  const granularitySelect = document.getElementById('granularity');
  const BOOK_NAME_BY_NUMBER = {
    1: 'Genesis', 2: 'Exodus', 3: 'Leviticus', 4: 'Numbers', 5: 'Deuteronomy', 6: 'Joshua', 7: 'Judges', 8: 'Ruth', 9: '1 Samuel', 10: '2 Samuel',
    11: '1 Kings', 12: '2 Kings', 13: '1 Chronicles', 14: '2 Chronicles', 15: 'Ezra', 16: 'Nehemiah', 17: 'Esther', 18: 'Job', 19: 'Psalms', 20: 'Proverbs', 21: 'Ecclesiastes', 22: 'Song of Solomon', 23: 'Isaiah',
    24: 'Jeremiah', 25: 'Lamentations', 26: 'Ezekiel', 27: 'Daniel', 28: 'Hosea', 29: 'Joel', 30: 'Amos', 31: 'Obadiah', 32: 'Jonah', 33: 'Micah', 34: 'Nahum', 35: 'Habakkuk', 36: 'Zephaniah', 37: 'Haggai',
    38: 'Zechariah', 39: 'Malachi', 40: 'Matthew', 41: 'Mark', 42: 'Luke', 43: 'John', 44: 'Acts', 45: 'Romans', 46: '1 Corinthians', 47: '2 Corinthians',
    48: 'Galatians', 49: 'Ephesians', 50: 'Philippians', 51: 'Colossians', 52: '1 Thessalonians', 53: '2 Thessalonians', 54: '1 Timothy', 55: '2 Timothy',
    56: 'Titus', 57: 'Philemon', 58: 'Hebrews', 59: 'James', 60: '1 Peter', 61: '2 Peter', 62: '1 John', 63: '2 John', 64: '3 John', 65: 'Jude', 66: 'Revelation'
  };
  const BOOK_ALIASES = {
    gen: 'Genesis', ge: 'Genesis', gn: 'Genesis', ex: 'Exodus', exo: 'Exodus', exod: 'Exodus',
    lev: 'Leviticus', le: 'Leviticus', lv: 'Leviticus', num: 'Numbers', nu: 'Numbers', nm: 'Numbers',
    deut: 'Deuteronomy', deu: 'Deuteronomy', dt: 'Deuteronomy', jos: 'Joshua', josh: 'Joshua',
    jdg: 'Judges', jdgs: 'Judges', judg: 'Judges', jd: 'Judges', ruth: 'Ruth', ru: 'Ruth',
    '1sam': '1 Samuel', '1 sam': '1 Samuel', '1sa': '1 Samuel', '2sam': '2 Samuel', '2 sam': '2 Samuel', '2sa': '2 Samuel',
    '1ki': '1 Kings', '1 kgs': '1 Kings', '1kgs': '1 Kings', '1 kings': '1 Kings', '2ki': '2 Kings', '2 kgs': '2 Kings', '2kgs': '2 Kings', '2 kings': '2 Kings',
    '1chr': '1 Chronicles', '1 chr': '1 Chronicles', '1ch': '1 Chronicles', '2chr': '2 Chronicles', '2 chr': '2 Chronicles', '2ch': '2 Chronicles',
    ezr: 'Ezra', ezra: 'Ezra', ez: 'Ezra', neh: 'Nehemiah', ne: 'Nehemiah', est: 'Esther', esth: 'Esther',
    job: 'Job', ps: 'Psalms', psa: 'Psalms', psalm: 'Psalms', psalms: 'Psalms', prov: 'Proverbs', pro: 'Proverbs', pr: 'Proverbs', prv: 'Proverbs',
    eccl: 'Ecclesiastes', ecc: 'Ecclesiastes', ec: 'Ecclesiastes', song: 'Song of Solomon', 'song of songs': 'Song of Solomon', 'song of solomon': 'Song of Solomon', sos: 'Song of Solomon',
    isa: 'Isaiah', is: 'Isaiah', jer: 'Jeremiah', je: 'Jeremiah', jr: 'Jeremiah', lam: 'Lamentations', la: 'Lamentations',
    ezek: 'Ezekiel', eze: 'Ezekiel', ezk: 'Ezekiel', dan: 'Daniel', da: 'Daniel', dn: 'Daniel', hos: 'Hosea', ho: 'Hosea', joel: 'Joel', jl: 'Joel',
    amos: 'Amos', am: 'Amos', obad: 'Obadiah', ob: 'Obadiah', oba: 'Obadiah', jon: 'Jonah', jnh: 'Jonah', mic: 'Micah', mc: 'Micah', nah: 'Nahum', na: 'Nahum',
    hab: 'Habakkuk', hb: 'Habakkuk', zeph: 'Zephaniah', zep: 'Zephaniah', zp: 'Zephaniah', hag: 'Haggai', hg: 'Haggai', zech: 'Zechariah', zec: 'Zechariah', zc: 'Zechariah',
    mal: 'Malachi', ml: 'Malachi', mat: 'Matthew', matt: 'Matthew', mt: 'Matthew', mrk: 'Mark', mar: 'Mark', mk: 'Mark', mr: 'Mark', luk: 'Luke', lk: 'Luke', lu: 'Luke',
    jhn: 'John', jn: 'John', joh: 'John', act: 'Acts', acts: 'Acts', ac: 'Acts', rom: 'Romans', rm: 'Romans', ro: 'Romans',
    '1cor': '1 Corinthians', '1 cor': '1 Corinthians', '1co': '1 Corinthians', '2cor': '2 Corinthians', '2 cor': '2 Corinthians', '2co': '2 Corinthians',
    gal: 'Galatians', ga: 'Galatians', eph: 'Ephesians', ep: 'Ephesians', php: 'Philippians', phil: 'Philippians', phl: 'Philippians', col: 'Colossians', co: 'Colossians',
    '1th': '1 Thessalonians', '1 th': '1 Thessalonians', '1thes': '1 Thessalonians', '1thess': '1 Thessalonians', '1 thess': '1 Thessalonians', '1 thes': '1 Thessalonians',
    '2th': '2 Thessalonians', '2 th': '2 Thessalonians', '2thes': '2 Thessalonians', '2thess': '2 Thessalonians', '2 thess': '2 Thessalonians', '2 thes': '2 Thessalonians',
    '1tim': '1 Timothy', '1 tim': '1 Timothy', '1ti': '1 Timothy', '2tim': '2 Timothy', '2 tim': '2 Timothy', '2ti': '2 Timothy', tit: 'Titus', ti: 'Titus',
    phm: 'Philemon', philem: 'Philemon', pm: 'Philemon', heb: 'Hebrews', he: 'Hebrews', jas: 'James', jam: 'James', jm: 'James', js: 'James',
    '1pet': '1 Peter', '1 pet': '1 Peter', '1pe': '1 Peter', '1pt': '1 Peter', '1 pt': '1 Peter', '1peter': '1 Peter', '2pet': '2 Peter', '2 pet': '2 Peter', '2pe': '2 Peter', '2pt': '2 Peter', '2 pt': '2 Peter', '2peter': '2 Peter',
    '1jn': '1 John', '1 jn': '1 John', '1jhn': '1 John', '1jo': '1 John', '1j': '1 John', '2jn': '2 John', '2 jn': '2 John', '2jhn': '2 John', '2jo': '2 John', '2j': '2 John',
    '3jn': '3 John', '3 jn': '3 John', '3jhn': '3 John', '3jo': '3 John', '3j': '3 John', jud: 'Jude', jude: 'Jude', rev: 'Revelation', re: 'Revelation', rv: 'Revelation'
  };
  const BOOK_NUMBER_BY_NAME = Object.fromEntries(
    Object.entries(BOOK_NAME_BY_NUMBER).map(([num, name]) => [name.toLowerCase(), Number(num)])
  );
  Object.entries(BOOK_ALIASES).forEach(([key, name]) => {
    BOOK_NUMBER_BY_NAME[key.toLowerCase()] = BOOK_NUMBER_BY_NAME[name.toLowerCase()];
  });
  let lastResultsData = null;
  let readingNavigationState = {
    entries: [],
    loading: false,
    lastScrollY: window.scrollY,
    previousLoadLocked: false,
    nextLoadLocked: false,
    lastAutoLoadAt: 0,
    bottomWheelStartedAt: null,
    bottomPauseStartedAt: null,
    topScrollStartedAt: null,
    topPauseStartedAt: null,
    pendingBoundaryDirection: null
  };
  window.__READING_FOCUS_INITIALIZED__ = null;
  window.__READING_FOCUS_SCROLL_INITIALIZED__ = false;
  window.__LAST_SEARCH_QUERY__ = '';

  function getReadingVerseElement(reference) {
    const target = normalizeReferenceForUrl(reference);
    if (!target) return null;

    const match = target.match(/(.+?)\s+(\d+)\s*[:.]\s*(\d+)/);
    if (!match) return null;

    const bookName = match[1].trim();
    const chapter = match[2];
    const verse = match[3];
    const bookNumber = bookNumberFromName(bookName);
    if (!bookNumber || !chapter || !verse) return null;

    const verseId = buildReadingVerseId(bookNumber, chapter, verse);
    return document.getElementById(verseId);
  }

  function normalizeReferenceForUrl(reference) {
    const query = typeof reference === 'string' ? reference.trim() : '';
    if (!query) return '';

    const cleaned = query.replace(/^\[\[|\]\]$/g, '').trim();
    const match = cleaned.match(/^(.+?)\s+(\d+)\s*[:.]\s*(\d+)(?:\s*-\s*\d+)?$/i);
    if (!match) return cleaned;

    const bookName = match[1].trim();
    const bookNumber = bookNumberFromName(bookName);
    if (!bookNumber) return cleaned;
    const canonicalBook = BOOK_NAME_BY_NUMBER[bookNumber] || bookName;
    return `${canonicalBook} ${match[2]}:${match[3]}`;
  }

  function chapterReferenceForReadingUrl(reference) {
    const normalized = normalizeReferenceForUrl(reference);
    if (!normalized) return '';

    const chapterOnlyMatch = normalized.match(/^(.+?)\s+(\d+)$/i);
    if (chapterOnlyMatch) {
      return `${chapterOnlyMatch[1].trim()} ${chapterOnlyMatch[2]}`;
    }

    const verseMatch = normalized.match(/^(.+?)\s+(\d+)\s*[:.]\s*(\d+)(?:\s*-\s*\d+)?$/i);
    if (verseMatch) {
      return `${verseMatch[1].trim()} ${verseMatch[2]}`;
    }

    return normalized;
  }

  function bookNameFromNumber(book) {
    const num = Number(book);
    return BOOK_NAME_BY_NUMBER[num] || String(book || '');
  }

  function bookNumberFromName(bookName) {
    if (!bookName) return null;
    const value = String(bookName).trim();
    const normalized = value.toLowerCase().replace(/\s+/g, ' ');
    if (BOOK_NUMBER_BY_NAME[normalized]) return BOOK_NUMBER_BY_NAME[normalized];

    const aliasValue = BOOK_ALIASES[normalized.replace(/\./g, '').replace(/\s+/g, '')];
    if (aliasValue && BOOK_NUMBER_BY_NAME[aliasValue.toLowerCase()]) {
      return BOOK_NUMBER_BY_NAME[aliasValue.toLowerCase()];
    }

    const compact = normalized.replace(/\s+/g, '');
    for (const [name, number] of Object.entries(BOOK_NUMBER_BY_NAME)) {
      if (name === normalized || name.replace(/\s+/g, '') === compact || name.startsWith(normalized) || name.replace(/\s+/g, '').startsWith(compact)) {
        return number;
      }
    }
    return null;
  }

  function buildReadingVerseId(book, chapter, verse) {
    const name = bookNameFromNumber(book).trim();
    return `reading-verse-${String(name || '').replace(/[^\w]+/g, '-')}-${String(chapter || '').replace(/[^\w]+/g, '-')}-${String(verse || '').replace(/[^\w]+/g, '-')}`;
  }

  function looksLikeReferenceQuery(value) {
    const text = typeof value === 'string' ? value.trim() : '';
    if (!text) return false;

    const chapterOrVersePattern = /^(?:[A-Za-z][A-Za-z\.\s'-]*?)\s+\d+(?:\s*[:.]\s*\d+(?:\s*-\s*\d+)?)?$/;
    if (chapterOrVersePattern.test(text)) {
      return true;
    }

    return /^(?:[A-Za-z][A-Za-z\.\s'-]*?)\s*\d+\s*[:.]\s*\d+$/.test(text);
  }

  function getCurrentDisplaySettings() {
    const params = new URLSearchParams(window.location.search);
    const selectedGranularity = granularitySelect?.value || params.get('granularity') || 'Verse';
    return {
      granularity: selectedGranularity,
      showReferenceLinks: Boolean(referenceLinkToggle ? referenceLinkToggle.checked : params.get('showReferenceLinks') === '1' || params.get('showReferenceLinks') === 'true'),
      highlight: Boolean(highlightToggle ? highlightToggle.checked : params.get('highlight') === '1' || params.get('highlight') === 'true'),
      showRedLetters: Boolean(redLetterToggle ? redLetterToggle.checked : params.get('showRedLetters') === '1' || params.get('showRedLetters') === 'true'),
      newLineVerse: Boolean(inlineVerseNumbersToggle ? inlineVerseNumbersToggle.checked : params.get('newLineVerse') === '1' || params.get('newLineVerse') === 'true')
    };
  }

  function buildCanonicalUrlSearchParams(overrides = {}) {
    const params = new URLSearchParams();
    const currentParams = new URLSearchParams(window.location.search);
    const rawQuery = overrides.q !== undefined ? overrides.q : (input ? input.value.trim() : '') || window.__INITIAL_QUERY__ || currentParams.get('q') || '';
    const activeQuery = typeof rawQuery === 'string' ? rawQuery.trim() : '';
    if (activeQuery) {
      params.set('q', activeQuery);
    }

    const activeGranularity = overrides.granularity ?? (granularitySelect?.value || currentParams.get('granularity') || 'Verse');
    params.set('granularity', activeGranularity);

    const focusReference = normalizeReferenceForUrl(overrides.focus ?? currentParams.get('focus') ?? '');
    const shouldKeepFocus = Boolean(focusReference);
    if (shouldKeepFocus) {
      params.set('focus', focusReference);
    }

    const activeReferenceStyle = overrides.reference_style ?? (referenceStyle ? referenceStyle.value : currentParams.get('reference_style') || 'Wikilink');
    if (['Wikilink', 'Standard'].includes(activeReferenceStyle)) {
      params.set('reference_style', activeReferenceStyle);
    }

    const activeReferencePosition = overrides.reference_position ?? (referencePosition ? referencePosition.value : currentParams.get('reference_position') || 'Ref First');
    if (['Ref First', 'Ref Last'].includes(activeReferencePosition)) {
      params.set('reference_position', activeReferencePosition);
    }

    const activeHighlight = overrides.highlight ?? (highlightToggle ? highlightToggle.checked : currentParams.get('highlight') === '1' || currentParams.get('highlight') === 'true');
    params.set('highlight', activeHighlight ? '1' : '0');

    const activeRedLetters = overrides.showRedLetters ?? (redLetterToggle ? redLetterToggle.checked : currentParams.get('showRedLetters') === '1' || currentParams.get('showRedLetters') === 'true');
    params.set('showRedLetters', activeRedLetters ? '1' : '0');

    const activeReferenceLinks = overrides.showReferenceLinks ?? (referenceLinkToggle ? referenceLinkToggle.checked : currentParams.get('showReferenceLinks') === '1' || currentParams.get('showReferenceLinks') === 'true');
    params.set('showReferenceLinks', activeReferenceLinks ? '1' : '0');

    const activeNewLineVerse = overrides.newLineVerse ?? (inlineVerseNumbersToggle ? inlineVerseNumbersToggle.checked : currentParams.get('newLineVerse') === '1' || currentParams.get('newLineVerse') === 'true');
    if (activeGranularity === 'Passage' && activeNewLineVerse) {
      params.set('newLineVerse', '1');
    } else {
      params.delete('newLineVerse');
    }

    return params;
  }

  function buildReferenceUrl(reference) {
    const query = normalizeReferenceForUrl(reference);
    if (!query) return '#';

    const chapterQuery = chapterReferenceForReadingUrl(query) || query;
    const activeSettings = getCurrentDisplaySettings();
    const activeGranularity = activeSettings.granularity || 'Verse';
    const url = new URL(window.location.href);
    url.pathname = '/';
    const params = buildCanonicalUrlSearchParams({
      q: chapterQuery,
      granularity: activeGranularity,
      focus: query,
      reference_style: referenceStyle ? referenceStyle.value : undefined,
      reference_position: referencePosition ? referencePosition.value : undefined,
      highlight: activeSettings.highlight,
      showRedLetters: activeSettings.showRedLetters,
      showReferenceLinks: activeSettings.showReferenceLinks,
      newLineVerse: activeSettings.newLineVerse
    });

    url.search = params.toString();
    return url.toString();
  }

  function isReadingViewportMode(granularity = (granularitySelect?.value || 'Verse'), focusReference = getUrlReadSettings().focus || window.__READING_FOCUS_REF || '') {
    return granularity === 'Passage' || (granularity === 'Verse' && Boolean(focusReference));
  }

  function shouldKeepReadingFocus(reference, granularity = (granularitySelect?.value || 'Verse'), options = {}) {
    const normalized = normalizeReferenceForUrl(reference);
    if (!normalized) {
      return false;
    }

    const focusReference = normalizeReferenceForUrl(options?.focus || '');
    if (!focusReference) {
      return true;
    }

    if (granularity === 'Passage') {
      return true;
    }

    return normalized === focusReference || focusReference === normalized;
  }

  function normalizeInitialReadingQuery(rawQuery, readSettings = getUrlReadSettings()) {
    const query = typeof rawQuery === 'string' ? rawQuery.trim() : '';
    if (!query) return '';
    if (!readSettings.focus || !['Passage', 'Verse'].includes(readSettings.granularity)) return query;
    const normalized = chapterReferenceForReadingUrl(query);
    return normalized || query;
  }

  function normalizeBooleanQueryValue(value, fallback = false) {
    if (value === undefined || value === null || value === '') {
      return Boolean(fallback);
    }

    const normalized = String(value).trim().toLowerCase();
    if (normalized === '0' || normalized === 'false') {
      return false;
    }
    if (normalized === '1' || normalized === 'true') {
      return true;
    }
    return Boolean(fallback);
  }

  function getUrlReadSettings(defaults = {}) {
    const params = new URLSearchParams(window.location.search);
    const fallbackGranularity = defaults.granularity ?? granularitySelect?.value ?? 'Verse';
    const fallbackNewLineVerse = defaults.newLineVerse ?? Boolean(inlineVerseNumbersToggle ? inlineVerseNumbersToggle.checked : false);
    const fallbackHighlight = defaults.highlight ?? Boolean(highlightToggle ? highlightToggle.checked : true);
    const fallbackShowRedLetters = defaults.showRedLetters ?? Boolean(redLetterToggle ? redLetterToggle.checked : true);
    const fallbackShowReferenceLinks = defaults.showReferenceLinks ?? Boolean(referenceLinkToggle ? referenceLinkToggle.checked : false);
    const fallbackReferenceStyle = defaults.reference_style ?? (referenceStyle ? referenceStyle.value : 'Wikilink');
    const fallbackReferencePosition = defaults.reference_position ?? (referencePosition ? referencePosition.value : 'Ref First');

    return {
      granularity: params.has('granularity') ? (params.get('granularity') || fallbackGranularity) : fallbackGranularity,
      newLineVerse: params.has('newLineVerse') ? normalizeBooleanQueryValue(params.get('newLineVerse'), fallbackNewLineVerse) : fallbackNewLineVerse,
      focus: params.has('focus') ? (params.get('focus') || '') : (defaults.focus || ''),
      showReferenceLinks: params.has('showReferenceLinks') ? normalizeBooleanQueryValue(params.get('showReferenceLinks'), fallbackShowReferenceLinks) : fallbackShowReferenceLinks,
      highlight: params.has('highlight') ? normalizeBooleanQueryValue(params.get('highlight'), fallbackHighlight) : fallbackHighlight,
      showRedLetters: params.has('showRedLetters') ? normalizeBooleanQueryValue(params.get('showRedLetters'), fallbackShowRedLetters) : fallbackShowRedLetters,
      reference_style: params.has('reference_style') ? (params.get('reference_style') || fallbackReferenceStyle) : fallbackReferenceStyle,
      reference_position: params.has('reference_position') ? (params.get('reference_position') || fallbackReferencePosition) : fallbackReferencePosition
    };
  }

  function applyReadingVerseFocus(reference) {
    const target = normalizeReferenceForUrl(reference);
    if (!target) return;

    document.querySelectorAll('.reading-verse-focus').forEach((el) => {
      el.classList.remove('reading-verse-focus');
    });

    const verseEl = getReadingVerseElement(target);
    if (verseEl) {
      verseEl.classList.add('reading-verse-focus');
      window.__READING_FOCUS_REF = target;
    }
  }

  function scrollReadingVerseIntoView(reference, options = {}) {
    const { center = false } = options;
    const target = normalizeReferenceForUrl(reference);
    if (!target) return;

    const verseEl = getReadingVerseElement(target);
    if (verseEl) {
      applyReadingVerseFocus(target);
      if (center) {
        verseEl.scrollIntoView({ behavior: 'auto', block: 'center' });
        verseEl.setAttribute('tabindex', '-1');
        verseEl.focus({ preventScroll: true });
      }
      window.__READING_FOCUS_REF = target;
    }
  }

  function syncAccordionState() {
    const isMobile = window.matchMedia('(max-width: 640px)').matches;

    accordionToggles.forEach((toggle) => {
      const targetId = toggle.getAttribute('data-target');
      const panel = targetId ? document.getElementById(targetId) : null;
      const arrow = toggle.querySelector('.accordion-arrow');
      if (!panel || !arrow) return;

      const userExpanded = panel.dataset.expandedByUser === 'true';
      const shouldCollapse = isMobile && !userExpanded;
      panel.classList.toggle('collapsed', shouldCollapse);
      toggle.setAttribute('aria-expanded', String(!shouldCollapse));
      arrow.textContent = shouldCollapse ? '▸' : '▾';
      if (shouldCollapse) {
        panel.dataset.expandedByUser = 'false';
      }
    });
  }

  function getSearchOptions() {
    const contextValue = Number.parseInt(contextWindow ? contextWindow.value : '0', 10);

    return {
      book_group: bookGroup ? bookGroup.value : 'All Books',
      search_type: searchType ? searchType.value : 'Phrase',
      case_sensitive: Boolean(caseSensitive && caseSensitive.checked),
      reference_style: referenceStyle ? referenceStyle.value : 'Wikilink',
      granularity: granularity ? granularity.value : 'Verse',
      reference_position: referencePosition ? referencePosition.value : 'Ref First',
      suppress_paragraph: Boolean(suppressParagraphs && suppressParagraphs.checked),
      context_window: Number.isFinite(contextValue) ? contextValue : 0
    };
  }

  function getReferenceStyleValue() {
    return referenceStyle ? referenceStyle.value : 'Wikilink';
  }

  function getReferencePositionValue() {
    return referencePosition ? referencePosition.value : 'Ref First';
  }

  function parseReferenceParts(referenceText) {
    const value = typeof referenceText === 'string' ? referenceText.trim() : '';
    if (!value) return null;

    const cleaned = value.replace(/^\[\[|\]\]$/g, '').trim();
    if (!cleaned) return null;

    const match = cleaned.match(/^(.+?)\s+(\d+)(?:\s*[:.]\s*(\d+)(?:\s*-\s*(\d+))?)?$/i);
    if (!match) return null;

    const [, bookName, chapterText, verseStartText, verseEndText] = match;
    const chapter = Number(chapterText);
    const verseStart = verseStartText ? Number(verseStartText) : null;
    const verseEnd = verseEndText ? Number(verseEndText) : verseStart;

    if (!Number.isFinite(chapter) || (verseStart !== null && !Number.isFinite(verseStart))) {
      return null;
    }

    return {
      bookName: bookName.trim(),
      chapter,
      verseStart,
      verseEnd
    };
  }

  function buildReferenceTextFromParts(parts, styleValue) {
    if (!parts || !parts.bookName) return '';

    const style = styleValue === 'Standard' ? 'Standard' : 'Wikilink';
    const chapter = Number(parts.chapter);
    const verseStart = parts.verseStart !== null ? Number(parts.verseStart) : null;
    const verseEnd = parts.verseEnd !== null ? Number(parts.verseEnd) : verseStart;

    if (!Number.isFinite(chapter) || (verseStart !== null && !Number.isFinite(verseStart))) {
      return '';
    }

    if (style === 'Wikilink') {
      if (verseStart !== null && verseEnd !== null && verseStart !== verseEnd) {
        return `[[${parts.bookName} ${chapter}.${verseStart}-${verseEnd}]]`;
      }
      if (verseStart !== null) {
        return `[[${parts.bookName} ${chapter}.${verseStart}]]`;
      }
      return `[[${parts.bookName} ${chapter}]]`;
    }

    if (verseStart !== null && verseEnd !== null && verseStart !== verseEnd) {
      return `${parts.bookName} ${chapter}:${verseStart}-${verseEnd}`;
    }
    if (verseStart !== null) {
      return `${parts.bookName} ${chapter}:${verseStart}`;
    }
    return `${parts.bookName} ${chapter}`;
  }

  function applyReferenceModeToData(data) {
    if (!data) return data;

    const styleValue = getReferenceStyleValue();
    const positionValue = getReferencePositionValue();

    if (Array.isArray(data.items)) {
      data.items = data.items.map((item) => {
        const parts = parseReferenceParts(item?.reference || '');
        return {
          ...item,
          reference: buildReferenceTextFromParts(parts, styleValue) || item.reference || '',
          reference_position: positionValue
        };
      });
    }

    if (Array.isArray(data.reading_items)) {
      data.reading_items = data.reading_items.map((item) => ({
        ...item,
        reference: buildReferenceTextFromParts(parseReferenceParts(item?.reference || ''), styleValue) || item.reference || '',
      }));
    }

    return data;
  }

  function getDisplayOptions() {
    const highlightCheckbox = document.getElementById('highlightMatches');
    const redLetterCheckbox = document.getElementById('showRedLetters');
    const referenceLinkCheckbox = document.getElementById('showReferenceLinks');

    return {
      highlight: Boolean(highlightCheckbox && highlightCheckbox.checked),
      show_red_letters: Boolean(redLetterCheckbox && redLetterCheckbox.checked),
      show_reference_links: Boolean(referenceLinkCheckbox && referenceLinkCheckbox.checked)
    };
  }

  function setStatus(message, isError = false) {
    if (!status) return;
    status.textContent = message || '';
    status.classList.toggle('error', isError);
    status.classList.remove('hidden');
    status.style.visibility = 'visible';
    status.style.opacity = '1';

    if (setStatus.timeoutId) {
      window.clearTimeout(setStatus.timeoutId);
    }

    if (message) {
      setStatus.timeoutId = window.setTimeout(() => {
        status.classList.add('hidden');
        status.style.opacity = '0';
        status.style.visibility = 'hidden';
      }, 5000);
    } else {
      setStatus.timeoutId = null;
    }
  }

  function collapseReadingAccordions() {
    accordionToggles.forEach((toggle) => {
      const targetId = toggle.getAttribute('data-target');
      const panel = targetId ? document.getElementById(targetId) : null;
      const arrow = toggle.querySelector('.accordion-arrow');
      if (!panel || !arrow) return;
      panel.classList.add('collapsed');
      panel.dataset.expandedByUser = 'false';
      toggle.setAttribute('aria-expanded', 'false');
      arrow.textContent = '▸';
    });
  }

  function showChapterToast(bookName, chapterNumber, bookNumber = null) {
    const existing = document.getElementById('reading-chapter-toast');
    if (existing) {
      existing.remove();
    }

    const toast = document.createElement('div');
    toast.id = 'reading-chapter-toast';
    toast.className = 'reading-chapter-toast';
    toast.textContent = `${bookName} ${chapterNumber}`;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add('visible');
    });

    window.clearTimeout(showChapterToast.timeoutId);
    showChapterToast.timeoutId = window.setTimeout(() => {
      toast.classList.remove('visible');
      window.setTimeout(() => toast.remove(), 320);
    }, 3000);
  }

  function setLoading(isLoading) {
    if (searchButton) searchButton.disabled = isLoading;
    if (referenceButton) referenceButton.disabled = isLoading;
    if (input) input.disabled = isLoading;
  }

  function buildVerseSlices(text, highlightSpans = [], redSegments = [], enableHighlight = true, enableRedLetters = true) {
    if (!text) return [];

    const boundaries = new Set([0, text.length]);

    if (enableHighlight && Array.isArray(highlightSpans)) {
      highlightSpans.forEach(([start, end]) => {
        const s = Number(start);
        const e = Number(end);
        if (!Number.isFinite(s) || !Number.isFinite(e) || e <= s) return;
        boundaries.add(Math.max(0, s));
        boundaries.add(Math.min(text.length, e));
      });
    }

    if (enableRedLetters && Array.isArray(redSegments)) {
      let offset = 0;
      redSegments.forEach((segment) => {
        if (!segment || !segment.red) {
          offset += String(segment?.text ?? '').length;
          return;
        }

        const segText = String(segment.text ?? '');
        if (segText.length > 0) {
          boundaries.add(offset);
          boundaries.add(offset + segText.length);
        }
        offset += segText.length;
      });
    }

    const sliceStarts = Array.from(boundaries).sort((a, b) => a - b);
    const slices = [];

    for (let i = 0; i < sliceStarts.length - 1; i += 1) {
      const start = sliceStarts[i];
      const end = sliceStarts[i + 1];
      if (end <= start) continue;

      const chunk = text.slice(start, end);
      if (!chunk) continue;

      let isHighlighted = false;
      let isRedLetter = false;

      if (enableHighlight && Array.isArray(highlightSpans)) {
        isHighlighted = highlightSpans.some(([spanStart, spanEnd]) => {
          const s = Number(spanStart);
          const e = Number(spanEnd);
          if (!Number.isFinite(s) || !Number.isFinite(e) || e <= s) return false;
          return s <= start && end <= e;
        });
      }

      if (enableRedLetters && Array.isArray(redSegments)) {
        let offset = 0;
        for (const segment of redSegments) {
          if (!segment || !segment.red) {
            offset += String(segment?.text ?? '').length;
            continue;
          }

          const segText = String(segment.text ?? '');
          const segStart = offset;
          const segEnd = offset + segText.length;
          if (segText.length > 0 && segStart <= start && end <= segEnd) {
            isRedLetter = true;
            break;
          }
          offset += segText.length;
        }
      }

      slices.push({
        start,
        end,
        text: chunk,
        highlighted: isHighlighted,
        red: isRedLetter
      });
    }

    return slices;
  }

  function splitBracketedText(text) {
    const segments = [];
    const pattern = /\[([^\]]+)\]/g;
    let lastIndex = 0;
    let match;

    while ((match = pattern.exec(text)) !== null) {
      if (match.index > lastIndex) {
        const prefix = text.slice(lastIndex, match.index);
        if (prefix) {
          segments.push({ text: prefix, bracketed: false });
        }
      }

      const inner = match[1] ?? '';
      if (inner) {
        segments.push({ text: inner, bracketed: true });
      }
      lastIndex = match.index + match[0].length;
    }

    const suffix = text.slice(lastIndex);
    if (suffix) {
      segments.push({ text: suffix, bracketed: false });
    }

    return segments;
  }

  function appendStyledTextSegment(parent, text, { bracketed = false, highlighted = false, red = false } = {}) {
    if (!text) return;

    const node = document.createElement('span');
    if (highlighted) node.classList.add('highlight-match');
    if (red) node.classList.add('red-letter');
    if (bracketed) node.classList.add('bracketed-phrase');
    node.textContent = text;
    parent.appendChild(node);
  }

  function createStyledVerseNode(item, options = {}) {
    const text = String(item?.verse_text || '');
    if (!text) {
      return document.createTextNode('');
    }

    const slices = buildVerseSlices(
      text,
      Array.isArray(item?.highlight_spans) ? item.highlight_spans : [],
      Array.isArray(item?.segments) ? item.segments : [],
      Boolean(options.highlight),
      Boolean(options.show_red_letters)
    );

    if (!slices.length) {
      return document.createTextNode(text);
    }

    const fragment = document.createDocumentFragment();
    slices.forEach(({ text: sliceText, highlighted, red }) => {
      const splitSegments = splitBracketedText(sliceText);

      splitSegments.forEach(({ text: segmentText, bracketed }) => {
        appendStyledTextSegment(fragment, segmentText, { bracketed, highlighted, red });
      });
    });

    return fragment;
  }

  function renderWildcardSummary(data) {
    const summary = Array.isArray(data?.wildcard_summary) ? data.wildcard_summary : [];
    if (!summary.length) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'wildcard-summary';

    const title = document.createElement('h3');
    title.textContent = 'Word counts';
    wrapper.appendChild(title);

    const list = document.createElement('ul');
    summary.forEach((entry) => {
      const li = document.createElement('li');
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'summary-link';
      button.textContent = `${entry.word} (${entry.matches})`;
      button.addEventListener('click', () => {
        const url = new URL(window.location.href);
        url.pathname = '/';
        url.search = new URLSearchParams({ q: entry.word }).toString();
        window.open(url.toString(), '_blank', 'noopener,noreferrer');
      });
      li.appendChild(button);
      list.appendChild(li);
    });

    wrapper.appendChild(list);
    results.appendChild(wrapper);
  }

  function renderWildcardSummaryForReadingView(data) {
    if (!data || !Array.isArray(data.wildcard_summary) || !data.wildcard_summary.length) {
      return;
    }

    const existing = document.querySelector('.wildcard-summary');
    if (existing) {
      existing.remove();
    }

    const wrapper = document.createElement('div');
    wrapper.className = 'wildcard-summary';

    const title = document.createElement('h3');
    title.textContent = 'Word counts';
    wrapper.appendChild(title);

    const list = document.createElement('ul');
    data.wildcard_summary.forEach((entry) => {
      const li = document.createElement('li');
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'summary-link';
      button.textContent = `${entry.word} (${entry.matches})`;
      button.addEventListener('click', () => {
        const url = new URL(window.location.href);
        url.pathname = '/';
        url.search = new URLSearchParams({ q: entry.word }).toString();
        window.open(url.toString(), '_blank', 'noopener,noreferrer');
      });
      li.appendChild(button);
      list.appendChild(li);
    });
    wrapper.appendChild(list);
    results.appendChild(wrapper);
  }

  function applyTheme(theme) {
    const isDark = theme === 'dark';
    document.body.classList.toggle('dark', isDark);
    if (themeToggle) {
      themeToggle.setAttribute('aria-pressed', String(isDark));
      themeToggle.textContent = isDark ? 'Light mode' : 'Dark mode';
    }
  }

  function initTheme() {
    const storedTheme = localStorage.getItem('bibleapp-theme');
    applyTheme(storedTheme || 'light');
  }

  function syncInlineVerseRowDisplay() {
    if (!inlineVerseNumbersRow) return;
    const isPassageMode = (granularitySelect?.value || 'Verse') === 'Passage';
    inlineVerseNumbersRow.hidden = !isPassageMode;
    inlineVerseNumbersRow.style.display = isPassageMode ? 'flex' : 'none';
    inlineVerseNumbersRow.style.visibility = isPassageMode ? 'visible' : 'hidden';
  }

  function updateDisplayOptionsVisibility() {
    const hasReadingView = Boolean(document.querySelector('.reading-view'));
    const urlSettings = getUrlReadSettings();
    const isPassageMode = (granularitySelect?.value || 'Verse') === 'Passage';
    const highlightMatchesRow = document.getElementById('highlightMatchesRow');
    const referenceLinksRow = document.getElementById('referenceLinksRow');
    const hasInlineVersePreference = Boolean(urlSettings.newLineVerse || (inlineVerseNumbersToggle && inlineVerseNumbersToggle.checked));

    if (highlightMatchesRow) {
      highlightMatchesRow.hidden = hasReadingView;
      highlightMatchesRow.style.display = hasReadingView ? 'none' : 'flex';
    }

    if (referenceLinksRow) {
      referenceLinksRow.hidden = hasReadingView && isPassageMode;
      referenceLinksRow.style.display = (hasReadingView && isPassageMode) ? 'none' : 'flex';
    }

    syncInlineVerseRowDisplay();

    if (inlineVerseNumbersToggle && !isPassageMode && !hasInlineVersePreference) {
      inlineVerseNumbersToggle.checked = false;
    }
  }

  function updateUrlDisplayState() {
    const params = buildCanonicalUrlSearchParams();
    const nextUrl = new URL(window.location.href);
    nextUrl.search = params.toString();
    window.history.replaceState({}, '', nextUrl.toString());
  }

  function syncInlineVerseToggleFromUrl() {
    if (!inlineVerseNumbersToggle) return;
    const urlSettings = getUrlReadSettings();
    if (urlSettings.granularity === 'Passage' || urlSettings.newLineVerse) {
      inlineVerseNumbersToggle.checked = Boolean(urlSettings.newLineVerse || inlineVerseNumbersToggle.checked);
      return;
    }
    inlineVerseNumbersToggle.checked = false;
  }

  function updateInlineVerseNumberVisibility() {
    syncInlineVerseToggleFromUrl();
    updateDisplayOptionsVisibility();
  }

  function renderReadingVerseSegments(verse, options = {}) {
    const showRedLetters = Boolean(options.showRedLetters ?? getUrlReadSettings().showRedLetters ?? true);
    const wrap = document.createElement('span');
    const segments = Array.isArray(verse?.segments) ? verse.segments : [];

    if (!segments.length) {
      const parts = splitBracketedText(String(verse?.text ?? ''));
      parts.forEach(({ text: partText, bracketed }) => {
        const el = document.createElement('span');
        if (bracketed) {
          el.classList.add('bracketed-phrase');
        }
        el.textContent = partText;
        wrap.appendChild(el);
      });
      return wrap;
    }

    segments.forEach((segment) => {
      const segmentText = String(segment?.text ?? '');
      if (!segmentText) return;

      splitBracketedText(segmentText).forEach(({ text: partText, bracketed }) => {
        const el = document.createElement('span');
        if (bracketed) {
          el.classList.add('bracketed-phrase');
        }
        if (showRedLetters && segment.red) {
          el.classList.add('red-letter');
        }
        el.textContent = partText;
        wrap.appendChild(el);
      });
    });

    return wrap;
  }

  function renderReadingParagraphs(item) {
    const container = document.createElement('div');
    const isPassageMode = (granularitySelect?.value || 'Verse') === 'Passage';
    const useNewLineVerse = isPassageMode && Boolean(inlineVerseNumbersToggle ? inlineVerseNumbersToggle.checked : getUrlReadSettings().newLineVerse);
    container.className = `reading-paragraphs${isPassageMode ? ' passage-mode' : ''}`;

    const paragraphs = Array.isArray(item?.paragraphs) ? item.paragraphs : [];
    if (!paragraphs.length) {
      const empty = document.createElement('p');
      empty.textContent = 'No text available for this chapter.';
      container.appendChild(empty);
      return container;
    }

    paragraphs.forEach((paragraph) => {
      const paragraphEl = document.createElement('div');
      if (isPassageMode) {
        paragraphEl.classList.add('passage-mode');
        paragraphEl.style.marginBottom = '1.1rem';
        paragraphEl.style.lineHeight = '1.7';
      }

      if (!Array.isArray(paragraph)) {
        paragraphEl.textContent = String(paragraph ?? '');
        container.appendChild(paragraphEl);
        return;
      }

      paragraph.forEach((verse) => {
        const verseText = String(verse?.text ?? '');
        if (!verseText) return;

        const verseEl = document.createElement('div');
        verseEl.className = 'reading-verse';
        verseEl.id = buildReadingVerseId(item?.book ?? '', item?.chapter ?? '', verse?.verse ?? '');
        verseEl.dataset.reference = `${bookNameFromNumber(item?.book ?? '')} ${item?.chapter ?? ''}:${verse?.verse ?? ''}`;
        if (isPassageMode) {
          const isInlineVerseGroup = !useNewLineVerse;
          verseEl.classList.toggle('inline-verse', isInlineVerseGroup);
          verseEl.classList.toggle('new-line-verse', useNewLineVerse);
          verseEl.style.display = useNewLineVerse ? 'block' : 'inline';
          verseEl.style.margin = '0';
          verseEl.style.lineHeight = '1.7';
          verseEl.style.marginRight = useNewLineVerse ? '0' : '0.35em';
        } else {
          verseEl.style.display = 'block';
          verseEl.style.margin = '0';
          verseEl.style.lineHeight = '1.55';
        }

        if (verse?.verse !== undefined && verse?.verse !== null) {
          const verseNumber = document.createElement('span');
          verseNumber.className = 'inline-verse-number';
          verseNumber.textContent = `${verse.verse}.`;
          verseNumber.tabIndex = 0;
          verseNumber.setAttribute('aria-label', `Focus verse ${verse.verse}`);
          const focusVerse = () => {
            const verseReference = `${bookNameFromNumber(item?.book ?? '')} ${item?.chapter ?? ''}:${verse?.verse ?? ''}`;
            const chapterQuery = chapterReferenceForReadingUrl(verseReference) || verseReference;
            const url = new URL(window.location.href);
            url.search = new URLSearchParams({
              q: chapterQuery,
              granularity: 'Verse',
              newLineVerse: '1',
              focus: verseReference
            }).toString();
            window.history.replaceState({}, '', url.toString());
            scrollReadingVerseIntoView(verseReference);
          };
          verseNumber.addEventListener('click', focusVerse);
          verseNumber.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              focusVerse();
            }
          });
          verseEl.appendChild(verseNumber);
        }

        const textWrap = renderReadingVerseSegments(verse, { showRedLetters: getUrlReadSettings().showRedLetters });
        verseEl.appendChild(textWrap);

        paragraphEl.appendChild(verseEl);
      });

      if (paragraphEl.textContent.trim()) {
        container.appendChild(paragraphEl);
      }
    });

    return container;
  }

  function renderReadingView(data) {
    const items = Array.isArray(data?.reading_items) ? data.reading_items : [];
    readingNavigationState.entries = items;

    if (!results) return;
    results.innerHTML = '';

    if (!items.length) {
      const empty = document.createElement('p');
      empty.textContent = 'No reading mode available.';
      results.appendChild(empty);
      return;
    }

    const wrapper = document.createElement('div');
    wrapper.className = 'reading-view';

    items.forEach((item, index) => {
      const chapterNumber = Number(item?.chapter);
      const previousItem = index > 0 ? items[index - 1] : null;
      const previousChapterNumber = Number(previousItem?.chapter);
      const sameChapter = chapterNumber && previousChapterNumber && chapterNumber === previousChapterNumber;

      if (chapterNumber && (!previousItem || !sameChapter)) {
        const chapterHeading = document.createElement('h2');
        chapterHeading.className = 'reading-chapter-heading';
        chapterHeading.textContent = `Chapter ${chapterNumber}`;
        wrapper.appendChild(chapterHeading);
      }

      const chapterBlock = document.createElement('article');
      chapterBlock.className = 'reading-item';
      chapterBlock.appendChild(renderReadingParagraphs(item));
      wrapper.appendChild(chapterBlock);
    });

    results.appendChild(wrapper);

    const focusReference = getUrlReadSettings().focus || window.__READING_FOCUS_REF || '';
    if (focusReference) {
      const shouldCenterOnLoad = !window.__READING_FOCUS_SCROLL_INITIALIZED__ && window.__READING_FOCUS_INITIALIZED__ !== focusReference;
      window.__READING_FOCUS_INITIALIZED__ = focusReference;
      window.__READING_FOCUS_REF = focusReference;
      applyReadingVerseFocus(focusReference);
      if (shouldCenterOnLoad) {
        requestAnimationFrame(() => {
          scrollReadingVerseIntoView(focusReference, { center: true });
          window.__READING_FOCUS_SCROLL_INITIALIZED__ = true;
        });
      }
    }
  }

  async function loadReadingChapter(direction) {
    const entries = readingNavigationState.entries || [];
    if (!entries.length || readingNavigationState.loading) return;

    const targetRef = direction === 'next'
      ? entries[entries.length - 1]?.nav?.next
      : entries[0]?.nav?.previous;

    if (!targetRef) return;

    const now = Date.now();
    if (now - readingNavigationState.lastAutoLoadAt < 600) {
      return;
    }

    readingNavigationState.loading = true;
    try {
      const data = await postSearch('reference', targetRef, getSearchOptions());
      const nextEntries = Array.isArray(data?.reading_items) ? data.reading_items : [];
      if (!nextEntries.length) return;

      if (direction === 'next') {
        readingNavigationState.entries = [...entries, ...nextEntries];
      } else {
        readingNavigationState.entries = [...nextEntries, ...entries];
        collapseReadingAccordions();
      }

      renderReadingView({ reading_items: readingNavigationState.entries });
      const activeFocus = window.__READING_FOCUS_REF || getUrlReadSettings().focus || '';
      if (activeFocus) {
        applyReadingVerseFocus(activeFocus);
      }

      const toastEntry = direction === 'next'
        ? readingNavigationState.entries[readingNavigationState.entries.length - 1]
        : readingNavigationState.entries[0];
      const bookName = bookNameFromNumber(toastEntry?.book ?? '');
      const chapter = toastEntry?.chapter ?? 1;
      const bookNumber = toastEntry?.book ?? null;
      showChapterToast(bookName, chapter, bookNumber);

      if (direction === 'next') {
        requestAnimationFrame(() => {
          const chapterHeading = document.querySelector('.reading-chapter-heading:last-of-type');
          const currentScrollY = window.scrollY;
          const viewportHeight = window.innerHeight || 1;
          const headingTop = chapterHeading ? chapterHeading.getBoundingClientRect().top + currentScrollY : currentScrollY;
          const targetScrollTop = Math.max(0, headingTop - (viewportHeight * 0.8));

          if (targetScrollTop > currentScrollY) {
            window.scrollTo({ top: targetScrollTop, behavior: 'auto' });
          }
        });
      }

      if (direction === 'previous') {
        requestAnimationFrame(() => {
          const firstChapterBlock = document.querySelector('.reading-item');
          const currentScrollY = window.scrollY;
          const viewportHeight = window.innerHeight || 1;
          const chapterBottom = firstChapterBlock ? firstChapterBlock.getBoundingClientRect().bottom + currentScrollY : currentScrollY;
          const targetScrollTop = Math.max(0, chapterBottom - (viewportHeight * 0.2));

          if (targetScrollTop >= currentScrollY) {
            window.scrollTo({ top: targetScrollTop, behavior: 'auto' });
          }
        });
      }

      readingNavigationState.lastAutoLoadAt = Date.now();
      setStatus(`Loaded ${direction === 'next' ? 'next' : 'previous'} chapter.`);
    } catch (error) {
      setStatus(error.message || 'Failed to load chapter.', true);
    } finally {
      readingNavigationState.loading = false;
    }
  }

  function handleReadingScrollAutoLoad() {
    const entries = readingNavigationState.entries || [];
    if (!entries.length) return;

    const previousRef = entries[0]?.nav?.previous;
    const nextRef = entries[entries.length - 1]?.nav?.next;
    const currentScrollY = window.scrollY;
    const scrollingUp = currentScrollY < readingNavigationState.lastScrollY;
    const scrollingDown = currentScrollY > readingNavigationState.lastScrollY;
    const truePageBottom = document.body.scrollHeight;
    const atTop = currentScrollY <= 0;
    const atBottom = currentScrollY + window.innerHeight >= truePageBottom - 1;
    const cooldownActive = Date.now() - readingNavigationState.lastAutoLoadAt < 600;
    const readingOverflowVisible = document.body.scrollHeight > window.innerHeight * 1.25;
    const topPauseStartedAt = readingNavigationState.topPauseStartedAt;
    const bottomPauseStartedAt = readingNavigationState.bottomPauseStartedAt;
    const topPauseElapsed = Boolean(topPauseStartedAt) && Date.now() - topPauseStartedAt >= 600;
    const bottomPauseElapsed = Boolean(bottomPauseStartedAt) && Date.now() - bottomPauseStartedAt >= 600;
    const keyboardIntentUp = readingNavigationState.pendingBoundaryDirection === 'up';
    const keyboardIntentDown = readingNavigationState.pendingBoundaryDirection === 'down';

    if ((atTop && keyboardIntentUp) || (atTop && !scrollingDown && !topPauseStartedAt)) {
      readingNavigationState.topPauseStartedAt = readingNavigationState.topPauseStartedAt || Date.now();
    } else if (!atTop || scrollingDown) {
      readingNavigationState.topPauseStartedAt = null;
      if (!atTop && keyboardIntentUp) {
        readingNavigationState.pendingBoundaryDirection = null;
      }
    }

    if ((atBottom && keyboardIntentDown) || (atBottom && !scrollingUp && !bottomPauseStartedAt)) {
      readingNavigationState.bottomPauseStartedAt = readingNavigationState.bottomPauseStartedAt || Date.now();
    } else if (!atBottom || scrollingUp) {
      readingNavigationState.bottomPauseStartedAt = null;
      if (!atBottom && keyboardIntentDown) {
        readingNavigationState.pendingBoundaryDirection = null;
      }
    }

    if (!atBottom && !readingNavigationState.loading) {
      readingNavigationState.nextLoadLocked = false;
      readingNavigationState.bottomWheelStartedAt = null;
    }

    if (atTop && scrollingUp) {
      collapseReadingAccordions();
    }

    if (atTop && previousRef && readingOverflowVisible && !readingNavigationState.loading && !readingNavigationState.previousLoadLocked && !cooldownActive && (topPauseElapsed || keyboardIntentUp)) {
      readingNavigationState.previousLoadLocked = true;
      readingNavigationState.topPauseStartedAt = null;
      readingNavigationState.pendingBoundaryDirection = null;
      loadReadingChapter('previous');
    } else if (!atTop || !readingOverflowVisible) {
      readingNavigationState.previousLoadLocked = false;
    }

    if (atBottom && nextRef && readingOverflowVisible && !readingNavigationState.loading && !readingNavigationState.nextLoadLocked && !cooldownActive && (bottomPauseElapsed || keyboardIntentDown)) {
      readingNavigationState.nextLoadLocked = true;
      readingNavigationState.bottomPauseStartedAt = null;
      readingNavigationState.pendingBoundaryDirection = null;
      loadReadingChapter('next');
    } else if (!atBottom || !readingOverflowVisible) {
      readingNavigationState.nextLoadLocked = false;
    }

    readingNavigationState.lastScrollY = currentScrollY;
  }

  function handleReadingKeyboardAutoLoad(event) {
    const entries = readingNavigationState.entries || [];
    if (!entries.length || !event) return;

    const key = event.key || '';
    const previousRef = entries[0]?.nav?.previous;
    const nextRef = entries[entries.length - 1]?.nav?.next;
    const currentScrollY = window.scrollY;
    const truePageBottom = document.body.scrollHeight;
    const atTop = currentScrollY <= 0;
    const atBottom = currentScrollY + window.innerHeight >= truePageBottom - 1;
    const cooldownActive = Date.now() - readingNavigationState.lastAutoLoadAt < 600;
    const goesUp = ['PageUp', 'ArrowUp', 'Home'].includes(key);
    const goesDown = ['PageDown', 'ArrowDown', 'End'].includes(key);

    if (goesUp) {
      readingNavigationState.pendingBoundaryDirection = 'up';
      if (atTop && previousRef && !readingNavigationState.loading && !readingNavigationState.previousLoadLocked && !cooldownActive) {
        if (!readingNavigationState.topPauseStartedAt) {
          readingNavigationState.topPauseStartedAt = Date.now();
        }
        if (Date.now() - readingNavigationState.topPauseStartedAt >= 600) {
          readingNavigationState.previousLoadLocked = true;
          readingNavigationState.topPauseStartedAt = null;
          readingNavigationState.pendingBoundaryDirection = null;
          loadReadingChapter('previous');
        }
      }
      return;
    }

    if (goesDown) {
      readingNavigationState.pendingBoundaryDirection = 'down';
      if (atBottom && nextRef && !readingNavigationState.loading && !readingNavigationState.nextLoadLocked && !cooldownActive) {
        if (!readingNavigationState.bottomPauseStartedAt) {
          readingNavigationState.bottomPauseStartedAt = Date.now();
        }
        if (Date.now() - readingNavigationState.bottomPauseStartedAt >= 600) {
          readingNavigationState.nextLoadLocked = true;
          readingNavigationState.bottomPauseStartedAt = null;
          readingNavigationState.pendingBoundaryDirection = null;
          loadReadingChapter('next');
        }
      }
    }
  }

  function handleReadingWheelAutoLoad(event) {
    const entries = readingNavigationState.entries || [];
    if (!entries.length || !event) return;

    const previousRef = entries[0]?.nav?.previous;
    const nextRef = entries[entries.length - 1]?.nav?.next;
    const currentScrollY = window.scrollY;
    const truePageBottom = document.body.scrollHeight;
    const atTop = currentScrollY <= 0;
    const atBottom = currentScrollY + window.innerHeight >= truePageBottom - 1;
    const cooldownActive = Date.now() - readingNavigationState.lastAutoLoadAt < 600;
    const topPauseStartedAt = readingNavigationState.topPauseStartedAt;
    const topPauseElapsed = Boolean(topPauseStartedAt) && Date.now() - topPauseStartedAt >= 600;

    if (event.deltaY < 0) {
      if (atTop) {
        if (!topPauseStartedAt) {
          readingNavigationState.topPauseStartedAt = Date.now();
        }

        if (previousRef && !readingNavigationState.loading && !readingNavigationState.previousLoadLocked && !cooldownActive && Date.now() - readingNavigationState.topPauseStartedAt >= 600) {
          readingNavigationState.previousLoadLocked = true;
          readingNavigationState.topPauseStartedAt = null;
          loadReadingChapter('previous');
        }
      } else {
        readingNavigationState.topPauseStartedAt = null;
      }
      return;
    }

    if (event.deltaY > 0 && atTop) {
      readingNavigationState.topPauseStartedAt = null;
    }

    if (event.deltaY <= 0) {
      return;
    }

    if (!atBottom || !nextRef || readingNavigationState.loading || readingNavigationState.nextLoadLocked || cooldownActive) {
      readingNavigationState.bottomWheelStartedAt = null;
      return;
    }

    if (!readingNavigationState.bottomWheelStartedAt) {
      readingNavigationState.bottomWheelStartedAt = Date.now();
      return;
    }

    const bottomWheelDebounceDue = Date.now() - readingNavigationState.bottomWheelStartedAt >= 600;
    if (bottomWheelDebounceDue) {
      readingNavigationState.nextLoadLocked = true;
      readingNavigationState.bottomWheelStartedAt = null;
      loadReadingChapter('next');
    }
  }

  function renderResults(data) {
    lastResultsData = data || null;
    updateDisplayOptionsVisibility();
    readingNavigationState.entries = [];
    if (!results) return;
    results.innerHTML = '';

    const isPassageMode = (granularitySelect?.value || 'Verse') === 'Passage';
    const activeGranularity = granularitySelect?.value || 'Verse';
    const activeFocusReference = getUrlReadSettings().focus || window.__READING_FOCUS_REF || '';
    const isReadingMode = Boolean(data && data.recommended_view === 'reading' && Array.isArray(data.reading_items) && data.reading_items.length && isPassageMode);
    if (isReadingMode) {
      const queryReference = normalizeReferenceForUrl(
        (input && input.value.trim()) ||
        window.__LAST_SEARCH_QUERY__ ||
        window.__INITIAL_QUERY__ ||
        new URLSearchParams(window.location.search).get('q') ||
        ''
      );
      const isSingleVerseReference = Boolean(queryReference) && /^.+\s+\d+\s*[:.]\s*\d+\s*$/i.test(queryReference);

      if (isSingleVerseReference) {
        const chapterQuery = chapterReferenceForReadingUrl(queryReference) || queryReference;
        const nextParams = new URLSearchParams({
          q: chapterQuery,
          granularity: activeGranularity,
          focus: queryReference,
          showRedLetters: String(Boolean(getCurrentDisplaySettings().showRedLetters)),
          reference_style: String(referenceStyle ? referenceStyle.value : 'Wikilink'),
          reference_position: String(referencePosition ? referencePosition.value : 'Ref First'),
          highlight: String(Boolean(highlightToggle ? highlightToggle.checked : true)),
          showReferenceLinks: String(Boolean(referenceLinkToggle ? referenceLinkToggle.checked : false))
        });
        if (activeGranularity === 'Passage') {
          nextParams.set('newLineVerse', String(Boolean(inlineVerseNumbersToggle ? inlineVerseNumbersToggle.checked : getUrlReadSettings().newLineVerse)));
        }

        window.history.replaceState({}, '', `${window.location.pathname}?${nextParams.toString()}`);
        window.__READING_FOCUS_INITIALIZED__ = null;
        window.__READING_FOCUS_SCROLL_INITIALIZED__ = false;
        window.__READING_FOCUS_REF = queryReference;
      }

      const urlSettings = getUrlReadSettings();
      if (urlSettings.granularity === 'Passage') {
        granularitySelect.value = 'Passage';
      }
      if (inlineVerseNumbersToggle) {
        inlineVerseNumbersToggle.checked = Boolean(urlSettings.newLineVerse || inlineVerseNumbersToggle.checked);
      }
      updateInlineVerseNumberVisibility();
      renderReadingView(data);
      updateInlineVerseNumberVisibility();
      renderWildcardSummaryForReadingView(data);
      return;
    }

    renderWildcardSummary(data);

    const items = Array.isArray(data?.items) ? data.items : [];

    if (!items.length) {
      const empty = document.createElement('p');
      empty.textContent = 'No matches found.';
      results.appendChild(empty);
      return;
    }

    const list = document.createElement('ul');
    const displayOptions = getDisplayOptions();
    const queryReference = normalizeReferenceForUrl(
      (input && input.value.trim()) ||
      window.__LAST_SEARCH_QUERY__ ||
      window.__INITIAL_QUERY__ ||
      new URLSearchParams(window.location.search).get('q') ||
      ''
    );
    const isSingleVerseReference = Boolean(queryReference) && /^.+\s+\d+\s*[:.]\s*\d+\s*$/i.test(queryReference);
    const focusReference = normalizeReferenceForUrl(getUrlReadSettings().focus || '') || (isSingleVerseReference ? queryReference : '');
    const itemReferencePosition = getReferencePositionValue();

    items.forEach((item) => {
      const li = document.createElement('li');
      const reference = item.reference || 'Reference';
      const normalizedReference = normalizeReferenceForUrl(reference);
      li.dataset.reference = normalizedReference;
      const isFocusedVerse = Boolean(focusReference) && normalizedReference === focusReference;
      if (isFocusedVerse) {
        li.classList.add('reading-verse-focus');
        li.tabIndex = -1;
      }
      const shouldLinkReference = Boolean(displayOptions.show_reference_links) && Boolean(item.reference);
      const referenceNode = shouldLinkReference ? document.createElement('a') : document.createElement('span');

      if (shouldLinkReference) {
        referenceNode.href = buildReferenceUrl(reference);
        referenceNode.target = '_blank';
        referenceNode.rel = 'noopener noreferrer';
        referenceNode.className = 'result-reference';
      } else {
        referenceNode.className = 'result-reference';
      }

      const strong = document.createElement('strong');
      strong.textContent = reference;
      referenceNode.appendChild(strong);

      const verse = document.createElement('span');
      verse.className = 'verse-text';

      const separator = document.createTextNode(' — ');
      verse.appendChild(createStyledVerseNode(item, displayOptions));

      if (itemReferencePosition === 'Ref Last') {
        li.appendChild(verse);
        li.appendChild(separator);
        li.appendChild(referenceNode);
      } else {
        li.appendChild(referenceNode);
        li.appendChild(separator);
        li.appendChild(verse);
      }
      list.appendChild(li);
    });

    const focusedResult = focusReference
      ? Array.from(list.querySelectorAll('li')).find((li) => normalizeReferenceForUrl(li.dataset.reference || '') === focusReference)
      : null;
    if (focusedResult) {
      window.__READING_FOCUS_INITIALIZED__ = focusReference;
      window.__READING_FOCUS_REF = focusReference;
      const shouldCenterOnLoad = !window.__READING_FOCUS_SCROLL_INITIALIZED__ || window.__READING_FOCUS_INITIALIZED__ !== focusReference;
      if (shouldCenterOnLoad) {
        requestAnimationFrame(() => {
          const currentMatch = Array.from(list.querySelectorAll('li')).find((li) => normalizeReferenceForUrl(li.dataset.reference || '') === focusReference);
          if (!currentMatch) return;
          currentMatch.scrollIntoView({ behavior: 'auto', block: 'center' });
          currentMatch.focus({ preventScroll: true });
          window.__READING_FOCUS_SCROLL_INITIALIZED__ = true;
        });
      }
    }

    results.appendChild(list);
  }

  async function postSearch(intent, query, requestOptions = {}) {
    const options = { ...getSearchOptions(), ...requestOptions };
    const displayOptions = getDisplayOptions();
    const response = await fetch('/api/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        intent,
        query,
        ...options,
        highlight: Boolean(displayOptions.highlight),
        lookup_extracted: true,
        show_red_letters: Boolean(displayOptions.show_red_letters)
      })
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(payload.detail || 'Search failed.');
    }

    return payload;
  }

  function escapeMarkdownText(text) {
    return String(text ?? '').replace(/\\/g, '\\\\').replace(/([*_])/g, '\\$1');
  }

  function buildMarkdownTextForItem(item) {
    const reference = String(item?.reference || '');
    const verseText = String(item?.verse_text || '');
    const referencePosition = item?.reference_position || 'Ref First';
    const highlightSpans = Array.isArray(item?.highlight_spans) ? item.highlight_spans : [];

    const renderedVerse = buildVerseSlices(verseText, highlightSpans, [], true, false)
      .flatMap(({ text: sliceText, highlighted }) => splitBracketedText(sliceText).map(({ text: segmentText, bracketed }) => {
        const safeText = escapeMarkdownText(segmentText);
        if (highlighted) {
          return `***${safeText}***`;
        }
        return bracketed ? `*${safeText}*` : safeText;
      }))
      .join('');

    if (!reference && !renderedVerse) {
      return '';
    }

    return referencePosition === 'Ref Last'
      ? `${renderedVerse} ${reference}`.trim()
      : `${reference} ${renderedVerse}`.trim();
  }

  function buildPassageCopyText(item) {
    const reference = String(item?.reference || '');
    const paragraphs = (Array.isArray(item?.paragraphs) ? item.paragraphs : [])
      .map((paragraph) => {
        if (!Array.isArray(paragraph)) {
          return String(paragraph ?? '');
        }
        return paragraph
          .map((verse) => `${verse?.verse !== undefined && verse?.verse !== null ? `${verse.verse}. ` : ''}${verse?.text ?? ''}`)
          .join(' ');
      })
      .filter(Boolean)
      .join('\n');

    if (!reference && !paragraphs) {
      return '';
    }

    return reference ? `${reference}\n${paragraphs}`.trim() : paragraphs.trim();
  }

  function buildCurrentViewText() {
    const viewData = lastResultsData || {};
    const isPassageMode = (granularitySelect?.value || 'Verse') === 'Passage';
    const readingItems = Array.isArray(viewData.reading_items) ? viewData.reading_items : [];

    if (isPassageMode && readingItems.length) {
      return readingItems
        .map((item) => buildPassageCopyText(item))
        .filter(Boolean)
        .join('\n\n');
    }

    const items = Array.isArray(viewData.items) ? viewData.items : [];
    return items.map(buildMarkdownTextForItem).filter(Boolean).join('\n');
  }

  async function copyResults() {
    const text = buildCurrentViewText();
    if (!text.trim()) {
      setStatus('No results to copy.', true);
      return;
    }

    if (!navigator.clipboard || !window.isSecureContext) {
      const fallback = document.createElement('textarea');
      fallback.value = text;
      document.body.appendChild(fallback);
      fallback.select();
      document.execCommand('copy');
      fallback.remove();
      setStatus('Copied current view to clipboard.');
      return;
    }

    await navigator.clipboard.writeText(text);
    setStatus('Copied current view to clipboard.');
  }

  async function exportResults() {
    const items = Array.isArray(lastResultsData?.items) ? lastResultsData.items : [];
    if (!items.length) {
      setStatus('No results to export.', true);
      return;
    }

    const format = exportFormat ? exportFormat.value : 'txt';
    const response = await fetch(`/api/export/${format}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(items)
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload.detail || 'Export failed.');
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `verses.${format}`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    setStatus(`Exported ${items.length} result(s) as ${format.toUpperCase()}.`);
  }

  async function runSearch(intent) {
    const query = input?.value.trim();
    if (!query) {
      setStatus('Please enter a word or reference to search.', true);
      return;
    }

    window.__LAST_SEARCH_QUERY__ = query;
    const options = getSearchOptions();

    setLoading(true);
    setStatus(intent === 'reference' ? 'Searching reference...' : 'Searching words...');

    try {
      const data = await postSearch(intent, query, options);

      const hasApostropheTextQuery = typeof query === 'string' && /['’]/.test(query) && !looksLikeReferenceQuery(query);

      if (intent === 'search' && !hasApostropheTextQuery && (Number(data.count || 0) === 0 || !(data.items || []).length)) {
        setStatus('No word search results. Trying reference search...');
        const referenceData = await postSearch('reference', query, options);

        if (Number(referenceData.count || 0) === 0 || !(referenceData.items || []).length) {
          renderResults(referenceData);
          setStatus('No word or reference matches found.', true);
          return;
        }

        renderResults(referenceData);
        setStatus('Reference search results.');
        return;
      }

      renderResults(data);
      setStatus(intent === 'reference' ? 'Reference search results.' : 'Word search results.');
    } catch (error) {
      setStatus(error.message || 'Search failed.', true);
      renderResults({ items: [] });
    } finally {
      setLoading(false);
    }
  }

  const highlightToggle = document.getElementById('highlightMatches');
  const redLetterToggle = document.getElementById('showRedLetters');
  const referenceLinkToggle = document.getElementById('showReferenceLinks');

  function rerenderForDisplayChange() {
    updateUrlDisplayState();
    updateDisplayOptionsVisibility();
    if (lastResultsData) {
      const isReadingView = Boolean(document.querySelector('.reading-view')) || lastResultsData?.recommended_view === 'reading';
      if (isReadingView) {
        const activeQuery = (input && input.value.trim()) || window.__INITIAL_QUERY__ || new URLSearchParams(window.location.search).get('q') || '';
        if (activeQuery) {
          runSearch(looksLikeReferenceQuery(activeQuery) ? 'reference' : 'search');
          return;
        }
      }
      renderResults(applyReferenceModeToData({ ...lastResultsData }));
    }
  }

  if (highlightToggle) {
    highlightToggle.addEventListener('change', rerenderForDisplayChange);
  }

  if (redLetterToggle) {
    redLetterToggle.addEventListener('change', rerenderForDisplayChange);
  }

  if (referenceLinkToggle) {
    referenceLinkToggle.addEventListener('change', rerenderForDisplayChange);
  }

  if (referenceStyle) {
    referenceStyle.addEventListener('change', rerenderForDisplayChange);
    referenceStyle.addEventListener('input', rerenderForDisplayChange);
  }

  if (referencePosition) {
    referencePosition.addEventListener('change', rerenderForDisplayChange);
    referencePosition.addEventListener('input', rerenderForDisplayChange);
  }

  if (inlineVerseNumbersToggle) {
    inlineVerseNumbersToggle.addEventListener('change', () => {
      updateUrlDisplayState();
      updateInlineVerseNumberVisibility();
      if (lastResultsData) {
        renderResults(lastResultsData);
      }
    });
  }

  if (granularitySelect) {
    const syncGranularityDisplay = () => {
      updateUrlDisplayState();
      syncInlineVerseRowDisplay();
      updateInlineVerseNumberVisibility();

      const currentQuery = input?.value.trim() || '';
      if (currentQuery) {
        runSearch(looksLikeReferenceQuery(currentQuery) ? 'reference' : 'search');
        return;
      }

      if (lastResultsData) {
        renderResults(lastResultsData);
      }
    };

    granularitySelect.addEventListener('change', syncGranularityDisplay);
    granularitySelect.addEventListener('input', syncGranularityDisplay);
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const nextTheme = document.body.classList.contains('dark') ? 'light' : 'dark';
      localStorage.setItem('bibleapp-theme', nextTheme);
      applyTheme(nextTheme);
    });
  }

  if (copyButton) {
    copyButton.addEventListener('click', async () => {
      try {
        await copyResults();
      } catch (error) {
        setStatus(error.message || 'Copy failed.', true);
      }
    });
  }

  if (exportButton) {
    exportButton.addEventListener('click', async () => {
      try {
        await exportResults();
      } catch (error) {
        setStatus(error.message || 'Export failed.', true);
      }
    });
  }

  if (form) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      runSearch('search');
    });
  }

  if (searchButton) {
    searchButton.addEventListener('click', () => runSearch('search'));
  }

  if (referenceButton) {
    referenceButton.addEventListener('click', () => runSearch('reference'));
  }

  if (input) {
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        runSearch('search');
      }
    });
  }

  accordionToggles.forEach((toggle) => {
    toggle.addEventListener('click', () => {
      const targetId = toggle.getAttribute('data-target');
      const panel = targetId ? document.getElementById(targetId) : null;
      const arrow = toggle.querySelector('.accordion-arrow');
      if (!panel || !arrow) return;

      const willCollapse = !panel.classList.contains('collapsed');
      panel.classList.toggle('collapsed', willCollapse);
      panel.dataset.expandedByUser = String(!willCollapse);
      toggle.setAttribute('aria-expanded', String(!willCollapse));
      arrow.textContent = willCollapse ? '▸' : '▾';
    });
  });

  updateInlineVerseNumberVisibility();
  initTheme();
  syncAccordionState();
  window.addEventListener('scroll', handleReadingScrollAutoLoad, { passive: true });
  window.addEventListener('wheel', handleReadingWheelAutoLoad, { passive: true });
  document.addEventListener('keydown', handleReadingKeyboardAutoLoad);
  window.addEventListener('resize', () => {
    const isMobile = window.matchMedia('(max-width: 640px)').matches;
    if (!isMobile) {
      accordionToggles.forEach((toggle) => {
        const targetId = toggle.getAttribute('data-target');
        const panel = targetId ? document.getElementById(targetId) : null;
        const arrow = toggle.querySelector('.accordion-arrow');
        if (!panel || !arrow) return;
        panel.classList.remove('collapsed');
        panel.dataset.expandedByUser = 'true';
        toggle.setAttribute('aria-expanded', 'true');
        arrow.textContent = '▾';
      });
    } else {
      syncAccordionState();
    }
  });

  const initialQuery = window.__INITIAL_QUERY__ || new URLSearchParams(window.location.search).get('q') || '';
  const defaultReadSettings = {
    granularity: granularitySelect ? granularitySelect.value : 'Verse',
    highlight: Boolean(highlightToggle ? highlightToggle.checked : true),
    showRedLetters: Boolean(redLetterToggle ? redLetterToggle.checked : true),
    showReferenceLinks: Boolean(referenceLinkToggle ? referenceLinkToggle.checked : false),
    newLineVerse: Boolean(inlineVerseNumbersToggle ? inlineVerseNumbersToggle.checked : false),
    reference_style: referenceStyle ? referenceStyle.value : 'Wikilink',
    reference_position: referencePosition ? referencePosition.value : 'Ref First'
  };
  const urlSettings = getUrlReadSettings(defaultReadSettings);
  const normalizedInitialQuery = normalizeInitialReadingQuery(initialQuery, urlSettings);
  if (granularitySelect && urlSettings.granularity) {
    granularitySelect.value = urlSettings.granularity;
  }
  if (highlightToggle && new URLSearchParams(window.location.search).has('highlight')) {
    highlightToggle.checked = urlSettings.highlight;
  }
  if (redLetterToggle && new URLSearchParams(window.location.search).has('showRedLetters')) {
    redLetterToggle.checked = urlSettings.showRedLetters;
  }
  if (referenceLinkToggle && new URLSearchParams(window.location.search).has('showReferenceLinks')) {
    referenceLinkToggle.checked = urlSettings.showReferenceLinks;
  }
  if (referenceStyle) {
    const referenceStyleQuery = new URLSearchParams(window.location.search).get('reference_style');
    if (referenceStyleQuery && ['Wikilink', 'Standard'].includes(referenceStyleQuery)) {
      referenceStyle.value = referenceStyleQuery;
    }
  }
  if (referencePosition) {
    const referencePositionQuery = new URLSearchParams(window.location.search).get('reference_position');
    if (referencePositionQuery && ['Ref First', 'Ref Last'].includes(referencePositionQuery)) {
      referencePosition.value = referencePositionQuery;
    }
  }
  if (inlineVerseNumbersToggle && new URLSearchParams(window.location.search).has('newLineVerse')) {
    inlineVerseNumbersToggle.checked = Boolean(urlSettings.newLineVerse);
  }
  updateInlineVerseNumberVisibility();

  if (normalizedInitialQuery) {
    input.value = normalizedInitialQuery;
    const searchIntent = looksLikeReferenceQuery(normalizedInitialQuery) ? 'reference' : 'search';
    runSearch(searchIntent);
  }

  setStatus('Ready.');
});
