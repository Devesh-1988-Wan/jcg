import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import ExecutiveSummary from "../components/ExecutiveSummaryPage";
import ExportPdfModal from "../components/ExportPdfModal";

import { fetchReport } from "../api/reportApi";
import { normalizeKpi } from "../utils/normalizeKpi";
import { generateAIInsights } from "../services/aiService";

import { PieChart, Pie, Cell, Tooltip } from "recharts";

const COLORS = ["#ef4444", "#f59e0b", "#22c55e"]; // RED AMBER GREEN

// ----------------------
// CARD
// ----------------------
const Card = ({ title, value, color }) => (
  <div className="p-4 border rounded-xl shadow-sm bg-white">
    <div className="text-sm text-gray-500">{title}</div>
    <div className={`text-xl font-bold ${color}`}>{value}</div>
  </div>
);

export default function DashboardPage({ kpis, setKpis }) {
  const navigate = useNavigate();

  const [topRisks, setTopRisks] = useState([]);
  const [aiInsights, setAiInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showExport, setShowExport] = useState(false);

  // ---------------------------
  // LOAD DATA
  // ---------------------------
  useEffect(() => {
    if (kpis.length) {
      setLoading(false);
      return;
    }
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await fetchReport();
      const normalized = (res?.kpis || []).map(normalizeKpi);

      setKpis(normalized);

      setTopRisks(
        normalized.filter(k => k.status === "RED").slice(0, 5)
      );
    } catch (err) {
      console.error("Dashboard error:", err);
      setKpis([]);
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------
  // AI
  // ---------------------------
  useEffect(() => {
    if (!kpis.length) return;
    generateAIInsights(kpis).then(setAiInsights);
  }, [kpis]);

  // ---------------------------
  // RAG CALCULATION
  // ---------------------------
  const { red, amber, green } = useMemo(() => {
    let red = 0, amber = 0, green = 0;

    kpis.forEach(k => {
      if (k.status === "RED") red++;
      else if (k.status === "AMBER") amber++;
      else green++;
    });

    return { red, amber, green };
  }, [kpis]);

  // ---------------------------
  // COMPLIANCE SCORE
  // ---------------------------
  const compliance = useMemo(() => {
    if (!kpis.length) return 0;

    const score =
      kpis.reduce((acc, k) => {
        if (k.status === "GREEN") return acc + 1;
        if (k.status === "AMBER") return acc + 0.5;
        return acc;
      }, 0) / kpis.length;

    return Math.round(score * 100);
  }, [kpis]);

  // ---------------------------
  // CHART DATA
  // ---------------------------
  const chartData = [
    { name: "Red", value: red },
    { name: "Amber", value: amber },
    { name: "Green", value: green },
  ];

  if (loading) return <div className="p-6">Loading...</div>;

  // ---------------------------
  // RENDER
  // ---------------------------
  return (
    <div className="p-6 space-y-6">

      {/* EXPORT BUTTON */}
      <button
        onClick={() => setShowExport(true)}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Export PDF
      </button>

        {/* DONUT */}
        <div className="flex justify-center">
          <PieChart width={260} height={260}>
            <Pie data={chartData} dataKey="value" innerRadius={70} outerRadius={100}>
              {chartData.map((_, i) => (
                <Cell key={i} fill={COLORS[i]} />
              ))}
            </Pie>

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

      {/* EXEC SUMMARY */}
      <ExecutiveSummary data={kpis} aiInsights={aiInsights} />

      {/* EXPORT MODAL */}
      {showExport && (
        <ExportPdfModal
          onClose={() => setShowExport(false)}
          onExport={(selected) => {
            setShowExport(false);

            navigate("/report", {
              state: {
                kpis,
                aiInsights,
                selectedPages: selected,
                autoExport: true,
              },
            });
          }}
        />
      )}

    </div>
  );
}