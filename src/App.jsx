import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import NavBar from "./components/NavBar";
import AdminRoute from "./components/AdminRoute";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import BooksPage from "./pages/BooksPage";
import TransactionsPage from "./pages/TransactionsPage";
import UsersPage from "./pages/UsersPage";
import MyBooksPage from "./pages/MyBooksPage";
import RecordsPage from "./pages/RecordsPage";
import NotFoundPage from "./pages/NotFoundPage";
import UserContext from "./UserContext";
import { ensureDefaultAdmin, seedDemoData, loadSession, saveSession, clearSession } from "./storage";

//App decides which pages exist and who is allowed to see them.
function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(function () {
    ensureDefaultAdmin();
    seedDemoData();
    const savedUser = loadSession();
    if (savedUser !== null) {
      setCurrentUser(savedUser);
    }
    setSessionChecked(true);
  }, []);

  function handleLogin(user) {
    saveSession(user.id);
    setCurrentUser(user);
  }

  function handleLogout() {
    clearSession();
    setCurrentUser(null);
  }

  //Used when an admin edits their own account on the Users page.
  function handleCurrentUserChange(updatedUser) {
    setCurrentUser(updatedUser);
  }

  if (sessionChecked === false) {
    return null;
  }

  if (currentUser === null) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  //Somebody is logged in: show the top menu and the pages
  return (
    <UserContext.Provider value={currentUser}>
    <div className="app">
      <NavBar currentUser={currentUser} onLogout={handleLogout} />

      <main className="content">
        <Routes>
          <Route path="/" element={<DashboardPage currentUser={currentUser} />} />
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="/my-books" element={<MyBooksPage currentUser={currentUser} />} />
          <Route
            path="/books"
            element={
              <AdminRoute currentUser={currentUser}>
                <BooksPage />
              </AdminRoute>
            }
          />
          <Route
            path="/records"
            element={
              <AdminRoute currentUser={currentUser}>
                <RecordsPage currentUser={currentUser} />
              </AdminRoute>
            }
          />
          <Route
            path="/transactions"
            element={
              <AdminRoute currentUser={currentUser}>
                <TransactionsPage currentUser={currentUser} />
              </AdminRoute>
            }
          />
          <Route
            path="/users"
            element={
              <AdminRoute currentUser={currentUser}>
                <UsersPage currentUser={currentUser} onCurrentUserChange={handleCurrentUserChange} />
              </AdminRoute>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
    </UserContext.Provider>
  );
}

export default App;
