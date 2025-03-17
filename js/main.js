let books = [];
let selectedBooks = [];
let availableBooks = [];
let removedBooks = [];
let knownAutors = [];

// Ukládá knihy do localStorage - uloží si je do paměti prohližeče
const savedSelectedBooks = localStorage.getItem('selectedBooks');
if (savedSelectedBooks) {
  selectedBooks = JSON.parse(savedSelectedBooks);
}

// Načte data ze souboru data.json, seřadí knihy podle autora a názvu a aktualizuje seznamy knih
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

// Vytvoří HTML element reprezentující knihu s jejími detaily (název, autor, žánr, rok).
// Podle parametru isSelected nastaví onclick handler buď na přidání nebo odebrání knihy.
function createBookElement(book, isSelected = false) {
  const div = document.createElement('div');
  div.className = 'book-item';

  const mainContent = document.createElement('div');
  mainContent.className = 'book-main-content';
  mainContent.innerHTML = `
      <div>${book.title}</div>
      <div class="book-meta">
        ${book.author}
        <span class="genre-badge genre-${book.genre}">${book.genre}</span>
      </div>
    `;

  
  const yearContent = document.createElement('div');
  yearContent.className = 'book-year';
  yearContent.textContent = book.year || 'N/A'; 

  
  div.appendChild(mainContent);
  div.appendChild(yearContent);

  
  if (isSelected) {
    div.onclick = () => removeBook(book);
  } else {
    div.onclick = () => selectBook(book);
  }

  return div;
}

/**
 * Aktualizuje seznamy dostupných a vybraných knih v uživatelském rozhraní.
 * 
 * Funkce:
 * 1. Seřadí knihy podle autora a názvu
 * 2. Vyčistí stávající seznamy v HTML
 * 3. Vytvoří nové HTML elementy pro každou knihu pomocí createBookElement()
 * 4. Přidá knihy do příslušných kontejnerů (dostupné/vybrané)
 * 5. Aktualizuje počítadlo vybraných knih
 * 6. Spustí validaci výběru
 */

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

// Přidání knihy do vybraných knih
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
  
  localStorage.setItem('selectedBooks', JSON.stringify(selectedBooks));
  
  if (!knownAutors.includes(book.author)) {
    knownAutors.push(book.author);
  } else {
    let removedBooksNow = availableBooks.filter((b) => b.author == book.author);
    removedBooks = removedBooks.concat(removedBooksNow);
    availableBooks = availableBooks.filter((b) => b.author !== book.author);
  }
  updateBookLists();
}

// Odebrání knihy z vybraných knih
function removeBook(book) {
  selectedBooks = selectedBooks.filter((b) => b.title !== book.title);
  
  localStorage.setItem('selectedBooks', JSON.stringify(selectedBooks));
  
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


//Kontroluje, zda je výběr knih platný podle požadavků maturitní zkoušky
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

// Generuje PDF s výběrem knih
function generatePDF() {
  const isDebugMode =
    typeof process !== 'undefined' && process.env.DEBUG_MODE === 'true';

  if (!isDebugMode && !isSelectionValid()) {
    showNotification('Výběr knih nesplňuje všechny požadované podmínky!');
    return;
  }

  
  const userName =
    document.getElementById('userName').value || 'Nezadané jméno';
  const userClass =
    document.getElementById('userClass').value || 'Nezadaná třída';

  
  const fileName = `${userClass}_${userName}_maturitni_cetba.pdf`.replace(
    /\s+/g,
    '_'
  );

  
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
                bold: 'true',
                fontface: 'Tahoma',
                margin: [0, 20, 0, 0],
              },
            ],
          },
          {
            text: 'Seznam literárních děl k ústní maturitní zkoušce z českého jazyka a literatury ve školním roce 2024/2025',
            style: 'header',
            alignment: 'center',
            margin: [0, 10, 0, 0],
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
                    text: `${book.author}: ${book.title}`,
                    fontSize: 10,
                    bold: false,
                  },
                ],
                margin: [0, 5, 0, 5],
              };
            }),
          },
          {
            columns: [
              {
                text: `Datum vytvoření: ${new Date().toLocaleDateString('cs-CZ')}\nVyučující:\nPředeseda předmětové komise: Mgr. et. Mgr. Martin Jíša\nŘeditel školy: Ing. Miroslav Dundr`,
                alignment: 'left',
                lineHeight: 1.5,
                fontSize: 10,
                margin: [0, 30, 0, 0],
              },
              {
                text: 'Podpis žáka:',
                alignment: 'right',
                fontSize: 10,
                margin: [0, 30, 70, 0],
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
      };

      
      pdfMake.createPdf(docDefinition).download(fileName);
    })
    .catch((error) => {
      console.error('Error loading image data:', error);
      showNotification('Chyba při načítání obrázku!');
    });
}

// Zobrazí upozornění na stránku
function showNotification(message) {
  const notification = document.getElementById('customNotification');
  const messageSpan = document.getElementById('notificationMessage');
  messageSpan.textContent = message; 
  notification.classList.remove('hidden');
  notification.classList.add('visible');

  
  setTimeout(() => {
    hideNotification();
  }, 3000);
}

// Skryje upozornění na stránku
function hideNotification() {
  const notification = document.getElementById('customNotification');
  notification.classList.remove('visible');
  notification.classList.add('hidden');
}


// Vrátí barvu pro daný žánr 
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


// Vytvoří tlačítko pro přepnutí mezi světlým a tmavým režimem
const header = document.querySelector('h1');
const darkModeToggle = document.createElement('button');
darkModeToggle.innerHTML = '🌙';
darkModeToggle.className = 'dark-mode-toggle';
darkModeToggle.setAttribute('title', 'Toggle Dark Mode');
header.parentNode.insertBefore(darkModeToggle, header.nextSibling);

// Načte preferovaný režim z localStorage nebo použije systémový režim
const darkModePreference =
  localStorage.getItem('darkMode') ||
  (window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'enabled'
    : 'disabled');

// Přepne režim na základě preferance
if (darkModePreference === 'enabled') {
  document.body.classList.add('dark-mode');
  darkModeToggle.innerHTML = '☀️';
}


darkModeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');

  
  darkModeToggle.innerHTML = document.body.classList.contains('dark-mode')
    ? '☀️'
    : '🌙';

  
  localStorage.setItem(
    'darkMode',
    document.body.classList.contains('dark-mode') ? 'enabled' : 'disabled'
  );
});

// Při změně systémového režimu přepne režim na základě preferance
window
  .matchMedia('(prefers-color-scheme: dark)')
  .addEventListener('change', (e) => {
    if (!localStorage.getItem('darkMode')) {
      
      document.body.classList.toggle('dark-mode', e.matches);
      darkModeToggle.innerHTML = e.matches ? '☀️' : '🌙';
    }
  });

// Nastaví výšku kontejneru pro vybrané knihy
function setSelectedBooksHeight() {
  const selectedBooks = document.querySelector('#selectedBooks');
  const viewportHeight = window.innerHeight;
  const maxListHeight = viewportHeight * 0.4; 
  selectedBooks.style.height = maxListHeight + 'px';
}

// Nastaví výšku kontejneru pro vybrané knihy
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

// Vyhledávání knih podle názvu, autora nebo žánru
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

// Aktualizuje seznamy knih
updateBookLists();
