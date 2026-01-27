let bibleData = {}; // This will hold the loaded Bible data

document.addEventListener('DOMContentLoaded', () => {
  const bookSelect = document.getElementById('bookSelect');
  const chapterSelect = document.getElementById('chapterSelect');
  const verseSelect = document.getElementById('verseSelect');
  const verseDisplay = document.getElementById('verseDisplay');

  // Function to load the Bible data
  async function loadBibleData() {
    try {
      // User must place HolyBibleKRV.json in the root directory of the project
      // You can download it from: https://github.com/scj-peter/HolyBibleKRV
      const response = await fetch('HolyBibleKRV.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      bibleData = await response.json();
      console.log('Bible data loaded successfully.');
      populateBooks();
    } catch (error) {
      console.error('Error loading Bible data:', error);
      verseDisplay.innerHTML = `
        <p style="color: red;">
          Error loading Bible data. Please ensure 'HolyBibleKRV.json' is in the project root directory.
          You can download it from <a href="https://github.com/scj-peter/HolyBibleKRV" target="_blank">here</a>.
        </p>
      `;
    }
  }

  // Populate Book dropdown
  function populateBooks() {
    bookSelect.innerHTML = '<option value="">Select Book</option>';
    if (bibleData && Object.keys(bibleData).length > 0) {
      Object.keys(bibleData).forEach(bookName => {
        const option = document.createElement('option');
        option.value = bookName;
        option.textContent = bookName;
        bookSelect.appendChild(option);
      });
      bookSelect.disabled = false;
    }
  }

  // Populate Chapter dropdown
  function populateChapters(bookName) {
    chapterSelect.innerHTML = '<option value="">Select Chapter</option>';
    verseSelect.innerHTML = '<option value="">Select Verse</option>';
    verseSelect.disabled = true;
    chapterSelect.disabled = true;

    if (bookName && bibleData[bookName]) {
      const numChapters = bibleData[bookName].length;
      for (let i = 1; i <= numChapters; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        chapterSelect.appendChild(option);
      }
      chapterSelect.disabled = false;
    }
  }

  // Populate Verse dropdown
  function populateVerses(bookName, chapterNum) {
    verseSelect.innerHTML = '<option value="">Select Verse</option>';
    verseSelect.disabled = true;

    if (bookName && chapterNum && bibleData[bookName] && bibleData[bookName][chapterNum - 1]) {
      const numVerses = bibleData[bookName][chapterNum - 1].length;
      for (let i = 1; i <= numVerses; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        verseSelect.appendChild(option);
      }
      verseSelect.disabled = false;
    }
  }

  // Display verses
  function displayVerses(bookName, chapterNum, selectedVerseNum) {
    verseDisplay.innerHTML = '';
    if (!bookName || !chapterNum || !selectedVerseNum) {
      return;
    }

    const chapter = bibleData[bookName][chapterNum - 1];
    if (!chapter) {
      verseDisplay.innerHTML = `<p style="color: red;">Chapter not found.</p>`;
      return;
    }

    const selectedVerseIndex = selectedVerseNum - 1;
    const startVerseIndex = Math.max(0, selectedVerseIndex - 2);
    const endVerseIndex = Math.min(chapter.length - 1, selectedVerseIndex + 2);

    for (let i = startVerseIndex; i <= endVerseIndex; i++) {
      const verseElement = document.createElement('p');
      const verseNumber = i + 1;
      const verseText = chapter[i];

      verseElement.classList.add('verse');
      if (verseNumber === selectedVerseNum) {
        verseElement.classList.add('normal-verse');
      } else {
        verseElement.classList.add('light-verse');
      }
      verseElement.innerHTML = `<span class="verse-number">${bookName} ${chapterNum}:${verseNumber}</span> ${verseText}`;
      verseDisplay.appendChild(verseElement);
    }
  }

  // Event Listeners
  bookSelect.addEventListener('change', () => {
    const selectedBook = bookSelect.value;
    populateChapters(selectedBook);
    displayVerses('', '', ''); // Clear display when book changes
  });

  chapterSelect.addEventListener('change', () => {
    const selectedBook = bookSelect.value;
    const selectedChapter = chapterSelect.value;
    populateVerses(selectedBook, selectedChapter);
    displayVerses('', '', ''); // Clear display when chapter changes
  });

  verseSelect.addEventListener('change', () => {
    const selectedBook = bookSelect.value;
    const selectedChapter = parseInt(chapterSelect.value);
    const selectedVerse = parseInt(verseSelect.value);
    displayVerses(selectedBook, selectedChapter, selectedVerse);
  });

  // Initial load
  loadBibleData();
});
