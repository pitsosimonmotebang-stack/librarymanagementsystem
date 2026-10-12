import React from "react";

// One of the small number boxes at the top of the dashboard.
// (The highlight prop is still accepted, but every box looks the same now.)
function StatCard(props) {
  return (
    <div className="stat">
      <span>{props.label}</span>
      <strong>{props.number}</strong>
    </div>
  );
}

export default StatCard;
