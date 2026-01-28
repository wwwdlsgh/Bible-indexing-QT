const bookSelect = document.getElementById('book-select');
const chapterSelect = document.getElementById('chapter-select');
const verseSelect = document.getElementById('verse-select');
const searchButton = document.getElementById('search-button');

const prevVerseButton = document.getElementById('prev-verse-button');
const nextVerseButton = document.getElementById('next-verse-button');

const contextTop = document.getElementById('context-top');
const mainVerseDiv = document.getElementById('main-verse');
const contextBottom = document.getElementById('context-bottom');
const resultContainer = document.getElementById('result-container');

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
    resultContainer.innerHTML = '책 목록을 불러오는 데 실패했습니다.';
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

  // Always initialize chapters and verses after book select is populated
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


    populateVerseSelect(); // Changed to not await here. It should be fine.
  } catch (error) {
    console.error('Error fetching book data for chapters:', error);
    resultContainer.innerHTML = '장의 데이터를 불러오는 데 실패했습니다.';
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
  if (!selectedChapterNumber || !currentBookData) { // Removed currentChapterIndex === -1 check
    let defaultOption = document.createElement('option');
    defaultOption.value = "";
    defaultOption.textContent = "절을 선택하세요";
    verseSelect.appendChild(defaultOption);
    currentVerseIndex = -1;
    return;
  }

  // Determine currentChapterIndex based on selectedChapterNumber
  const chapterIdx = currentBookData.chapters.findIndex(c => c.chapter == selectedChapterNumber);
  if (chapterIdx === -1) {
    let defaultOption = document.createElement('option');
    defaultOption.value = "";
    defaultOption.textContent = "절을 선택하세요";
    verseSelect.appendChild(defaultOption);
    currentVerseIndex = -1;
    return;
  }
  currentChapterIndex = chapterIdx; // Update global state here

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

    // If there's a verse already selected, restore it
    if (currentVerseIndex !== -1 && chapterData.verses[currentVerseIndex] && chapterData.verses[currentVerseIndex].verse == verseSelect.value) {
      // Do nothing, verseSelect.value is already correct from navigation
    } else if (currentVerseIndex !== -1 && chapterData.verses[currentVerseIndex]) {
        verseSelect.value = chapterData.verses[currentVerseIndex].verse;
    }
  }
  currentVerseIndex = -1; // Reset until an explicit search or navigation
}

async function searchBible() {
  const selectedBookName = bookSelect.value;
  const selectedChapterNumber = chapterSelect.value;
  const selectedVerseNumber = verseSelect.value;

  if (!selectedBookName || !selectedChapterNumber) {
    resultContainer.innerHTML = '책과 장을 선택해주세요.';
    return;
  }

  resultContainer.innerHTML = '검색 중...';
  contextTop.innerHTML = '';
  mainVerseDiv.innerHTML = '';
  contextBottom.innerHTML = '';
  prevVerseButton.disabled = true;
  nextVerseButton.disabled = true;

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

  // Update currentChapterIndex based on selectedChapterNumber
  currentChapterIndex = currentBookData.chapters.findIndex(c => c.chapter == selectedChapterNumber);
  if (currentChapterIndex === -1) {
      resultContainer.innerHTML = '장을 찾을 수 없습니다.';
      return;
  }
  const chapterData = currentBookData.chapters[currentChapterIndex];


  if (selectedVerseNumber) {
    currentVerseIndex = chapterData.verses.findIndex(v => v.verse == selectedVerseNumber);
  } else {
    currentVerseIndex = 0; // Default to the first verse of the chapter
  }

  if (currentVerseIndex === -1) {
    resultContainer.innerHTML = '절을 찾을 수 없습니다.';
    return;
  }

  displayVerseWithContext();
}

function displayVerseWithContext() {
  resultContainer.innerHTML = ''; // Clear general messages, assume display will be in divs
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
  if (currentBookData === null) return;

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
  populateVerseSelect(); // Now currentChapterIndex is guaranteed to be set
  verseSelect.value = currentBookData.chapters[currentChapterIndex].verses[currentVerseIndex].verse;

  displayVerseWithContext();
}

async function goToNextVerse() {
  if (currentBookData === null) return;

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
  populateVerseSelect(); // Now currentChapterIndex is guaranteed to be set
  verseSelect.value = currentBookData.chapters[currentChapterIndex].verses[currentVerseIndex].verse;

  displayVerseWithContext();
}

function updateNavigationButtons() {
  let canGoPrev = false;
  if (currentBookIndex > 0 || (currentBookIndex === 0 && currentChapterIndex > 0) || (currentBookIndex === 0 && currentChapterIndex === 0 && currentVerseIndex > 0)) {
    canGoPrev = true;
  }
  prevVerseButton.disabled = !canGoPrev;

  let canGoNext = false;
  if (currentBookData && currentChapterIndex !== -1 && currentVerseIndex !== -1) {
    const currentChapter = currentBookData.chapters[currentChapterIndex];
    if (currentVerseIndex < currentChapter.verses.length - 1 ||
        currentChapterIndex < currentBookData.chapters.length - 1 ||
        currentBookIndex < allBooksList.length - 1) {
      canGoNext = true;
    }
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