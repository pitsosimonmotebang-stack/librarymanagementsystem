# Molibetsane Library System

A web-based library management system for the Ha Molibetsane Community Library.
Built with React (JSX, hooks, components), React Router and the browser's local storage.

## How to run

1. Install Node.js (version 16 or newer).
2. Open a terminal inside this folder and run:

   npm install
   npm start

3. The app opens at http://localhost:3000

## Demo logins

| Role   | Membership ID | Password  |
| ------ | ------------- | --------- |
| Admin  | ADMIN001      | admin123  |
| Member | MEM001        | member123 |
| Member | MEM002        | member123 |

The first time the app runs it adds some sample books, the two demo members and a few sample
loans (one of them overdue) so the library does not look empty. This happens only once.
To start fresh, clear this site's local storage in the browser and remove the
`seedDemoData()` line in `src/App.jsx`.

## Library rules

- A member can hold up to 3 books at a time.
- Each loan lasts 14 days.
- A member cannot borrow the same title twice at once.
- A member with an overdue book cannot borrow until it is returned.
- A book that is out on loan, or a member who still has books, cannot be deleted.
- Stock only changes through Transactions, borrowing and returning, so the history log is always complete.
  (The quantity is locked while updating a book.)
- Renaming a book or a member also updates their old borrow records and history lines.
- Messages remove themselves after 5 seconds.

(The numbers 3 and 14 are set at the top of `src/helpers.jsx`.)

## Pages

| Page             | Route           | Who can open it | What it does                                              |
| ---------------- | --------------- | --------------- | --------------------------------------------------------- |
| Login            | /login          | Everyone        | Log in (with a Show password option)                      |
| Dashboard / Browse Books | /       | Admin, Member   | View books. Members can borrow here                       |
| My Books         | /my-books       | Member          | Books I have now, return them, borrowing history          |
| Book Management  | /books          | Admin only      | Add, update, delete books                                 |
| Borrow Records   | /records        | Admin only      | Who borrowed which book, when, due date, returned or not  |
| Transactions     | /transactions   | Admin only      | Add or deduct stock, full history log                     |
| User Management  | /users          | Admin only      | Add, update, delete users, see how many books each holds  |

## Project structure

src/
  index.jsx        starts the app and wraps it in the router
  App.jsx          routes and login state
  storage.jsx      all local storage reading and writing, plus borrow and return rules
  helpers.jsx      library rules, dates and status helpers
  index.css        all the styling
  assets/          background picture
  components/      reusable pieces (forms, tables, cards, top menu)
  pages/           one file for each page
