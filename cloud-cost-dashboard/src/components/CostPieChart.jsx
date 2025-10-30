// src/components/CostPieChart.jsx
import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

function CostPieChart({ services }) {
  const data = {
    labels: services.map((s) => s.name),
    datasets: [
      {
        data: services.map((s) => s.cost),
        backgroundColor: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444"],
      },
    ],
  };

  return (
    <div style={{ width: "45%", margin: "1rem auto" }}>
      <h3>Cost Breakdown by Service</h3>
      <Pie data={data} />
    </div>
  );
}

export default CostPieChart;
