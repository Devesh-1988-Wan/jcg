export function normalizeKpi(raw = {}) {
  // ---------------------------
  // SAFE INPUT HANDLING
  // ---------------------------
  let name = String(raw.name || "").trim();

  // ---------------------------
  // CLEAN NAME (REMOVE NOISE)
  // ---------------------------
  name = name
    .replace(/^\d+\s+/i, "")                // remove leading index
    .replace(/AUD-\d+/gi, "")               // remove audit ID
    .replace(/\b(RED|AMBER|GREEN)\b/gi, "") // remove status text
    .replace(/\b(Compliance|Number of)\b/gi, "") // remove noise words
    .replace(/\s+/g, " ")
    .trim();

  // ---------------------------
  // NORMALIZE VALUE
  // ---------------------------
  let value = raw.value;

  if (typeof value === "string") {
    value = value.replace("%", "");
  }

  value = Number(value) || 0;

  // ---------------------------
  // STATUS (TRUST SOURCE FIELD)
  // ---------------------------
  const status = (raw.status || "").toUpperCase();

  // ---------------------------
  // CATEGORY MAPPING (ENHANCED)
  // ---------------------------
  let category = "OTHER";
  const lower = name.toLowerCase();

  if (
    lower.includes("lead") ||
    lower.includes("cycle") ||
    lower.includes("wip") ||
    lower.includes("aging")
  ) {
    category = "FLOW";
  }
  else if (
    lower.includes("bug") ||
    lower.includes("defect") ||
    lower.includes("reopen")
  ) {
    category = "QUALITY";
  }
  else if (
    lower.includes("delivery") ||
    lower.includes("throughput") ||
    lower.includes("resolution") ||
    lower.includes("completion")
  ) {
    category = "DELIVERY";
  }
  else if (
    lower.includes("scope") ||
    lower.includes("spill")
  ) {
    category = "PREDICTABILITY";
  }
  else if (
    lower.includes("parent") ||
    lower.includes("link")
  ) {
    category = "DATA_INTEGRITY";
  }
  else if (
    lower.includes("estimate")
  ) {
    category = "PLANNING";
  }
  else if (
    lower.includes("priority") ||
    lower.includes("p1")
  ) {
    category = "CRITICAL";
  }

  // ---------------------------
  // RETURN NORMALIZED KPI
  // ---------------------------
  return {
    id: raw.id || "",
    name,
    value,
    status,
    category
  };
}

