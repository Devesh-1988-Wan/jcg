import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { exportToPDF } from "../components/pdfUtils";

import ExecutiveSummary from "../components/ExecutiveSummaryPage";

export default function ReportPage() {
  const { state } = useLocation();

  const kpis = state?.kpis || [];
  const aiInsights = state?.aiInsights || {};

  // ---------------------------
  // WAIT FOR FULL RENDER
  // ---------------------------
  const waitForFullRender = () => {
    return new Promise((resolve) => {
      setTimeout(resolve, 1500); // ensures charts + AI render
    });
  };

  // ---------------------------
  // AUTO EXPORT
  // ---------------------------
  useEffect(() => {
    if (state?.autoExport) {
      waitForFullRender().then(() => {
        exportToPDF(kpis);
      });
    }
  }, [state, kpis]);

  // ---------------------------
  // RENDER
  // ---------------------------
  return (
    <div className="bg-white p-6 flex justify-center">

      {/* PAGE 1 (ONLY THIS IS CAPTURED) */}
      <div id="pdf-page-1" className="pdf-page">
        <ExecutiveSummary data={kpis} aiInsights={aiInsights} />
      </div>

    </div>
  );
}