// src/components/SummaryCards.jsx
import React from "react";

function SummaryCards({ totalCost, month, topService }) {
  return (
    <div style={{ display: "flex", gap: "1rem", justifyContent: "center", margin: "1rem" }}>
      <div className="card">
        <h3>Total Monthly Cost</h3>
        <p>${totalCost}</p>
      </div>
      <div className="card">
        <h3>Top Service</h3>
        <p>{topService}</p>
      </div>
      <div className="card">
        <h3>Month</h3>
        <p>{month}</p>
      </div>
    </div>
  );
}

export default SummaryCards;
