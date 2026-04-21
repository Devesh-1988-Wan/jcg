import { scoreKpis } from "../utils/ragScoring";

const RiskDashboardPage = ({ data = [] }) => {
  // ✅ Safe scoring inside component
  const { scoredKpis, totalScore, overallRag } = scoreKpis(data);

  // ✅ Optional: group into categories (basic example)
  const categories = {
    flow: 0,
    quality: 0,
    delivery: 0,
    scope: 0,
  };

  scoredKpis.forEach((kpi) => {
    const name = kpi.name.toLowerCase();

    if (name.includes("lead") || name.includes("cycle") || name.includes("wip")) {
      categories.flow += kpi.score;
    } else if (name.includes("bug") || name.includes("defect")) {
      categories.quality += kpi.score;
    } else if (name.includes("delivery") || name.includes("throughput")) {
      categories.delivery += kpi.score;
    } else if (name.includes("scope") || name.includes("spill")) {
      categories.scope += kpi.score;
    }
  });

  return (
    <div className="p-6 space-y-4">

      <h1 className="text-xl font-semibold">
        Overall Risk: {overallRag}
      </h1>

      <div className="text-sm text-gray-500">
        Total Score: {totalScore}
      </div>

      {/* Category Breakdown */}
      <div className="space-y-2">
        {Object.entries(categories).map(([key, value]) => (
          <div key={key} className="flex justify-between border-b pb-1">
            <span className="capitalize">{key}</span>
            <span>{value}</span>
          </div>
        ))}
      </div>

    </div>
  );
};

export default RiskDashboardPage;

