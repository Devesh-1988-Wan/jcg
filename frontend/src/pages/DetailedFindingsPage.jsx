import { useMemo, useState } from "react";

export default function DetailedFindings({ data = [] }) {
  const [sortDesc, setSortDesc] = useState(true);

  // SORTING
  const sorted = useMemo(() => {
    return [...data].sort((a, b) =>
      sortDesc
        ? (b.value || 0) - (a.value || 0)
        : (a.value || 0) - (b.value || 0)
    );
  }, [data, sortDesc]);

  if (!data.length) {
    return (
      <div className="p-6 text-gray-500">
        No detailed findings available.
      </div>
    );
  }

  // STATUS COLORS
  const getStatusStyle = (status) => {
    switch (status) {
      case "RED":
        return "bg-red-100 text-red-700";
      case "AMBER":
        return "bg-yellow-100 text-yellow-700";
      case "GREEN":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  // CATEGORY COLORS
  const getCategoryStyle = (category) => {
    switch (category) {
      case "FLOW":
        return "text-blue-600";
      case "QUALITY":
        return "text-purple-600";
      case "DELIVERY":
        return "text-indigo-600";
      case "PREDICTABILITY":
        return "text-orange-600";
      case "PLANNING":
        return "text-pink-600";
      case "OTHER":
        return "text-gray-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div className="p-6 space-y-4 bg-white rounded-xl shadow-sm">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Detailed Findings</h2>

        <button
          onClick={() => setSortDesc((p) => !p)}
          className="px-3 py-1 border rounded text-sm hover:bg-gray-100"
        >
          Sort ({sortDesc ? "High → Low" : "Low → High"})
        </button>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full text-sm">

          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="p-3 text-left">#</th>
              <th className="p-3 text-left">Item</th>
              <th className="p-3 text-left">Category</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">%</th>
            </tr>
          </thead>

          <tbody>
            {sorted.map((k, i) => (
              <tr
                key={i}
                className={`border-t hover:bg-gray-50 ${
                  k.status === "RED" ? "bg-red-50" : ""
                }`}
              >
                <td className="p-3">{i + 1}</td>

                <td className="p-3">{k.name}</td>

                <td className={`p-3 font-medium ${getCategoryStyle(k.category)}`}>
                  {k.category}
                </td>

                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${getStatusStyle(
                      k.status
                    )}`}
                  >
                    {k.status}
                  </span>
                </td>

                <td className="p-3 font-semibold">{k.value}%</td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>
    </div>
  );
}