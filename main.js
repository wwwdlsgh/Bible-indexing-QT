const bookSelect = document.getElementById('book-select');
const chapterSelect = document.getElementById('chapter-select');
const verseSelect = document.getElementById('verse-select');
const searchButton = document.getElementById('search-button');

const prevVerseButton = document.getElementById('prev-verse-button');
const nextVerseButton = document.getElementById('next-verse-button');

const contextTop = document.getElementById('context-top');
const mainVerseDiv = document.getElementById('main-verse'); // Renamed to avoid conflict
const contextBottom = document.getElementById('context-bottom');
const resultContainer = document.getElementById('result-container'); // Still needed for general messages

let allBooksList = []; // To store the list of all book names from books.json
let currentBookData = null; // To store the data of the currently selected book
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
    resultContainer.innerHTML = '책 목록을 불러오는 데 실패했습니다.';
    return [];
  }
  return allBooksList;
}

async function populateBookSelect() {
  const books = await fetchBookList();
  bookSelect.innerHTML = ''; // Clear previous options

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

  // Initialize chapter and verse selects as well
  populateChapterSelect();
}

async function populateChapterSelect() {
  chapterSelect.innerHTML = ''; // Clear previous options
  verseSelect.innerHTML = '';   // Clear verse options as well
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
    currentBookData = await response.json(); // Store for verse population

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

    populateVerseSelect(); // Populate verses for the first chapter by default
  } catch (error) {
    console.error('Error fetching book data for chapters:', error);
    resultContainer.innerHTML = '장의 데이터를 불러오는 데 실패했습니다.';
  }
}

function populateVerseSelect() {
  verseSelect.innerHTML = ''; // Clear previous options
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
    currentChapterIndex = -1;
    currentVerseIndex = -1;
    return;
  }

  currentChapterIndex = currentBookData.chapters.findIndex(c => c.chapter == selectedChapterNumber);
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
  }
  currentVerseIndex = -1; // Reset verse index
}

async function searchBible() {
  const selectedBookName = bookSelect.value;
  const selectedChapterNumber = chapterSelect.value;
  const selectedVerseNumber = verseSelect.value;

  if (!selectedBookName || !selectedChapterNumber) {
    resultContainer.innerHTML = '책과 장을 선택해주세요.';
    return;
  }

  // Ensure currentBookData is loaded and correct
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
      resultContainer.innerHTML = '성경 데이터를 불러오는 데 실패했습니다.';
      return;
    }
  }

  currentChapterIndex = currentBookData.chapters.findIndex(c => c.chapter == selectedChapterNumber);
  const chapterData = currentBookData.chapters[currentChapterIndex];

  if (!chapterData) {
    resultContainer.innerHTML = '장을 찾을 수 없습니다.';
    return;
  }

  if (selectedVerseNumber) {
    currentVerseIndex = chapterData.verses.findIndex(v => v.verse == selectedVerseNumber);
  } else {
    // If no specific verse selected, default to the first verse of the chapter
    currentVerseIndex = 0;
  }

  if (currentVerseIndex === -1) {
    resultContainer.innerHTML = '절을 찾을 수 없습니다.';
    return;
  }

  displayVerseWithContext();
}

function displayVerseWithContext() {
  contextTop.innerHTML = '';
  mainVerseDiv.innerHTML = '';
  contextBottom.innerHTML = '';
  resultContainer.innerHTML = ''; // Clear general messages

  if (!currentBookData || currentBookIndex === -1 || currentChapterIndex === -1 || currentVerseIndex === -1) {
    return; // No verse selected yet
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
  if (currentVerseIndex > 0) {
    currentVerseIndex--;
  } else if (currentChapterIndex > 0) {
    currentChapterIndex--;
    const prevChapter = currentBookData.chapters[currentChapterIndex];
    currentVerseIndex = prevChapter.verses.length - 1;
  } else if (currentBookIndex > 0) {
    currentBookIndex--;
    const prevBookName = allBooksList[currentBookIndex];
    try {
      const response = await fetch(`Bible_KRV/${prevBookName}.json`);
      currentBookData = await response.json();
      currentChapterIndex = currentBookData.chapters.length - 1;
      const prevChapter = currentBookData.chapters[currentChapterIndex];
      currentVerseIndex = prevChapter.verses.length - 1;
    } catch (error) {
      console.error('Error fetching previous book data:', error);
      resultContainer.innerHTML = '이전 책 데이터를 불러오는 데 실패했습니다.';
      return;
    }
  } else {
    // Cannot go further back
    return;
  }
  // Update dropdowns to reflect new position
  bookSelect.value = allBooksList[currentBookIndex];
  await populateChapterSelect(); // This will re-fetch book data if needed and populate chapter/verse
  chapterSelect.value = currentBookData.chapters[currentChapterIndex].chapter;
  populateVerseSelect();
  verseSelect.value = currentBookData.chapters[currentChapterIndex].verses[currentVerseIndex].verse;

  displayVerseWithContext();
}

async function goToNextVerse() {
  const currentChapter = currentBookData.chapters[currentChapterIndex];
  if (currentVerseIndex < currentChapter.verses.length - 1) {
    currentVerseIndex++;
  } else if (currentChapterIndex < currentBookData.chapters.length - 1) {
    currentChapterIndex++;
    currentVerseIndex = 0;
  } else if (currentBookIndex < allBooksList.length - 1) {
    currentBookIndex++;
    const nextBookName = allBooksList[currentBookIndex];
    try {
      const response = await fetch(`Bible_KRV/${nextBookName}.json`);
      currentBookData = await response.json();
      currentChapterIndex = 0;
      currentVerseIndex = 0;
    } catch (error) {
      console.error('Error fetching next book data:', error);
      resultContainer.innerHTML = '다음 책 데이터를 불러오는 데 실패했습니다.';
      return;
    }
  } else {
    // Cannot go further forward
    return;
  }
  // Update dropdowns to reflect new position
  bookSelect.value = allBooksList[currentBookIndex];
  await populateChapterSelect();
  chapterSelect.value = currentBookData.chapters[currentChapterIndex].chapter;
  populateVerseSelect();
  verseSelect.value = currentBookData.chapters[currentChapterIndex].verses[currentVerseIndex].verse;

  displayVerseWithContext();
}

function updateNavigationButtons() {
  let canGoPrev = false;
  if (currentVerseIndex > 0 || currentChapterIndex > 0 || currentBookIndex > 0) {
    canGoPrev = true;
  }
  prevVerseButton.disabled = !canGoPrev;

  let canGoNext = false;
  const currentChapter = currentBookData.chapters[currentChapterIndex];
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
verseSelect.addEventListener('change', searchBible); // Trigger search when a specific verse is selected

// Initial population
populateBookSelect();