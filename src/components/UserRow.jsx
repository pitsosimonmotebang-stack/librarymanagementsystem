import React from "react";
import { getRoleLabel } from "../helpers";

// One row in the user table with Update and Delete buttons.
function UserRow(props) {
  const user = props.user;

  function handleUpdateClick() {
    props.onUpdate(user);
  }

  function handleDeleteClick() {
    props.onDelete(user);
  }

  // Show a small note so the admin can see which account is their own.
  let youNote = null;
  if (user.id === props.currentUserId) {
    youNote = <span className="you-note"> (you)</span>;
  }

  return (
    <tr>
      <td>
        {user.name}
        {youNote}
      </td>
      <td>{user.membershipId}</td>
      <td>
        <span className="role-label">{getRoleLabel(user.role)}</span>
      </td>
      <td>{props.loanCount}</td>
      <td>
        <div className="action-group">
          <button type="button" onClick={handleUpdateClick}>
            Update
          </button>
          <button className="danger" type="button" onClick={handleDeleteClick}>
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}

export default UserRow;
