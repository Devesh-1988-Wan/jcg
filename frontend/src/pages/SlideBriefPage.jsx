import React, { useEffect, useState } from "react";

const SlideBriefPage = ({ data = [] }) => {
  const [slides, setSlides] = useState([]);

  // ---------------------------
  // TYPE DETECTION (PDF-BASED)
  // ---------------------------
  const detectType = (kpis) => {
    const text = kpis.map(k => k.name.toLowerCase()).join(" ");

    if (
      text.includes("aging") ||
      text.includes("wip") ||
      text.includes("cycle") ||
      text.includes("throughput")
    ) return "GOVERNANCE";

    if (
      text.includes("audit") ||
      text.includes("bugs") ||
      text.includes("resolution") ||
      text.includes("estimate")
    ) return "COMPLIANCE";

    return "GENERIC";
  };

  // ---------------------------
  // GENERATE SLIDES FROM PDF DATA
  // ---------------------------
  useEffect(() => {
    if (!data.length) return;

    const type = detectType(data);

    const red = data.filter(k => k.status === "RED");
    const amber = data.filter(k => k.status === "AMBER");
    const green = data.filter(k => k.status === "GREEN");

    const topRisks = red
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)
      .map(k => `${k.name} (${k.value}%)`)
      .join(", ");

    // ---------------------------
    // GOVERNANCE (Flow-based PDFs)
    // ---------------------------
    if (type === "GOVERNANCE") {
      setSlides([
        {
          title: "Delivery Health Summary",
          content: `Total KPIs: ${data.length}, Critical Risks: ${red.length}, Warnings: ${amber.length}, Healthy: ${green.length}`
        },
        {
          title: "Flow & Aging Risks",
          content: data
            .filter(k => k.name.toLowerCase().includes("aging") || k.name.toLowerCase().includes("wip"))
            .slice(0, 5)
            .map(k => `${k.name} (${k.value}%)`)
            .join(", ")
        },
        {
          title: "Throughput & Cycle Efficiency",
          content: data
            .filter(k => k.name.toLowerCase().includes("cycle") || k.name.toLowerCase().includes("throughput"))
            .map(k => `${k.name} (${k.value}%)`)
            .join(", ")
        },
        {
          title: "Top Risk Drivers",
          content: topRisks
        },
        {
          title: "Recommendations",
          content: "Reduce aging items, enforce WIP limits, and improve flow efficiency."
        }
      ]);
      return;
    }

    // ---------------------------
    // COMPLIANCE (Audit PDFs)
    // ---------------------------
    if (type === "COMPLIANCE") {
      setSlides([
        {
          title: "Compliance Overview",
          content: `Critical Violations: ${red.length}, Partial Compliance: ${amber.length}, Fully Compliant: ${green.length}`
        },
        {
          title: "Critical Compliance Gaps",
          content: topRisks
        },
        {
          title: "Data Integrity Issues",
          content: data
            .filter(k => k.name.toLowerCase().includes("missing"))
            .map(k => `${k.name} (${k.value}%)`)
            .join(", ")
        },
        {
          title: "SLA & Resolution Issues",
          content: data
            .filter(k => k.name.toLowerCase().includes("resolution"))
            .map(k => `${k.name} (${k.value}%)`)
            .join(", ")
        },
        {
          title: "Recommendations",
          content: "Fix missing fields, enforce estimation discipline, and improve SLA compliance."
        }
      ]);
      return;
    }

    // ---------------------------
    // GENERIC FALLBACK
    // ---------------------------
    setSlides([
      {
        title: "Overview",
        content: `Total KPIs: ${data.length}`
      },
      {
        title: "Top Risks",
        content: topRisks
      },
      {
        title: "Insights",
        content: "Multiple performance issues observed across KPIs."
      },
      {
        title: "Focus Areas",
        content: "Prioritize high-risk KPIs and improve process consistency."
      },
      {
        title: "Recommendations",
        content: "Address critical risks and improve monitoring."
      }
    ]);

  }, [data]);

  // ---------------------------
  // UI
  // ---------------------------
  if (!data.length) {
    return (
      <div className="p-6 text-gray-500">
        No data available. Please upload a report.
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-semibold">Slide Brief</h2>

      {slides.map((slide, index) => (
        <div key={index} className="p-4 border rounded-lg bg-gray-50">
          <h3 className="font-semibold">{slide.title}</h3>
          <p className="text-gray-600 mt-1">{slide.content}</p>
        </div>
      ))}
    </div>
  );
};

export default SlideBriefPage;