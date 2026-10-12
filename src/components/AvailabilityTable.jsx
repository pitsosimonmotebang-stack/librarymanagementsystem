import React from "react";
import BorrowButton from "./BorrowButton";
import StockBadge from "./StockBadge";
import { getStockRowClass } from "../helpers";

// The dashboard table layout. Low stock rows are coloured.
// Members also get a Borrow button in the last column.
function AvailabilityTable(props) {
  const rows = [];

  for (let i = 0; i < props.books.length; i = i + 1) {
    const book = props.books[i];
    const rowClass = getStockRowClass(book.quantity);

    let borrowCell = null;
    if (props.canBorrow === true) {
      borrowCell = (
        <td>
          <div className="action-group">
            <BorrowButton book={book} borrowedBookIds={props.borrowedBookIds} onBorrow={props.onBorrow} />
          </div>
        </td>
      );
    }

    rows.push(
      <tr key={book.id} className={rowClass}>
        <td>{book.title}</td>
        <td>{book.author}</td>
        <td>{book.genre}</td>
        <td>{book.isbn}</td>
        <td>{book.quantity}</td>
        <td>
          <StockBadge quantity={book.quantity} />
        </td>
        {borrowCell}
      </tr>
    );
  }

  let borrowHeading = null;
  if (props.canBorrow === true) {
    borrowHeading = <th>Action</th>;
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Author</th>
            <th>Genre</th>
            <th>ISBN</th>
            <th>Quantity</th>
            <th>Status</th>
            {borrowHeading}
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    </div>
  );
}

export default AvailabilityTable;
