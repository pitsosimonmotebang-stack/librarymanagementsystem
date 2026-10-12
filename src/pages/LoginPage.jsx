import React, { useState, useCallback } from "react";
import FormField from "../components/FormField";
import Message from "../components/Message";
import { findUserByLogin } from "../storage";

//The login page. Nobody can see anything else until they log in here.
function LoginPage(props) {
  const [membershipId, setMembershipId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState("");

  const clearLoginError = useCallback(function () {
    setLoginError("");
  }, []);

  function handleMembershipIdChange(event) {
    setMembershipId(event.target.value);
  }

  function handlePasswordChange(event) {
    setPassword(event.target.value);
  }

  //Flips between showing the password as dots and showing it as plain text.
  function handleShowPasswordChange(event) {
    setShowPassword(event.target.checked);
  }

  function handleSubmit(event) {
    event.preventDefault();

    const newErrors = {};
    if (membershipId.trim() === "") {
      newErrors.membershipId = "Please enter your membership ID.";
    }
    if (password === "") {
      newErrors.password = "Please enter your password.";
    }
    setErrors(newErrors);
    setLoginError("");

    const errorNames = Object.keys(newErrors);
    if (errorNames.length > 0) {
      return;
    }

    const foundUser = findUserByLogin(membershipId, password);
    if (foundUser === null) {
      setLoginError("The membership ID or password is not correct.");
      return;
    }

    props.onLogin(foundUser);
  }

  let passwordType = "password";
  if (showPassword === true) {
    passwordType = "text";
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Ha Molibetsane Community Library</h1>
        <p>Login to your account</p>
        <Message type="error" text={loginError} onDismiss={clearLoginError} />
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
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
              label="Password"
              type={passwordType}
              value={password}
              onChange={handlePasswordChange}
              placeholder="Password"
              error={errors.password}
            />
            <label className="show-password">
              <input type="checkbox" checked={showPassword} onChange={handleShowPasswordChange} />
              Show password
            </label>
            <button type="submit">Login</button>
        </form>
        <div className="demo-box">
          {"Admin: ADMIN001 / admin123\nMember: MEM001 / member123"}
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
