export const generatePresentation = (summary, kpis, health) => {
  const ppt = new PptxGenJS();

  // ---------------------------
  // SLIDE 1: TITLE
  // ---------------------------
  ppt.addSlide().addText("Delivery Governance Report", {
    x: 1,
    y: 1.5,
    fontSize: 24,
    bold: true,
  });

  // ---------------------------
  // SLIDE 2: DELIVERY HEALTH
  // ---------------------------
  const slide2 = ppt.addSlide();

  slide2.addText("Delivery Health & Risk", {
    x: 0.5,
    y: 0.5,
    fontSize: 20,
    bold: true,
  });

  slide2.addText(`Score: ${health.score}`, {
    x: 0.5,
    y: 1.2,
    fontSize: 18,
  });

  slide2.addText(
    `Flow: ${health.flow} | Execution: ${health.execution} | Quality: ${health.quality} | Governance: ${health.governance}`,
    { x: 0.5, y: 1.8, fontSize: 14 }
  );

  // ---------------------------
  // SLIDE 3: SUMMARY
  // ---------------------------
  ppt.addSlide().addText(summary, {
    x: 0.5,
    y: 1,
    fontSize: 14,
    wrap: true,
  });

  ppt.writeFile("Delivery_Report.pptx");
};