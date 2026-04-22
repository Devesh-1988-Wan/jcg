import { useMemo, useState } from "react";

export default function DetailedFindings({ data = [], loading = false }) {
  const [sortDesc, setSortDesc] = useState(true);

  // ---------------------------
  // SAFE SORTING
  // ---------------------------
  const sortedKpis = useMemo(() => {
    return [...data].sort((a, b) => {
      const valA = Number(a?.value ?? 0);
      const valB = Number(b?.value ?? 0);
      return sortDesc ? valB - valA : valA - valB;
    });
  }, [data, sortDesc]);

  // ---------------------------
  // STATES
  // ---------------------------
  if (loading) {
    return <div className="p-6 text-gray-500">Loading data...</div>;
  }

  if (!data.length) {
    return (
      <div className="p-6 text-gray-500">
        No detailed findings available.
      </div>
    );
  }

  // ---------------------------
  // COLORS
  // ---------------------------
  const getStatusColor = (status) => {
    if (status === "RED") return "bg-red-100 text-red-700";
    if (status === "AMBER") return "bg-yellow-100 text-yellow-700";
    if (status === "GREEN") return "bg-green-100 text-green-700";
    return "bg-gray-100 text-gray-600";
  };

  const getCategoryColor = (category) => {
    const map = {
      FLOW: "text-blue-600",
      QUALITY: "text-purple-600",
      DELIVERY: "text-indigo-600",
      PREDICTABILITY: "text-orange-600",
      DATA_INTEGRITY: "text-red-600",
    };
    return map[category] || "text-gray-500";
  };

  // ---------------------------
  // RENDER
  // ---------------------------
  return (
    <div id="detailed-findings-table" className="p-6 space-y-4 bg-white">

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
                key={item?.id || index}
                className={`border-t hover:bg-gray-50 ${
                  item?.status === "RED" ? "bg-red-50" : ""
                }`}
              >
                <td className="p-3">{index + 1}</td>

                <td className="p-3">
                  {item?.name || "-"}
                </td>

                <td className={`p-3 font-medium ${getCategoryColor(item?.category)}`}>
                  {item?.category || "-"}
                </td>

                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                      item?.status
                    )}`}
                  >
                    {item?.status || "-"}
                  </span>
                </td>

                <td className="p-3 font-semibold">
                  {item?.value ?? 0}%
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>
    </div>
  );
}