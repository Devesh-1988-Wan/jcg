import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";

const getColor = (status) => {
  if (status === "RED") return [239, 68, 68];
  if (status === "AMBER") return [245, 158, 11];
  if (status === "GREEN") return [34, 197, 94];
  return [0, 0, 0];
};

export const exportToPDF = async (kpis = []) => {
  const pdf = new jsPDF("p", "mm", "a4");

  // ---------------------------
  // PAGE 1 → SUMMARY
  // ---------------------------
  const el = document.getElementById("pdf-page-1");

  if (el) {
    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
    });

    const img = canvas.toDataURL("image/png");

    pdf.addImage(img, "PNG", 0, 0, 210, 297);
  }

  // ---------------------------
  // PAGE 2 → DETAILED FINDINGS
  // ---------------------------
  pdf.addPage();

  pdf.setFontSize(14);
  pdf.text("Detailed Findings", 14, 15);

  autoTable(pdf, {
    startY: 20,
    head: [["#", "Item", "Category", "Status", "%"]],
    body: kpis.map((k, i) => [
      i + 1,
      k.name,
      k.category,
      k.status,
      `${k.value}%`,
    ]),

    styles: { fontSize: 8 },

    didParseCell: (data) => {
      if (data.section === "body" && data.column.index === 3) {
        const color = getColor(data.cell.raw);
        data.cell.styles.textColor = color;
        data.cell.styles.fontStyle = "bold";
      }
    },
  });

  // ---------------------------
  // PAGE 3 → KPI APPENDIX
  // ---------------------------
  pdf.addPage();

  pdf.setFontSize(14);
  pdf.text("KPI Appendix", 14, 15);

  autoTable(pdf, {
    startY: 20,
    head: [["KPI", "Category", "Value", "Status"]],
    body: kpis.map((k) => [
      k.name,
      k.category,
      `${k.value}%`,
      k.status,
    ]),

    styles: { fontSize: 8 },

    didParseCell: (data) => {
      if (data.section === "body" && data.column.index === 3) {
        const color = getColor(data.cell.raw);
        data.cell.styles.textColor = color;
      }
    },
  });

  pdf.save("Agile_Compliance_and_Governance_Report.pdf");
};