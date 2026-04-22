import PptxGenJS from "pptxgenjs";

// ---------------------------
// COLOR MAP (RAG)
// ---------------------------
const getColor = (status) => {
  if (status === "RED") return "FF4D4F";
  if (status === "AMBER") return "FDBA2D";
  if (status === "GREEN") return "52C41A";
  return "999999";
};

export const generatePresentation = (kpis = []) => {
  const pptx = new PptxGenJS();

  // ---------------------------
  // DATA
  // ---------------------------
  const red = kpis.filter(k => k.status === "RED");
  const amber = kpis.filter(k => k.status === "AMBER");
  const green = kpis.filter(k => k.status === "GREEN");

  const topRisks = red.slice(0, 5);

  // ---------------------------
  // SLIDE 1 — COVER
  // ---------------------------
  let slide = pptx.addSlide();

  slide.background = { fill: "224094" };

  slide.addText("Delivery Governance Report", {
    x: 1,
    y: 2,
    fontSize: 32,
    bold: true,
    color: "FFFFFF",
  });

  slide.addText("Executive Summary", {
    x: 1,
    y: 3,
    fontSize: 18,
    color: "FFFFFF",
  });

  // ---------------------------
  // SLIDE 2 — EXEC SUMMARY
  // ---------------------------
  slide = pptx.addSlide();

  slide.addText("Executive Summary", {
    x: 0.5,
    y: 0.5,
    fontSize: 24,
    bold: true,
    color: "224094",
  });

  slide.addText(
    `Total KPIs: ${kpis.length}\nCritical Risks: ${red.length}\nWarnings: ${amber.length}\nHealthy: ${green.length}`,
    {
      x: 0.5,
      y: 1.5,
      fontSize: 16,
    }
  );

  // ---------------------------
  // SLIDE 3 — KPI SNAPSHOT
  // ---------------------------
  slide = pptx.addSlide();

  slide.addText("KPI Snapshot", {
    x: 0.5,
    y: 0.5,
    fontSize: 24,
    bold: true,
    color: "224094",
  });

  slide.addText(
    red.map(k => `🔴 ${k.name} (${k.value}%)`).join("\n"),
    { x: 0.5, y: 1.5, fontSize: 14, color: "FF4D4F" }
  );

  // ---------------------------
  // SLIDE 4 — TOP RISKS
  // ---------------------------
  slide = pptx.addSlide();

  slide.addText("Top Risk Drivers", {
    x: 0.5,
    y: 0.5,
    fontSize: 24,
    bold: true,
  });

  slide.addText(
    topRisks.map(k => `${k.name} (${k.value}%)`).join("\n"),
    { x: 0.5, y: 1.5, fontSize: 16 }
  );

  // ---------------------------
  // SLIDE 5 — CATEGORY INSIGHTS
  // ---------------------------
  slide = pptx.addSlide();

  slide.addText("Category Insights", {
    x: 0.5,
    y: 0.5,
    fontSize: 24,
    bold: true,
  });

  const categories = [...new Set(kpis.map(k => k.category))];

  slide.addText(
    categories
      .map(cat => {
        const items = kpis.filter(k => k.category === cat);
        return `${cat}: ${items.length} KPIs`;
      })
      .join("\n"),
    { x: 0.5, y: 1.5, fontSize: 14 }
  );

  // ---------------------------
  // SLIDE 6 — RECOMMENDATIONS
  // ---------------------------
  slide = pptx.addSlide();

  slide.addText("Recommendations", {
    x: 0.5,
    y: 0.5,
    fontSize: 24,
    bold: true,
  });

  slide.addText(
    "• Reduce aging items\n• Control WIP\n• Improve estimation\n• Strengthen SLA adherence",
    { x: 0.5, y: 1.5, fontSize: 14 }
  );

  // ---------------------------
  // SLIDE 7 — APPENDIX
  // ---------------------------
  slide = pptx.addSlide();

  slide.addText("KPI Appendix", {
    x: 0.5,
    y: 0.5,
    fontSize: 24,
    bold: true,
  });

  slide.addText(
    kpis.map(k => `${k.name} - ${k.value}%`).join("\n"),
    { x: 0.5, y: 1.5, fontSize: 10 }
  );

  // ---------------------------
  // SAVE
  // ---------------------------
  pptx.writeFile("Governance_Report.pptx");
};