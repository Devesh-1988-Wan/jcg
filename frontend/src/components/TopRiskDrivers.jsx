export default function TopRiskDrivers({ risks = [] }) {
  if (!risks.length) {
    return (
      <div className="p-4 text-gray-500">
        No high-risk drivers identified.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <h2 className="text-lg font-semibold mb-3">
        Top Risk Drivers
      </h2>

      {/* HEADER */}
      <div className="flex justify-between text-sm font-semibold text-gray-500 border-b pb-2">
        <span>Issue</span>
        <span>Severity</span>
      </div>

      {/* LIST */}
      {risks.map((risk, index) => (
        <div
          key={index}
          className="flex justify-between py-2 border-b last:border-none"
        >
          <span className="text-gray-800">
            {risk.checklistItem}
          </span>

          <span className="font-semibold text-red-500">
            {risk.severity}%
          </span>
        </div>
      ))}
    </div>
  );
}

