import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import ExecutiveSummary from "../components/ExecutiveSummaryPage";
import ExportPdfModal from "../components/ExportPdfModal";
import { generateAIInsights } from "../services/aiService";
import { generatePresentation } from "../utils/pptGenerator";

export default function DashboardPage({ kpis = [] }) {
  const navigate = useNavigate();

  const [aiInsights, setAiInsights] = useState(null);
  const [showExport, setShowExport] = useState(false);

  // ---------------------------
  // EMPTY STATE
  // ---------------------------
  if (!kpis.length) {
    return (
      <div className="p-6 text-gray-500">
        No data available. Please upload a report.
      </div>
    );
  }

  // ---------------------------
  // AI INSIGHTS
  // ---------------------------
  useEffect(() => {
    generateAIInsights(kpis).then(setAiInsights);
  }, [kpis]);

  // ---------------------------
  // DERIVED SUMMARY (FIX)
  // ---------------------------
  const summary =
    aiInsights?.summary ||
    "Auto-generated report summary based on KPI trends.";

  // ---------------------------
  // RENDER
  // ---------------------------
  return (
    <div className="p-6 space-y-6">

      {/* EXPORT PDF */}
      <button
        onClick={() => setShowExport(true)}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Export PDF
      </button>

      {/* EXPORT PPT */}
      <button
        onClick={() => generatePresentation(summary, kpis)}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Generate PPT
      </button>

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