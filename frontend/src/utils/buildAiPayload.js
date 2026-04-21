export function buildAiPayload(kpis) {
  const grouped = {
    flow: [],
    quality: [],
    delivery: [],
    scope: []
  };

  kpis.forEach(k => {
    const name = k.name.toLowerCase();

    if (name.includes("lead") || name.includes("cycle") || name.includes("wip") || name.includes("aging")) {
      grouped.flow.push(k);
    } else if (name.includes("bug") || name.includes("defect")) {
      grouped.quality.push(k);
    } else if (name.includes("delivery") || name.includes("throughput")) {
      grouped.delivery.push(k);
    } else if (name.includes("scope") || name.includes("spill")) {
      grouped.scope.push(k);
    }
  });

  return grouped;
}