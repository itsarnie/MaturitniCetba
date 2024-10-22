let books = [];
let selectedBooks = [];
let availableBooks = [];
let removedBooks = [];
let knownAutors = [];

fetch("data.json")
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
    console.error("Error loading JSON data:", error);
  });

function createBookElement(book, isSelected = false) {
  const div = document.createElement("div");
  div.className = "book-item";

  const mainContent = document.createElement("div");
  mainContent.innerHTML = `
                <div>${book.title}</div>
                <div class="book-meta">
                    ${book.author}
                    <span class="genre-badge genre-${book.genre}">${book.genre}</span>
                </div>
            `;

  div.appendChild(mainContent);

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
  const availableContainer = document.getElementById("availableBooks");
  const selectedContainer = document.getElementById("selectedBooks");
  const countElement = document.getElementById("selectedCount");

  availableContainer.innerHTML = "";
  selectedContainer.innerHTML = "";

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
    alert("Již máte vybráno maximum 20 knih!");
    return;
  }

  const authorBooks = selectedBooks.filter((b) => b.author === book.author);
  if (authorBooks.length >= 2) {
    alert("Od jednoho autora můžete vybrat maximálně 2 díla!");
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

function generatePDF() {
  const docDefinition = {
    pageSize: "A4", // Zajištění, že se výstup vejde na stránku A4
    pageMargins: [40, 60, 40, 60], // Okraje stránky
    content: [
      {
        text: "Seznam maturitní četby",
        style: "header",
        alignment: "center",
      },
      {
        ol: selectedBooks.map((book) => {
          return {
            columns: [
              {
                text: `${book.title}`,
                width: "40%",
                bold: true,
              },
              { text: book.author, width: "30%", italics: true },
              {
                text: book.genre,
                width: "30%",
                alignment: "right",
                color: getGenreColor(book.genre),
              },
            ],
            margin: [0, 5, 0, 5],
          };
        }),
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
        margin: [0, 10, 0, 5],
      },
    },
    footer: function (currentPage, pageCount) {
      return {
        text: `SPŠ a VOŠ Kladno - ${new Date().toLocaleDateString(
          "cs-CZ"
        )} (Strana ${currentPage} z ${pageCount})`,
        alignment: "center",
        fontSize: 10,
        margin: [0, 0, 0, 20],
      };
    },
  };

  // Vygenerování a otevření PDF v novém okně
  pdfMake.createPdf(docDefinition).download("seznam-cetby.pdf");
}

// Pomocná funkce pro přiřazení barvy podle žánru
function getGenreColor(genre) {
  switch (genre) {
    case "próza":
      return "#007bff";
    case "poezie":
      return "#9c27b0";
    case "drama":
      return "#4caf50";
    default:
      return "#000000";
  }
}

function validateSelection() {
  const results = [];
  const validationContainer = document.getElementById("validationResults");

  const totalCount = selectedBooks.length;
  const before1800 = selectedBooks.filter((b) => b.period === "18").length;
  const century19 = selectedBooks.filter((b) => b.period === "19").length;
  const century20World = selectedBooks.filter(
    (b) => b.period === "20" && !b.isCzech
  ).length;
  const century20Czech = selectedBooks.filter(
    (b) => b.period === "20" && b.isCzech
  ).length;
  const prose = selectedBooks.filter((b) => b.genre === "próza").length;
  const poetry = selectedBooks.filter((b) => b.genre === "poezie").length;
  const drama = selectedBooks.filter((b) => b.genre === "drama").length;

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
    message: `Světová literatura 20. století: ${century20World}/4`,
  });
  results.push({
    valid: century20Czech >= 5,
    message: `Česká literatura 20. století: ${century20Czech}/5`,
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
                  result.valid ? "valid" : "invalid"
                }">
                    ${result.valid ? "✓" : "✗"} ${result.message}
                </div>
            `
    )
    .join("");
}

document.getElementById("searchBox").addEventListener("input", (e) => {
  const searchTerm = e.target.value.toLowerCase();
  const filteredBooks = books.filter(
    (book) =>
      !selectedBooks.includes(book) &&
      (book.title.toLowerCase().includes(searchTerm) ||
        book.author.toLowerCase().includes(searchTerm))
  );
  availableBooks = filteredBooks;
  updateBookLists();
});

updateBookLists();
