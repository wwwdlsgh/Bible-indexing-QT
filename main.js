const bookSelect = document.getElementById('book-select');
const chapterSelect = document.getElementById('chapter-select');
const verseSelect = document.getElementById('verse-select');
const searchButton = document.getElementById('search-button');

const prevVerseButton = document.getElementById('prev-verse-button');
const nextVerseButton = document.getElementById('next-verse-button');

const contextTop = document.getElementById('context-top');
const mainVerseDiv = document.getElementById('main-verse');
const contextBottom = document.getElementById('context-bottom');
const resultContainer = document.getElementById('result-container'); // This is the parent container

let allBooksList = [];
let currentBookData = null;
let currentBookIndex = -1;
let currentChapterIndex = -1;
let currentVerseIndex = -1;

async function fetchBookList() {
  try {
    const response = await fetch('Bible_KRV/books.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    allBooksList = await response.json();
  } catch (error) {
    console.error('Error fetching book list:', error);
    mainVerseDiv.innerHTML = '책 목록을 불러오는 데 실패했습니다.';
    return [];
  }
  return allBooksList;
}

async function populateBookSelect() {
  const books = await fetchBookList();
  bookSelect.innerHTML = '';

  let defaultOption = document.createElement('option');
  defaultOption.value = "";
  defaultOption.textContent = "책을 선택하세요";
  bookSelect.appendChild(defaultOption);

  for (const book of books) {
    const option = document.createElement('option');
    option.value = book;
    option.textContent = book;
    bookSelect.appendChild(option);
  }

  // If there's a book already selected (e.g., after navigation), restore it
  if (currentBookIndex !== -1 && allBooksList[currentBookIndex]) {
      bookSelect.value = allBooksList[currentBookIndex];
  }

  await populateChapterSelect();
}

async function populateChapterSelect() {
  chapterSelect.innerHTML = '';
  verseSelect.innerHTML = '';
  mainVerseDiv.innerHTML = '';
  contextTop.innerHTML = '';
  contextBottom.innerHTML = '';
  prevVerseButton.disabled = true;
  nextVerseButton.disabled = true;

  const selectedBookName = bookSelect.value;
  if (!selectedBookName) {
    let defaultChapterOption = document.createElement('option');
    defaultChapterOption.value = "";
    defaultChapterOption.textContent = "장을 선택하세요";
    chapterSelect.appendChild(defaultChapterOption);
    let defaultVerseOption = document.createElement('option');
    defaultVerseOption.value = "";
    defaultVerseOption.textContent = "절을 선택하세요";
    verseSelect.appendChild(defaultVerseOption);
    currentBookData = null;
    currentBookIndex = -1;
    currentChapterIndex = -1;
    currentVerseIndex = -1;
    return;
  }

  currentBookIndex = allBooksList.indexOf(selectedBookName);

  try {
    const response = await fetch(`Bible_KRV/${selectedBookName}.json`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    currentBookData = await response.json();

    let defaultOption = document.createElement('option');
    defaultOption.value = "";
    defaultOption.textContent = "장을 선택하세요";
    chapterSelect.appendChild(defaultOption);

    currentBookData.chapters.forEach(chap => {
      const option = document.createElement('option');
      option.value = chap.chapter;
      option.textContent = chap.chapter;
      chapterSelect.appendChild(option);
    });

    // If there's a chapter already selected, restore it
    if (currentChapterIndex !== -1 && currentBookData.chapters[currentChapterIndex] && currentBookData.chapters[currentChapterIndex].chapter == chapterSelect.value) {
      // Do nothing, chapterSelect.value is already correct from navigation
    } else if (currentChapterIndex !== -1 && currentBookData.chapters[currentChapterIndex]) {
        chapterSelect.value = currentBookData.chapters[currentChapterIndex].chapter;
    }

    populateVerseSelect();
  } catch (error) {
    console.error('Error fetching book data for chapters:', error);
    mainVerseDiv.innerHTML = '장의 데이터를 불러오는 데 실패했습니다.';
  }
}

function populateVerseSelect() {
  verseSelect.innerHTML = '';
  mainVerseDiv.innerHTML = '';
  contextTop.innerHTML = '';
  contextBottom.innerHTML = '';
  prevVerseButton.disabled = true;
  nextVerseButton.disabled = true;

  const selectedChapterNumber = chapterSelect.value;
  if (!selectedChapterNumber || !currentBookData) {
    let defaultOption = document.createElement('option');
    defaultOption.value = "";
    defaultOption.textContent = "절을 선택하세요";
    verseSelect.appendChild(defaultOption);
    currentVerseIndex = -1;
    return;
  }

  const chapterIdx = currentBookData.chapters.findIndex(c => c.chapter == selectedChapterNumber);
  if (chapterIdx === -1) {
    let defaultOption = document.createElement('option');
    defaultOption.value = "";
    defaultOption.textContent = "절을 선택하세요";
    verseSelect.appendChild(defaultOption);
    currentVerseIndex = -1;
    return;
  }
  currentChapterIndex = chapterIdx;

  const chapterData = currentBookData.chapters[currentChapterIndex];

  if (chapterData) {
    let defaultOption = document.createElement('option');
    defaultOption.value = "";
    defaultOption.textContent = "절을 선택하세요";
    verseSelect.appendChild(defaultOption);
    chapterData.verses.forEach(v => {
      const option = document.createElement('option');
      option.value = v.verse;
      option.textContent = v.verse;
      verseSelect.appendChild(option);
    });

    if (currentVerseIndex !== -1 && chapterData.verses[currentVerseIndex] && chapterData.verses[currentVerseIndex].verse == verseSelect.value) {
      // Do nothing, verseSelect.value is already correct from navigation
    } else if (currentVerseIndex !== -1 && chapterData.verses[currentVerseIndex]) {
        verseSelect.value = chapterData.verses[currentVerseIndex].verse;
    }
  }
  currentVerseIndex = -1;
}

async function searchBible() {
  const selectedBookName = bookSelect.value;
  const selectedChapterNumber = chapterSelect.value;
  const selectedVerseNumber = verseSelect.value;

  if (!selectedBookName || !selectedChapterNumber) {
    mainVerseDiv.innerHTML = '<p>책과 장을 선택해주세요.</p>';
    contextTop.innerHTML = '';
    contextBottom.innerHTML = '';
    prevVerseButton.disabled = true;
    nextVerseButton.disabled = true;
    return;
  }

  mainVerseDiv.innerHTML = '<p>검색 중...</p>';
  contextTop.innerHTML = '';
  contextBottom.innerHTML = '';
  prevVerseButton.disabled = true;
  nextVerseButton.disabled = true;

  if (!currentBookData || currentBookData.book !== selectedBookName) {
    try {
      const response = await fetch(`Bible_KRV/${selectedBookName}.json`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      currentBookData = await response.json();
      currentBookIndex = allBooksList.indexOf(selectedBookName);
    } catch (error) {
      console.error('Error re-fetching book data for search:', error);
      mainVerseDiv.innerHTML = '<p>성경 데이터를 불러오는 데 실패했습니다.</p>';
      return;
    }
  }

  currentChapterIndex = currentBookData.chapters.findIndex(c => c.chapter == selectedChapterNumber);
  if (currentChapterIndex === -1) {
      mainVerseDiv.innerHTML = '<p>장을 찾을 수 없습니다.</p>';
      return;
  }
  const chapterData = currentBookData.chapters[currentChapterIndex];


  if (selectedVerseNumber) {
    currentVerseIndex = chapterData.verses.findIndex(v => v.verse == selectedVerseNumber);
  } else {
    currentVerseIndex = 0;
  }

  if (currentVerseIndex === -1) {
    mainVerseDiv.innerHTML = '<p>절을 찾을 수 없습니다.</p>';
    return;
  }

  displayVerseWithContext();
}

function displayVerseWithContext() {
  contextTop.innerHTML = '';
  mainVerseDiv.innerHTML = '';
  contextBottom.innerHTML = '';

  if (!currentBookData || currentBookIndex === -1 || currentChapterIndex === -1 || currentVerseIndex === -1) {
    updateNavigationButtons();
    return;
  }

  const currentChapter = currentBookData.chapters[currentChapterIndex];
  const versesInChapter = currentChapter.verses;

  // Main Verse
  const mainVerse = versesInChapter[currentVerseIndex];
  if (mainVerse) {
    mainVerseDiv.innerHTML = `<p>${currentBookData.book} ${currentChapter.chapter}:${mainVerse.verse} - ${mainVerse.text}</p>`;
  }

  // Context Top (2 preceding verses)
  for (let i = currentVerseIndex - 2; i < currentVerseIndex; i++) {
    if (i >= 0) {
      const verse = versesInChapter[i];
      contextTop.innerHTML += `<p class="context-verse">${currentBookData.book} ${currentChapter.chapter}:${verse.verse} - ${verse.text}</p>`;
    }
  }

  // Context Bottom (2 succeeding verses)
  for (let i = currentVerseIndex + 1; i <= currentVerseIndex + 2; i++) {
    if (i < versesInChapter.length) {
      const verse = versesInChapter[i];
      contextBottom.innerHTML += `<p class="context-verse">${currentBookData.book} ${currentChapter.chapter}:${verse.verse} - ${verse.text}</p>`;
    }
  }

  updateNavigationButtons();
}

async function goToPreviousVerse() {
  if (currentBookData === null || currentBookIndex === -1 || currentChapterIndex === -1 || currentVerseIndex === -1) return;

  // Try to go to previous verse in current chapter
  if (currentVerseIndex > 0) {
    currentVerseIndex--;
  }
  // Try to go to previous chapter in current book
  else if (currentChapterIndex > 0) {
    currentChapterIndex--;
    currentVerseIndex = currentBookData.chapters[currentChapterIndex].verses.length - 1;
  }
  // Try to go to previous book
  else if (currentBookIndex > 0) {
    currentBookIndex--;
    const prevBookName = allBooksList[currentBookIndex];
    try {
      const response = await fetch(`Bible_KRV/${prevBookName}.json`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      currentBookData = await response.json();
      currentChapterIndex = currentBookData.chapters.length - 1;
      currentVerseIndex = currentBookData.chapters[currentChapterIndex].verses.length - 1;
    } catch (error) {
          console.error('Error fetching previous book data:', error);
          mainVerseDiv.innerHTML = '<p>이전 책 데이터를 불러오는 데 실패했습니다.</p>';
          return;    }
  } else {
    // Cannot go further back
    return;
  }

  bookSelect.value = allBooksList[currentBookIndex];
  await populateChapterSelect();
  chapterSelect.value = currentBookData.chapters[currentChapterIndex].chapter;
  populateVerseSelect();
  verseSelect.value = currentBookData.chapters[currentChapterIndex].verses[currentVerseIndex].verse;

  displayVerseWithContext();
}

async function goToNextVerse() {
  if (currentBookData === null || currentBookIndex === -1 || currentChapterIndex === -1 || currentVerseIndex === -1) return;

  const currentChapter = currentBookData.chapters[currentChapterIndex];

  // Try to go to next verse in current chapter
  if (currentVerseIndex < currentChapter.verses.length - 1) {
    currentVerseIndex++;
  }
  // Try to go to next chapter in current book
  else if (currentChapterIndex < currentBookData.chapters.length - 1) {
    currentChapterIndex++;
    currentVerseIndex = 0;
  }
  // Try to go to next book
  else if (currentBookIndex < allBooksList.length - 1) {
    currentBookIndex++;
    const nextBookName = allBooksList[currentBookIndex];
    try {
      const response = await fetch(`Bible_KRV/${nextBookName}.json`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      currentBookData = await response.json();
      currentChapterIndex = 0;
      currentVerseIndex = 0;
    } catch (error) {
          console.error('Error fetching next book data:', error);
          mainVerseDiv.innerHTML = '<p>다음 책 데이터를 불러오는 데 실패했습니다.</p>';
          return;    }
  } else {
    // Cannot go further forward
    return;
  }

  bookSelect.value = allBooksList[currentBookIndex];
  await populateChapterSelect();
  chapterSelect.value = currentBookData.chapters[currentChapterIndex].chapter;
  populateVerseSelect();
  verseSelect.value = currentBookData.chapters[currentChapterIndex].verses[currentVerseIndex].verse;

  displayVerseWithContext();
}

function updateNavigationButtons() {
  prevVerseButton.disabled = true;
  nextVerseButton.disabled = true;

  if (currentBookData === null || currentBookIndex === -1 || currentChapterIndex === -1 || currentVerseIndex === -1) {
      return;
  }

  let canGoPrev = false;
  // Can go prev if not first verse of first chapter of first book
  if (currentVerseIndex > 0 || currentChapterIndex > 0 || currentBookIndex > 0) {
    canGoPrev = true;
  }
  prevVerseButton.disabled = !canGoPrev;

  let canGoNext = false;
  const currentChapter = currentBookData.chapters[currentChapterIndex];
  // Can go next if not last verse of last chapter of last book
  if (currentVerseIndex < currentChapter.verses.length - 1 ||
      currentChapterIndex < currentBookData.chapters.length - 1 ||
      currentBookIndex < allBooksList.length - 1) {
    canGoNext = true;
  }
  nextVerseButton.disabled = !canGoNext;
}


// Event Listeners
bookSelect.addEventListener('change', populateChapterSelect);
chapterSelect.addEventListener('change', populateVerseSelect);
searchButton.addEventListener('click', searchBible);
prevVerseButton.addEventListener('click', goToPreviousVerse);
nextVerseButton.addEventListener('click', goToNextVerse);
// Optionally trigger search when a specific verse is selected
verseSelect.addEventListener('change', searchBible);

// Initial population
populateBookSelect();