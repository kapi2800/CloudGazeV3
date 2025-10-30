import React from "react";
import Navbar from "../components/Navbar";

function AboutPage() {
  return (
    <div>
      <Navbar />
      <div style={{ padding: "2rem" }}>
        <h2 style={{ color: "#3B82F6" }}>About This Project</h2>
        <p style={{ color: "#374151", marginTop: "1rem" }}>
          This project visualizes cloud service costs and provides simple rule-based optimization suggestions.
          It helps users understand where their cloud budget is going and how to save costs.
        </p>
        <h3 style={{ marginTop: "2rem", color: "#10B981" }}>Tech Stack</h3>
        <ul>
          <li>Frontend: React + Chart.js</li>
          <li>Backend: Flask (Python)</li>
          <li>Visualization: Chart.js Pie & Line charts</li>
        </ul>
        <h3 style={{ marginTop: "2rem", color: "#F59E0B" }}>Developed By</h3>
        <p>Your Name (B.Tech CSE, Final Year)</p>
      </div>
    </div>
  );
}

export default AboutPage;
