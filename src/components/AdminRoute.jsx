import React from "react";
import { Link } from "react-router-dom";

// Wraps the pages that only admins are allowed to see.
// A normal member who types the address by hand just gets a message.
function AdminRoute(props) {
  if (props.currentUser.role !== "admin") {
    return (
      <div className="panel">
        <h2>Admins only</h2>
        <p>Your account does not have permission to open this page.</p>
        <Link className="btn btn-primary" to="/">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return props.children;
}

export default AdminRoute;
