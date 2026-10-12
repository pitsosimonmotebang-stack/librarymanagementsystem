import React, { useState, useEffect, useCallback } from "react";
import PageHeader from "../components/PageHeader";
import Message from "../components/Message";
import StockForm from "../components/StockForm";
import TransactionTable from "../components/TransactionTable";
import { getBooks, getUsers, getTransactions, recordTransaction, borrowBooks } from "../storage";

//Transactions page: add stock, deduct stock and see the history log
function TransactionsPage(props) {
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [messageType, setMessageType] = useState("success");
  const [messageText, setMessageText] = useState("");

  useEffect(function () {
    setBooks(getBooks());
    setTransactions(getTransactions());

    //Only people with the member role can borrow books
    const allUsers = getUsers();
    const justMembers = [];
    for (let i = 0; i < allUsers.length; i = i + 1) {
      if (allUsers[i].role === "member") {
        justMembers.push(allUsers[i]);
      }
    }
    setMembers(justMembers);
  }, []);

  //useCallback keeps this function the same between renders, so the
  //message timer is not restarted every time something else changes.
  const clearMessage = useCallback(function () {
    setMessageText("");
  }, []);

  //Called by the stock form when it passes validation.
  //It returns true if it worked, so the form knows if it can clear itself.
  function handleRecord(bookId, type, quantity, memberId) {
    let result = null;

    if (type === "deduct" && memberId !== "") {
      // A member was chosen, so this is a real checkout and a borrow record is made.
      result = borrowBooks(bookId, memberId, quantity, props.currentUser);
    } else {
      result = recordTransaction(bookId, type, quantity, props.currentUser);
    }

    if (result.ok === true) {
      setMessageType("success");
    } else {
      setMessageType("error");
    }
    setMessageText(result.message);

    //Load the new numbers so the screen is up to date.
    setBooks(getBooks());
    setTransactions(getTransactions());

    return result.ok;
  }

  return (
    <div>
      <PageHeader title="Transactions" />

      <Message type={messageType} text={messageText} onDismiss={clearMessage} />

      <StockForm books={books} members={members} onRecord={handleRecord} />

      <div className="panel">
        <h2>Transaction History</h2>
        <TransactionTable transactions={transactions} />
      </div>
    </div>
  );
}

export default TransactionsPage;
