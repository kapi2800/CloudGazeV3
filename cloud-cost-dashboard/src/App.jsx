import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import AboutPage from "./pages/AboutPage";

// Main App component
function App() {
  // Simple state to track if user is logged in
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // When user logs in (no password needed for demo)
  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  // When user logs out
  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <Router>
      <Routes>
        {/* Default route — show login page if not logged in */}
        <Route
          path="/"
          element={
            isLoggedIn ? (
              <Navigate to="/dashboard" />
            ) : (
              <LoginPage onLogin={handleLogin} />
            )
          }
        />

        {/* Dashboard route — protected */}
        <Route
          path="/dashboard"
          element={
            isLoggedIn ? (
              <DashboardPage onLogout={handleLogout} />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* About route — also protected */}
        <Route
          path="/about"
          element={
            isLoggedIn ? (
              <AboutPage onLogout={handleLogout} />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;