import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import ExecutiveSummary from "../components/ExecutiveSummaryPage";
import ExportPdfModal from "../components/ExportPdfModal";
import { generateAIInsights } from "../services/aiService";

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
      {/* EXPORT PPT */}
      <button
       onClick={() => generatePresentation(kpis)}
        className="bg-indigo-600 text-white px-4 py-2 rounded"
      >
      Export PPT
      </button>

      {/* ✅ SINGLE SOURCE OF TRUTH */}
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