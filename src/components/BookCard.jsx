import React from "react";
import BorrowButton from "./BorrowButton";
import StockBadge from "./StockBadge";
import { getStockCardClass } from "../helpers";

// One book shown as a card (used by the dashboard card layout).
function BookCard(props) {
  const book = props.book;

  // low and out of stock cards get an extra class so they are highlighted.
  const cardClass = getStockCardClass(book.quantity);

  // Members get a Borrow button at the bottom of the card.
  let borrowArea = null;
  if (props.canBorrow === true) {
    borrowArea = (
      <div className="book-card-action action-group">
        <BorrowButton book={book} borrowedBookIds={props.borrowedBookIds} onBorrow={props.onBorrow} />
      </div>
    );
  }

  return (
    <div className={cardClass}>
      <span className="book-card-genre">{book.genre}</span>
      <h3>{book.title}</h3>
      <p className="book-card-author">by {book.author}</p>
      <p className="book-card-isbn">ISBN: {book.isbn}</p>
      <div className="book-card-bottom">
        <span className="book-card-count">
          {book.quantity}
          <small> in stock</small>
        </span>
        <StockBadge quantity={book.quantity} />
      </div>
      {borrowArea}
    </div>
  );
}

export default BookCard;
