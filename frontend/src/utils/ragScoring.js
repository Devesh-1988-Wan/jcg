// src/utils/ragScoring.js

import { KPI_WEIGHTS, RAG_THRESHOLDS } from "../config/governanceConfig";
import { normalizeKpi } from "./normalizeKpi";

function getWeight(name) {
  const key = Object.keys(KPI_WEIGHTS).find(k =>
    name.toLowerCase().includes(k)
  );
  return key ? KPI_WEIGHTS[key] : 5; // default weight
}

function calculateScore(value, weight) {
  return value * weight;
}

export function scoreKpis(rawData) {
  const normalized = rawData.map(normalizeKpi);

  const scored = normalized.map(kpi => {
    const weight = getWeight(kpi.name);
    const score = calculateScore(kpi.value, weight);

    let rag = "GREEN";
    if (kpi.value >= RAG_THRESHOLDS.RED) rag = "RED";
    else if (kpi.value >= RAG_THRESHOLDS.AMBER) rag = "AMBER";

    return {
      ...kpi,
      weight,
      score,
      rag
    };
  });

  const totalScore = scored.reduce((sum, k) => sum + k.score, 0);

  let overallRag = "GREEN";
  if (totalScore > 800) overallRag = "RED";
  else if (totalScore > 300) overallRag = "AMBER";

  return {
    scoredKpis: scored,
    totalScore,
    overallRag
  };
}