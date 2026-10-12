import React, { useState, useEffect, useCallback } from "react";
import PageHeader from "../components/PageHeader";
import Message from "../components/Message";
import UserForm from "../components/UserForm";
import UserList from "../components/UserList";
import {
  getUsers,
  getUserById,
  addUser,
  updateUser,
  deleteUser,
  countAdmins,
  countActiveLoansForUser,
} from "../storage";

//User Management page(admin only): add, update and delete users.
function UsersPage(props) {
  const [users, setUsers] = useState([]);
  const [userToEdit, setUserToEdit] = useState(null);
  const [messageType, setMessageType] = useState("success");
  const [messageText, setMessageText] = useState("");

  useEffect(function () {
    setUsers(getUsers());
  }, []);

  //useCallback keeps this function the same between renders, so the
  //message timer is not restarted every time something else changes.
  const clearMessage = useCallback(function () {
    setMessageText("");
  }, []);

  function showMessage(type, text) {
    setMessageType(type);
    setMessageText(text);
  }

  //Called by the form when it passes validation.
  function handleSaveUser(userData) {
    if (userToEdit !== null) {
      // Do not allow the last admin to be changed into a normal member.
      if (userToEdit.role === "admin" && userData.role !== "admin" && countAdmins() <= 1) {
        showMessage("error", "There must always be at least one admin, so this role cannot be changed.");
        return;
      }

      updateUser(userToEdit.id, userData);

      //If the admin edited their own account, refresh the logged in user too.
      if (userToEdit.id === props.currentUser.id) {
        const refreshedUser = getUserById(userToEdit.id);
        props.onCurrentUserChange(refreshedUser);
      }

      showMessage("success", userData.name + " was updated.");
      setUserToEdit(null);
    } else {
      addUser(userData);
      showMessage("success", userData.name + " was added.");
    }
    setUsers(getUsers());
  }

  function handleUpdateClick(user) {
    setUserToEdit(user);
    setMessageText("");
    window.scrollTo(0, 0);
  }

  function handleDeleteClick(user) {
    if (user.id === props.currentUser.id) {
      showMessage("error", "You cannot delete the account you are logged in with.");
      return;
    }

    if (user.role === "admin" && countAdmins() <= 1) {
      showMessage("error", "You cannot delete the last admin.");
      return;
    }

    if (countActiveLoansForUser(user.id) > 0) {
      showMessage("error", user.name + " still has books on loan. They must be returned before the account is deleted.");
      return;
    }

    const userSaidYes = window.confirm("Are you sure you want to delete " + user.name + "?");
    if (userSaidYes === false) {
      return;
    }

    deleteUser(user.id);
    setUsers(getUsers());

    if (userToEdit !== null && userToEdit.id === user.id) {
      setUserToEdit(null);
    }
    showMessage("success", user.name + " was deleted.");
  }

  function handleCancelEdit() {
    setUserToEdit(null);
  }

  //Work out how many books each user has on loan right now.
  const loanCounts = {};
  for (let i = 0; i < users.length; i = i + 1) {
    loanCounts[users[i].id] = countActiveLoansForUser(users[i].id);
  }

  return (
    <div>
      <PageHeader title="User Management" />

      <Message type={messageType} text={messageText} onDismiss={clearMessage} />

      <UserForm userToEdit={userToEdit} onSave={handleSaveUser} onCancel={handleCancelEdit} />

      <div className="panel">
        <h2>All Users ({users.length})</h2>
        <UserList
          users={users}
          currentUserId={props.currentUser.id}
          loanCounts={loanCounts}
          onUpdate={handleUpdateClick}
          onDelete={handleDeleteClick}
        />
      </div>
    </div>
  );
}

export default UsersPage;
