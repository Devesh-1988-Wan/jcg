import React, { useEffect, useState } from "react";
import { fetchReport } from "../api/reportApi";

const SlideBriefPage = () => {
  const [report, setReport] = useState("");
  const [slides, setSlides] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // ---------------------------
  // LOAD + POLL REPORT
  // ---------------------------
  useEffect(() => {
    let interval;

    const loadReport = async () => {
      try {
        const res = await fetchReport();

        // 🔥 Handle async AI case
        if (!res.report || res.report === "Processing...") {
          setLoading(true);
          return;
        }

        setReport(res.report);
        generateSlides(res.report);
        setLoading(false);

        // Stop polling once report is ready
        if (interval) clearInterval(interval);

      } catch (err) {
        console.error("Slide load error:", err);
        setError("Upload report first to generate slides.");
        setLoading(false);
      }
    };

    // Initial load
    loadReport();

    // 🔥 Poll every 4 sec until AI completes
    interval = setInterval(loadReport, 4000);

    return () => clearInterval(interval);
  }, []);

  // ---------------------------
  // BETTER SLIDE GENERATION
  // ---------------------------
  const generateSlides = (text) => {
    if (!text) return;

    // Split by sections instead of raw lines
    const sections = text
      .split(/\n{2,}/) // split by paragraphs
      .map((s) => s.trim())
      .filter(Boolean);

    const generatedSlides = sections.slice(0, 5).map((section, index) => {
      const lines = section.split("\n");

      return {
        title: lines[0]?.slice(0, 80) || `Slide ${index + 1}`,
        content: lines.slice(1).join(" ") || lines[0],
      };
    });

    setSlides(generatedSlides);
  };

  // ---------------------------
  // UI STATES
  // ---------------------------
  if (loading) {
    return (
      <div style={{ padding: "20px", color: "#666" }}>
        ⏳ Generating slides from AI report...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "20px", color: "red" }}>
        {error}
      </div>
    );
  }

  if (!slides.length) {
    return (
      <div style={{ padding: "20px", color: "#666" }}>
        No slides generated yet.
      </div>
    );
  }

  // ---------------------------
  // UI
  // ---------------------------
  return (
    <div style={{ padding: "20px" }}>
      <h2>Slide Brief</h2>

      {slides.map((slide, index) => (
        <div
          key={index}
          style={{
            marginTop: "15px",
            padding: "15px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            background: "#fafafa",
          }}
        >
          <h3>{slide.title}</h3>
          <p>{slide.content}</p>
        </div>
      ))}
    </div>
  );
};

export default SlideBriefPage;
