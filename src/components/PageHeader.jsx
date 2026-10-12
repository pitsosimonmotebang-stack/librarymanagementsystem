import React, { useContext } from "react";
import UserContext from "../UserContext";

// The title area at the top of every page: the page name and a welcome line.
function PageHeader(props) {
  const currentUser = useContext(UserContext);

  let subtitle = props.subtitle;
  if (!subtitle && currentUser) {
    subtitle = "Welcome, " + currentUser.name;
  }

  return (
    <header className="page-header">
      <h1>{props.title}</h1>
      <p>{subtitle}</p>
    </header>
  );
}

export default PageHeader;
