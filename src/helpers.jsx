//A book is in low stock when it has this many copies or fewer.
export const LOW_STOCK_LIMIT = 2;

//The library rules: how many books one member can hold and for how long.
export const MAX_LOANS = 3;
export const LOAN_DAYS = 14;

const ONE_DAY = 24 * 60 * 60 * 1000;

//Returns "out", "low" or "ok" depending on how many copies are left.
export function getStockStatus(quantity) {
  if (quantity <= 0) {
    return "out";
  }
  if (quantity <= LOW_STOCK_LIMIT) {
    return "low";
  }
  return "ok";
}

//Returns the words we show on the screen for each stock status.
export function getStockLabel(quantity) {
  const status = getStockStatus(quantity);
  if (status === "out") {
    return "Out of stock";
  }
  if (status === "low") {
    return "Low stock";
  }
  return "In stock";
}

//Class names for a table row or a book card, based on the stock level.
//These are used by the dashboard table, the book list and the book cards,
//so the low / out of stock colours are decided in ONE place.
export function getStockRowClass(quantity) {
  const status = getStockStatus(quantity);
  if (status === "low") {
    return "row-low";
  }
  if (status === "out") {
    return "row-out";
  }
  return "";
}

export function getStockCardClass(quantity) {
  const status = getStockStatus(quantity);
  if (status === "low") {
    return "book-card book-card-low";
  }
  if (status === "out") {
    return "book-card book-card-out";
  }
  return "book-card";
}
export function getRoleLabel(role) {
  if (role === "admin") {
    return "Admin";
  }
  return "Member";
}

//Dates and loan status
export function formatDate(isoText) {
  if (!isoText) {
    return "-";
  }
  const dateObject = new Date(isoText);
  return dateObject.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

// Returns one of: on-loan, overdue, returned, returned-late
export function getLoanStatus(record) {
  const dueTime = new Date(record.dueAt).getTime();

  if (record.returnedAt !== null) {
    const returnedTime = new Date(record.returnedAt).getTime();
    if (returnedTime > dueTime) {
      return "returned-late";
    }
    return "returned";
  }

  if (Date.now() > dueTime) {
    return "overdue";
  }
  return "on-loan";
}

export function getLoanStatusLabel(status) {
  if (status === "overdue") {
    return "Overdue";
  }
  if (status === "returned") {
    return "Returned";
  }
  if (status === "returned-late") {
    return "Returned late";
  }
  return "On loan";
}

//Reuses the badge colours from the stock badges.
export function getLoanBadgeClass(status) {
  if (status === "overdue") {
    return "badge badge-out";
  }
  if (status === "returned") {
    return "badge badge-ok";
  }
  if (status === "returned-late") {
    return "badge badge-low";
  }
  return "badge";
}

//A short sentence like Due in 5 days or Overdue by 3 days
export function getDueText(record) {
  const status = getLoanStatus(record);
  const dueTime = new Date(record.dueAt).getTime();

  if (status === "overdue") {
    let daysLate = Math.floor((Date.now() - dueTime) / ONE_DAY);
    if (daysLate < 1) {
      daysLate = 1;
    }
    if (daysLate === 1) {
      return "Overdue by 1 day";
    }
    return "Overdue by " + daysLate + " days";
  }

  if (status === "on-loan") {
    const daysLeft = Math.ceil((dueTime - Date.now()) / ONE_DAY);
    if (daysLeft <= 1) {
      return "Due within 1 day";
    }
    return "Due in " + daysLeft + " days";
  }

  return "";
}
