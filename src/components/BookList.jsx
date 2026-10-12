import React from "react";
import BookRow from "./BookRow";

// The list of all books on the Book Management page.
function BookList(props) {
  if (props.books.length === 0) {
    return <p className="empty-text">There are no books yet. Use the form above to add the first one.</p>;
  }

  const rows = [];
  for (let i = 0; i < props.books.length; i = i + 1) {
    rows.push(
      <BookRow
        key={props.books[i].id}
        book={props.books[i]}
        onUpdate={props.onUpdate}
        onDelete={props.onDelete}
      />
    );
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
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    </div>
  );
}

export default BookList;
