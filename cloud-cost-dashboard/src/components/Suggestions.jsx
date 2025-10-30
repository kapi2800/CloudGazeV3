import React from "react";

function Suggestions({ suggestions }) {
  return (
    <div style={{
      background: "#fff",
      borderRadius: "12px",
      padding: "20px",
      margin: "30px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
    }}>
      <h3> Optimization Suggestions</h3>
      <ul>
        {suggestions && suggestions.length > 0 ? (
          suggestions.map((s, i) => <li key={i}>{s}</li>)
        ) : (
          <li>No suggestions available</li>
        )}
      </ul>
    </div>
  );
}

export default Suggestions;
