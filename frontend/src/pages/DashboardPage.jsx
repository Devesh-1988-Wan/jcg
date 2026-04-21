import { useEffect, useState } from "react";

// ✅ FIXED IMPORT
import ExecutiveSummaryPage from "../components/ExecutiveSummaryPage";

export default function DashboardPage() {
  const [data, setData] = useState([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("governanceData");

      if (!stored) {
        console.warn("No governance data found");
        setData([]);
        return;
      }

      const parsed = JSON.parse(stored);

      if (!Array.isArray(parsed)) {
        console.error("Invalid data format:", parsed);
        setData([]);
        return;
      }

      setData(parsed);
    } catch (err) {
      console.error("❌ Failed to parse localStorage:", err);
      setData([]);
    }
  }, []);

  return (
    <div className="p-6">
      <ExecutiveSummaryPage data={data} />
    </div>
  );
}