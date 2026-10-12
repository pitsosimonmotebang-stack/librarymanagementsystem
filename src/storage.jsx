import { MAX_LOANS, LOAN_DAYS, formatDate, getLoanStatus } from "./helpers";

const BOOKS_KEY = "library_books";
const USERS_KEY = "library_users";
const TRANSACTIONS_KEY = "library_transactions";
const RECORDS_KEY = "library_borrow_records";
const SESSION_KEY = "library_current_user_id";
const SEEDED_KEY = "library_demo_seeded";

const ONE_DAY = 24 * 60 * 60 * 1000;

// ---------- Basic read and write functions ----------

function readList(key) {
  const savedText = localStorage.getItem(key);
  if (savedText === null) {
    return [];
  }
  try {
    const list = JSON.parse(savedText);
    return list;
  } catch (error) {
    // If the saved text is broken we just start with an empty list.
    return [];
  }
}

function writeList(key, list) {
  const textToSave = JSON.stringify(list);
  localStorage.setItem(key, textToSave);
}

// Makes a simple unique id from the time, a counter and a random number.
let idCounter = 0;
function makeId() {
  idCounter = idCounter + 1;
  const timePart = Date.now().toString();
  const randomPart = Math.floor(Math.random() * 100000).toString();
  return timePart + "-" + idCounter + "-" + randomPart;
}

//Removes dashes and spaces from an ISBN
function cleanIsbn(isbn) {
  let cleaned = isbn.replace(/-/g, "");
  cleaned = cleaned.replace(/ /g, "");
  return cleaned.toLowerCase();
}

//Users

export function getUsers() {
  return readList(USERS_KEY);
}

export function saveUsers(users) {
  writeList(USERS_KEY, users);
}

export function getUserById(id) {
  const users = getUsers();
  for (let i = 0; i < users.length; i = i + 1) {
    if (users[i].id === id) {
      return users[i];
    }
  }
  return null;
}

// The very first time the app runs there are no users, so we make an admin.
// Without this nobody would be able to log in.
export function ensureDefaultAdmin() {
  const users = getUsers();
  let adminFound = false;

  for (let i = 0; i < users.length; i = i + 1) {
    if (users[i].role === "admin") {
      adminFound = true;
    }
  }

  if (adminFound === false) {
    const defaultAdmin = {
      id: makeId(),
      name: "Administrator",
      membershipId: "ADMIN001",
      password: "admin123",
      role: "admin",
    };
    users.push(defaultAdmin);
    saveUsers(users);
  }
}

export function addUser(userData) {
  const users = getUsers();
  const newUser = {
    id: makeId(),
    name: userData.name,
    membershipId: userData.membershipId,
    password: userData.password,
    role: userData.role,
  };
  users.push(newUser);
  saveUsers(users);
  return newUser;
}

export function updateUser(id, userData) {
  const users = getUsers();
  for (let i = 0; i < users.length; i = i + 1) {
    if (users[i].id === id) {
      users[i].name = userData.name;
      users[i].membershipId = userData.membershipId;
      users[i].role = userData.role;
      // Only change the password if a new one was typed in.
      if (userData.password !== "") {
        users[i].password = userData.password;
      }
    }
  }
  saveUsers(users);

  // Borrow records and the history log keep a copy of the name as text,
  // so after a rename we have to update those copies too.
  refreshUserInHistory(id, userData.name, userData.membershipId);
}

export function deleteUser(id) {
  const users = getUsers();
  const remainingUsers = [];
  for (let i = 0; i < users.length; i = i + 1) {
    if (users[i].id !== id) {
      remainingUsers.push(users[i]);
    }
  }
  saveUsers(remainingUsers);
}

export function countAdmins() {
  const users = getUsers();
  let total = 0;
  for (let i = 0; i < users.length; i = i + 1) {
    if (users[i].role === "admin") {
      total = total + 1;
    }
  }
  return total;
}

//Checks if a membership ID is already used by someone else
//ignoreId is used when editing so a user does not clash with themselves
export function membershipIdExists(membershipId, ignoreId) {
  const users = getUsers();
  const wanted = membershipId.trim().toLowerCase();
  for (let i = 0; i < users.length; i = i + 1) {
    const existing = users[i].membershipId.toLowerCase();
    if (existing === wanted && users[i].id !== ignoreId) {
      return true;
    }
  }
  return false;
}

//Used by the login form. Returns the user if the details are right or null
export function findUserByLogin(membershipId, password) {
  const users = getUsers();
  const wanted = membershipId.trim().toLowerCase();
  for (let i = 0; i < users.length; i = i + 1) {
    const existing = users[i].membershipId.toLowerCase();
    if (existing === wanted && users[i].password === password) {
      return users[i];
    }
  }
  return null;
}

//Login session (so a page refresh does not log you out)

export function saveSession(userId) {
  localStorage.setItem(SESSION_KEY, userId);
}

export function loadSession() {
  const savedId = localStorage.getItem(SESSION_KEY);
  if (savedId === null) {
    return null;
  }
  return getUserById(savedId);
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

//Books

export function getBooks() {
  return readList(BOOKS_KEY);
}

export function saveBooks(books) {
  writeList(BOOKS_KEY, books);
}

export function addBook(bookData) {
  const books = getBooks();
  const newBook = {
    id: makeId(),
    title: bookData.title,
    author: bookData.author,
    genre: bookData.genre,
    isbn: bookData.isbn,
    quantity: bookData.quantity,
  };
  books.push(newBook);
  saveBooks(books);
  return newBook;
}

//Updates the details of a book. The quantity is NOT changed here on purpose
//Stock can only change through a transaction (add or deduct), a borrow or a
//return, so every change is written in the history log
export function updateBook(id, bookData) {
  const books = getBooks();
  for (let i = 0; i < books.length; i = i + 1) {
    if (books[i].id === id) {
      books[i].title = bookData.title;
      books[i].author = bookData.author;
      books[i].genre = bookData.genre;
      books[i].isbn = bookData.isbn;
    }
  }
  saveBooks(books);

  //Borrow records and the history log keep a copy of the title as text,
  //so after a rename we have to update those copies too
  refreshBookTitleInHistory(id, bookData.title);
}

export function deleteBook(id) {
  const books = getBooks();
  const remainingBooks = [];
  for (let i = 0; i < books.length; i = i + 1) {
    if (books[i].id !== id) {
      remainingBooks.push(books[i]);
    }
  }
  saveBooks(remainingBooks);
}

//Checks if another book already uses this ISBN.
export function isbnExists(isbn, ignoreId) {
  const books = getBooks();
  const wanted = cleanIsbn(isbn);
  for (let i = 0; i < books.length; i = i + 1) {
    const existing = cleanIsbn(books[i].isbn);
    if (existing === wanted && books[i].id !== ignoreId) {
      return true;
    }
  }
  return false;
}

//Transactions

export function getTransactions() {
  return readList(TRANSACTIONS_KEY);
}

function logTransaction(book, typeLabel, quantity, stockAfter, member, recordedByUser, whenTime) {
  let memberId = "";
  let memberName = "";
  if (member !== null) {
    memberId = member.id;
    memberName = member.name;
  }

  const transactions = getTransactions();
  const newTransaction = {
    id: makeId(),
    date: new Date(whenTime).toLocaleString(),
    bookId: book.id,
    bookTitle: book.title,
    type: typeLabel,
    quantity: quantity,
    stockAfter: stockAfter,
    memberId: memberId,
    memberName: memberName,
    recordedById: recordedByUser.id,
    recordedBy: recordedByUser.name,
  };
  //unshift puts the newest transaction at the top of the list
  transactions.unshift(newTransaction);
  writeList(TRANSACTIONS_KEY, transactions);
}

//type is either "add" (new stock arrived) or "deduct" (copies removed).
//This changes the book's quantity AND writes a line in the history log.
//It returns an object that says if it worked and what message to show.
export function recordTransaction(bookId, type, quantity, recordedByUser) {
  const books = getBooks();
  let bookIndex = -1;

  for (let i = 0; i < books.length; i = i + 1) {
    if (books[i].id === bookId) {
      bookIndex = i;
    }
  }

  if (bookIndex === -1) {
    return { ok: false, message: "That book could not be found." };
  }

  const book = books[bookIndex];
  let newQuantity = 0;
  let typeLabel = "";

  if (type === "add") {
    newQuantity = book.quantity + quantity;
    typeLabel = "Stock Added";
  } else {
    if (quantity > book.quantity) {
      return {
        ok: false,
        message: "Only " + book.quantity + " copies are in stock, so you cannot deduct " + quantity + ".",
      };
    }
    newQuantity = book.quantity - quantity;
    typeLabel = "Stock Deducted";
  }

  books[bookIndex].quantity = newQuantity;
  saveBooks(books);
  logTransaction(book, typeLabel, quantity, newQuantity, null, recordedByUser, Date.now());

  return {
    ok: true,
    message: typeLabel + ": " + quantity + " x \"" + book.title + "\". Copies now in stock: " + newQuantity + ".",
  };
}

//Borrow records (who borrowed what and when)

export function getBorrowRecords() {
  return readList(RECORDS_KEY);
}

function saveBorrowRecords(records) {
  writeList(RECORDS_KEY, records);
}

//All the books a member has right now (not returned yet)
export function getActiveLoansForUser(userId) {
  const records = getBorrowRecords();
  const activeLoans = [];
  for (let i = 0; i < records.length; i = i + 1) {
    if (records[i].userId === userId && records[i].returnedAt === null) {
      activeLoans.push(records[i]);
    }
  }
  return activeLoans;
}

export function countActiveLoansForUser(userId) {
  return getActiveLoansForUser(userId).length;
}

export function countActiveLoansForBook(bookId) {
  const records = getBorrowRecords();
  let total = 0;
  for (let i = 0; i < records.length; i = i + 1) {
    if (records[i].bookId === bookId && records[i].returnedAt === null) {
      total = total + 1;
    }
  }
  return total;
}

export function userHasOverdueLoan(userId) {
  const activeLoans = getActiveLoansForUser(userId);
  for (let i = 0; i < activeLoans.length; i = i + 1) {
    if (getLoanStatus(activeLoans[i]) === "overdue") {
      return true;
    }
  }
  return false;
}

//Gives one or more copies of a book to a member.
//It checks the library rules first, then lowers the stock, creates the
//borrow record and writes the history log.
export function borrowBooks(bookId, userId, quantity, recordedByUser) {
  const books = getBooks();
  let bookIndex = -1;
  for (let i = 0; i < books.length; i = i + 1) {
    if (books[i].id === bookId) {
      bookIndex = i;
    }
  }
  if (bookIndex === -1) {
    return { ok: false, message: "That book could not be found." };
  }

  const user = getUserById(userId);
  if (user === null) {
    return { ok: false, message: "That member could not be found." };
  }

  const book = books[bookIndex];
  const activeLoans = getActiveLoansForUser(userId);

  if (userHasOverdueLoan(userId)) {
    return { ok: false, message: "Borrowing is blocked because this account has an overdue book. Return it first." };
  }

  if (quantity > 1) {
    return { ok: false, message: "Only one copy of the same title can be borrowed at a time." };
  }

  for (let j = 0; j < activeLoans.length; j = j + 1) {
    if (activeLoans[j].bookId === bookId) {
      return { ok: false, message: "This account already has a copy of \"" + book.title + "\" on loan." };
    }
  }

  if (activeLoans.length + quantity > MAX_LOANS) {
    return {
      ok: false,
      message: "Borrowing limit reached. A member can hold at most " + MAX_LOANS + " books at a time.",
    };
  }

  if (book.quantity < quantity) {
    return { ok: false, message: "Sorry, no copies of \"" + book.title + "\" are available right now." };
  }

  const nowTime = Date.now();
  const dueTime = nowTime + LOAN_DAYS * ONE_DAY;

  const records = getBorrowRecords();
  const newRecord = {
    id: makeId(),
    bookId: book.id,
    bookTitle: book.title,
    userId: user.id,
    userName: user.name,
    membershipId: user.membershipId,
    borrowedAt: new Date(nowTime).toISOString(),
    dueAt: new Date(dueTime).toISOString(),
    returnedAt: null,
  };
  records.unshift(newRecord);
  saveBorrowRecords(records);

  const newQuantity = book.quantity - quantity;
  books[bookIndex].quantity = newQuantity;
  saveBooks(books);

  logTransaction(book, "Book Borrowed", quantity, newQuantity, user, recordedByUser, nowTime);

  return {
    ok: true,
    message: "\"" + book.title + "\" was borrowed by " + user.name + ". It is due back on " + formatDate(newRecord.dueAt) + ".",
  };
}

//Takes a book back: stamps the return time and puts the copy back on the shelf
export function returnBook(recordId, recordedByUser) {
  const records = getBorrowRecords();
  let recordIndex = -1;
  for (let i = 0; i < records.length; i = i + 1) {
    if (records[i].id === recordId) {
      recordIndex = i;
    }
  }

  if (recordIndex === -1 || records[recordIndex].returnedAt !== null) {
    return { ok: false, message: "That loan could not be found or was already returned." };
  }

  const nowTime = Date.now();
  records[recordIndex].returnedAt = new Date(nowTime).toISOString();
  saveBorrowRecords(records);

  const record = records[recordIndex];

  //The member who is returning the book (we only need their id and name)
  let member = getUserById(record.userId);
  if (member === null) {
    member = { id: record.userId, name: record.userName };
  }

  const books = getBooks();
  for (let j = 0; j < books.length; j = j + 1) {
    if (books[j].id === record.bookId) {
      books[j].quantity = books[j].quantity + 1;
      logTransaction(books[j], "Book Returned", 1, books[j].quantity, member, recordedByUser, nowTime);
    }
  }
  saveBooks(books);

  let message = "\"" + record.bookTitle + "\" was returned. Thank you!";
  if (getLoanStatus(record) === "returned-late") {
    message = "\"" + record.bookTitle + "\" was returned, but it was past its due date.";
  }
  return { ok: true, message: message };
}

//Keeping old records up to date after a rename

// A book was renamed: change the title in every borrow record and history line.
function refreshBookTitleInHistory(bookId, newTitle) {
  const records = getBorrowRecords();
  for (let i = 0; i < records.length; i = i + 1) {
    if (records[i].bookId === bookId) {
      records[i].bookTitle = newTitle;
    }
  }
  saveBorrowRecords(records);

  const transactions = getTransactions();
  for (let j = 0; j < transactions.length; j = j + 1) {
    if (transactions[j].bookId === bookId) {
      transactions[j].bookTitle = newTitle;
    }
  }
  writeList(TRANSACTIONS_KEY, transactions);
}

//A user was changed: update their name and membership ID in every borrow
//record, and their name in the history log (as the member or as the person
//who recorded the action).
function refreshUserInHistory(userId, newName, newMembershipId) {
  const records = getBorrowRecords();
  for (let i = 0; i < records.length; i = i + 1) {
    if (records[i].userId === userId) {
      records[i].userName = newName;
      records[i].membershipId = newMembershipId;
    }
  }
  saveBorrowRecords(records);

  const transactions = getTransactions();
  for (let j = 0; j < transactions.length; j = j + 1) {
    if (transactions[j].memberId === userId) {
      transactions[j].memberName = newName;
    }
    if (transactions[j].recordedById === userId) {
      transactions[j].recordedBy = newName;
    }
  }
  writeList(TRANSACTIONS_KEY, transactions);
}

//Sample data so the library does not look empty on day one
//This only runs ONE time, and only if there are no books or loans yet
//It adds some books, two members and a few loans (one of them overdue)

export function seedDemoData() {
  if (localStorage.getItem(SEEDED_KEY) !== null) {
    return;
  }
  localStorage.setItem(SEEDED_KEY, "yes");

  if (getBooks().length > 0 || getBorrowRecords().length > 0) {
    return;
  }
  if (membershipIdExists("MEM001", null) || membershipIdExists("MEM002", null)) {
    return;
  }

  const palesa = addUser({ name: "Tau Sebolai", membershipId: "MEM001", password: "member123", role: "member" });
  const thabo = addUser({ name: "Thaabe Letsie", membershipId: "MEM002", password: "member123", role: "member" });

  const sampleBooks = [
    { title: "Mopheme", author: "Moshoeshoe 1", genre: "Lipale", isbn: "9780385474542", copies: 5 },
    { title: "Chaka", author: "Thomas Mofolo", genre: "Lipale", isbn: "9780061120084", copies: 3 },
    { title: "1984", author: "George Orwell", genre: "Dystopian", isbn: "9780451524935", copies: 4 },
    { title: "The Alchemist", author: "Paulo Coelho", genre: "Fiction", isbn: "9780062315007", copies: 2 },
    { title: "Long Walk to Freedom", author: "Nelson Mandela", genre: "Biography", isbn: "9780316548182", copies: 3 },
    { title: "Born a Crime", author: "Trevor Noah", genre: "Memoir", isbn: "9780399588174", copies: 2 },
    { title: "A Brief History of Time", author: "Stephen Hawking", genre: "Science", isbn: "9780553380163", copies: 2 },
  ];

  //Build the book list with 0 copies first. The events below fill in the stock.
  const books = [];
  for (let i = 0; i < sampleBooks.length; i = i + 1) {
    books.push({
      id: makeId(),
      title: sampleBooks[i].title,
      author: sampleBooks[i].author,
      genre: sampleBooks[i].genre,
      isbn: sampleBooks[i].isbn,
      quantity: 0,
    });
  }

  //The admin is the one who adds the first stock
  let adminUser = { id: "", name: "Administrator" };
  const allUsers = getUsers();
  for (let a = 0; a < allUsers.length; a = a + 1) {
    if (allUsers[a].role === "admin") {
      adminUser = allUsers[a];
    }
  }

  const nowTime = Date.now();
  const events = [];

  //Every book first arrives as new stock, 60 days ago.
  for (let j = 0; j < books.length; j = j + 1) {
    events.push({ time: nowTime - 60 * ONE_DAY, kind: "stock", book: books[j], copies: sampleBooks[j].copies });
  }

  // Some loans: which book, who borrowed it, how many days ago and when it came back.
  const loanPlans = [
    { bookIndex: 2, user: thabo, borrowedDaysAgo: 20, returnedDaysAgo: null },
    { bookIndex: 3, user: palesa, borrowedDaysAgo: 3, returnedDaysAgo: null },
    { bookIndex: 6, user: thabo, borrowedDaysAgo: 5, returnedDaysAgo: null },
    { bookIndex: 0, user: palesa, borrowedDaysAgo: 25, returnedDaysAgo: 15 },
    { bookIndex: 5, user: palesa, borrowedDaysAgo: 40, returnedDaysAgo: 20 },
    { bookIndex: 1, user: thabo, borrowedDaysAgo: 12, returnedDaysAgo: 4 },
  ];

  const records = [];
  for (let k = 0; k < loanPlans.length; k = k + 1) {
    const plan = loanPlans[k];
    const borrowTime = nowTime - plan.borrowedDaysAgo * ONE_DAY;
    const book = books[plan.bookIndex];

    let returnedText = null;
    if (plan.returnedDaysAgo !== null) {
      returnedText = new Date(nowTime - plan.returnedDaysAgo * ONE_DAY).toISOString();
    }

    const record = {
      id: makeId(),
      bookId: book.id,
      bookTitle: book.title,
      userId: plan.user.id,
      userName: plan.user.name,
      membershipId: plan.user.membershipId,
      borrowedAt: new Date(borrowTime).toISOString(),
      dueAt: new Date(borrowTime + LOAN_DAYS * ONE_DAY).toISOString(),
      returnedAt: returnedText,
    };
    records.push(record);

    events.push({ time: borrowTime, kind: "borrow", book: book, user: plan.user });
    if (plan.returnedDaysAgo !== null) {
      events.push({ time: nowTime - plan.returnedDaysAgo * ONE_DAY, kind: "return", book: book, user: plan.user });
    }
  }

  //Go through everything in the order it happened, so the stock numbers are right
  events.sort(function (a, b) {
    return a.time - b.time;
  });

  for (let m = 0; m < events.length; m = m + 1) {
    const event = events[m];
    if (event.kind === "stock") {
      event.book.quantity = event.book.quantity + event.copies;
      logTransaction(event.book, "Stock Added", event.copies, event.book.quantity, null, adminUser, event.time);
    } else if (event.kind === "borrow") {
      event.book.quantity = event.book.quantity - 1;
      logTransaction(event.book, "Book Borrowed", 1, event.book.quantity, event.user, event.user, event.time);
    } else {
      event.book.quantity = event.book.quantity + 1;
      logTransaction(event.book, "Book Returned", 1, event.book.quantity, event.user, event.user, event.time);
    }
  }

  //Newest loans at the top of the list.
  records.sort(function (a, b) {
    return new Date(b.borrowedAt).getTime() - new Date(a.borrowedAt).getTime();
  });

  saveBooks(books);
  saveBorrowRecords(records);
}
