import React, { useMemo } from "react";

export default function RiskTable({ data = [] }) {
  // Ensure stable unique keys (important for dynamic / AI-generated data)
  const safeData = useMemo(() => {
    return data.map((d, index) => ({
      ...d,
      _key: d.id || `${d.name}-${index}`, // fallback if id missing
    }));
  }, [data]);

  if (!safeData.length) {
    return (
      <div className="bg-white rounded-2xl shadow p-4">
        <h3 className="font-semibold mb-3">Top Risk Drivers</h3>
        <p className="text-gray-400 text-sm">No risk data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <h3 className="font-semibold mb-3">Top Risk Drivers</h3>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-500">
            <th className="pb-2">Issue</th>
            <th className="pb-2">Severity</th>
          </tr>
        </thead>

        <tbody>
          {safeData.map((d) => (
            <tr key={d._key} className="border-t hover:bg-gray-50 transition">
              <td className="py-2">{d.name || "N/A"}</td>

              <td
                className={`py-2 font-semibold ${
                  d.value >= 70
                    ? "text-red-500"
                    : d.value >= 40
                    ? "text-amber-500"
                    : "text-green-600"
                }`}
              >
                {typeof d.value === "number" ? `${d.value}%` : "N/A"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}