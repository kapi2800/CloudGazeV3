// src/components/CostLineChart.jsx
import React from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement } from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

function CostLineChart({ monthlyCosts }) {
  const data = {
    labels: monthlyCosts.map((m) => m.month),
    datasets: [
      {
        label: "Monthly Cost ($)",
        data: monthlyCosts.map((m) => m.cost),
        borderColor: "#3B82F6",
        backgroundColor: "#BFDBFE",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  return (
    <div style={{ width: "80%", margin: "1rem auto" }}>
      <h3>Cost Trend Over Time</h3>
      <Line data={data} />
    </div>
  );
}

export default CostLineChart;
