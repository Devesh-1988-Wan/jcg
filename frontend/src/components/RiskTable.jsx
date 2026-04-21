import React from "react";

export default function RiskTable({ data }) {
  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <h3 className="font-semibold mb-3">Top Risk Drivers</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-500">
            <th>Issue</th>
            <th>Severity</th>
          </tr>
        </thead>
        <tbody>
          {data.map(d => (
            <tr key={d.id} className="border-t">
              <td>{d.name}</td>
              <td className="text-red-500 font-semibold">{d.value}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
