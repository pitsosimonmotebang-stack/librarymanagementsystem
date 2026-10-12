import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import Message from "../components/Message";
import BookCard from "../components/BookCard";
import AvailabilityTable from "../components/AvailabilityTable";
import { getBooks, getUsers, getBorrowRecords, borrowBooks } from "../storage";
import { LOW_STOCK_LIMIT, MAX_LOANS, LOAN_DAYS, getStockStatus, getLoanStatus } from "../helpers";

//The Dashboard shows the current availability of every book.
//Admins see library numbers. Members see their own numbers and can borrow.
function DashboardPage(props) {
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [records, setRecords] = useState([]);
  const [viewMode, setViewMode] = useState("cards");
  const [searchText, setSearchText] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [messageText, setMessageText] = useState("");

  const isMember = props.currentUser.role === "member";

  //Load the saved data once when the page first opens.
  useEffect(function () {
    setBooks(getBooks());
    setUsers(getUsers());
    setRecords(getBorrowRecords());
  }, []);

  //useCallback keeps this function the same between renders, so the
  //message timer is not restarted every time something else changes.
  const clearMessage = useCallback(function () {
    setMessageText("");
  }, []);

  function handleSearchChange(event) {
    setSearchText(event.target.value);
  }

  function showCards() {
    setViewMode("cards");
  }

  function showTable() {
    setViewMode("table");
  }

  //Called when a member presses a Borrow button.
  function handleBorrow(book) {
    const result = borrowBooks(book.id, props.currentUser.id, 1, props.currentUser);

    if (result.ok === true) {
      setMessageType("success");
    } else {
      setMessageType("error");
    }
    setMessageText(result.message);

    //Load the new numbers so the screen is up to date.
    setBooks(getBooks());
    setRecords(getBorrowRecords());
  }

  //Work out the numbers for the stat boxes
  let totalCopies = 0;
  let lowStockCount = 0;
  const lowStockBooks = [];

  for (let i = 0; i < books.length; i = i + 1) {
    totalCopies = totalCopies + books[i].quantity;
    if (getStockStatus(books[i].quantity) !== "ok") {
      lowStockCount = lowStockCount + 1;
      lowStockBooks.push(books[i]);
    }
  }

  let memberCount = 0;
  for (let j = 0; j < users.length; j = j + 1) {
    if (users[j].role === "member") {
      memberCount = memberCount + 1;
    }
  }

  //Loans across the whole library (for admins).
  let booksOnLoan = 0;
  let overdueCount = 0;

  //Loans for the logged in member only.
  let myLoanCount = 0;
  let myOverdueCount = 0;
  const myBorrowedBookIds = [];

  for (let r = 0; r < records.length; r = r + 1) {
    const record = records[r];
    if (record.returnedAt === null) {
      booksOnLoan = booksOnLoan + 1;
      if (getLoanStatus(record) === "overdue") {
        overdueCount = overdueCount + 1;
      }
      if (record.userId === props.currentUser.id) {
        myLoanCount = myLoanCount + 1;
        myBorrowedBookIds.push(record.bookId);
        if (getLoanStatus(record) === "overdue") {
          myOverdueCount = myOverdueCount + 1;
        }
      }
    }
  }

  //Only keep the books that match what was typed in the search box
  const search = searchText.trim().toLowerCase();
  const visibleBooks = [];
  for (let k = 0; k < books.length; k = k + 1) {
    const book = books[k];
    const allText = (book.title + " " + book.author + " " + book.genre + " " + book.isbn).toLowerCase();
    if (search === "" || allText.indexOf(search) !== -1) {
      visibleBooks.push(book);
    }
  }

  let lowStockWarning = null;
  if (isMember === false && lowStockBooks.length > 0) {
    let warningText = "";
    for (let m = 0; m < lowStockBooks.length; m = m + 1) {
      warningText = warningText + lowStockBooks[m].title + " (" + lowStockBooks[m].quantity + " left)";
      if (m < lowStockBooks.length - 1) {
        warningText = warningText + ", ";
      }
    }
    lowStockWarning = (
      <div className="message message-warning">
        <strong>Running low:</strong> {warningText}
      </div>
    );
  }

  let overdueWarning = null;
  if (isMember === false && overdueCount > 0) {
    overdueWarning = (
      <div className="message message-error">
        <strong>{overdueCount} book(s) are overdue.</strong> <Link to="/records">See who has them</Link>
      </div>
    );
  }
  if (isMember === true && myOverdueCount > 0) {
    overdueWarning = (
      <div className="message message-error">
        <strong>You have {myOverdueCount} overdue book(s).</strong> Please return them on the{" "}
        <Link to="/my-books">My Books</Link> page. You cannot borrow until they are back.
      </div>
    );
  }

  //Stat boxes (different for admins and members)
  let statBoxes = null;
  if (isMember === true) {
    let loansLeft = MAX_LOANS - myLoanCount;
    if (loansLeft < 0) {
      loansLeft = 0;
    }
    statBoxes = (
      <div className="stats">
        <StatCard number={books.length} label="Book titles in the library" />
        <StatCard number={myLoanCount} label="Books you have borrowed" />
        <StatCard number={loansLeft} label={"Borrows left (limit is " + MAX_LOANS + ")"} />
        <StatCard number={myOverdueCount} label="Your overdue books" highlight={myOverdueCount > 0} />
      </div>
    );
  } else {
    statBoxes = (
      <div className="stats">
        <StatCard number={books.length} label="Book titles" />
        <StatCard number={totalCopies} label="Copies in stock" />
        <StatCard number={lowStockCount} label="Low or out of stock" highlight={lowStockCount > 0} />
        <StatCard number={booksOnLoan} label="Books on loan" />
        <StatCard number={overdueCount} label="Overdue books" highlight={overdueCount > 0} />
        <StatCard number={memberCount} label="Members" />
      </div>
    );
  }

  //Decide what to show for the book list
  let bookDisplay = null;
  if (books.length === 0) {
    bookDisplay = <p className="empty-text">No books have been added to the library yet.</p>;
  } else if (visibleBooks.length === 0) {
    bookDisplay = <p className="empty-text">No books match your search.</p>;
  } else if (viewMode === "table") {
    bookDisplay = (
      <AvailabilityTable
        books={visibleBooks}
        canBorrow={isMember}
        borrowedBookIds={myBorrowedBookIds}
        onBorrow={handleBorrow}
      />
    );
  } else {
    const cards = [];
    for (let n = 0; n < visibleBooks.length; n = n + 1) {
      cards.push(
        <BookCard
          key={visibleBooks[n].id}
          book={visibleBooks[n]}
          canBorrow={isMember}
          borrowedBookIds={myBorrowedBookIds}
          onBorrow={handleBorrow}
        />
      );
    }
    bookDisplay = <div className="card-grid">{cards}</div>;
  }

  let cardsButtonClass = "toggle-btn";
  let tableButtonClass = "toggle-btn";
  if (viewMode === "cards") {
    cardsButtonClass = "toggle-btn toggle-btn-active";
  } else {
    tableButtonClass = "toggle-btn toggle-btn-active";
  }

  //Words at the top of the page 
  let headerSubtitle = "Here is what is on the shelves right now. Books with " + LOW_STOCK_LIMIT + " or fewer copies are highlighted.";
  if (isMember === true) {
    headerSubtitle = "Browse the library and borrow up to " + MAX_LOANS + " books at a time. Each loan lasts " + LOAN_DAYS + " days.";
  }

  return (
    <div>
      <PageHeader title={isMember === true ? "Browse Books" : "Dashboard"} />

      {statBoxes}

      <Message type={messageType} text={messageText} onDismiss={clearMessage} />
      {overdueWarning}
      {lowStockWarning}

      <div className="panel">
        <div className="panel-top">
          <h2>Book Availability</h2>
          <div className="toolbar">
            <input
              className="search-input"
              type="text"
              placeholder="Search title, author or genre"
              value={searchText}
              onChange={handleSearchChange}
              aria-label="Search books"
            />
            <div className="toggle-group">
              <button className={cardsButtonClass} type="button" onClick={showCards}>
                Cards
              </button>
              <button className={tableButtonClass} type="button" onClick={showTable}>
                Table
              </button>
            </div>
          </div>
        </div>
        <p className="panel-note">{headerSubtitle}</p>
        {bookDisplay}
      </div>
    </div>
  );
}

export default DashboardPage;
