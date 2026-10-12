import React, { useState, useEffect } from "react";
import FormField from "./FormField";
import SelectField from "./SelectField";
import { membershipIdExists } from "../storage";

const roleOptions = [
  { value: "member", label: "Member" },
  { value: "admin", label: "Admin" },
];

// Form for adding a new user or updating an existing one.
function UserForm(props) {
  const userToEdit = props.userToEdit;

  const [name, setName] = useState("");
  const [membershipId, setMembershipId] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("member");
  const [errors, setErrors] = useState({});

  // When we start or stop editing a user, fill in or clear the inputs.
  useEffect(
    function () {
      if (userToEdit !== null) {
        setName(userToEdit.name);
        setMembershipId(userToEdit.membershipId);
        setPassword("");
        setRole(userToEdit.role);
      } else {
        setName("");
        setMembershipId("");
        setPassword("");
        setRole("member");
      }
      setErrors({});
    },
    [userToEdit]
  );

  function handleNameChange(event) {
    setName(event.target.value);
  }

  function handleMembershipIdChange(event) {
    setMembershipId(event.target.value);
  }

  function handlePasswordChange(event) {
    setPassword(event.target.value);
  }

  function handleRoleChange(event) {
    setRole(event.target.value);
  }

  function validateForm() {
    const newErrors = {};

    if (name.trim().length < 2) {
      newErrors.name = "Please enter a name with at least 2 letters.";
    }

    if (membershipId.trim() === "") {
      newErrors.membershipId = "Please enter a membership ID.";
    } else {
      let ignoreId = null;
      if (userToEdit !== null) {
        ignoreId = userToEdit.id;
      }
      if (membershipIdExists(membershipId, ignoreId)) {
        newErrors.membershipId = "That membership ID is already taken.";
      }
    }

    // A new user must have a password. When editing, a blank password
    // means "keep the old password".
    if (userToEdit === null && password === "") {
      newErrors.password = "Please enter a password.";
    } else if (password !== "" && password.length < 6) {
      newErrors.password = "The password must be at least 6 characters long.";
    }

    setErrors(newErrors);

    const errorNames = Object.keys(newErrors);
    if (errorNames.length === 0) {
      return true;
    }
    return false;
  }

  function handleSubmit(event) {
    event.preventDefault();

    const formIsValid = validateForm();
    if (formIsValid === false) {
      return;
    }

    const userData = {
      name: name.trim(),
      membershipId: membershipId.trim(),
      password: password,
      role: role,
    };

    props.onSave(userData);

    // After adding a new user, empty the inputs ready for the next one.
    if (userToEdit === null) {
      setName("");
      setMembershipId("");
      setPassword("");
      setRole("member");
      setErrors({});
    }
  }

  let heading = "Add a New User";
  let passwordLabel = "Password";
  let passwordPlaceholder = "Password (at least 6 characters)";
  let submitText = "Add User";
  let cancelButton = null;

  if (userToEdit !== null) {
    heading = "Update User";
    passwordLabel = "New Password (optional)";
    passwordPlaceholder = "New password (leave blank to keep the old one)";
    submitText = "Save Changes";
    cancelButton = (
      <button className="btn btn-secondary" type="button" onClick={props.onCancel}>
        Cancel
      </button>
    );
  }

  return (
    <div className="panel">
      <h2>{heading}</h2>
      <form onSubmit={handleSubmit} noValidate>
        <div className="form-grid">
          <FormField
            id="name"
            label="Full Name"
            type="text"
            value={name}
            onChange={handleNameChange}
            placeholder="Full Name"
            error={errors.name}
          />
          <FormField
            id="membershipId"
            label="Membership ID"
            type="text"
            value={membershipId}
            onChange={handleMembershipIdChange}
            placeholder="Membership ID"
            error={errors.membershipId}
          />
          <FormField
            id="password"
            label={passwordLabel}
            type="password"
            value={password}
            onChange={handlePasswordChange}
            placeholder={passwordPlaceholder}
            error={errors.password}
          />
          <SelectField id="role" label="Role" value={role} onChange={handleRoleChange} options={roleOptions} />
        </div>
        <div className="form-buttons">
          <button className="btn" type="submit">
            {submitText}
          </button>
          {cancelButton}
        </div>
      </form>
    </div>
  );
}

export default UserForm;
