import React, { useState, useEffect } from "react";
import FormField from "./FormField";
import { isbnExists } from "../storage";

// This form is used for BOTH adding a new book and updating an old one.
// When props.bookToEdit has a book in it, the form fills itself in.
function BookForm(props) {
  const bookToEdit = props.bookToEdit;

  // Each input has its own piece of state (these are controlled inputs).
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [genre, setGenre] = useState("");
  const [isbn, setIsbn] = useState("");
  const [quantity, setQuantity] = useState("");
  const [errors, setErrors] = useState({});

  // useEffect runs when bookToEdit changes. If we are editing, copy the
  // book's details into the inputs. If not, clear the inputs.
  useEffect(
    function () {
      if (bookToEdit !== null) {
        setTitle(bookToEdit.title);
        setAuthor(bookToEdit.author);
        setGenre(bookToEdit.genre);
        setIsbn(bookToEdit.isbn);
        setQuantity(String(bookToEdit.quantity));
      } else {
        setTitle("");
        setAuthor("");
        setGenre("");
        setIsbn("");
        setQuantity("");
      }
      setErrors({});
    },
    [bookToEdit]
  );

  function handleTitleChange(event) {
    setTitle(event.target.value);
  }

  function handleAuthorChange(event) {
    setAuthor(event.target.value);
  }

  function handleGenreChange(event) {
    setGenre(event.target.value);
  }

  function handleIsbnChange(event) {
    setIsbn(event.target.value);
  }

  function handleQuantityChange(event) {
    setQuantity(event.target.value);
  }

  // Checks every field. Returns true only if there are no problems.
  function validateForm() {
    const newErrors = {};

    if (title.trim() === "") {
      newErrors.title = "Please enter the book title.";
    }

    if (author.trim() === "") {
      newErrors.author = "Please enter the author's name.";
    }

    if (genre.trim() === "") {
      newErrors.genre = "Please enter the genre.";
    }

    if (isbn.trim() === "") {
      newErrors.isbn = "Please enter the ISBN.";
    } else {
      let digitsOnly = isbn.replace(/-/g, "");
      digitsOnly = digitsOnly.replace(/ /g, "");
      const isTenDigits = /^[0-9]{9}[0-9Xx]$/.test(digitsOnly);
      const isThirteenDigits = /^[0-9]{13}$/.test(digitsOnly);

      if (isTenDigits === false && isThirteenDigits === false) {
        newErrors.isbn = "An ISBN must have 10 or 13 digits (dashes are allowed).";
      } else {
        let ignoreId = null;
        if (bookToEdit !== null) {
          ignoreId = bookToEdit.id;
        }
        if (isbnExists(isbn, ignoreId)) {
          newErrors.isbn = "Another book already uses this ISBN.";
        }
      }
    }

    // The quantity is only typed in when ADDING a book.
    // When updating, the field is locked, so there is nothing to check.
    if (bookToEdit === null) {
      if (quantity === "") {
        newErrors.quantity = "Please enter the quantity.";
      } else if (Number.isInteger(Number(quantity)) === false) {
        newErrors.quantity = "The quantity must be a whole number.";
      } else if (Number(quantity) < 0) {
        newErrors.quantity = "The quantity cannot be below 0.";
      }
    }

    setErrors(newErrors);

    const errorNames = Object.keys(newErrors);
    if (errorNames.length === 0) {
      return true;
    }
    return false;
  }

  function handleSubmit(event) {
    event.preventDefault();

    const formIsValid = validateForm();
    if (formIsValid === false) {
      return;
    }

    // When updating we keep the book's current quantity as it is.
    let quantityToSave = Number(quantity);
    if (bookToEdit !== null) {
      quantityToSave = bookToEdit.quantity;
    }

    const bookData = {
      title: title.trim(),
      author: author.trim(),
      genre: genre.trim(),
      isbn: isbn.trim(),
      quantity: quantityToSave,
    };

    props.onSave(bookData);

    // After adding a new book, empty the inputs ready for the next one.
    // (When editing, the page sets bookToEdit back to null and the useEffect clears them.)
    if (bookToEdit === null) {
      setTitle("");
      setAuthor("");
      setGenre("");
      setIsbn("");
      setQuantity("");
      setErrors({});
    }
  }

  // Change the words on the screen depending on add or update mode.
  let heading = "Add a New Book";
  let quantityLabel = "Initial Quantity";
  let submitText = "Add Book";
  let cancelButton = null;
  let quantityLocked = false;
  let quantityHint = "";

  if (bookToEdit !== null) {
    heading = "Update Book Details";
    quantityLabel = "Quantity in Stock";
    quantityLocked = true;
    quantityHint = "Locked. Change stock on the Transactions page so it is recorded in the history.";
    submitText = "Save Changes";
    cancelButton = (
      <button className="btn btn-secondary" type="button" onClick={props.onCancel}>
        Cancel
      </button>
    );
  }

  return (
    <div className="panel">
      <h2>{heading}</h2>
      <form onSubmit={handleSubmit} noValidate>
        <div className="form-grid">
          <FormField
            id="title"
            label="Title"
            type="text"
            value={title}
            onChange={handleTitleChange}
            placeholder="Title"
            error={errors.title}
          />
          <FormField
            id="author"
            label="Author"
            type="text"
            value={author}
            onChange={handleAuthorChange}
            placeholder="Author"
            error={errors.author}
          />
          <FormField
            id="genre"
            label="Genre"
            type="text"
            value={genre}
            onChange={handleGenreChange}
            placeholder="Genre"
            error={errors.genre}
          />
          <FormField
            id="isbn"
            label="ISBN"
            type="text"
            value={isbn}
            onChange={handleIsbnChange}
            placeholder="ISBN"
            error={errors.isbn}
          />
          <FormField
            id="quantity"
            label={quantityLabel}
            type="number"
            min="0"
            value={quantity}
            onChange={handleQuantityChange}
            placeholder="Quantity"
            disabled={quantityLocked}
            hint={quantityHint}
            error={errors.quantity}
          />
        </div>
        <div className="form-buttons">
          <button className="btn" type="submit">
            {submitText}
          </button>
          {cancelButton}
        </div>
      </form>
    </div>
  );
}

export default BookForm;
