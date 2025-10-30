import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import SummaryCards from "../components/SummaryCards";
import CostPieChart from "../components/CostPieChart";
import CostLineChart from "../components/CostLineChart";
import Suggestions from "../components/Suggestions";

function DashboardPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/costs")
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => console.error(err));
  }, []);

  if (!data) return <h3 style={{ textAlign: "center", marginTop: "3rem" }}>Loading...</h3>;

  const topService = data.services.reduce((a, b) => (a.cost > b.cost ? a : b)).name;

  return (
    <div>
      <Navbar />
      <SummaryCards totalCost={data.total_cost} month={data.month} topService={topService} />
      <div style={{ display: "flex", justifyContent: "space-around", flexWrap: "wrap" }}>
        <CostPieChart services={data.services} />
        <CostLineChart monthlyCosts={data.monthly_costs} />
      </div>
      <Suggestions suggestions={data.suggestions} />
    </div>
  );
}

export default DashboardPage;
