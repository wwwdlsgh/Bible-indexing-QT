const bookSelect = document.getElementById('book-select');
const chapterSelect = document.getElementById('chapter-select');
const verseSelect = document.getElementById('verse-select');
const searchButton = document.getElementById('search-button');
const resultContainer = document.getElementById('result-container');

let currentBookData = null; // To store the data of the currently selected book

async function populateBookSelect() {
  try {
    const response = await fetch('Bible_KRV/books.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const books = await response.json();
    // Add a default "Select Book" option
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
    // Populate chapters for the initially selected (or default) book
    if (bookSelect.value) {
      await populateChapterSelect();
    }
  } catch (error) {
    console.error('Error fetching book list:', error);
    resultContainer.innerHTML = '책 목록을 불러오는 데 실패했습니다.';
  }
}

async function populateChapterSelect() {
  chapterSelect.innerHTML = ''; // Clear previous options
  verseSelect.innerHTML = '';   // Clear verse options as well

  const selectedBookName = bookSelect.value;
  if (!selectedBookName) {
    let defaultOption = document.createElement('option');
    defaultOption.value = "";
    defaultOption.textContent = "장을 선택하세요";
    chapterSelect.appendChild(defaultOption);
    defaultOption = document.createElement('option');
    defaultOption.value = "";
    defaultOption.textContent = "절을 선택하세요";
    verseSelect.appendChild(defaultOption);
    return;
  }

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

    for (const chapter of currentBookData.chapters) {
      const option = document.createElement('option');
      option.value = chapter.chapter;
      option.textContent = chapter.chapter;
      chapterSelect.appendChild(option);
    }
    // Populate verses for the initially selected chapter
    if (chapterSelect.value) {
      await populateVerseSelect();
    }
  } catch (error) {
    console.error('Error fetching book data for chapters:', error);
    resultContainer.innerHTML = '장의 데이터를 불러오는 데 실패했습니다.';
  }
}

function populateVerseSelect() {
  verseSelect.innerHTML = ''; // Clear previous options

  const selectedChapterNumber = chapterSelect.value;
  if (!selectedChapterNumber || !currentBookData) {
    let defaultOption = document.createElement('option');
    defaultOption.value = "";
    defaultOption.textContent = "절을 선택하세요";
    verseSelect.appendChild(defaultOption);
    return;
  }

  const chapterData = currentBookData.chapters.find(c => c.chapter == selectedChapterNumber);

  if (chapterData) {
    let defaultOption = document.createElement('option');
    defaultOption.value = "";
    defaultOption.textContent = "절을 선택하세요";
    verseSelect.appendChild(defaultOption);
    for (const verse of chapterData.verses) {
      const option = document.createElement('option');
      option.value = verse.verse;
      option.textContent = verse.verse;
      verseSelect.appendChild(option);
    }
  }
}

async function searchBible() {
  const selectedBookName = bookSelect.value;
  const selectedChapter = chapterSelect.value;
  const selectedVerse = verseSelect.value;

  if (!selectedBookName || !selectedChapter) {
    resultContainer.innerHTML = '책과 장을 선택해주세요.';
    return;
  }

  resultContainer.innerHTML = '검색 중...';

  // currentBookData should already be loaded by populateChapterSelect
  if (!currentBookData || currentBookData.book !== selectedBookName) {
    // This case should ideally not happen if dropdowns are populated correctly
    // But as a fallback, re-fetch if data is stale or missing
    try {
        const response = await fetch(`Bible_KRV/${selectedBookName}.json`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        currentBookData = await response.json();
    } catch (error) {
        console.error('Error re-fetching book data for search:', error);
        resultContainer.innerHTML = '성경 데이터를 불러오는 데 실패했습니다.';
        return;
    }
  }


  const chapterData = currentBookData.chapters.find(c => c.chapter == selectedChapter);

  if (!chapterData) {
    resultContainer.innerHTML = '장을 찾을 수 없습니다.';
    return;
  }

  let resultHTML = '';
  if (selectedVerse) {
    const verseData = chapterData.verses.find(v => v.verse == selectedVerse);
    if (verseData) {
      resultHTML = `<p>${selectedBookName} ${selectedChapter}:${selectedVerse} - ${verseData.text}</p>`;
    } else {
      resultContainer.innerHTML = '절을 찾을 수 없습니다.';
    }
  } else {
    chapterData.verses.forEach(v => {
      resultHTML += `<p>${selectedBookName} ${selectedChapter}:${v.verse} - ${v.text}</p>`;
    });
  }
  resultContainer.innerHTML = resultHTML;
}

// Event Listeners
bookSelect.addEventListener('change', populateChapterSelect);
chapterSelect.addEventListener('change', populateVerseSelect);
searchButton.addEventListener('click', searchBible);

// Initial population
populateBookSelect();