import React from "react";
import UserRow from "./UserRow";

// The table of every user in the system.
function UserList(props) {
  if (props.users.length === 0) {
    return <p className="empty-text">There are no users yet.</p>;
  }

  const rows = [];
  for (let i = 0; i < props.users.length; i = i + 1) {
    rows.push(
      <UserRow
        key={props.users[i].id}
        user={props.users[i]}
        currentUserId={props.currentUserId}
        loanCount={props.loanCounts[props.users[i].id]}
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
            <th>Name</th>
            <th>Membership ID</th>
            <th>Role</th>
            <th>Books on Loan</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    </div>
  );
}

export default UserList;
