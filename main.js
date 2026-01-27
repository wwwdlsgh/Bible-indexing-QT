const bookSelect = document.getElementById('bookSelect');
const chapterSelect = document.getElementById('chapterSelect');
const verseSelect = document.getElementById('verseSelect');
const verseDisplay = document.getElementById('verseDisplay');

let bibleData;

fetch('./HolyBibleKRV.json')
  .then(response => response.json())
  .then(data => {
    bibleData = data;
    populateBookSelect();
  });

function populateBookSelect() {
  bibleData.forEach(book => {
    const option = document.createElement('option');
    option.value = book.bcode;
    option.textContent = book.name;
    bookSelect.appendChild(option);
  });
  bookSelect.addEventListener('change', () => {
    populateChapterSelect();
    populateVerseSelect();
    displayVerse();
  });
  populateChapterSelect();
  populateVerseSelect();
  displayVerse();
}

function populateChapterSelect() {
  const selectedBook = bibleData.find(book => book.bcode == bookSelect.value);
  chapterSelect.innerHTML = '';
  for (let i = 1; i <= Object.keys(selectedBook.chapters).length; i++) {
    const option = document.createElement('option');
    option.value = i;
    option.textContent = i;
    chapterSelect.appendChild(option);
  }
  chapterSelect.addEventListener('change', () => {
    populateVerseSelect();
    displayVerse();
  });
}

function populateVerseSelect() {
  const selectedBook = bibleData.find(book => book.bcode == bookSelect.value);
  const selectedChapter = selectedBook.chapters[chapterSelect.value];
  verseSelect.innerHTML = '';
  for (let i = 1; i <= Object.keys(selectedChapter).length; i++) {
    const option = document.createElement('option');
    option.value = i;
    option.textContent = i;
    verseSelect.appendChild(option);
  }
  verseSelect.addEventListener('change', displayVerse);
}

function displayVerse() {
  const selectedBook = bibleData.find(book => book.bcode == bookSelect.value);
  const selectedChapter = selectedBook.chapters[chapterSelect.value];
  const selectedVerse = selectedChapter[verseSelect.value];
  verseDisplay.textContent = selectedVerse;
}
