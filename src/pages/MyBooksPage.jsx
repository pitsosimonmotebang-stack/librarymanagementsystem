import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import Message from "../components/Message";
import LoanTable from "../components/LoanTable";
import { getBorrowRecords, returnBook } from "../storage";
import { MAX_LOANS, LOAN_DAYS } from "../helpers";

//My Books page(for members): the books they have now and their history.
function MyBooksPage(props) {
  const [records, setRecords] = useState([]);
  const [messageType, setMessageType] = useState("success");
  const [messageText, setMessageText] = useState("");

  const userId = props.currentUser.id;

  //Load all records, then keep only the ones that belong to this member.
  //useCallback keeps this function the same between renders, so the
  //useEffect below only runs again when the user id really changes.
  const loadMyRecords = useCallback(
    function () {
      const allRecords = getBorrowRecords();
      const mine = [];
      for (let i = 0; i < allRecords.length; i = i + 1) {
        if (allRecords[i].userId === userId) {
          mine.push(allRecords[i]);
        }
      }
      setRecords(mine);
    },
    [userId]
  );

  //Load the records when the page opens.
  useEffect(
    function () {
      loadMyRecords();
    },
    [loadMyRecords]
  );

  //useCallback keeps this function the same between renders, so the
  //message timer is not restarted every time something else changes.
  const clearMessage = useCallback(function () {
    setMessageText("");
  }, []);

  function handleReturn(record) {
    const result = returnBook(record.id, props.currentUser);

    if (result.ok === true) {
      setMessageType("success");
    } else {
      setMessageType("error");
    }
    setMessageText(result.message);
    loadMyRecords();
  }

  //Split the records into "still have it" and "already returned".
  const currentLoans = [];
  const pastLoans = [];
  for (let j = 0; j < records.length; j = j + 1) {
    if (records[j].returnedAt === null) {
      currentLoans.push(records[j]);
    } else {
      pastLoans.push(records[j]);
    }
  }

  const emptyCurrentText = "You have no books at the moment.";

  return (
    <div>
      <PageHeader title="My Books" />

      <Message type={messageType} text={messageText} onDismiss={clearMessage} />

      <div className="panel">
        <h2>Books I Have Now ({currentLoans.length})</h2>
        <p className="panel-note">
          You can hold up to {MAX_LOANS} books at a time. Each loan lasts {LOAN_DAYS} days, so please return books on time.
        </p>
        <LoanTable
          records={currentLoans}
          showMember={false}
          showReturned={false}
          onReturn={handleReturn}
          returnLabel="Return Book"
          emptyText={emptyCurrentText}
        />
        <p className="panel-note">
          Looking for something to read? Go to <Link to="/">Browse Books</Link>.
        </p>
      </div>

      <div className="panel">
        <h2>My Borrowing History ({pastLoans.length})</h2>
        <LoanTable
          records={pastLoans}
          showMember={false}
          showReturned={true}
          emptyText="Books you return will be listed here."
        />
      </div>
    </div>
  );
}

export default MyBooksPage;
