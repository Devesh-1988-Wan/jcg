import { useEffect, useState, useMemo } from "react";
import { fetchReportKpis } from "../api/reportApi";
import { normalizeKpi } from "../utils/normalizeKpi";

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
      console.log("📊 RAW KPI Data:", res);

      const rawKpis = res?.kpis || res?.data || [];
      const normalized = rawKpis.map(normalizeKpi);

      console.log("✅ NORMALIZED KPIs:", normalized);

      setKpis(normalized);
    } catch (err) {
      console.error("❌ Failed to load KPIs:", err);
      setKpis([]);
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------
  // SORTING (MEMOIZED ✅)
  // ---------------------------
  const sortedKpis = useMemo(() => {
    return [...kpis].sort((a, b) => {
      const valA = Number(a.value);
      const valB = Number(b.value);
      return sortDesc ? valB - valA : valA - valB;
    });
  }, [kpis, sortDesc]);

  // ---------------------------
  // LOADING
  // ---------------------------
  if (loading) {
    return <div className="p-6 text-gray-500">Loading data...</div>;
  }

  // ---------------------------
  // EMPTY
  // ---------------------------
  if (!kpis.length) {
    return (
      <div className="p-6 text-gray-500">
        No detailed findings available.
      </div>
    );
  }

  // ---------------------------
  // STATUS COLOR
  // ---------------------------
  const getStatusColor = (status) => {
    if (status === "RED") return "bg-red-100 text-red-700";
    if (status === "AMBER") return "bg-yellow-100 text-yellow-700";
    if (status === "GREEN") return "bg-green-100 text-green-700";
    return "bg-gray-100 text-gray-600";
  };

  // ---------------------------
  // CATEGORY COLOR
  // ---------------------------
  const getCategoryColor = (category) => {
    if (category === "FLOW") return "text-blue-600";
    if (category === "QUALITY") return "text-purple-600";
    if (category === "DELIVERY") return "text-indigo-600";
    if (category === "PREDICTABILITY") return "text-orange-600";
    if (category === "DATA_INTEGRITY") return "text-red-600";
    return "text-gray-500";
  };

  // ---------------------------
  // RENDER
  // ---------------------------
  return (
    <div className="p-6 space-y-4">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Detailed Findings</h2>

        <button
          onClick={() => setSortDesc((prev) => !prev)}
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
              <th className="p-3 text-left">#</th>
              <th className="p-3 text-left">Checklist Item</th>
              <th className="p-3 text-left">Category</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">%</th>
            </tr>
          </thead>

          <tbody>
            {sortedKpis.map((item, index) => (
              <tr
                key={item.id || index}
                className={`border-t hover:bg-gray-50 ${
                  item.status === "RED" ? "bg-red-50" : ""
                }`}
              >
                <td className="p-3">{index + 1}</td>
                <td className="p-3">{item.name}</td>
                <td className={`p-3 font-medium ${getCategoryColor(item.category)}`}>
                  {item.category}
                </td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                      item.status
                    )}`}
                  >
                    {item.status}
                  </span>
                </td>
                <td className="p-3 font-semibold">{item.value}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
