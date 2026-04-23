import React from "react";

export default function RiskDrivers({ data = [] }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <h3 className="font-semibold mb-3">Top Risk Drivers</h3>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-gray-500 text-left">
            <th>Metric</th>
            <th>Severity</th>
            <th>Insight</th>
          </tr>
        </thead>

        <tbody>
          {data.map((d, i) => (
            <tr key={i} className="border-t">
              <td>{d.name}</td>
              <td className="text-red-600">{d.value}%</td>
              <td>
                {d.name.includes("Aging") &&
                  "Work items are stuck"}
                {d.name.includes("WIP") &&
                  "Too much context switching"}
                {d.name.includes("Lead Time") &&
                  "Slow delivery cycle"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}