import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import ExecutiveSummary from "../components/ExecutiveSummaryPage";
import DetailedFindings from "../components/DetailedFindings";

export default function ReportPage() {
  const { state } = useLocation();

  const kpis = state?.kpis || [];
  const aiInsights = state?.aiInsights || {};

  useEffect(() => {
    if (state?.autoExport) {
      setTimeout(generatePDF, 800);
    }
  }, []);

  const generatePDF = async () => {
    const pdf = new jsPDF("p", "mm", "a4");

    const pages = [
      "pdf-page-1",
      "pdf-page-2",
      "pdf-page-3",
      "pdf-page-4",
    ];

    for (let i = 0; i < pages.length; i++) {
      const el = document.getElementById(pages[i]);
      if (!el) continue;

      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
      });

      const img = canvas.toDataURL("image/png");

      if (i !== 0) pdf.addPage();

      pdf.addImage(img, "PNG", 0, 0, 210, 297);
    }

    pdf.save("Leadership_Report.pdf");
  };

  return (
    <div className="bg-white p-6 space-y-6">

      {/* PAGE 1 */}
      <div id="pdf-page-1" className="pdf-page">
        <ExecutiveSummary data={kpis} aiInsights={aiInsights} />
      </div>

      {/* PAGE 2 */}
      <div id="pdf-page-2" className="pdf-page">
        <ExecutiveSummary data={kpis} aiInsights={aiInsights} />
      </div>

      {/* PAGE 3 */}
      <div id="pdf-page-3" className="pdf-page">
        <DetailedFindings data={kpis} />
      </div>

      {/* PAGE 4 */}
      <div id="pdf-page-4" className="pdf-page">
        <DetailedFindings data={kpis} />
      </div>

    </div>
  );
}