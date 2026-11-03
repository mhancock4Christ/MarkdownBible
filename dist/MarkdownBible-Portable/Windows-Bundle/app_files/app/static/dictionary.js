document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('dictionarySearchForm');
  const input = document.getElementById('dictionarySearchInput');
  const searchButton = document.getElementById('dictionarySearchButton');
  const status = document.getElementById('dictionaryStatus');
  const results = document.getElementById('dictionaryResults');
  const loadMoreButton = document.getElementById('dictionaryLoadMore');
  const themeToggle = document.getElementById('themeToggle');
  const pageSize = 50;
  let currentQuery = '';
  let currentOffset = 0;
  let currentTotal = 0;
  let latestRequest = 0;

  function appendText(parent, tagName, className, text) {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    element.textContent = text;
    parent.append(element);
    return element;
  }

  function renderEntry(word) {
    const article = document.createElement('article');
    article.className = 'dictionary-entry';
    appendText(
      article,
      'h3',
      'dictionary-headword',
      word.headword.charAt(0).toLocaleUpperCase() + word.headword.slice(1)
    );

    const definitions = word.definitions;
    const first = definitions[0];
    const hasHeadwordPreface = Boolean(first?.is_headword_preface);
    if (first?.part_of_speech) {
      const heading = document.createElement('p');
      heading.className = 'dictionary-entry-heading';
      const headword = document.createElement('strong');
      headword.textContent = word.headword.toLocaleUpperCase();
      heading.append(headword, ', ');
      const partOfSpeech = document.createElement('em');
      partOfSpeech.textContent = first.part_of_speech;
      heading.append(partOfSpeech);

      if (hasHeadwordPreface && first.definition) {
        heading.append(document.createTextNode(` ${first.definition}`));
      }
      if (first.etymology) {
        heading.append(document.createTextNode(` ${first.etymology}`));
      }
      article.append(heading);
      if (hasHeadwordPreface && first.notes.length) {
        appendText(article, 'p', 'dictionary-meta', first.notes.join(' '));
      }
      if (hasHeadwordPreface && first.languages.length) {
        appendText(article, 'p', 'dictionary-meta', `Languages: ${first.languages.join(', ')}`);
      }
    }

    const numberedDefinitions = hasHeadwordPreface
      ? definitions.slice(1)
      : definitions;
    const definitionList = document.createElement('ol');
    definitionList.className = 'dictionary-definition-list';
    numberedDefinitions.forEach((entry, index) => {
      const item = document.createElement('li');
      item.className = 'dictionary-definition-item';
      appendText(item, 'p', 'dictionary-definition', entry.definition || '');

      if (entry.etymology && !(index === 0 && entry === first)) {
        appendText(item, 'p', 'dictionary-etymology', entry.etymology);
      }
      if (entry.notes.length) {
        appendText(item, 'p', 'dictionary-meta', entry.notes.join(' '));
      }
      if (entry.languages.length) {
        appendText(item, 'p', 'dictionary-meta', `Languages: ${entry.languages.join(', ')}`);
      }
      definitionList.append(item);
    });
    if (numberedDefinitions.length) {
      definitionList.start = 1;
      article.append(definitionList);
    }

    results.append(article);
  }

  async function search(query, append = false) {
    if (!query.trim()) {
      status.textContent = 'Enter a word to search.';
      return;
    }

    const requestId = ++latestRequest;
    if (!append) {
      currentQuery = query.trim();
      currentOffset = 0;
      results.replaceChildren();
    }
    status.textContent = 'Searching…';
    searchButton.disabled = true;
    loadMoreButton.disabled = true;

    try {
      const params = new URLSearchParams({
        q: currentQuery,
        limit: String(pageSize),
        offset: String(currentOffset)
      });
      const response = await fetch(`/api/dictionary/search?${params}`);
      const data = await response.json();
      if (requestId !== latestRequest) return;
      if (!response.ok) {
        throw new Error(data.detail || 'The dictionary search failed.');
      }

      data.results.forEach(renderEntry);
      currentOffset += data.results.length;
      currentTotal = data.total;
      status.textContent = data.total
        ? `Showing ${currentOffset} of ${data.total} words (${data.definition_count} definitions loaded) for "${data.query}".`
        : `No definitions found for "${data.query}".`;
      loadMoreButton.hidden = currentOffset >= currentTotal;
      history.replaceState(null, '', `?q=${encodeURIComponent(currentQuery)}`);
    } catch (error) {
      if (requestId !== latestRequest) return;
      status.textContent = error.message || 'The dictionary search failed.';
      loadMoreButton.hidden = true;
    } finally {
      if (requestId === latestRequest) {
        searchButton.disabled = false;
        loadMoreButton.disabled = false;
      }
    }
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    search(input.value);
  });
  loadMoreButton.addEventListener('click', () => search(currentQuery, true));

  const isDark = document.body.classList.contains('dark');
  themeToggle.textContent = isDark ? 'Light mode' : 'Dark mode';
  themeToggle.setAttribute('aria-pressed', String(isDark));
  themeToggle.addEventListener('click', () => {
    const nextTheme = document.body.classList.contains('dark') ? 'light' : 'dark';
    document.body.classList.toggle('dark', nextTheme === 'dark');
    localStorage.setItem('bibleapp-theme', nextTheme);
    themeToggle.textContent = nextTheme === 'dark' ? 'Light mode' : 'Dark mode';
    themeToggle.setAttribute('aria-pressed', String(nextTheme === 'dark'));
  });

  if (input.value.trim()) {
    search(input.value);
  }
});
