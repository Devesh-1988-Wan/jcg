import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { exportToPDF } from "../components/pdfUtils";

import ExecutiveSummary from "../components/ExecutiveSummaryPage";
import DetailedFindings from "../components/DetailedFindings"; // 👈 SAME UI

export default function ReportPage() {
  const { state } = useLocation();

  const [kpis, setKpis] = useState(state?.kpis || []);
  const [aiInsights, setAiInsights] = useState(state?.aiInsights || []);

  useEffect(() => {
    if (state?.autoExport) {
      setTimeout(() => {
        exportToPDF({
          summary: true,
          charts: true,
          kpi: true,
          findings: true,
        }, kpis);
      }, 800);
    }
  }, []);

  return (
    <div className="p-6 space-y-6 bg-white">

      {/* PAGE 1 */}
      <div id="pdf-page-1" className="space-y-4">
        <h2 className="text-xl font-bold">Executive Overview</h2>
        <ExecutiveSummary data={kpis} aiInsights={aiInsights} />
      </div>

      {/* PAGE 2 */}
      <div id="pdf-page-2">
        <h2 className="text-xl font-bold">Charts</h2>
        {/* reuse your chart components */}
      </div>

      {/* PAGE 3 */}
      <div id="pdf-page-3">
        <h2 className="text-xl font-bold">KPI Table</h2>
      </div>

      {/* PAGE 4 (IMPORTANT) */}
      <div id="pdf-page-4">
        <h2 className="text-xl font-bold">Detailed Findings</h2>

        {/* ✅ EXACT SAME UI */}
        <DetailedFindings data={kpis} />
      </div>

    </div>
  );
}