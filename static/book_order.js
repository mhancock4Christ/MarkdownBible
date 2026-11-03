document.addEventListener('DOMContentLoaded', () => {
  const books = [
    { name: 'Genesis', category: 'law' },
    { name: 'Exodus', category: 'law' },
    { name: 'Leviticus', category: 'law' },
    { name: 'Numbers', category: 'law' },
    { name: 'Deuteronomy', category: 'law' },
    { name: 'Joshua', category: 'history' },
    { name: 'Judges', category: 'history' },
    { name: 'Ruth', category: 'history' },
    { name: '1 Samuel', category: 'history' },
    { name: '2 Samuel', category: 'history' },
    { name: '1 Kings', category: 'history' },
    { name: '2 Kings', category: 'history' },
    { name: '1 Chronicles', category: 'history' },
    { name: '2 Chronicles', category: 'history' },
    { name: 'Ezra', category: 'history' },
    { name: 'Nehemiah', category: 'history' },
    { name: 'Esther', category: 'history' },
    { name: 'Job', category: 'poetry' },
    { name: 'Psalms', category: 'poetry' },
    { name: 'Proverbs', category: 'poetry' },
    { name: 'Ecclesiastes', category: 'poetry' },
    { name: 'Song of Solomon', category: 'poetry' },
    { name: 'Isaiah', category: 'prophets' },
    { name: 'Jeremiah', category: 'prophets' },
    { name: 'Lamentations', category: 'prophets' },
    { name: 'Ezekiel', category: 'prophets' },
    { name: 'Daniel', category: 'prophets' },
    { name: 'Hosea', category: 'prophets' },
    { name: 'Joel', category: 'prophets' },
    { name: 'Amos', category: 'prophets' },
    { name: 'Obadiah', category: 'prophets' },
    { name: 'Jonah', category: 'prophets' },
    { name: 'Micah', category: 'prophets' },
    { name: 'Nahum', category: 'prophets' },
    { name: 'Habakkuk', category: 'prophets' },
    { name: 'Zephaniah', category: 'prophets' },
    { name: 'Haggai', category: 'prophets' },
    { name: 'Zechariah', category: 'prophets' },
    { name: 'Malachi', category: 'prophets' },
    { name: 'Matthew', category: 'gospels' },
    { name: 'Mark', category: 'gospels' },
    { name: 'Luke', category: 'gospels' },
    { name: 'John', category: 'gospels' },
    { name: 'Acts', category: 'history' },
    { name: 'Romans', category: 'epistles' },
    { name: '1 Corinthians', category: 'epistles' },
    { name: '2 Corinthians', category: 'epistles' },
    { name: 'Galatians', category: 'epistles' },
    { name: 'Ephesians', category: 'epistles' },
    { name: 'Philippians', category: 'epistles' },
    { name: 'Colossians', category: 'epistles' },
    { name: '1 Thessalonians', category: 'epistles' },
    { name: '2 Thessalonians', category: 'epistles' },
    { name: '1 Timothy', category: 'epistles' },
    { name: '2 Timothy', category: 'epistles' },
    { name: 'Titus', category: 'epistles' },
    { name: 'Philemon', category: 'epistles' },
    { name: 'Hebrews', category: 'epistles' },
    { name: 'James', category: 'epistles' },
    { name: '1 Peter', category: 'epistles' },
    { name: '2 Peter', category: 'epistles' },
    { name: '1 John', category: 'epistles' },
    { name: '2 John', category: 'epistles' },
    { name: '3 John', category: 'epistles' },
    { name: 'Jude', category: 'epistles' },
    { name: 'Revelation', category: 'prophets' }
  ];
  const storageKey = 'bibleapp-book-order-results';
  const cloud = document.getElementById('bookCloud');
  const orderedBooks = document.getElementById('orderedBooks');
  const status = document.getElementById('gameStatus');
  const alert = document.getElementById('gameAlert');
  const timer = document.getElementById('gameTimer');
  const progress = document.getElementById('gameProgress');
  const mistakesDisplay = document.getElementById('gameMistakes');
  const cloudCount = document.getElementById('cloudCount');
  const playerName = document.getElementById('playerName');
  const savedResults = document.getElementById('savedResults');
  const restartButton = document.getElementById('restartGame');
  const clearResultsButton = document.getElementById('clearResults');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let nextBook = 0;
  let mistakes = 0;
  let startedAt = null;
  let timerInterval = null;
  let audioContext = null;
  let finished = false;
  let results = [];
  let cloudOrder = [];

  function showAlert(message) {
    alert.textContent = message;
  }

  function formatTime(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  function playTone(isCorrect) {
    const AudioContextType = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextType) return;
    try {
      audioContext = audioContext || new AudioContextType();
      if (audioContext.state === 'suspended') {
        audioContext.resume().catch((error) => showAlert(`Audio feedback is unavailable: ${error.message}`));
      }
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const now = audioContext.currentTime;
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(isCorrect ? 660 : 190, now);
      if (isCorrect) oscillator.frequency.setValueAtTime(880, now + 0.1);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.16, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + (isCorrect ? 0.22 : 0.18));
      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.start(now);
      oscillator.stop(now + (isCorrect ? 0.23 : 0.19));
    } catch (error) {
      showAlert(`Audio feedback is unavailable: ${error.message}`);
    }
  }

  function startTimer() {
    if (startedAt !== null) return;
    startedAt = Date.now();
    timerInterval = window.setInterval(() => {
      timer.textContent = formatTime(Date.now() - startedAt);
    }, 250);
  }

  function saveResults() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(results));
      showAlert('');
    } catch (error) {
      showAlert(`Your game is complete, but results could not be saved in this browser: ${error.message}`);
    }
  }

  function renderResults() {
    savedResults.replaceChildren();
    if (!results.length) {
      const empty = document.createElement('p');
      empty.className = 'learn-empty-results';
      empty.textContent = 'Finish a game to see your results here.';
      savedResults.append(empty);
      return;
    }

    const table = document.createElement('table');
    table.className = 'learn-results-table';
    const head = table.createTHead().insertRow();
    ['Name', 'Time', 'Mistakes', 'Date'].forEach((label) => {
      const cell = document.createElement('th');
      cell.scope = 'col';
      cell.textContent = label;
      head.append(cell);
    });
    const body = table.createTBody();
    results.forEach((result) => {
      const row = body.insertRow();
      [result.name || 'Guest', formatTime(result.elapsedMs), String(result.mistakes), new Date(result.completedAt).toLocaleDateString()].forEach((value) => {
        const cell = row.insertCell();
        cell.textContent = value;
      });
    });
    savedResults.append(table);
  }

  function loadResults() {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          results = parsed.filter((result) =>
            result &&
            typeof result.name === 'string' &&
            Number.isFinite(result.elapsedMs) &&
            Number.isFinite(result.mistakes) &&
            typeof result.completedAt === 'string'
          ).slice(0, 10);
        }
      }
    } catch (error) {
      showAlert(`Saved results could not be read from this browser: ${error.message}`);
    }
    renderResults();
  }

  function renderCloud() {
    cloud.replaceChildren();
    const remaining = cloudOrder.filter((bookIndex) => bookIndex >= nextBook);
    remaining.forEach((bookIndex, index) => {
      const book = books[bookIndex];
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `book-cloud-item category-${book.category}`;
      button.textContent = book.name;
      button.dataset.bookIndex = String(bookIndex);
      button.style.setProperty('--cloud-size', `${0.92 + ((bookIndex + index) % 4) * 0.06}rem`);
      button.addEventListener('click', () => selectBook(bookIndex, button));
      cloud.append(button);
    });
    cloudCount.textContent = `${remaining.length} ${remaining.length === 1 ? 'book' : 'books'}`;
  }

  function updateProgress() {
    progress.textContent = `${nextBook} / ${books.length}`;
    mistakesDisplay.textContent = String(mistakes);
    renderCloud();
  }

  function completeGame() {
    finished = true;
    window.clearInterval(timerInterval);
    const elapsedMs = Date.now() - startedAt;
    timer.textContent = formatTime(elapsedMs);
    const result = {
      name: playerName.value.trim().slice(0, 32),
      elapsedMs,
      mistakes,
      completedAt: new Date().toISOString()
    };
    results.unshift(result);
    results = results.slice(0, 10);
    saveResults();
    renderResults();
    status.textContent = `Wonderful! You put all 66 books in order in ${formatTime(elapsedMs)} with ${mistakes} ${mistakes === 1 ? 'mistake' : 'mistakes'}.`;
    playTone(true);
  }

  function selectBook(index, button) {
    if (finished) return;
    startTimer();
    if (index !== nextBook) {
      mistakes += 1;
      mistakesDisplay.textContent = String(mistakes);
      button.classList.remove('book-cloud-wrong');
      if (!reducedMotion) void button.offsetWidth;
      button.classList.add('book-cloud-wrong');
      status.textContent = `Not quite. ${books[nextBook].name} is the next book.`;
      playTone(false);
      return;
    }

    playTone(true);
    const item = document.createElement('li');
    item.className = `ordered-book category-${books[index].category}`;
    const number = document.createElement('span');
    number.className = 'ordered-book-number';
    number.textContent = String(index + 1);
    const name = document.createElement('span');
    name.textContent = books[index].name;
    item.append(number, name);
    orderedBooks.append(item);
    orderedBooks.scrollTop = orderedBooks.scrollHeight;
    nextBook += 1;
    updateProgress();
    if (nextBook === books.length) {
      completeGame();
    } else {
      status.textContent = `${books[index].name} is in place. Keep going!`;
    }
  }

  function resetGame() {
    window.clearInterval(timerInterval);
    nextBook = 0;
    mistakes = 0;
    startedAt = null;
    timerInterval = null;
    finished = false;
    cloudOrder = books.map((_, index) => index);
    for (let index = cloudOrder.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [cloudOrder[index], cloudOrder[swapIndex]] = [cloudOrder[swapIndex], cloudOrder[index]];
    }
    timer.textContent = '00:00';
    orderedBooks.replaceChildren();
    status.textContent = 'Choose a book to begin. The timer starts with your first pick.';
    updateProgress();
  }

  restartButton.addEventListener('click', resetGame);
  clearResultsButton.addEventListener('click', () => {
    results = [];
    try {
      localStorage.removeItem(storageKey);
    } catch (error) {
      showAlert(`Saved results could not be cleared: ${error.message}`);
      return;
    }
    renderResults();
  });
  playerName.addEventListener('input', () => {
    try {
      localStorage.setItem('bibleapp-book-order-name', playerName.value.slice(0, 32));
    } catch (error) {
      showAlert(`Your name could not be saved in this browser: ${error.message}`);
    }
  });
  try {
    playerName.value = localStorage.getItem('bibleapp-book-order-name') || '';
  } catch (error) {
    showAlert(`Your saved name could not be read from this browser: ${error.message}`);
  }

  loadResults();
  resetGame();
});
