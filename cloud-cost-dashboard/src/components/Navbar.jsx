import React from "react";

import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      <h1>☁️ Cloud Cost Dashboard</h1>
      <div className="nav-links">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/about">About</Link>
        <Link to="/">Logout</Link>
      </div>
    </nav>
  );
}
export default Navbar;
