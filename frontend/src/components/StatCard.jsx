import React from "react";

export default function StatCard({ title, value, trend }) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow hover:shadow-lg transition">
      <p className="text-gray-500 text-sm">{title}</p>
      <div className="flex justify-between items-center mt-2">
        <h2 className="text-2xl font-bold">{value}</h2>
        {trend && <span className="text-xs text-gray-400">{trend}</span>}
      </div>
    </div>
  );
}