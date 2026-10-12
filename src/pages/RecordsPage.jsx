import React, { useState, useEffect, useCallback } from "react";
import PageHeader from "../components/PageHeader";
import Message from "../components/Message";
import StatCard from "../components/StatCard";
import LoanTable from "../components/LoanTable";
import SelectField from "../components/SelectField";
import { getBorrowRecords, returnBook } from "../storage";
import { getLoanStatus } from "../helpers";

const filterOptions = [
  { value: "all", label: "All records" },
  { value: "on-loan", label: "Currently on loan" },
  { value: "overdue", label: "Overdue" },
  { value: "returned", label: "Returned" },
];

//Borrow Records page (admin only): who borrowed which book, when,
//when it is due and if it has been returned.
function RecordsPage(props) {
  const [records, setRecords] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [messageText, setMessageText] = useState("");

  useEffect(function () {
    setRecords(getBorrowRecords());
  }, []);

  //useCallback keeps this function the same between renders, so the
  //message timer is not restarted every time something else changes.
  const clearMessage = useCallback(function () {
    setMessageText("");
  }, []);

  function handleFilterChange(event) {
    setStatusFilter(event.target.value);
  }

  function handleSearchChange(event) {
    setSearchText(event.target.value);
  }

  //The librarian can mark a book as returned when a member hands it in.
  function handleReturn(record) {
    const result = returnBook(record.id, props.currentUser);

    if (result.ok === true) {
      setMessageType("success");
    } else {
      setMessageType("error");
    }
    setMessageText(result.message);
    setRecords(getBorrowRecords());
  }

  //Count the records for the stat boxes
  let onLoanCount = 0;
  let overdueCount = 0;
  let returnedCount = 0;

  for (let i = 0; i < records.length; i = i + 1) {
    const status = getLoanStatus(records[i]);
    if (status === "on-loan") {
      onLoanCount = onLoanCount + 1;
    }
    if (status === "overdue") {
      overdueCount = overdueCount + 1;
    }
    if (status === "returned" || status === "returned-late") {
      returnedCount = returnedCount + 1;
    }
  }

  //Apply the filter and the search box
  const search = searchText.trim().toLowerCase();
  const visibleRecords = [];

  for (let j = 0; j < records.length; j = j + 1) {
    const record = records[j];
    const status = getLoanStatus(record);

    let statusMatches = false;
    if (statusFilter === "all") {
      statusMatches = true;
    } else if (statusFilter === "returned") {
      statusMatches = status === "returned" || status === "returned-late";
    } else {
      statusMatches = status === statusFilter;
    }

    const allText = (record.userName + " " + record.membershipId + " " + record.bookTitle).toLowerCase();
    const searchMatches = search === "" || allText.indexOf(search) !== -1;

    if (statusMatches === true && searchMatches === true) {
      visibleRecords.push(record);
    }
  }

  return (
    <div>
      <PageHeader title="Borrow Records" />

      <div className="stats">
        <StatCard number={records.length} label="Total loans recorded" />
        <StatCard number={onLoanCount + overdueCount} label="Books out right now" />
        <StatCard number={overdueCount} label="Overdue" highlight={overdueCount > 0} />
        <StatCard number={returnedCount} label="Returned" />
      </div>

      <Message type={messageType} text={messageText} onDismiss={clearMessage} />

      <div className="panel">
        <div className="panel-top">
          <h2>Loan Records ({visibleRecords.length})</h2>
          <div className="toolbar">
            <input
              className="search-input"
              type="text"
              placeholder="Search member, ID or book"
              value={searchText}
              onChange={handleSearchChange}
              aria-label="Search borrow records"
            />
            <SelectField id="statusFilter" label="Show" value={statusFilter} onChange={handleFilterChange} options={filterOptions} />
          </div>
        </div>
        <LoanTable
          records={visibleRecords}
          showMember={true}
          showReturned={true}
          onReturn={handleReturn}
          returnLabel="Mark Returned"
          emptyText="No loan records match your search."
        />
      </div>
    </div>
  );
}

export default RecordsPage;
