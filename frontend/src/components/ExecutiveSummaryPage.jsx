import React, { useMemo } from "react";
import RiskTable from "./RiskTable";
import TrendChart from "./TrendChart";
import { PieChart, Pie, Cell, Tooltip } from "recharts";

export default function ExecutiveSummary({ data = [], aiInsights }) {

  if (!Array.isArray(data) || data.length === 0) {
    return <div className="p-6 text-gray-500">No Data Available.</div>;
  }

  // ---------------------------
  // NORMALIZE
  // ---------------------------
  const normalized = useMemo(() => {
    return data.map((d) => ({
      name: d?.name || "Unknown",
      value: Number(d?.value) || 0,
      status: (d?.status || "GREEN").toUpperCase(),
      category: d?.category || "OTHER",
    }));
  }, [data]);

  // ---------------------------
  // RAG COUNTS
  // ---------------------------
  const { red, amber, green } = useMemo(() => {
    let red = 0, amber = 0, green = 0;

    normalized.forEach((d) => {
      if (d.status === "RED") red++;
      else if (d.status === "AMBER") amber++;
      else green++;
    });

    return { red, amber, green };
  }, [normalized]);

  // ---------------------------
  // COMPLIANCE
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
  // CHART DATA
  // ---------------------------
  const chartData = [
    { name: "Red", value: red },
    { name: "Amber", value: amber },
    { name: "Green", value: green },
  ];

  const COLORS = ["#ef4444", "#f59e0b", "#22c55e"];

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
  // TREND MOCK
  // ---------------------------
  const trendMock = [
    { name: "Week 1", value: 65 },
    { name: "Week 2", value: 58 },
    { name: "Week 3", value: 52 },
    { name: "Week 4", value: compliance },
  ];

  // ---------------------------
  // CARD
  // ---------------------------
  const Card = ({ title, value, color }) => (
    <div className="p-4 border rounded-xl shadow-sm bg-white">
      <div className="text-sm text-gray-500">{title}</div>
      <div className={`text-xl font-bold ${color}`}>{value}</div>
    </div>
  );

  // ---------------------------
  // RENDER
  // ---------------------------
  return (
    <div className="space-y-6">

      {/* KPI + DONUT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">

        {/* KPI CARDS */}
        <div className="grid grid-cols-2 gap-4">
          <Card title="Compliance Score" value={`${compliance}%`} color="text-gray-800" />
          <Card title="Critical Risks" value={red} color="text-red-600" />
          <Card title="Warnings" value={amber} color="text-yellow-600" />
          <Card title="Healthy" value={green} color="text-green-600" />
        </div>

        {/* DONUT CHART */}
        <div className="flex justify-center">
          <PieChart width={260} height={260}>
            <Pie
              data={chartData}
              dataKey="value"
              innerRadius={70}
              outerRadius={100}
            >
              {chartData.map((_, i) => (
                <Cell key={i} fill={COLORS[i]} />
              ))}
            </Pie>

            {/* CENTER TEXT */}
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-xl font-bold fill-gray-700"
            >
              {compliance}%
            </text>

            <Tooltip />
          </PieChart>
        </div>

      </div>

      {/* TREND + RISKS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TrendChart data={trendMock} />
        <RiskTable data={topRisks} />
      </div>

      {/* AI INSIGHTS */}
      <div className="bg-white p-4 rounded-2xl shadow">
        <h3 className="font-semibold mb-3">AI Insights</h3>

        {!aiInsights ? (
          <div className="text-gray-400 text-sm">Generating insights...</div>
        ) : (
          <div className="space-y-3 text-sm">

            {aiInsights.risks?.length > 0 && (
              <div>
                <div className="text-red-600 font-medium mb-1">🔴 Risks</div>
                <ul className="list-disc ml-5">
                  {aiInsights.risks.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>
            )}

            {aiInsights.causes?.length > 0 && (
              <div>
                <div className="text-yellow-600 font-medium mb-1">🧠 Causes</div>
                <ul className="list-disc ml-5">
                  {aiInsights.causes.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
              </div>
            )}

            {aiInsights.actions?.length > 0 && (
              <div>
                <div className="text-green-600 font-medium mb-1">⚡ Actions</div>
                <ul className="list-disc ml-5">
                  {aiInsights.actions.map((a, i) => <li key={i}>{a}</li>)}
                </ul>
              </div>
            )}

          </div>
        )}
      </div>

    </div>
  );
}