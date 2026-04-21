export function normalizeKpi(raw) {
  let name = raw.name || "";

  // ✅ Clean name (remove noise)
  name = name
    .replace(/^\d+\s+/i, "")          // remove leading index
    .replace(/AUD-\d+/gi, "")         // remove audit ID
    .replace(/\b(RED|AMBER|GREEN)\b/gi, "") // remove status text
    .replace(/\s+/g, " ")
    .trim();

  const value = Number(raw.value) || 0;

  // ✅ Trust explicit status (not name)
  const status = (raw.status || "").toUpperCase();

  // ✅ Auto category mapping (generic)
  let category = "OTHER";
  const lower = name.toLowerCase();

  if (lower.includes("lead") || lower.includes("cycle") || lower.includes("wip") || lower.includes("aging")) {
    category = "FLOW";
  } else if (lower.includes("bug") || lower.includes("defect") || lower.includes("reopen")) {
    category = "QUALITY";
  } else if (lower.includes("delivery") || lower.includes("throughput")) {
    category = "DELIVERY";
  } else if (lower.includes("scope") || lower.includes("spill")) {
    category = "PREDICTABILITY";
  }

  return {
    id: raw.id,
    name,
    value,
    status,
    category
  };
}

