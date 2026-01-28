const bookSelect = document.getElementById('book-select');
const chapterInput = document.getElementById('chapter');
const verseInput = document.getElementById('verse');
const searchButton = document.getElementById('search-button');
const resultContainer = document.getElementById('result-container');

async function populateBookSelect() {
  try {
    const response = await fetch('Bible_KRV/books.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const books = await response.json();
    for (const book of books) {
      const option = document.createElement('option');
      option.value = book;
      option.textContent = book;
      bookSelect.appendChild(option);
    }
  } catch (error) {
    console.error('Error fetching book list:', error);
    resultContainer.innerHTML = '책 목록을 불러오는 데 실패했습니다.';
  }
}

async function searchBible() {
  const selectedBook = bookSelect.value;
  const chapter = chapterInput.value;
  const verse = verseInput.value;

  if (!chapter) {
    resultContainer.innerHTML = '장을 입력해주세요.';
    return;
  }

  resultContainer.innerHTML = '검색 중...';

  try {
    const response = await fetch(`Bible_KRV/${selectedBook}.json`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const bookData = await response.json();

    const chapterData = bookData.chapters.find(c => c.chapter == chapter);

    if (!chapterData) {
      resultContainer.innerHTML = '장을 찾을 수 없습니다.';
      return;
    }

    let resultHTML = '';
    if (verse) {
      const verseData = chapterData.verses.find(v => v.verse == verse);
      if (verseData) {
        resultHTML = `<p>${selectedBook} ${chapter}:${verse} - ${verseData.text}</p>`;
      } else {
        resultHTML = '절을 찾을 수 없습니다.';
      }
    } else {
      chapterData.verses.forEach(v => {
        resultHTML += `<p>${selectedBook} ${chapter}:${v.verse} - ${v.text}</p>`;
      });
    }
    resultContainer.innerHTML = resultHTML;

  } catch (error) {
    console.error('Error fetching Bible data:', error);
    resultContainer.innerHTML = '성경 데이터를 불러오는 데 실패했습니다.';
  }
}

searchButton.addEventListener('click', searchBible);

populateBookSelect();