// ==============================
// DELIVERY HEALTH SCORING ENGINE
// ==============================

// Convert % (bad when high) → score
const invertScore = (value) => {
  if (value === undefined || value === null) return 100;
  return Math.max(0, 100 - value);
};

// Average helper
const avg = (arr) =>
  arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 100;

// Extract KPI value safely
const getValue = (kpis, name) => {
  const item = kpis.find((k) =>
    k.name?.toLowerCase().includes(name.toLowerCase())
  );
  return item?.value ?? 0;
};

// ==============================
// MAIN CALCULATION
// ==============================
export const calculateDeliveryHealth = (kpis) => {
  // FLOW
  const flowScores = [
    invertScore(getValue(kpis, "Lead Time")),
    invertScore(getValue(kpis, "Cycle Time")),
    invertScore(getValue(kpis, "Aging")),
    invertScore(getValue(kpis, "WIP")),
  ];
  const flow = avg(flowScores);

  // EXECUTION
  const executionScores = [
    invertScore(getValue(kpis, "Spillover")),
    invertScore(getValue(kpis, "Scope Creep")),
    invertScore(getValue(kpis, "On-Time")),
  ];
  const execution = avg(executionScores);

  // QUALITY
  const qualityScores = [
    invertScore(getValue(kpis, "Reopen")),
    invertScore(getValue(kpis, "Defect Aging")),
  ];
  const quality = avg(qualityScores);

  // GOVERNANCE
  const governanceScores = [
    invertScore(getValue(kpis, "parent link")),
    invertScore(getValue(kpis, "RCA")),
  ];
  const governance = avg(governanceScores);

  // FINAL SCORE
  const score =
    flow * 0.3 +
    execution * 0.3 +
    quality * 0.2 +
    governance * 0.2;

  return {
    score: Math.round(score),
    flow: Math.round(flow),
    execution: Math.round(execution),
    quality: Math.round(quality),
    governance: Math.round(governance),
  };
};

// ==============================
// RISK CLASSIFICATION
// ==============================
export const getRiskLevel = (score) => {
  if (score >= 85) return { label: "Healthy", color: "green" };
  if (score >= 70) return { label: "Watch", color: "yellow" };
  if (score >= 50) return { label: "Risk", color: "orange" };
  return { label: "Critical", color: "red" };
};