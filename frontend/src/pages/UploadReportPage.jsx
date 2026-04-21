import React, { useState } from "react";
import { uploadReport } from "../api/reportApi";

// ✅ PDF.js FIX
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export default function UploadReportPage({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [skipAI, setSkipAI] = useState(false);

  const handleUpload = async () => {
    if (!file) return alert("Please select file");

    try {
      setLoading(true);

      const response = await uploadReport(file, skipAI);

      console.log("UPLOAD SUCCESS:", response);

      onUploadSuccess && onUploadSuccess(response);

    } catch (err) {
      console.error("❌ Upload Error:", err);
      alert("Upload failed. Check backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />

      <label className="flex gap-2">
        <input
          type="checkbox"
          checked={skipAI}
          onChange={(e) => setSkipAI(e.target.checked)}
        />
        Skip AI Processing
      </label>

      <button
        onClick={handleUpload}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {loading ? "Uploading..." : "Upload Report"}
      </button>
    </div>
  );
}