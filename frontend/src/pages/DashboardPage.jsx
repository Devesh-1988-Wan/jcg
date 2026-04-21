import { useEffect, useState } from "react";
import ExecutiveSummaryPage from "../components/ExecutiveSummaryPage";
import { fetchReport, fetchAIStatus } from "../api/reportApi";
import { PieChart, Pie, Cell, Tooltip } from "recharts";

import { normalizeKpi } from "../utils/normalizeKpi";
import { scoreKpis } from "../utils/ragScoring";
import { generateAIInsights } from "../services/aiService";

export default function DashboardPage() {
  // ---------------------------
  // STATE (ALL HOOKS FIRST ✅)
  // ---------------------------
  const [summary, setSummary] = useState(null);
  const [kpis, setKpis] = useState([]);
  const [topRisks, setTopRisks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [aiInsights, setAiInsights] = useState(null);

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
    let attempts = 0;
    const maxAttempts = 12;

    const interval = setInterval(async () => {
      try {
        const res = await fetchAIStatus();

        if (res.status === "completed") {
          loadDashboard();
          clearInterval(interval);
        }

        attempts++;
        if (attempts >= maxAttempts) clearInterval(interval);
      } catch (err) {
        console.error("AI polling error:", err);
        clearInterval(interval);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // ---------------------------
  // LOAD DATA (FIXED ✅)
  // ---------------------------
  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetchReport(); // ✅ ONLY place res exists

      const rawKpis = res.kpis || res.data || [];
      const normalizedKpis = rawKpis.map(normalizeKpi);

      // ✅ FIX: summary handled correctly
      const summaryText =
        res.summary?.text ||
        res.report ||
        "AI insights not available";

      setSummary({ text: summaryText });
      setKpis(normalizedKpis);

      const top = normalizedKpis
        .filter((k) => k.status === "RED")
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

      setTopRisks(top);

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
  // AI INSIGHTS
  // ---------------------------
  useEffect(() => {
    if (!kpis.length) return;

    async function runAI() {
      try {
        const insights = await generateAIInsights(kpis);
        setAiInsights(insights);
      } catch (err) {
        console.error("AI failed:", err);
      }
    }

    runAI();
  }, [kpis]);

  // ---------------------------
  // RAG DISTRIBUTION
  // ---------------------------
  const getRagDistribution = () => {
    let red = 0, amber = 0, green = 0;

    kpis.forEach((item) => {
      if (item.status === "RED") red++;
      else if (item.status === "AMBER") amber++;
      else if (item.status === "GREEN") green++;
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
      if (item.status === "GREEN") score += 1;
      else if (item.status === "AMBER") score += 0.5;
    });

    return Math.round((score / kpis.length) * 100);
  };

  const complianceScore = calculateComplianceScore();

  // ---------------------------
  // SCORING ENGINE
  // ---------------------------
  const { overallRag, totalScore } = scoreKpis(kpis);

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
  // UI STATES
  // ---------------------------
  if (loading) return <div className="p-6">Loading dashboard...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (!kpis.length) return <div className="p-6">No KPI Data</div>;

  // ---------------------------
  // UI
  // ---------------------------
  return (
    <div className="p-6 space-y-6">
      <div className="text-sm text-gray-500">
        AI Insights updating automatically...
      </div>

      {/* DONUT */}
      <div className="flex justify-center">
        <PieChart width={320} height={320}>
          <Pie data={chartData} dataKey="value" innerRadius={70} outerRadius={110}>
            {chartData.map((entry, index) => (
              <Cell key={index} fill={COLORS[index]} />
            ))}
          </Pie>

          <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
            {complianceScore}%
          </text>

          <Tooltip />
        </PieChart>
      </div>

      {/* SUMMARY */}
      <ExecutiveSummaryPage
        summary={{
          ...(summary || {}),
          complianceScore,
          rag,
          overallRag,
          totalScore,
        }}
        data={kpis}
        topRisks={topRisks}
        aiInsights={aiInsights}
      />
    </div>
  );
}

