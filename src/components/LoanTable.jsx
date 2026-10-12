import React from "react";
import LoanRow from "./LoanRow";

// A table of borrow records. It is used on the My Books page (for members)
// and on the Borrow Records page (for admins). The props decide which
// columns are shown:
//   showMember   - show the "Member" column
//   showReturned - show the "Returned On" column
//   onReturn     - if given, an action column with a return button is shown
function LoanTable(props) {
  if (props.records.length === 0) {
    return <p className="empty-text">{props.emptyText}</p>;
  }

  const rows = [];
  for (let i = 0; i < props.records.length; i = i + 1) {
    rows.push(
      <LoanRow
        key={props.records[i].id}
        record={props.records[i]}
        showMember={props.showMember}
        showReturned={props.showReturned}
        onReturn={props.onReturn}
        returnLabel={props.returnLabel}
      />
    );
  }

  let memberHeading = null;
  if (props.showMember === true) {
    memberHeading = <th>Member</th>;
  }

  let returnedHeading = null;
  if (props.showReturned === true) {
    returnedHeading = <th>Returned On</th>;
  }

  let actionHeading = null;
  if (props.onReturn) {
    actionHeading = <th>Action</th>;
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {memberHeading}
            <th>Book</th>
            <th>Borrowed On</th>
            <th>Due Date</th>
            {returnedHeading}
            <th>Status</th>
            {actionHeading}
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    </div>
  );
}

export default LoanTable;
