import React, { useState } from "react";
import FormField from "./FormField";
import SelectField from "./SelectField";

// The form on the Transactions page. The librarian picks a book, types
// a quantity and then presses either "Add Stock" or "Deduct Stock".
function StockForm(props) {
  const [bookId, setBookId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [memberId, setMemberId] = useState("");
  const [errors, setErrors] = useState({});

  function handleBookChange(event) {
    setBookId(event.target.value);
  }

  function handleQuantityChange(event) {
    setQuantity(event.target.value);
  }

  function handleMemberChange(event) {
    setMemberId(event.target.value);
  }

  // Find the book object that matches the chosen id.
  function findSelectedBook() {
    for (let i = 0; i < props.books.length; i = i + 1) {
      if (props.books[i].id === bookId) {
        return props.books[i];
      }
    }
    return null;
  }

  function validateForm(type) {
    const newErrors = {};
    const selectedBook = findSelectedBook();

    if (bookId === "" || selectedBook === null) {
      newErrors.bookId = "Please choose a book.";
    }

    if (quantity === "") {
      newErrors.quantity = "Please enter a quantity.";
    } else if (Number.isInteger(Number(quantity)) === false) {
      newErrors.quantity = "The quantity must be a whole number.";
    } else if (Number(quantity) < 1) {
      newErrors.quantity = "The quantity must be at least 1.";
    } else if (type === "deduct" && selectedBook !== null && Number(quantity) > selectedBook.quantity) {
      newErrors.quantity = "Only " + selectedBook.quantity + " copies are in stock.";
    }

    setErrors(newErrors);

    const errorNames = Object.keys(newErrors);
    if (errorNames.length === 0) {
      return true;
    }
    return false;
  }

  function submitTransaction(type) {
    const formIsValid = validateForm(type);
    if (formIsValid === false) {
      return;
    }

    // The member is only used when deducting (checking a book out to someone).
    let memberToSave = "";
    if (type === "deduct") {
      memberToSave = memberId;
    }

    const worked = props.onRecord(bookId, type, Number(quantity), memberToSave);
    if (worked === true) {
      setQuantity("");
    }
  }

  function handleAddClick() {
    submitTransaction("add");
  }

  function handleDeductClick() {
    submitTransaction("deduct");
  }

  // Pressing Enter inside an input should not reload the page.
  function handleSubmit(event) {
    event.preventDefault();
  }

  // Build the list of books for the dropdown.
  const bookOptions = [{ value: "", label: "Choose a book" }];
  for (let i = 0; i < props.books.length; i = i + 1) {
    const book = props.books[i];
    bookOptions.push({
      value: book.id,
      label: book.title + " (in stock: " + book.quantity + ")",
    });
  }

  // Build the list of members for the dropdown.
  const memberOptions = [{ value: "", label: "Borrowed by (optional, for deductions)" }];
  for (let j = 0; j < props.members.length; j = j + 1) {
    const member = props.members[j];
    memberOptions.push({
      value: member.id,
      label: member.name + " (" + member.membershipId + ")",
    });
  }

  return (
    <div className="panel">
      <h2>Add or Deduct Stock</h2>
      <p className="panel-note">
        Use <strong>Add Stock</strong> when new copies arrive. Use <strong>Deduct Stock</strong> when copies leave the
        shelf. If you choose a member, the book is checked out to them and shows up in Borrow Records.
      </p>
      <form onSubmit={handleSubmit} noValidate>
        <div className="form-grid">
          <SelectField
            id="bookId"
            label="Book"
            value={bookId}
            onChange={handleBookChange}
            options={bookOptions}
            error={errors.bookId}
          />
          <FormField
            id="quantity"
            label="Quantity"
            type="number"
            min="1"
            value={quantity}
            onChange={handleQuantityChange}
            placeholder="Quantity"
            error={errors.quantity}
          />
          <SelectField
            id="memberId"
            label="Borrowed by (optional, for deductions)"
            value={memberId}
            onChange={handleMemberChange}
            options={memberOptions}
          />
        </div>
        <div className="form-buttons">
          <button className="btn" type="button" onClick={handleAddClick}>
            Add Stock
          </button>
          <button className="btn btn-danger" type="button" onClick={handleDeductClick}>
            Deduct Stock
          </button>
        </div>
      </form>
    </div>
  );
}

export default StockForm;
