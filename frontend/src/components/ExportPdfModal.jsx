import { useState } from "react";

export default function ExportPdfModal({ onExport, onClose }) {
  const [selected, setSelected] = useState({
    summary: true,
    charts: true,
    kpi: true,
    findings: true,
  });

  const toggle = (key) => {
    setSelected(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleExport = async () => {
    if (!Object.values(selected).some(Boolean)) {
      alert("Select at least one section");
      return;
    }

    await onExport(selected);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl w-96">
        <h2 className="text-lg font-semibold mb-4">Export Report</h2>

        {[
          ["summary", "Summary & Risk Overview"],
          ["charts", "Charts & Insights"],
          ["kpi", "KPI Table"],
          ["findings", "Detailed Findings"],
        ].map(([key, label]) => (
          <label key={key} className="block">
            <input
              type="checkbox"
              checked={selected[key]}
              onChange={() => toggle(key)}
            /> {label}
          </label>
        ))}

        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose}>Cancel</button>
          <button
            onClick={handleExport}
            className="bg-blue-600 text-white px-3 py-1 rounded"
          >
            Generate PDF
          </button>
        </div>
      </div>
    </div>
  );
}