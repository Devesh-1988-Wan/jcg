import React from "react";
import {
  calculateDeliveryHealth,
  getRiskLevel,
} from "../utils/deliveryHealth";

export default function DeliveryHealthWidget({ kpis }) {
  const result = calculateDeliveryHealth(kpis);
  const risk = getRiskLevel(result.score);

  return (
    <div className="bg-white rounded-2xl shadow p-5">
      <h2 className="text-lg font-semibold mb-4">
        Delivery Health & Risk Trend
      </h2>

      {/* MAIN SCORE */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-4xl font-bold">{result.score}</p>
          <p className={`text-${risk.color}-500 font-medium`}>
            {risk.label}
          </p>
        </div>
      </div>

      {/* PILLARS */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>Flow: {result.flow}</div>
        <div>Execution: {result.execution}</div>
        <div>Quality: {result.quality}</div>
        <div>Governance: {result.governance}</div>
      </div>
    </div>
  );
}