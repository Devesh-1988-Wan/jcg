import { useState } from "react";
import { uploadReport } from "../api/reportApi";
import { useNavigate } from "react-router-dom";

export default function UploadReportPage() {
  const [file, setFile] = useState(null);
  const [skipAI, setSkipAI] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // ---------------------------
  // FILE SELECT
  // ---------------------------
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // ---------------------------
  // ✅ FIXED: ASYNC FUNCTION
  // ---------------------------
  const handleUpload = async () => {
    try {
      if (!file) {
        alert("Please select a file");
        return;
      }

      setLoading(true);

      const response = await uploadReport(file, skipAI);

      console.log("UPLOAD SUCCESS:", response);

      // ✅ Optional: store locally (if needed)
      // localStorage.setItem("governanceData", JSON.stringify(response.data));

      // ✅ Navigate to dashboard after upload
      navigate("/dashboard");

    } catch (error) {
      console.error("❌ Upload failed:", error);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

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