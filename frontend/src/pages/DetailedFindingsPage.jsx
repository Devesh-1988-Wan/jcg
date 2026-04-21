import { useEffect, useState } from "react";
import { fetchReportKpis } from "../api/reportApi";

export default function DetailedFindingsPage() {
  const [kpis, setKpis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortDesc, setSortDesc] = useState(true);

  useEffect(() => {
    loadKpis();
  }, []);

  const loadKpis = async () => {
    try {
      setLoading(true);

      const res = await fetchReportKpis();
      console.log("📊 Detailed KPI Data:", res);

      setKpis(res?.kpis || []);
    } catch (err) {
      console.error("❌ Failed to load KPIs:", err);
      setKpis([]);
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------
  // GOVERNANCE: RAG LOGIC
  // ---------------------------
  const getStatus = (value) => {
    const val = Number(value);

    if (isNaN(val)) return "UNKNOWN";
    if (val > 25) return "RED";
    if (val > 5) return "AMBER";
    return "GREEN";
  };

  // ---------------------------
  // CLEAN CHECKLIST TEXT
  // ---------------------------
  const extractChecklistName = (text) => {
    if (!text) return "Unknown Item";

    return text
      // Remove leading number + AUD pattern
      .replace(/^\d+\s+AUD-\d+\s+/i, "")
      // Remove trailing status
      .replace(/\s+(RED|AMBER|GREEN)$/i, "")
      // Remove "days"
      .replace(/\s*days?/i, "")
      // Normalize spacing (Aging >10 → Aging > 10)
      .replace(/>\s*/g, "> ")
      .trim();
  };

  // ---------------------------
  // SORTING
  // ---------------------------
  const sortedKpis = [...kpis].sort((a, b) => {
    const valA = Number(a.value);
    const valB = Number(b.value);

    return sortDesc ? valB - valA : valA - valB;
  });

  // ---------------------------
  // LOADING
  // ---------------------------
  if (loading) {
    return <div className="p-6 text-gray-500">Loading data...</div>;
  }

  // ---------------------------
  // EMPTY
  // ---------------------------
  if (!kpis || kpis.length === 0) {
    return (
      <div className="p-6 text-gray-500">
        No detailed findings available.
      </div>
    );
  }

  // ---------------------------
  // RENDER
  // ---------------------------
  return (
    <div className="p-6 space-y-4">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Detailed Findings</h2>

        <button
          onClick={() => setSortDesc(!sortDesc)}
          className="px-3 py-1 border rounded text-sm hover:bg-gray-100"
        >
          Sort by % ({sortDesc ? "High → Low" : "Low → High"})
        </button>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto border rounded-lg shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="p-3 text-left">Sr No</th>
              <th className="p-3 text-left">Checklist Item</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">%</th>
            </tr>
          </thead>

          <tbody>
            {sortedKpis.map((item, index) => {
              const value = Number(item.value);
              const status = getStatus(value);

              return (
                <tr
                  key={item.id || index}
                  className={`border-t hover:bg-gray-50 ${
                    status === "RED" ? "bg-red-50" : ""
                  }`}
                >
                  {/* SERIAL NUMBER */}
                  <td className="p-3">{index + 1}</td>

                  {/* CLEAN CHECKLIST ITEM */}
                  <td className="p-3">
                    {extractChecklistName(
                      item.checklistItem || item.name
                    )}
                  </td>

                  {/* STATUS */}
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        status === "RED"
                          ? "bg-red-100 text-red-700"
                          : status === "AMBER"
                          ? "bg-yellow-100 text-yellow-700"
                          : status === "GREEN"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {status}
                    </span>
                  </td>

                  {/* VALUE */}
                  <td className="p-3 font-semibold">
                    {isNaN(value) ? "-" : `${value}%`}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}