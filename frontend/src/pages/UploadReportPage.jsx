import React, { useState } from "react";
import * as pdfjsLib from "pdfjs-dist/build/pdf";
import pdfWorker from "pdfjs-dist/build/pdf.worker?url";

// ✅ REQUIRED for Vite
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const UploadReportPage = ({ setData }) => {
  const [file, setFile] = useState(null);
  const [report, setReport] = useState("");
  const [mode, setMode] = useState("");
  const [skipAI, setSkipAI] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ NEW: ROBUST PARSER
  const parseAuditData = (text) => {
    const lines = text.split("\n");

    const results = [];

    // Handles both with % and without %
    const regex = /(AUD-\d+)\s+(.*?)\s+(GREEN|AMBER|RED)\s+(\d+)?%?/;

    for (let line of lines) {
      const match = line.match(regex);

      if (match) {
        const [, id, name, status, value] = match;

        results.push({
          id: id.trim(),
          name: name.trim(),
          status: status.trim(),
          value: value ? parseInt(value) : 0,
        });
      }
    }

    return results;
  };

  const handleUpload = async () => {
    try {
      if (!file) {
        alert("Please select a file");
        return;
      }

      setLoading(true);

      console.log("📂 File selected:", file.name);
      console.log("⚙️ Skip AI:", skipAI);

      const reader = new FileReader();

      reader.onload = async () => {
        try {
          const typedArray = new Uint8Array(reader.result);

          const pdf = await pdfjsLib.getDocument(typedArray).promise;

          let fullText = "";

          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const strings = content.items.map((item) => item.str);
            fullText += strings.join(" ") + "\n";
          }

          console.log("📄 Extracted PDF text");

          // ✅ USE NEW PARSER
          const parsed = parseAuditData(fullText);

          console.log("✅ Parsed Data:", parsed);

          // ✅ VALIDATION
          if (!parsed.length) {
            alert("Invalid PDF format. Could not extract audit data.");
            setLoading(false);
            return;
          }

          // ✅ SORT BY RISK (HIGH VALUE FIRST)
          parsed.sort((a, b) => b.value - a.value);

          // ✅ SET GLOBAL DATA
          if (setData) setData(parsed);

          // ✅ OPTIONAL UI OUTPUT
          setReport(JSON.stringify(parsed, null, 2));
          setMode(skipAI ? "Manual Mode" : "Standard Mode");

          setLoading(false);
        } catch (err) {
          console.error("❌ PDF Parsing Error:", err);
          alert("Failed to process PDF");
          setLoading(false);
        }
      };

      reader.readAsArrayBuffer(file);
    } catch (err) {
      console.error("❌ Upload Error:", err);
      alert("Upload failed");
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Upload Jira Compliance PDF</h2>

      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => {
          const selected = e.target.files[0];
          console.log("📂 File selected:", selected);
          setFile(selected);
        }}
      />

      {/* Skip AI */}
      <label style={{ display: "block", marginTop: "10px" }}>
        <input
          type="checkbox"
          checked={skipAI}
          onChange={(e) => setSkipAI(e.target.checked)}
        />
        Skip AI Processing
      </label>

      <button
        type="button"
        onClick={handleUpload}
        style={{ marginTop: "10px" }}
      >
        {loading ? "Processing..." : "Generate Report"}
      </button>

      {/* Mode */}
      {mode && (
        <p style={{ marginTop: "10px", fontWeight: "bold" }}>
          Mode: {mode}
        </p>
      )}

      {/* Report Preview */}
      <pre style={{ marginTop: "20px", whiteSpace: "pre-wrap" }}>
        {report}
      </pre>
    </div>
  );
};

export default UploadReportPage;