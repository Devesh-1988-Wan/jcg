import React from "react";
import StatCard from "../components/StatCard";
import RiskTable from "../components/RiskTable";
import TrendChart from "../components/TrendChart";

export default function ExecutiveSummary({ data }) {

  // ✅ SAFE DATA HANDLING (critical fix)
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="p-6 text-gray-500">
        No Data Available. Please upload a report.
      </div>
    );
  }

  // ✅ CLEANED + SAFE CALCULATIONS
  const red = data.filter(d => d?.status === "RED").length;
  const amber = data.filter(d => d?.status === "AMBER").length;
  const green = data.filter(d => d?.status === "GREEN").length;

  const compliance = data.length
    ? Math.round((green / data.length) * 100)
    : 0;

  // ✅ SAFE SORTING (handles undefined values)
  const topRisks = data
    .filter(d => d?.status === "RED")
    .sort((a, b) => (b?.value || 0) - (a?.value || 0))
    .slice(0, 5);

  // ✅ TEMP TREND (replace later with real history)
  const trendMock = [
    { name: "Week 1", value: 60 },
    { name: "Week 2", value: 55 },
    { name: "Week 3", value: 48 },
    { name: "Week 4", value: compliance }
  ];

  return (
    <div className="space-y-6">

      {/* KPI ROW */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Compliance" value={`${compliance}%`} trend="↓" />
        <StatCard title="Red" value={red} />
        <StatCard title="Amber" value={amber} />
        <StatCard title="Green" value={green} />
      </div>

      {/* CHART + RISKS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TrendChart data={trendMock} />
        <RiskTable data={topRisks} />
      </div>

      {/* EXECUTIVE INSIGHT */}
      <div className="bg-white p-4 rounded-2xl shadow">
        <h3 className="font-semibold mb-2">Executive Insight</h3>
        <p className="text-gray-600">
          Delivery risk is elevated due to high scope creep and aging issues.
          Flow efficiency metrics indicate systemic bottlenecks in execution.
        </p>
      </div>

    </div>
  );
}