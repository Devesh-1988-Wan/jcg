
import React from "react";

export default function KPIAppendix({ data }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {data.filter(d => d.status === "RED").map(d => (
        <div key={d.id} className="bg-white p-4 rounded-2xl shadow">
          <h4 className="font-semibold">{d.name}</h4>
          <p className="text-red-500">Immediate Action Required</p>
        </div>
      ))}
    </div>
  );
}
