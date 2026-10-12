import React from "react";
import { formatDate, getLoanStatus, getLoanStatusLabel, getLoanBadgeClass, getDueText } from "../helpers";

// One row in a loan table: who borrowed which book, when, and if it is back.
function LoanRow(props) {
  const record = props.record;
  const status = getLoanStatus(record);

  function handleReturnClick() {
    props.onReturn(record);
  }

  // Admins see the member's name, members do not need to.
  let memberCell = null;
  if (props.showMember === true) {
    memberCell = (
      <td>
        {record.userName}
        <span className="small-text">{record.membershipId}</span>
      </td>
    );
  }

  // Under the due date we show a little reminder like "Due in 5 days".
  let dueReminder = null;
  const dueText = getDueText(record);
  if (dueText !== "") {
    dueReminder = <span className="small-text">{dueText}</span>;
  }

  let returnedCell = null;
  if (props.showReturned === true) {
    returnedCell = <td>{formatDate(record.returnedAt)}</td>;
  }

  // The action button only appears when this table can return books
  // and the book has not been returned yet.
  let actionCell = null;
  if (props.onReturn) {
    if (record.returnedAt === null) {
      actionCell = (
        <td>
          <div className="action-group">
            <button className="secondary" type="button" onClick={handleReturnClick}>
              {props.returnLabel}
            </button>
          </div>
        </td>
      );
    } else {
      actionCell = <td>-</td>;
    }
  }

  let rowClass = "";
  if (status === "overdue") {
    rowClass = "row-out";
  }

  return (
    <tr className={rowClass}>
      {memberCell}
      <td>{record.bookTitle}</td>
      <td>{formatDate(record.borrowedAt)}</td>
      <td>
        {formatDate(record.dueAt)}
        {dueReminder}
      </td>
      {returnedCell}
      <td>
        <span className={getLoanBadgeClass(status)}>{getLoanStatusLabel(status)}</span>
      </td>
      {actionCell}
    </tr>
  );
}

export default LoanRow;
