import React, { useMemo } from "react";
import StatCard from "./StatCard";
import RiskTable from "./RiskTable";
import TrendChart from "./TrendChart";

export default function ExecutiveSummary({ data = [], aiInsights }) {

  // ---------------------------
  // VALIDATION
  // ---------------------------
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="p-6 text-gray-500">
        No Data Available. Please upload a report.
      </div>
    );
  }

  // ---------------------------
  // NORMALIZE (MEMOIZED)
  // ---------------------------
  const normalized = useMemo(() => {
    return data.map((d) => ({
      id: d?.id || "",
      name: d?.name || "Unknown",
      value: Number(d?.value) || 0,
      status: (d?.status || d?.rag || "GREEN").toUpperCase(),
      category: d?.category || "OTHER",
      risk: d?.risk || ""
    }));
  }, [data]);

  // ---------------------------
  // KPI COUNTS
  // ---------------------------
  const { red, amber, green } = useMemo(() => {
    let red = 0, amber = 0, green = 0;

    normalized.forEach((d) => {
      if (d.status === "RED") red++;
      else if (d.status === "AMBER") amber++;
      else if (d.status === "GREEN") green++;
    });

    return { red, amber, green };
  }, [normalized]);

  // ---------------------------
  // COMPLIANCE SCORE
  // ---------------------------
  const compliance = useMemo(() => {
    if (!normalized.length) return 0;

    const score =
      normalized.reduce((acc, d) => {
        if (d.status === "GREEN") return acc + 1;
        if (d.status === "AMBER") return acc + 0.5;
        return acc;
      }, 0) / normalized.length;

    return Math.round(score * 100);
  }, [normalized]);

  // ---------------------------
  // TOP RISKS
  // ---------------------------
  const topRisks = useMemo(() => {
    return normalized
      .filter((d) => d.status === "RED")
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [normalized]);

  // ---------------------------
  // CATEGORY RISK
  // ---------------------------
  const categoryStats = useMemo(() => {
    const map = {};

    normalized.forEach((d) => {
      if (!map[d.category]) {
        map[d.category] = { total: 0, red: 0 };
      }

      map[d.category].total++;
      if (d.status === "RED") map[d.category].red++;
    });

    return Object.entries(map)
      .map(([category, val]) => ({
        category,
        riskScore: val.total
          ? Math.round((val.red / val.total) * 100)
          : 0
      }))
      .sort((a, b) => b.riskScore - a.riskScore);
  }, [normalized]);

  // ---------------------------
  // EXECUTIVE INSIGHT (RULE-BASED)
  // ---------------------------
  const insight = useMemo(() => {
    if (red > normalized.length * 0.4) {
      return "Severe governance risk detected with widespread KPI breaches.";
    }

    if (topRisks.some(r =>
      r.name.toLowerCase().includes("scope") ||
      r.name.toLowerCase().includes("spill")
    )) {
      return "Predictability issues observed due to scope creep and spillover.";
    }

    if (topRisks.some(r =>
      r.name.toLowerCase().includes("cycle") ||
      r.name.toLowerCase().includes("lead")
    )) {
      return "Flow efficiency issues detected with elevated cycle and lead time.";
    }

    return "Governance is moderately stable with localized improvement areas.";
  }, [normalized, red, topRisks]);

  // ---------------------------
  // TREND MOCK
  // ---------------------------
  const trendMock = useMemo(() => [
    { name: "Week 1", value: 65 },
    { name: "Week 2", value: 58 },
    { name: "Week 3", value: 52 },
    { name: "Week 4", value: compliance }
  ], [compliance]);

  // ---------------------------
  // TREND DIRECTION
  // ---------------------------
  const trendDirection = useMemo(() => {
    if (trendMock.length < 2) return "-";

    const last = trendMock[trendMock.length - 1].value;
    const prev = trendMock[trendMock.length - 2].value;

    if (last > prev) return "↑";
    if (last < prev) return "↓";
    return "→";
  }, [trendMock]);

  // ---------------------------
  // RENDER
  // ---------------------------
  return (
    <div className="space-y-6">

      {/* KPI SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Compliance Score" value={`${compliance}%`} trend={trendDirection} />
        <StatCard title="Critical Risks (Red)" value={red} />
        <StatCard title="Warnings (Amber)" value={amber} />
        <StatCard title="Healthy (Green)" value={green} />
      </div>

      {/* TREND + RISKS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TrendChart data={trendMock} />
        <RiskTable data={topRisks} />
      </div>

      {/* CATEGORY VIEW */}
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

      {/* RULE-BASED INSIGHT */}
      <div className="bg-white p-4 rounded-2xl shadow">
        <h3 className="font-semibold mb-2">Executive Insight</h3>
        <p className="text-gray-600">{insight}</p>
      </div>

      {/* 🔥 AI INSIGHTS (NEW) */}
      <div className="bg-white p-4 rounded-2xl shadow">
        <h3 className="font-semibold mb-3">AI Insights</h3>

        {!aiInsights ? (
          <div className="text-gray-400 text-sm">
            Generating insights...
          </div>
        ) : (
          <div className="space-y-3 text-sm">

            {aiInsights.risks?.length > 0 && (
              <div>
                <div className="font-medium text-red-600 mb-1">🔴 Top Risks</div>
                <ul className="list-disc ml-5">
                  {aiInsights.risks.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}

            {aiInsights.causes?.length > 0 && (
              <div>
                <div className="font-medium text-yellow-600 mb-1">🧠 Root Causes</div>
                <ul className="list-disc ml-5">
                  {aiInsights.causes.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            )}

            {aiInsights.actions?.length > 0 && (
              <div>
                <div className="font-medium text-green-600 mb-1">⚡ Actions</div>
                <ul className="list-disc ml-5">
                  {aiInsights.actions.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </div>
            )}

          </div>
        )}
      </div>

    </div>
  );
}

