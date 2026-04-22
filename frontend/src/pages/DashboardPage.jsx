import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import ExecutiveSummary from "../components/ExecutiveSummaryPage";
import ExportPdfModal from "../components/ExportPdfModal";

import { fetchReport } from "../api/reportApi";
import { normalizeKpi } from "../utils/normalizeKpi";
import { generateAIInsights } from "../services/aiService";

import { PieChart, Pie, Cell, Tooltip } from "recharts";

/* ---------------------------
   UI COMPONENTS
----------------------------*/

const Card = ({ title, value }) => (
  <div className="p-4 border rounded shadow-sm bg-white">
    <div className="text-sm text-gray-500">{title}</div>
    <div className="text-xl font-bold">{value ?? 0}</div>
  </div>
);

const TrendChart = () => (
  <div className="p-4 border bg-white">Trend Chart</div>
);

const TopRiskDrivers = ({ data = [] }) => (
  <div className="p-4 border bg-white">
    <div className="font-semibold mb-2">Top Risks</div>
    {data.length ? (
      data.map((r, i) => (
        <div key={i}>
          {r?.name || "-"} - {r?.value ?? 0}%
        </div>
      ))
    ) : (
      <div className="text-gray-400">No risks</div>
    )}
  </div>
);

const KpiTable = ({ data = [] }) => (
  <div className="p-4 border bg-white">
    KPI Table ({data.length})
  </div>
);

/* ---------------------------
   MAIN COMPONENT
----------------------------*/

export default function DashboardPage() {
  const navigate = useNavigate();

  const [kpis, setKpis] = useState([]);
  const [topRisks, setTopRisks] = useState([]);
  const [aiInsights, setAiInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  // OPTIONAL: keep modal if needed
  const [showExport, setShowExport] = useState(false);

  /* ---------------------------
     LOAD DATA
  ----------------------------*/
  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);

      const res = await fetchReport();
      const normalized = (res?.kpis || []).map(normalizeKpi);

      setKpis(normalized);

      setTopRisks(
        normalized
          .filter((k) => k?.status === "RED")
          .slice(0, 5)
      );
    } catch (err) {
      console.error("Dashboard load failed:", err);
      setKpis([]);
      setTopRisks([]);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------------------
     AI INSIGHTS
  ----------------------------*/
  useEffect(() => {
    if (!kpis.length) return;

    generateAIInsights(kpis)
      .then(setAiInsights)
      .catch((err) => console.error("AI failed:", err));
  }, [kpis]);

  /* ---------------------------
     METRICS
  ----------------------------*/
  const rag = {
    red: kpis.filter((k) => k.status === "RED").length,
    amber: kpis.filter((k) => k.status === "AMBER").length,
    green: kpis.filter((k) => k.status === "GREEN").length,
  };

  const complianceScore = kpis.length
    ? Math.round(
        (kpis.reduce((acc, k) => {
          if (k.status === "GREEN") return acc + 1;
          if (k.status === "AMBER") return acc + 0.5;
          return acc;
        }, 0) / kpis.length) * 100
      )
    : 0;

  const chartData = [
    { name: "Red", value: rag.red },
    { name: "Amber", value: rag.amber },
    { name: "Green", value: rag.green },
  ];

  const COLORS = ["#ef4444", "#f59e0b", "#22c55e"];

  /* ---------------------------
     STATES
  ----------------------------*/
  if (loading) {
    return <div className="p-6 text-gray-500">Loading...</div>;
  }

  if (!kpis.length) {
    return <div className="p-6 text-gray-500">No data available</div>;
  }

  /* ---------------------------
     RENDER
  ----------------------------*/
  return (
    <div className="p-6 space-y-6">

      {/* ✅ RECOMMENDED EXPORT FLOW */}
      <button
        onClick={() =>
          navigate("/report", {
            state: {
              kpis,
              aiInsights,
              autoExport: true,
            },
          })
        }
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Export PDF
      </button>

      {/* PAGE 1 */}
      <div id="pdf-page-1" className="pdf-page space-y-4">
        <div className="grid grid-cols-4 gap-4">
          <Card title="Compliance Score" value={`${complianceScore}%`} />
          <Card title="Critical Risks" value={rag.red} />
          <Card title="Warnings" value={rag.amber} />
          <Card title="Healthy" value={rag.green} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <TrendChart />
          <TopRiskDrivers data={topRisks} />
        </div>
      </div>

      {/* PAGE 2 */}
      <div id="pdf-page-2" className="pdf-page space-y-4">
        <div className="flex justify-center">
          <PieChart width={320} height={320}>
            <Pie data={chartData} dataKey="value" innerRadius={70} outerRadius={110}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={COLORS[i]} />
              ))}
            </Pie>

            <text x="50%" y="50%" textAnchor="middle">
              {complianceScore}%
            </text>

            <Tooltip />
          </PieChart>
        </div>

        <ExecutiveSummary data={kpis} aiInsights={aiInsights} />
      </div>

      {/* PAGE 3 */}
      <div id="pdf-page-3" className="pdf-page">
        <KpiTable data={kpis} />
      </div>

    </div>
  );
}