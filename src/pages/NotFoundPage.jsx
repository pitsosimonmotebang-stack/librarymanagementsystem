import React from "react";
import { Link } from "react-router-dom";

//Shown when someone types an address that does not exist.
function NotFoundPage() {
  return (
    <div className="panel">
      <h2>Page not found</h2>
      <p>The page you are looking for does not exist.</p>
      <Link className="btn btn-primary" to="/">
        Back to Dashboard
      </Link>
    </div>
  );
}

export default NotFoundPage;
