import { useMemo, useState } from "react";

export default function DetailedFindings({ data = [], loading = false }) {
  const [sortDesc, setSortDesc] = useState(true);

  const sortedKpis = useMemo(() => {
    return [...data].sort((a, b) => {
      const valA = Number(a?.value ?? 0);
      const valB = Number(b?.value ?? 0);
      return sortDesc ? valB - valA : valA - valB;
    });
  }, [data, sortDesc]);

  if (loading) {
    return <div className="p-6 text-gray-500">Loading...</div>;
  }

  if (!data.length) {
    return <div className="p-6 text-gray-500">No data available</div>;
  }

  const getStatusColor = (status) => {
    if (status === "RED") return "bg-red-100 text-red-700";
    if (status === "AMBER") return "bg-yellow-100 text-yellow-700";
    if (status === "GREEN") return "bg-green-100 text-green-700";
    return "bg-gray-100 text-gray-600";
  };

  return (
    <div className="p-4 border bg-white">
      <div className="flex justify-between mb-3">
        <h2 className="font-semibold">Detailed Findings</h2>

        <button
          onClick={() => setSortDesc((p) => !p)}
          className="text-sm border px-2 py-1 rounded"
        >
          Sort ({sortDesc ? "High → Low" : "Low → High"})
        </button>
      </div>

      <table className="w-full text-sm border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2">#</th>
            <th className="p-2">Item</th>
            <th className="p-2">Category</th>
            <th className="p-2">Status</th>
            <th className="p-2">%</th>
          </tr>
        </thead>

        <tbody>
          {sortedKpis.map((k, i) => (
            <tr key={i} className="border-t">
              <td className="p-2">{i + 1}</td>
              <td className="p-2">{k?.name || "-"}</td>
              <td className="p-2">{k?.category || "-"}</td>
              <td className="p-2">
                <span className={`px-2 py-1 rounded ${getStatusColor(k?.status)}`}>
                  {k?.status || "-"}
                </span>
              </td>
              <td className="p-2 font-semibold">{k?.value ?? 0}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}