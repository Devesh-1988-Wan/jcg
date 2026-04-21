// src/utils/filterKpis.js

import { AI_FILTER_CONFIG, AI_MODES } from "../config/governanceConfig";

/**
 * Filter KPIs for AI processing (FAST + GENERIC)
 * Assumes KPIs are already normalized
 */
export function filterKpis(kpis = [], mode = "BALANCED") {
  const config = AI_MODES?.[mode] || AI_FILTER_CONFIG;

  return kpis.filter((kpi) => {
    if (!kpi?.name) return false;

    const value = Number(kpi.value) || 0;

    // ✅ Status filter (RED / AMBER etc.)
    const statusCheck = config.includeStatuses.includes(kpi.status);

    // ✅ Threshold filter
    const thresholdCheck = value >= config.minThreshold;

    // ✅ Zero exclusion
    const zeroCheck = !config.excludeIfZero || value !== 0;

    // ✅ Mandatory KPIs (always include)
    const isMandatory = (config.mandatoryMetrics || []).some((m) =>
      kpi.name.toLowerCase().includes(m.toLowerCase())
    );

    return (statusCheck && thresholdCheck && zeroCheck) || isMandatory;
  });
}

