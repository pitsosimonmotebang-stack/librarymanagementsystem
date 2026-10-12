import React from "react";
import { getStockStatus, getStockLabel } from "../helpers";

// The little coloured label that says "In stock", "Low stock" or "Out of stock".
function StockBadge(props) {
  const status = getStockStatus(props.quantity);
  return <span className={"badge badge-" + status}>{getStockLabel(props.quantity)}</span>;
}

export default StockBadge;
