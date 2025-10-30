import React, { useState } from "react";

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim() !== "") {
      onLogin(); // no real auth, just a simple demo
    } else {
      alert("Please enter your name to continue.");
    }
  };

  return (
    <div style={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "#f9fafb" }}>
      <div style={{ background: "white", padding: "2rem", borderRadius: "12px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)", width: "300px", textAlign: "center" }}>
        <h2 style={{ color: "#3B82F6" }}>☁️ Cloud Cost Dashboard</h2>
        <p style={{ color: "#6b7280" }}>Login to view your dashboard</p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter your name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ width: "100%", padding: "10px", margin: "10px 0", borderRadius: "6px", border: "1px solid #ccc" }}
          />
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "10px",
              background: "#3B82F6",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer"
            }}
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
