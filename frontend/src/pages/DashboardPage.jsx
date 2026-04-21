import { useEffect, useState } from "react";
import ExecutiveSummaryPage from "../components/ExecutiveSummaryPage";
import {
  fetchReportSummary,
  fetchReportKpis,
  fetchAIStatus,
} from "../api/reportApi";
import { PieChart, Pie, Cell, Tooltip } from "recharts";

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [kpis, setKpis] = useState([]);
  const [topRisks, setTopRisks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ---------------------------
  // INITIAL LOAD
  // ---------------------------
  useEffect(() => {
    loadDashboard();
  }, []);

  // ---------------------------
  // POLL AI STATUS
  // ---------------------------
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetchAIStatus();
        if (res.status === "completed") {
          loadDashboard();
          clearInterval(interval);
        }
      } catch (err) {
        console.error("AI polling error:", err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // ---------------------------
  // RAG LOGIC
  // ---------------------------
  const getRagStatus = (value) => {
    const val = Number(value);
    if (isNaN(val)) return "UNKNOWN";
    if (val > 25) return "RED";
    if (val > 5) return "AMBER";
    return "GREEN";
  };

  // ---------------------------
  // FORMAT KPI (FIXED)
  // ---------------------------
  const formatRiskItem = (item = {}) => {
    const raw = item.name || item.checklistItem || "";

    let clean = raw
      .replace(/^\d+\s+/i, "")
      .replace(/AUD-\d+/gi, "")
      .replace(/\b(RED|AMBER|GREEN)\b/gi, "")
      .replace(/\s*>\s*/g, " > ")
      .replace(/\s+/g, " ")
      .trim();

    return {
      checklistItem: clean,
      severity: Number(item.value) || 0,
      status: getRagStatus(item.value),
    };
  };

  // ---------------------------
  // LOAD DASHBOARD DATA
  // ---------------------------
  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);

      const [summaryRes, kpiRes] = await Promise.all([
        fetchReportSummary(),
        fetchReportKpis(),
      ]);

      const rawKpis = kpiRes?.kpis || [];

      setSummary(summaryRes?.summary || null);
      setKpis(rawKpis);

      const processedRisks = rawKpis
        .map(formatRiskItem)
        .filter((item) => item.status === "RED")
        .sort((a, b) => b.severity - a.severity)
        .slice(0, 5);

      setTopRisks(processedRisks);

    } catch (err) {
      console.error("❌ Dashboard load failed:", err);
      setError("Failed to load dashboard data");
      setSummary(null);
      setKpis([]);
      setTopRisks([]);
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------
  // DISTRIBUTION
  // ---------------------------
  const getRagDistribution = () => {
    let red = 0,
      amber = 0,
      green = 0;

    kpis.forEach((item) => {
      const status = getRagStatus(item.value);
      if (status === "RED") red++;
      else if (status === "AMBER") amber++;
      else if (status === "GREEN") green++;
    });

    return { red, amber, green };
  };

  const rag = getRagDistribution();

  // ---------------------------
  // COMPLIANCE SCORE
  // ---------------------------
  const calculateComplianceScore = () => {
    if (!kpis.length) return 0;

    let score = 0;

    kpis.forEach((item) => {
      const status = getRagStatus(item.value);
      if (status === "GREEN") score += 1;
      else if (status === "AMBER") score += 0.5;
    });

    return Math.round((score / kpis.length) * 100);
  };

  const complianceScore = calculateComplianceScore();

  // ---------------------------
  // PIE DATA
  // ---------------------------
  const chartData = [
    { name: "Red", value: rag.red },
    { name: "Amber", value: rag.amber },
    { name: "Green", value: rag.green },
  ];

  const COLORS = ["#ef4444", "#f59e0b", "#22c55e"];

  // ---------------------------
  // STATES
  // ---------------------------
  if (loading) {
    return <div className="p-6 text-gray-500">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  if (!summary && kpis.length === 0) {
    return (
      <div className="p-6 text-gray-500">
        No Data Available. Please upload a report.
      </div>
    );
  }

  // ---------------------------
  // UI
  // ---------------------------
  return (
    <div className="p-6 space-y-6">

      <div className="text-sm text-gray-500">
        AI Insights updating automatically...
      </div>

      <div className="flex justify-center">
        <PieChart width={320} height={320}>
          <Pie data={chartData} dataKey="value" outerRadius={110} label>
            {chartData.map((entry, index) => (
              <Cell key={index} fill={COLORS[index]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </div>

      <ExecutiveSummaryPage
        summary={{
          ...summary,
          complianceScore,
          rag,
        }}
        data={kpis}
        topRisks={topRisks}
      />
    </div>
  );
}