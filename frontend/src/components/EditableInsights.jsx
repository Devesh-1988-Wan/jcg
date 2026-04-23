import React, { useState } from "react";

export default function EditableInsights({ aiInsights }) {
  const [summary, setSummary] = useState(
    aiInsights?.summary ||
      "Edit this executive summary..."
  );

  const [recommendations, setRecommendations] = useState(
    aiInsights?.recommendations?.join("\n") ||
      "Add recommendations..."
  );

  return (
    <div className="bg-white p-4 rounded-2xl shadow space-y-4">
      <h3 className="font-semibold text-lg">
        Executive Summary & Coach Insights
      </h3>

      <textarea
        className="w-full border rounded p-2 text-sm"
        rows={5}
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
      />

      <h4 className="font-semibold">Strategic Recommendations</h4>

      <textarea
        className="w-full border rounded p-2 text-sm"
        rows={5}
        value={recommendations}
        onChange={(e) => setRecommendations(e.target.value)}
      />
    </div>
  );
}