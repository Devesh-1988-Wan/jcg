import React, { useState } from "react";
import { uploadReport } from "../api/reportApi";

const UploadReportPage = () => {
  const [file, setFile] = useState(null);
  const [report, setReport] = useState("");
  const [mode, setMode] = useState(""); // ✅ NEW (non-breaking)
  const [skipAI, setSkipAI] = useState(false);

  const handleUpload = async () => {
    try {
      if (!file) {
        alert("Please select a file");
        return;
      }

      console.log("📄 Uploading file:", file);
      console.log("⚙️ Skip AI:", skipAI);

      const data = await uploadReport(file, skipAI);

      console.log("✅ Upload response:", data);

      // ✅ SAFE HANDLING (no breaking change)
      setReport(data?.report || "No report generated");
      setMode(data?.mode || "");

    } catch (err) {
      console.error("❌ Upload Error:", err);
      alert("Upload failed");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Upload Jira Compliance PDF</h2>

      <input
        type="file"
        onChange={(e) => {
          console.log("📂 File selected:", e.target.files[0]);
          setFile(e.target.files[0]);
        }}
      />

      {/* ✅ EXISTING — unchanged */}
      <label style={{ display: "block", marginTop: "10px" }}>
        <input
          type="checkbox"
          checked={skipAI}
          onChange={(e) => setSkipAI(e.target.checked)}
        />
        Skip AI Processing
      </label>

      <button type="button" onClick={handleUpload}>
        Generate Report
      </button>

      {/* ✅ NEW (SAFE ADDITION) */}
      {mode && (
        <p style={{ marginTop: "10px", fontWeight: "bold" }}>
          Mode: {mode}
        </p>
      )}

      <pre style={{ marginTop: "20px", whiteSpace: "pre-wrap" }}>
        {report}
      </pre>
    </div>
  );
};

export default UploadReportPage;