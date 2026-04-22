import jsPDF from "jspdf";

export const exportToPDF = async (selected, kpis = []) => {
  const pdf = new jsPDF();

  let y = 20;

  pdf.text("Detailed Findings", 10, y);
  y += 10;

  kpis.forEach((k, i) => {
    if (y > 280) {
      pdf.addPage();
      y = 20;
    }

    pdf.text(`${i + 1}. ${k.name} - ${k.value}%`, 10, y);
    y += 6;
  });

  pdf.save("Agile_Report.pdf");
};