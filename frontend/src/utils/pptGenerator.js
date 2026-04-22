import PptxGenJS from "pptxgenjs";

// ---------------------------
// NORMALIZE INPUT (CRITICAL FIX)
// ---------------------------
const normalizeKpis = (raw) => {
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.data)) return raw.data;
  return [];
};

// ---------------------------
// COLOR MAP (RAG)
// ---------------------------
const getColor = (status) => {
  if (status === "RED") return "FF4D4F";
  if (status === "AMBER") return "FDBA2D";
  if (status === "GREEN") return "52C41A";
  return "999999";
};

// ---------------------------
// SAFE VALUE HELPERS
// ---------------------------
const getName = (k) => k.name || k.metric || "Unknown KPI";
const getValue = (k) => k.value ?? k.score ?? "N/A";
const getCategory = (k) => k.category || "General";

// ---------------------------
// MAIN FUNCTION
// ---------------------------
export const generatePresentation = async (summary = "", rawKpis = []) => {
  try {
    const pptx = new PptxGenJS();

    // 🛡️ normalize input (fix for your error)
    const kpis = normalizeKpis(rawKpis);

    if (!kpis.length) {
      console.warn("No KPI data available");
    }

    // ---------------------------
    // DATA SEGMENTATION
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
      summary ||
        `Total KPIs: ${kpis.length}
Critical Risks: ${red.length}
Warnings: ${amber.length}
Healthy: ${green.length}`,
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

    const redText =
      red.length > 0
        ? red.map(k => `🔴 ${getName(k)} (${getValue(k)}%)`).join("\n")
        : "No critical risks";

    slide.addText(redText, {
      x: 0.5,
      y: 1.5,
      fontSize: 14,
      color: "FF4D4F",
    });

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
      topRisks.length
        ? topRisks.map(k => `${getName(k)} (${getValue(k)}%)`).join("\n")
        : "No high risks identified",
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

    const categories = [...new Set(kpis.map(getCategory))];

    const categoryText = categories
      .map(cat => {
        const items = kpis.filter(k => getCategory(k) === cat);
        return `${cat}: ${items.length} KPIs`;
      })
      .join("\n");

    slide.addText(categoryText || "No category data", {
      x: 0.5,
      y: 1.5,
      fontSize: 14,
    });

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
      `• Reduce aging items
• Control WIP limits
• Improve estimation accuracy
• Strengthen SLA adherence
• Monitor flow efficiency (Cycle Time)`,
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
      kpis.length
        ? kpis.map(k => `${getName(k)} - ${getValue(k)}%`).join("\n")
        : "No KPI data available",
      { x: 0.5, y: 1.5, fontSize: 10 }
    );

    // ---------------------------
    // SAVE FILE
    // ---------------------------
    await pptx.writeFile({ fileName: "Governance_Report.pptx" });

  } catch (error) {
    console.error("PPT Generation Failed:", error);
  }
};