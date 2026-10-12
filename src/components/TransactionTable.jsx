import React from "react";

// The history log of every stock change.
function TransactionTable(props) {
  if (props.transactions.length === 0) {
    return <p className="empty-text">No transactions have been recorded yet.</p>;
  }

  const rows = [];
  for (let i = 0; i < props.transactions.length; i = i + 1) {
    const item = props.transactions[i];

    // Stock Added and Book Returned put copies on the shelf (+).
    // Book Borrowed and Stock Deducted take copies off the shelf (-).
    let sign = "+";
    if (item.type === "Book Borrowed") {
      sign = "-";
    }
    if (item.type === "Stock Deducted") {
      sign = "-";
    }

    let memberText = "-";
    if (item.memberName) {
      memberText = item.memberName;
    }

    rows.push(
      <tr key={item.id}>
        <td>{item.date}</td>
        <td>{item.bookTitle}</td>
        <td>{item.type}</td>
        <td>
          {sign}
          {item.quantity}
        </td>
        <td>{item.stockAfter}</td>
        <td>{memberText}</td>
        <td>{item.recordedBy}</td>
      </tr>
    );
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Book</th>
            <th>Type</th>
            <th>Quantity</th>
            <th>Stock After</th>
            <th>Member</th>
            <th>Recorded By</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    </div>
  );
}

export default TransactionTable;
