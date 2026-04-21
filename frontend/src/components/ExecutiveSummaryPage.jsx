import React, { useMemo } from "react";
import StatCard from "./StatCard";
import RiskTable from "./RiskTable";
import TrendChart from "./TrendChart";

export default function ExecutiveSummary({ data }) {

  // ✅ VALIDATION
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="p-6 text-gray-500">
        No Data Available. Please upload a report.
      </div>
    );
  }

  // ✅ NORMALIZE DATA (important for backend inconsistencies)
  const normalized = data.map(d => ({
    id: d?.id,
    name: d?.name || "Unknown",
    value: Number(d?.value || 0),
    status: d?.status || d?.rag || "GREEN",
    category: d?.category || "Others",
    risk: d?.risk || "No risk defined"
  }));

  // ✅ KPI COUNTS
  const red = normalized.filter(d => d.status === "RED").length;
  const amber = normalized.filter(d => d.status === "AMBER").length;
  const green = normalized.filter(d => d.status === "GREEN").length;

  // ✅ WEIGHTED COMPLIANCE (more realistic than green %)
  const compliance = useMemo(() => {
    const total = normalized.length;
    if (!total) return 0;

    const score =
      normalized.reduce((acc, d) => {
        if (d.status === "GREEN") return acc + 1;
        if (d.status === "AMBER") return acc + 0.5;
        return acc;
      }, 0) / total;

    return Math.round(score * 100);
  }, [normalized]);

  // ✅ TOP RISKS (RED sorted by severity)
  const topRisks = useMemo(() => {
    return normalized
      .filter(d => d.status === "RED")
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [normalized]);

  // ✅ CATEGORY BREAKDOWN (important for governance view)
  const categoryStats = useMemo(() => {
    const map = {};

    normalized.forEach(d => {
      if (!map[d.category]) {
        map[d.category] = { total: 0, red: 0 };
      }

      map[d.category].total += 1;
      if (d.status === "RED") {
        map[d.category].red += 1;
      }
    });

    return Object.entries(map)
      .map(([category, val]) => ({
        category,
        riskScore: val.total ? Math.round((val.red / val.total) * 100) : 0
      }))
      .sort((a, b) => b.riskScore - a.riskScore);
  }, [normalized]);

  // ✅ DYNAMIC EXECUTIVE INSIGHT (core improvement)
  const insight = useMemo(() => {
    if (red > normalized.length * 0.4) {
      return "Severe governance risk detected. High concentration of critical KPI breaches impacting delivery predictability, traceability, and reporting integrity.";
    }

    if (topRisks.some(r => r.name.toLowerCase().includes("spillover"))) {
      return "Planning inefficiencies observed with significant sprint spillover impacting delivery commitments.";
    }

    if (topRisks.some(r => r.name.toLowerCase().includes("cycle") || r.name.toLowerCase().includes("lead"))) {
      return "Flow efficiency issues detected. Elevated cycle and lead times indicate systemic bottlenecks.";
    }

    return "Governance is moderately stable with localized improvement areas across estimation and workflow compliance.";
  }, [normalized, red, topRisks]);

  // ✅ TREND (placeholder for now, replace with backend API later)
  const trendMock = [
    { name: "Week 1", value: 65 },
    { name: "Week 2", value: 58 },
    { name: "Week 3", value: 52 },
    { name: "Week 4", value: compliance }
  ];

  return (
    <div className="space-y-6">

      {/* KPI SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Compliance Score" value={`${compliance}%`} trend="↓" />
        <StatCard title="Critical Risks (Red)" value={red} />
        <StatCard title="Warnings (Amber)" value={amber} />
        <StatCard title="Healthy (Green)" value={green} />
      </div>

      {/* TREND + TOP RISKS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TrendChart data={trendMock} />
        <RiskTable data={topRisks} />
      </div>

      {/* CATEGORY RISK VIEW */}
      <div className="bg-white p-4 rounded-2xl shadow">
        <h3 className="font-semibold mb-3">Risk by Category</h3>

        <div className="space-y-2">
          {categoryStats.map((c, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span>{c.category}</span>
              <span className="font-medium">{c.riskScore}% risk</span>
            </div>
          ))}
        </div>
      </div>

      {/* EXECUTIVE INSIGHT */}
      <div className="bg-white p-4 rounded-2xl shadow">
        <h3 className="font-semibold mb-2">Executive Insight</h3>
        <p className="text-gray-600">{insight}</p>
      </div>

    </div>
  );
}