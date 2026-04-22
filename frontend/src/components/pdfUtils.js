import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const pageMap = {
  summary: "pdf-page-1",
  charts: "pdf-page-2",
  kpi: "pdf-page-3",
};

export const exportToPDF = async (selectedPages, kpis = []) => {
  const pdf = new jsPDF("p", "mm", "a4");

  let pageNumber = 1;
  let first = true;

  for (const key of Object.keys(selectedPages)) {
    if (!selectedPages[key]) continue;
    if (key === "findings") continue;

    const el = document.getElementById(pageMap[key]);
    if (!el) continue;

    await new Promise(r => setTimeout(r, 400));

    const canvas = await html2canvas(el, { scale: 2 });
    const img = canvas.toDataURL("image/png");

    if (!first) pdf.addPage();

    addHeader(pdf, pageNumber);

    pdf.addImage(img, "PNG", 0, 12, 210, (canvas.height * 210) / canvas.width);

    addFooter(pdf);

    first = false;
    pageNumber++;
  }

  // Detailed Findings Table
  if (selectedPages.findings && kpis.length) {
    pdf.addPage();
    pageNumber++;

    addHeader(pdf, pageNumber);

    let y = 20;

    pdf.setFontSize(12);
    pdf.text("Detailed Findings", 10, y);
    y += 8;

    pdf.setFontSize(9);

    const headers = ["#", "Item", "Category", "Status", "%"];

    headers.forEach((h, i) => {
      pdf.text(h, 10 + i * 38, y);
    });

    y += 6;

    kpis.forEach((k, i) => {
      if (y > 270) {
        pdf.addPage();
        pageNumber++;
        addHeader(pdf, pageNumber);
        y = 20;
      }

      pdf.text(String(i + 1), 10, y);
      pdf.text(k.name || "-", 20, y);
      pdf.text(k.category || "-", 70, y);
      pdf.text(k.status || "-", 110, y);
      pdf.text(`${k.value || 0}%`, 150, y);

      y += 6;
    });

    addFooter(pdf);
  }

  pdf.save("Agile_Report.pdf");
};

const addHeader = (pdf, pageNumber) => {
  pdf.setFontSize(10);
  pdf.text("Leadership Compliance Report", 10, 8);
  pdf.text(`Page ${pageNumber}`, 180, 8);
};

const addFooter = (pdf) => {
  pdf.setFontSize(8);
  pdf.text(`Generated: ${new Date().toLocaleString()}`, 10, 290);
};