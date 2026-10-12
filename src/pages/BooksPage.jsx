import React, { useState, useEffect, useCallback } from "react";
import PageHeader from "../components/PageHeader";
import Message from "../components/Message";
import BookForm from "../components/BookForm";
import BookList from "../components/BookList";
import { getBooks, addBook, updateBook, deleteBook, countActiveLoansForBook } from "../storage";

//Book Management page: add, update and delete books.
function BooksPage() {
  const [books, setBooks] = useState([]);
  const [bookToEdit, setBookToEdit] = useState(null);
  const [messageType, setMessageType] = useState("success");
  const [messageText, setMessageText] = useState("");

  useEffect(function () {
    setBooks(getBooks());
  }, []);

  const clearMessage = useCallback(function () {
    setMessageText("");
  }, []);

  function showMessage(type, text) {
    setMessageType(type);
    setMessageText(text);
  }

  //Called by the form when it passes validation.
  function handleSaveBook(bookData) {
    if (bookToEdit !== null) {
      updateBook(bookToEdit.id, bookData);
      showMessage("success", "\"" + bookData.title + "\" was updated.");
      setBookToEdit(null);
    } else {
      addBook(bookData);
      showMessage("success", "\"" + bookData.title + "\" was added to the library.");
    }
    setBooks(getBooks());
  }

  //Called when the Update button on a row is pressed.
  function handleUpdateClick(book) {
    setBookToEdit(book);
    setMessageText("");
    //Scroll up so the person can see the form that was just filled in.
    window.scrollTo(0, 0);
  }

  function handleDeleteClick(book) {
    //A book that is out on loan cannot be deleted, otherwise we lose track of it.
    const copiesOnLoan = countActiveLoansForBook(book.id);
    if (copiesOnLoan > 0) {
      showMessage("error", "\"" + book.title + "\" cannot be deleted while " + copiesOnLoan + " copy/copies are on loan.");
      return;
    }

    const userSaidYes = window.confirm("Are you sure you want to delete \"" + book.title + "\"?");
    if (userSaidYes === false) {
      return;
    }

    deleteBook(book.id);
    setBooks(getBooks());

    //If the deleted book was being edited, stop editing it.
    if (bookToEdit !== null && bookToEdit.id === book.id) {
      setBookToEdit(null);
    }
    showMessage("success", "\"" + book.title + "\" was deleted.");
  }

  function handleCancelEdit() {
    setBookToEdit(null);
  }

  return (
    <div>
      <PageHeader title="Book Management" />

      <Message type={messageType} text={messageText} onDismiss={clearMessage} />

      <BookForm bookToEdit={bookToEdit} onSave={handleSaveBook} onCancel={handleCancelEdit} />

      <div className="panel">
        <h2>All Books ({books.length})</h2>
        <BookList books={books} onUpdate={handleUpdateClick} onDelete={handleDeleteClick} />
      </div>
    </div>
  );
}

export default BooksPage;
