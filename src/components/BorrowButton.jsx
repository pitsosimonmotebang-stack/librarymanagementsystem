import React from "react";

// The Borrow button shown next to a book (only members see it).
// It switches itself off when the book cannot be borrowed.
function BorrowButton(props) {
  const book = props.book;

  // Check if this member already has a copy of this book.
  let alreadyBorrowed = false;
  for (let i = 0; i < props.borrowedBookIds.length; i = i + 1) {
    if (props.borrowedBookIds[i] === book.id) {
      alreadyBorrowed = true;
    }
  }

  function handleClick() {
    props.onBorrow(book);
  }

  let buttonText = "Borrow";
  let isDisabled = false;

  if (alreadyBorrowed === true) {
    buttonText = "Already Borrowed";
    isDisabled = true;
  } else if (book.quantity <= 0) {
    buttonText = "Unavailable";
    isDisabled = true;
  }

  return (
    <button type="button" disabled={isDisabled} onClick={handleClick}>
      {buttonText}
    </button>
  );
}

export default BorrowButton;
