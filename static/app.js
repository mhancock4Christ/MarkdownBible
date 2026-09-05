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
  const wholeWord = document.getElementById('wholeWord');
  const caseSensitive = document.getElementById('caseSensitive');
  const suppressParagraphs = document.getElementById('suppressParagraphs');
  const accordionToggles = document.querySelectorAll('.accordion-toggle');
  const themeToggle = document.getElementById('themeToggle');
  const exportFormat = document.getElementById('exportFormat');
  const copyButton = document.getElementById('copyButton');
  const exportButton = document.getElementById('exportButton');
  let lastResultsData = null;
  let readingNavigationState = {
    entries: [],
    loading: false,
    lastScrollY: window.scrollY
  };

  function buildReferenceUrl(reference) {
    const query = typeof reference === 'string' ? reference.trim() : '';
    if (!query) return '#';

    const url = new URL(window.location.href);
    url.pathname = '/';
    url.search = new URLSearchParams({ q: query }).toString();
    return url.toString();
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
      whole_word: Boolean(wholeWord && wholeWord.checked),
      case_sensitive: Boolean(caseSensitive && caseSensitive.checked),
      reference_style: referenceStyle ? referenceStyle.value : 'Wikilink',
      granularity: granularity ? granularity.value : 'Verse',
      reference_position: referencePosition ? referencePosition.value : 'Ref First',
      suppress_paragraph: Boolean(suppressParagraphs && suppressParagraphs.checked),
      context_window: Number.isFinite(contextValue) ? contextValue : 0
    };
  }

  function getDisplayOptions() {
    const highlightCheckbox = document.getElementById('highlightMatches');
    const redLetterCheckbox = document.getElementById('showRedLetters');

    return {
      highlight: Boolean(highlightCheckbox && highlightCheckbox.checked),
      show_red_letters: Boolean(redLetterCheckbox && redLetterCheckbox.checked)
    };
  }

  function setStatus(message, isError = false) {
    if (!status) return;
    status.textContent = message || '';
    status.classList.toggle('error', isError);
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
      const node = document.createElement('span');
      if (highlighted) node.classList.add('highlight-match');
      if (red) node.classList.add('red-letter');
      node.textContent = sliceText;
      fragment.appendChild(node);
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

  function renderReadingParagraphs(item) {
    const container = document.createElement('div');
    container.className = 'reading-paragraphs';

    const paragraphs = Array.isArray(item?.paragraphs) ? item.paragraphs : [];
    if (!paragraphs.length) {
      const empty = document.createElement('p');
      empty.textContent = 'No text available for this chapter.';
      container.appendChild(empty);
      return container;
    }

    paragraphs.forEach((paragraph) => {
      const paragraphEl = document.createElement('p');
      if (!Array.isArray(paragraph)) {
        paragraphEl.textContent = String(paragraph ?? '');
        container.appendChild(paragraphEl);
        return;
      }

      paragraph.forEach((verse) => {
        const verseText = String(verse?.text ?? '');
        if (verseText) {
          const verseEl = document.createElement('span');
          verseEl.textContent = `${verseText} `;
          paragraphEl.appendChild(verseEl);
        }
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

    const nav = document.createElement('div');
    nav.className = 'chapter-nav';

    const prevRef = items[0]?.nav?.previous;
    const nextRef = items[items.length - 1]?.nav?.next;

    const prevButton = document.createElement('button');
    prevButton.type = 'button';
    prevButton.className = 'chapter-nav-button';
    prevButton.textContent = 'Previous chapter';
    prevButton.disabled = !prevRef || readingNavigationState.loading;
    prevButton.addEventListener('click', () => {
      if (prevRef) {
        loadReadingChapter('previous');
      }
    });

    const currentLabel = document.createElement('h2');
    currentLabel.textContent = items[0]?.reference || 'Reading';

    const nextButton = document.createElement('button');
    nextButton.type = 'button';
    nextButton.className = 'chapter-nav-button';
    nextButton.textContent = 'Next chapter';
    nextButton.disabled = !nextRef || readingNavigationState.loading;
    nextButton.addEventListener('click', () => {
      if (nextRef) {
        loadReadingChapter('next');
      }
    });

    nav.appendChild(prevButton);
    nav.appendChild(currentLabel);
    nav.appendChild(nextButton);
    wrapper.appendChild(nav);

    items.forEach((item) => {
      const chapterBlock = document.createElement('article');
      chapterBlock.className = 'reading-item';

      const chapterTitle = document.createElement('h3');
      chapterTitle.textContent = item.reference || 'Reference';
      chapterBlock.appendChild(chapterTitle);

      const navInline = document.createElement('div');
      navInline.className = 'chapter-inline-nav';
      if (item.nav?.previous) {
        const prevBtn = document.createElement('button');
        prevBtn.type = 'button';
        prevBtn.textContent = '← Previous';
        prevBtn.addEventListener('click', () => loadReadingChapter('previous'));
        navInline.appendChild(prevBtn);
      }
      if (item.nav?.next) {
        const nextBtn = document.createElement('button');
        nextBtn.type = 'button';
        nextBtn.textContent = 'Next →';
        nextBtn.addEventListener('click', () => loadReadingChapter('next'));
        navInline.appendChild(nextBtn);
      }
      if (navInline.childElementCount > 0) {
        chapterBlock.appendChild(navInline);
      }

      chapterBlock.appendChild(renderReadingParagraphs(item));
      wrapper.appendChild(chapterBlock);
    });

    results.appendChild(wrapper);
  }

  async function loadReadingChapter(direction) {
    const entries = readingNavigationState.entries || [];
    if (!entries.length || readingNavigationState.loading) return;

    const targetRef = direction === 'next'
      ? entries[entries.length - 1]?.nav?.next
      : entries[0]?.nav?.previous;

    if (!targetRef) return;

    readingNavigationState.loading = true;
    try {
      const data = await postSearch('reference', targetRef, getSearchOptions());
      const nextEntries = Array.isArray(data?.reading_items) ? data.reading_items : [];
      if (!nextEntries.length) return;

      if (direction === 'next') {
        readingNavigationState.entries = [...entries, ...nextEntries];
      } else {
        readingNavigationState.entries = [...nextEntries, ...entries];
      }

      renderReadingView({ reading_items: readingNavigationState.entries });
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
    const scrollingUp = window.scrollY < readingNavigationState.lastScrollY;
    const atTop = window.scrollY <= 24;
    const nearBottom = window.innerHeight + window.scrollY >= document.body.scrollHeight - 250;

    if (nearBottom && nextRef && !readingNavigationState.loading) {
      loadReadingChapter('next');
    } else if (atTop && scrollingUp && previousRef && !readingNavigationState.loading) {
      loadReadingChapter('previous');
    }

    readingNavigationState.lastScrollY = window.scrollY;
  }

  function renderResults(data) {
    lastResultsData = data || null;
    readingNavigationState.entries = [];
    if (!results) return;
    results.innerHTML = '';

    if (data && data.recommended_view === 'reading' && Array.isArray(data.reading_items) && data.reading_items.length) {
      renderReadingView(data);
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

    items.forEach((item) => {
      const li = document.createElement('li');
      const reference = item.reference || 'Reference';
      const link = document.createElement('a');
      link.href = buildReferenceUrl(reference);
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.className = 'result-reference';

      const strong = document.createElement('strong');
      strong.textContent = reference;
      link.appendChild(strong);

      const verse = document.createElement('span');
      verse.className = 'verse-text';

      const separator = document.createTextNode(' — ');
      verse.appendChild(createStyledVerseNode(item, displayOptions));

      li.appendChild(link);
      li.appendChild(separator);
      li.appendChild(verse);
      list.appendChild(li);
    });

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

  async function copyResults() {
    const items = Array.isArray(lastResultsData?.items) ? lastResultsData.items : [];
    if (!items.length) {
      setStatus('No results to copy.', true);
      return;
    }

    const text = items
      .map((item) => {
        const reference = item?.reference || '';
        const verseText = item?.verse_text || '';
        return [reference, verseText].filter(Boolean).join(' ');
      })
      .join('\n');

    if (!navigator.clipboard || !window.isSecureContext) {
      const fallback = document.createElement('textarea');
      fallback.value = text;
      document.body.appendChild(fallback);
      fallback.select();
      document.execCommand('copy');
      fallback.remove();
      setStatus('Copied results to clipboard.');
      return;
    }

    await navigator.clipboard.writeText(text);
    setStatus('Copied results to clipboard.');
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

    const options = getSearchOptions();

    setLoading(true);
    setStatus(intent === 'reference' ? 'Searching reference...' : 'Searching words...');

    try {
      const data = await postSearch(intent, query, options);

      if (intent === 'search' && (Number(data.count || 0) === 0 || !(data.items || []).length)) {
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

  if (highlightToggle) {
    highlightToggle.addEventListener('change', () => {
      if (lastResultsData) {
        renderResults(lastResultsData);
      }
    });
  }

  if (redLetterToggle) {
    redLetterToggle.addEventListener('change', () => {
      if (lastResultsData) {
        renderResults(lastResultsData);
      }
    });
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

  initTheme();
  syncAccordionState();
  window.addEventListener('scroll', handleReadingScrollAutoLoad, { passive: true });
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
  if (initialQuery) {
    input.value = initialQuery;
    runSearch('search');
  }

  setStatus('Ready.');
});
