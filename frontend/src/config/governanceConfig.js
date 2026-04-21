// ==============================
// KPI WEIGHTS (for scoring)
// ==============================
export const KPI_WEIGHTS = {
  "aging": 10,
  "lead time": 9,
  "cycle time": 9,
  "wip": 8,
  "throughput": 7,
  "defect": 8,
  "reopen": 6,
  "scope creep": 9,
  "spillover": 8,
  "delivery": 10
};

// ==============================
// RAG THRESHOLDS
// ==============================
export const RAG_THRESHOLDS = {
  RED: 25,
  AMBER: 5
};

// ==============================
// DEFAULT FILTER CONFIG
// ==============================
export const AI_FILTER_CONFIG = {
  includeStatuses: ["RED", "AMBER"],
  minThreshold: 5,
  excludeIfZero: true,
  mandatoryMetrics: ["Aging", "Lead Time"]
};

// ==============================
// AI MODES (performance tuning)
// ==============================
export const AI_MODES = {
  FAST: {
    includeStatuses: ["RED"],
    minThreshold: 10,
    excludeIfZero: true,
    mandatoryMetrics: ["Aging", "Lead Time"]
  },

  BALANCED: {
    includeStatuses: ["RED", "AMBER"],
    minThreshold: 5,
    excludeIfZero: true,
    mandatoryMetrics: ["Aging", "Lead Time"]
  },

  DEEP: {
    includeStatuses: ["RED", "AMBER", "GREEN"],
    minThreshold: 0,
    excludeIfZero: false,
    mandatoryMetrics: []
  }
};

