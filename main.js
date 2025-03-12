let books = [];
let selectedBooks = [];
let availableBooks = [];
let removedBooks = [];
let knownAutors = [];

fetch('data.json')
  .then((response) => response.json())
  .then((data) => {
    books = data;
    availableBooks = [...books];
    availableBooks.sort((a, b) => {
      const authorComparison = a.author.localeCompare(b.author);
      if (authorComparison !== 0) {
        return authorComparison;
      }
      return a.title.localeCompare(b.title);
    });
    updateBookLists();
  })
  .catch((error) => {
    console.error('Error loading JSON data:', error);
  });

function createBookElement(book, isSelected = false) {
  const div = document.createElement('div');
  div.className = 'book-item';

  // Hlavní obsah knihy
  const mainContent = document.createElement('div');
  mainContent.className = 'book-main-content';
  mainContent.innerHTML = `
      <div>${book.title}</div>
      <div class="book-meta">
        ${book.author}
        <span class="genre-badge genre-${book.genre}">${book.genre}</span>
      </div>
    `;

  // Rok knihy
  const yearContent = document.createElement('div');
  yearContent.className = 'book-year';
  yearContent.textContent = book.year || 'N/A'; // Zobrazí "N/A", pokud není rok k dispozici

  // Přidáme obsah do hlavního kontejneru
  div.appendChild(mainContent);
  div.appendChild(yearContent);

  // Nastavíme akci při kliknutí
  if (isSelected) {
    div.onclick = () => removeBook(book);
  } else {
    div.onclick = () => selectBook(book);
  }

  return div;
}

function updateBookLists() {
  availableBooks.sort((a, b) => a.author.localeCompare(b.author));
  selectedBooks.sort((a, b) => a.author.localeCompare(b.author));

  availableBooks.sort((a, b) => {
    const authorComparison = a.author.localeCompare(b.author);
    if (authorComparison !== 0) {
      return authorComparison;
    }
    return a.title.localeCompare(b.title);
  });
  selectedBooks.sort((a, b) => {
    const authorComparison = a.author.localeCompare(b.author);
    if (authorComparison !== 0) {
      return authorComparison;
    }
    return a.title.localeCompare(b.title);
  });
  const availableContainer = document.getElementById('availableBooks');
  const selectedContainer = document.getElementById('selectedBooks');
  const countElement = document.getElementById('selectedCount');

  availableContainer.innerHTML = '';
  selectedContainer.innerHTML = '';

  availableBooks.forEach((book) => {
    const div = createBookElement(book, false);
    availableContainer.appendChild(div);
  });

  selectedBooks.forEach((book) => {
    const div = createBookElement(book, true);
    selectedContainer.appendChild(div);
  });

  countElement.textContent = selectedBooks.length;
  validateSelection();
}

function selectBook(book) {
  if (selectedBooks.length >= 20) {
    showNotification('Již máte vybráno maximum 20 knih!');
    return;
  }

  const authorBooks = selectedBooks.filter((b) => b.author === book.author);
  if (authorBooks.length >= 2) {
    showNotification('Od jednoho autora můžete vybrat maximálně 2 díla!');
    return;
  }

  availableBooks = availableBooks.filter((b) => b.title !== book.title);
  selectedBooks.push(book);
  if (!knownAutors.includes(book.author)) {
    knownAutors.push(book.author);
  } else {
    let removedBooksNow = availableBooks.filter((b) => b.author == book.author);
    removedBooks = removedBooks.concat(removedBooksNow);
    availableBooks = availableBooks.filter((b) => b.author !== book.author);
  }
  updateBookLists();
}

function removeBook(book) {
  selectedBooks = selectedBooks.filter((b) => b.title !== book.title);
  if (selectedBooks.filter((b) => b.author === book.author).length === 0) {
    knownAutors = knownAutors.filter((a) => a !== book.author);
  } else {
    needToBeAdded = removedBooks.filter((b) => b.author === book.author);
    console.log(needToBeAdded);
    availableBooks = availableBooks.concat(needToBeAdded);
    removedBooks = removedBooks.filter((b) => b.author !== book.author);
  }
  availableBooks.push(book);
  updateBookLists();
}

function isSelectionValid() {
  const totalCount = selectedBooks.length;
  const before1800 = selectedBooks.filter((b) => b.period === '18').length;
  const century19 = selectedBooks.filter((b) => b.period === '19').length;
  const century20World = selectedBooks.filter(
    (b) => b.period === '20' && !b.isCzech
  ).length;
  const century20Czech = selectedBooks.filter(
    (b) => b.period === '20' && b.isCzech
  ).length;
  const prose = selectedBooks.filter((b) => b.genre === 'próza').length;
  const poetry = selectedBooks.filter((b) => b.genre === 'poezie').length;
  const drama = selectedBooks.filter((b) => b.genre === 'drama').length;

  return (
    totalCount === 20 &&
    before1800 >= 2 &&
    century19 >= 3 &&
    century20World >= 4 &&
    century20Czech >= 5 &&
    prose >= 2 &&
    poetry >= 2 &&
    drama >= 2
  );
}

function generatePDF() {
  const isDebugMode =
    typeof process !== 'undefined' && process.env.DEBUG_MODE === 'true';

  if (!isDebugMode && !isSelectionValid()) {
    showNotification('Výběr knih nesplňuje všechny požadované podmínky!');
    return;
  }

  // Získáme hodnoty jména a třídy z inputů
  const userName =
    document.getElementById('userName').value || 'Nezadané_jméno';
  const userClass =
    document.getElementById('userClass').value || 'Nezadaná_třída';

  // Vytvoříme název souboru
  const fileName = `${userClass}_${userName}_maturitni_cetba.pdf`.replace(
    /\s+/g,
    '_'
  );

  // Load the base64 image from img.txt
  fetch('img.txt')
    .then((response) => response.text())
    .then((base64Data) => {
      const docDefinition = {
        pageSize: 'A4',
        pageMargins: [40, 60, 40, 60],
        content: [
          {
            columns: [
              {
                image: 'data:image/jpeg;base64,' + base64Data,
                width: 100,
                alignment: 'left',
              },
              {
                text: 'STŘEDNÍ PRŮMYSLOVÁ ŠKOLA  A VYŠŠÍ ODBORNÁ ŠKOLA\nJana Palacha 1840, 272 01 KLADNO',
                alignment: 'center',
                margin: [0, 20, 0, 0],
              },
            ],
          },
          {
            text: 'Seznam maturitní četby',
            style: 'header',
            alignment: 'center',
          },
          {
            columns: [
              { text: `Jméno: ${userName}`, width: '50%', style: 'subheader' },
              {
                text: `Třída: ${userClass}`,
                width: '50%',
                style: 'subheader',
                alignment: 'right',
              },
            ],
          },
          {
            ol: selectedBooks.map((book) => {
              return {
                columns: [
                  {
                    text: `${book.title}`,
                    width: '40%',
                    bold: true,
                  },
                  { text: book.author, width: '30%', italics: true },
                  {
                    text: book.genre,
                    width: '30%',
                    alignment: 'right',
                    color: getGenreColor(book.genre),
                  },
                ],
                margin: [0, 5, 0, 5],
              };
            }),
          },
          {
            text: '\n\n\nPodpisy',
            style: 'subheader',
            alignment: 'center',
          },
          {
            columns: [
              {
                width: '50%',
                text: '_________________________\nPodpis učitele',
                alignment: 'center',
                margin: [0, 20, 0, 0],
              },
              {
                width: '50%',
                text: '_________________________\nPodpis žáka',
                alignment: 'center',
                margin: [0, 20, 0, 0],
              },
            ],
          },
        ],
        styles: {
          header: {
            fontSize: 18,
            bold: true,
            margin: [0, 0, 0, 20],
          },
          subheader: {
            fontSize: 12,
            margin: [0, 20, 0, 10],
          },
        },
        footer: function (currentPage, pageCount) {
          return {
            text: `SPŠ a VOŠ Kladno - ${new Date().toLocaleDateString(
              'cs-CZ'
            )} (Strana ${currentPage} z ${pageCount})`,
            alignment: 'center',
            fontSize: 10,
            margin: [0, 0, 0, 20],
          };
        },
      };

      // Vygenerování a stažení PDF s upraveným názvem souboru
      pdfMake.createPdf(docDefinition).download(fileName);
    })
    .catch((error) => {
      console.error('Error loading image data:', error);
      showNotification('Chyba při načítání obrázku!');
    });
}

// Funkce pro zobrazení notifikace
function showNotification(message) {
  const notification = document.getElementById('customNotification');
  const messageSpan = document.getElementById('notificationMessage');
  messageSpan.textContent = message; // Nastaví text notifikace
  notification.classList.remove('hidden');
  notification.classList.add('visible');

  // Skryje notifikaci po 3 sekundách
  setTimeout(() => {
    hideNotification();
  }, 3000);
}

// Funkce pro skrytí notifikace
function hideNotification() {
  const notification = document.getElementById('customNotification');
  notification.classList.remove('visible');
  notification.classList.add('hidden');
}

// Funkce pro kontrolu pozice při scrollování
function checkScroll() {
  const notification = document.getElementById('customNotification');

  // Pokud uživatel odscrolloval dostatečně dolů, zobrazíme notifikaci
  if (window.scrollY + window.innerHeight >= document.body.offsetHeight - 200) {
    notification.classList.add('visible');
  } else {
    notification.classList.remove('visible');
  }
}

// Event listener pro posun stránky
window.addEventListener('scroll', checkScroll);

// Pomocná funkce pro přiřazení barvy podle žánru
function getGenreColor(genre) {
  switch (genre) {
    case 'próza':
      return '#007bff';
    case 'poezie':
      return '#9c27b0';
    case 'drama':
      return '#4caf50';
    default:
      return '#000000';
  }
}

// Add dark mode toggle button to the header
const header = document.querySelector('h1');
const darkModeToggle = document.createElement('button');
darkModeToggle.innerHTML = '🌙';
darkModeToggle.className = 'dark-mode-toggle';
darkModeToggle.setAttribute('title', 'Toggle Dark Mode');
header.parentNode.insertBefore(darkModeToggle, header.nextSibling);

// Check for saved user preference, first in localStorage, then system setting
const darkModePreference =
  localStorage.getItem('darkMode') ||
  (window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'enabled'
    : 'disabled');

// Initialize dark mode based on saved preference
if (darkModePreference === 'enabled') {
  document.body.classList.add('dark-mode');
  darkModeToggle.innerHTML = '☀️';
}

// Toggle dark mode
darkModeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');

  // Update button icon
  darkModeToggle.innerHTML = document.body.classList.contains('dark-mode')
    ? '☀️'
    : '🌙';

  // Save preference
  localStorage.setItem(
    'darkMode',
    document.body.classList.contains('dark-mode') ? 'enabled' : 'disabled'
  );
});

// Listen for system theme changes
window
  .matchMedia('(prefers-color-scheme: dark)')
  .addEventListener('change', (e) => {
    if (!localStorage.getItem('darkMode')) {
      // Only if user hasn't manually set preference
      document.body.classList.toggle('dark-mode', e.matches);
      darkModeToggle.innerHTML = e.matches ? '☀️' : '🌙';
    }
  });

// Funkce pro nastavení výšky sekce Selected Books
function setSelectedBooksHeight() {
  const selectedBooks = document.querySelector('#selectedBooks');
  const viewportHeight = window.innerHeight;
  const maxListHeight = viewportHeight * 0.4; // Nastavíme výšku na 40 % výšky obrazovky
  selectedBooks.style.height = maxListHeight + 'px';
}

// Nastavíme výšku při načtení stránky a při změně velikosti okna
window.addEventListener('load', setSelectedBooksHeight);
window.addEventListener('resize', setSelectedBooksHeight);

function validateSelection() {
  const results = [];
  const validationContainer = document.getElementById('validationResults');

  const totalCount = selectedBooks.length;
  const before1800 = selectedBooks.filter((b) => b.period === '18').length;
  const century19 = selectedBooks.filter((b) => b.period === '19').length;
  const century20World = selectedBooks.filter(
    (b) => b.period === '20' && !b.isCzech
  ).length;
  const century20Czech = selectedBooks.filter(
    (b) => b.period === '20' && b.isCzech
  ).length;
  const prose = selectedBooks.filter((b) => b.genre === 'próza').length;
  const poetry = selectedBooks.filter((b) => b.genre === 'poezie').length;
  const drama = selectedBooks.filter((b) => b.genre === 'drama').length;

  results.push({
    valid: totalCount === 20,
    message: `Celkový počet knih: ${totalCount}/20`,
  });
  results.push({
    valid: before1800 >= 2,
    message: `Literatura do 18. století: ${before1800}/2`,
  });
  results.push({
    valid: century19 >= 3,
    message: `Literatura 19. století: ${century19}/3`,
  });
  results.push({
    valid: century20World >= 4,
    message: `Světová literatura 20. a 21. století: ${century20World}/4`,
  });
  results.push({
    valid: century20Czech >= 5,
    message: `Česká literatura 20. a 21. století: ${century20Czech}/5`,
  });
  results.push({
    valid: prose >= 2,
    message: `Próza: ${prose}/2`,
  });
  results.push({
    valid: poetry >= 2,
    message: `Poezie: ${poetry}/2`,
  });
  results.push({
    valid: drama >= 2,
    message: `Drama: ${drama}/2`,
  });

  validationContainer.innerHTML = results
    .map(
      (result) => `
                <div class="validation-item ${
                  result.valid ? 'valid' : 'invalid'
                }">
                    ${result.valid ? '✓' : '✗'} ${result.message}
                </div>
            `
    )
    .join('');
}

document.getElementById('searchBox').addEventListener('input', (e) => {
  function removeDiacritics(inputStr) {
    return inputStr.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }
  const searchTerm = removeDiacritics(e.target.value.toLowerCase());
  let filteredBooks = books.filter(
    (book) =>
      !selectedBooks.includes(book) &&
      (removeDiacritics(book.title).toLowerCase().includes(searchTerm) ||
        removeDiacritics(book.author).toLowerCase().includes(searchTerm) ||
        removeDiacritics(book.genre).toLowerCase().includes(searchTerm))
  );

  filteredBooks = filteredBooks.filter((book) => !removedBooks.includes(book));

  availableBooks = filteredBooks;
  updateBookLists();
});

updateBookLists();
