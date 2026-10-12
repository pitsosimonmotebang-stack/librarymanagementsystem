import React from "react";
import { NavLink } from "react-router-dom";
import { getRoleLabel } from "../helpers";

// NavLink gives us a "isActive" value so we can mark the page we are on.
function getLinkClass(linkState) {
  if (linkState.isActive) {
    return "nav-link active";
  }
  return "nav-link";
}

// The menu bar across the top of every page after login.
// Admins and members get different links.
function NavBar(props) {
  let menuLinks = null;

  if (props.currentUser.role === "admin") {
    menuLinks = (
      <React.Fragment>
        <NavLink to="/" end className={getLinkClass}>
          Dashboard
        </NavLink>
        <NavLink to="/books" className={getLinkClass}>
          Books
        </NavLink>
        <NavLink to="/records" className={getLinkClass}>
          Records
        </NavLink>
        <NavLink to="/transactions" className={getLinkClass}>
          Transactions
        </NavLink>
        <NavLink to="/users" className={getLinkClass}>
          Users
        </NavLink>
      </React.Fragment>
    );
  } else {
    menuLinks = (
      <React.Fragment>
        <NavLink to="/" end className={getLinkClass}>
          Browse Books
        </NavLink>
        <NavLink to="/my-books" className={getLinkClass}>
          My Books
        </NavLink>
      </React.Fragment>
    );
  }

  return (
    <header className="top-nav">
      <div className="site-title">
        <h2>Ha Molibetsane Community Library</h2>
        <p>
          {props.currentUser.name} - {getRoleLabel(props.currentUser.role)}
        </p>
      </div>

      <nav className="top-links" aria-label="Main navigation">
        {menuLinks}
      </nav>

      <button className="logout" type="button" onClick={props.onLogout}>
        Logout
      </button>
    </header>
  );
}

export default NavBar;
