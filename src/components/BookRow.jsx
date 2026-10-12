import React from "react";
import StockBadge from "./StockBadge";
import { getStockRowClass } from "../helpers";

// One row in the editable book list. It has the Update and Delete buttons.
function BookRow(props) {
  const book = props.book;

  function handleUpdateClick() {
    props.onUpdate(book);
  }

  function handleDeleteClick() {
    props.onDelete(book);
  }

  const rowClass = getStockRowClass(book.quantity);

  return (
    <tr className={rowClass}>
      <td>{book.title}</td>
      <td>{book.author}</td>
      <td>{book.genre}</td>
      <td>{book.isbn}</td>
      <td>
        {book.quantity} <StockBadge quantity={book.quantity} />
      </td>
      <td>
        <div className="action-group">
          <button type="button" onClick={handleUpdateClick}>
            Update
          </button>
          <button className="danger" type="button" onClick={handleDeleteClick}>
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}

export default BookRow;
