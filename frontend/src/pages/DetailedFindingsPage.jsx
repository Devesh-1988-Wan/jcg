import React, { useState } from "react";

export default function DetailedFindingsPage({ data = [] }) {
  const [sortKey, setSortKey] = useState("value");

  const sorted = [...data].sort((a, b) => (b[sortKey] || 0) - (a[sortKey] || 0));

  return (
    <div className="space-y-4">

      {/* SORT BUTTON */}
      <div className="flex gap-3">
        <button
          onClick={() => setSortKey("value")}
          className="bg-white px-3 py-1 rounded shadow"
        >
          Sort by %
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2">ID</th>
              <th>Name</th>
              <th>Status</th>
              <th>%</th>
            </tr>
          </thead>

          <tbody>
            {sorted.map((d) => (
              <tr key={d.id} className="border-t hover:bg-gray-50">
                <td className="p-2">{d.id}</td>
                <td>{d.name}</td>
                <td
                  className={`font-bold ${
                    d.status === "RED"
                      ? "text-red-500"
                      : d.status === "AMBER"
                      ? "text-yellow-500"
                      : "text-green-500"
                  }`}
                >
                  {d.status}
                </td>
                <td>{d.value}%</td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>

    </div>
  );
}