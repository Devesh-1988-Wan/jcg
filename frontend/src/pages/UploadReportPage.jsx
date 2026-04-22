import { useState, useEffect } from "react";
import { uploadReport } from "../api/reportApi";
import { normalizeKpi } from "../utils/normalizeKpi";
import { useNavigate } from "react-router-dom";

export default function UploadReportPage({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [skipAI, setSkipAI] = useState(false);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState("");

  const navigate = useNavigate();

  // ---------------------------
  // FILE SELECT
  // ---------------------------
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // ---------------------------
  // UPLOAD HANDLER (FIXED)
  // ---------------------------
  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file");
      return;
    }

    try {
      setLoading(true);

      const res = await uploadReport(file, skipAI);

      console.log("UPLOAD SUCCESS:", res);

      const raw = res?.data || res?.kpis || [];
      const normalized = raw.map(normalizeKpi);

      // ✅ update global state
      onUploadSuccess({
        reportData: normalized,
      });

      // optional AI report
      setReport(res.report);

      // navigate to dashboard
      navigate("/dashboard");

    } catch (error) {
      console.error("❌ Upload failed:", error);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------
  // AI POLLING (OPTIONAL)
  // ---------------------------
  useEffect(() => {
    if (report !== "Processing...") return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/report/ai-status");
        const data = await res.json();

        if (data.status === "completed") {
          setReport(data.report);
          clearInterval(interval);
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [report]);

  // ---------------------------
  // UI
  // ---------------------------
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Upload Governance Report</h1>

      <input type="file" onChange={handleFileChange} />

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={skipAI}
          onChange={(e) => setSkipAI(e.target.checked)}
        />
        <label>Skip AI Processing</label>
      </div>

      <button
        onClick={handleUpload}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        {loading ? "Uploading..." : "Upload Report"}
      </button>
    </div>
  );
}