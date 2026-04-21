import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { uploadReport } from "../api/reportApi";

// ✅ PDF.js FIX
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export default function UploadReportPage({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [skipAI, setSkipAI] = useState(false);

  const navigate = useNavigate();

  // ✅ FILE VALIDATION
  const handleFileChange = (e) => {
    const selected = e.target.files[0];

    if (!selected) return;

    const allowedTypes = ["application/pdf", "application/json"];

    if (!allowedTypes.includes(selected.type)) {
      alert("Only PDF or JSON files are allowed");
      return;
    }

    setFile(selected);
  };

  // ✅ MAIN UPLOAD HANDLER
  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file");
      return;
    }

    try {
      setLoading(true);

      const response = await uploadReport(file, skipAI);

      console.log("UPLOAD SUCCESS:", response);

      // ✅ CRITICAL: Extract correct structure
      const reportData = response?.report?.details || [];
      const summary = response?.report?.summary || {};

      console.log("📊 Extracted Details:", reportData);
      console.log("📈 Summary:", summary);

      // ✅ STORE DATA (temporary state management)
      localStorage.setItem("governanceData", JSON.stringify(reportData));
      localStorage.setItem("governanceSummary", JSON.stringify(summary));

      // ✅ CALLBACK (if parent needs it)
      onUploadSuccess && onUploadSuccess({ reportData, summary });

      // ✅ NAVIGATE TO DASHBOARD
      navigate("/dashboard");

    } catch (err) {
      console.error("❌ Upload Error:", err);
      alert("Upload failed. Check backend logs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-4">

      {/* FILE INPUT */}
      <input type="file" onChange={handleFileChange} />

      {/* SKIP AI */}
      <label className="flex gap-2 items-center">
        <input
          type="checkbox"
          checked={skipAI}
          onChange={(e) => setSkipAI(e.target.checked)}
        />
        <span>Skip AI Processing</span>
      </label>

      {/* UPLOAD BUTTON */}
      <button
        onClick={handleUpload}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
      >
        {loading ? "Uploading..." : "Upload Report"}
      </button>

    </div>
  );
}