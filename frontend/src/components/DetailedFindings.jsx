import { useMemo, useState } from "react";

export default function DetailedFindings({ data = [] }) {
  const [sortDesc, setSortDesc] = useState(true);

  const sorted = useMemo(() => {
    return [...data].sort((a, b) =>
      sortDesc ? b.value - a.value : a.value - b.value
    );
  }, [data, sortDesc]);

  if (!data.length) {
    return <div className="p-6 text-gray-500">No detailed findings available.</div>;
  }

  return (
    <div className="p-6">

      <div className="flex justify-between mb-3">
        <h2 className="font-semibold">Detailed Findings</h2>

        <button
          onClick={() => setSortDesc(p => !p)}
          className="border px-2 py-1 text-sm rounded"
        >
          Sort ({sortDesc ? "High → Low" : "Low → High"})
        </button>
      </div>

      <table className="w-full text-sm border">
        <thead className="bg-gray-100">
          <tr>
            <th>#</th>
            <th>Item</th>
            <th>Category</th>
            <th>Status</th>
            <th>%</th>
          </tr>
        </thead>

        <tbody>
          {sorted.map((k, i) => (
            <tr key={i} className="border-t">
              <td>{i + 1}</td>
              <td>{k.name}</td>
              <td>{k.category}</td>
              <td>{k.status}</td>
              <td>{k.value}%</td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
}