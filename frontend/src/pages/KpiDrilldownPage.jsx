import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { fetchReport, fetchConfig } from "../api/reportApi";
import { normalizeKpi } from "../utils/normalizeKpi";
import { filterKpis } from "../utils/filterKpis";
import { scoreKpis } from "../utils/ragScoring";

const KpiDrilldownPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [kpi, setKpi] = useState(null);
  const [config, setConfig] = useState(null);
  const [scoredData, setScoredData] = useState(null);
  const [loading, setLoading] = useState(true);

  // ---------------------------
  // LOAD DATA
  // ---------------------------
  useEffect(() => {
    const loadData = async () => {
      try {
        const report = await fetchReport();
        const cfg = await fetchConfig();

        // ✅ Normalize (generic handling)
        const normalized = (report.kpis || []).map(normalizeKpi);

        // ✅ Filter + Score (aligned with your architecture)
        const filtered = filterKpis(normalized);
        const scored = scoreKpis(filtered);

        setScoredData(scored);

        // ✅ Fix ID mismatch (string vs number)
        const found = normalized.find(
          (k) => String(k.id) === String(id)
        );

        setKpi(found);
        setConfig(cfg);

      } catch (err) {
        console.error("Error loading KPI:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  if (loading) return <div>Loading KPI details...</div>;
  if (!kpi) return <div>KPI not found</div>;

  // ---------------------------
  // KPI CONFIG RESOLUTION
  // ---------------------------
  const kpiRule =
    config?.kpi_rules?.find(
      (r) =>
        String(r.id) === String(kpi.id) ||
        kpi.name.toLowerCase().includes(r.name?.toLowerCase() || "")
    ) || null;

  const redThreshold =
    kpiRule?.thresholds?.red ?? config?.global_thresholds?.red ?? 25;

  const amberThreshold =
    kpiRule?.thresholds?.amber ?? config?.global_thresholds?.amber ?? 5;

  // ---------------------------
  // UI HELPERS
  // ---------------------------
  const getRiskColor = (status) => {
    if (status === "RED") return "red";
    if (status === "AMBER") return "orange";
    return "green";
  };

  const isMismatch =
    kpi.original_status &&
    kpi.original_status !== kpi.status;

  // ---------------------------
  // UI
  // ---------------------------
  return (
    <div style={{ padding: "20px" }}>
      <button onClick={() => navigate(-1)}>⬅ Back</button>

      <h1 style={{ marginTop: "10px" }}>
        {kpi.id} - {kpi.name}
      </h1>

      {/* VALUE */}
      <div style={{ marginTop: "20px" }}>
        <h2>Value: {kpi.value}%</h2>
      </div>

      {/* STATUS */}
      <div style={{ marginTop: "20px" }}>
        <h3>
          Computed Status:{" "}
          <span style={{ color: getRiskColor(kpi.status) }}>
            {kpi.status}
          </span>
        </h3>

        {kpi.original_status && (
          <h4>
            Original Status:{" "}
            <span style={{ color: getRiskColor(kpi.original_status) }}>
              {kpi.original_status}
            </span>
          </h4>
        )}

        {isMismatch && (
          <div style={{ color: "red", marginTop: "10px" }}>
            ⚠️ RAG mismatch detected (PDF vs Governance Rule)
          </div>
        )}
      </div>

      {/* GOVERNANCE */}
      <div style={{ marginTop: "30px" }}>
        <h3>Governance Configuration</h3>

        <p><strong>Category:</strong> {kpi.category || "N/A"}</p>
        <p><strong>Weight:</strong> {kpi.weight || "Default"}</p>
        <p><strong>Red Threshold:</strong> {redThreshold}%</p>
        <p><strong>Amber Threshold:</strong> {amberThreshold}%</p>

        <p>
          <strong>Threshold Source:</strong>{" "}
          {kpiRule?.thresholds ? "KPI-specific" : "Global default"}
        </p>
      </div>

      {/* INTERPRETATION */}
      <div style={{ marginTop: "30px" }}>
        <h3>Interpretation</h3>

        {kpi.status === "RED" && (
          <p style={{ color: "red" }}>
            Critical condition. Immediate action required.
          </p>
        )}

        {kpi.status === "AMBER" && (
          <p style={{ color: "orange" }}>
            Moderate risk. Monitor closely.
          </p>
        )}

        {kpi.status === "GREEN" && (
          <p style={{ color: "green" }}>
            Within acceptable limits.
          </p>
        )}
      </div>

      {/* ACTIONS */}
      <div style={{ marginTop: "30px" }}>
        <h3>Recommended Actions</h3>

        {kpi.category === "DELIVERY" && (
          <ul>
            <li>Reduce WIP limits</li>
            <li>Improve flow efficiency</li>
          </ul>
        )}

        {kpi.category === "QUALITY" && (
          <ul>
            <li>Strengthen QA validation</li>
            <li>Reduce defect leakage</li>
          </ul>
        )}

        {kpi.category === "EXECUTION" && (
          <ul>
            <li>Improve estimation accuracy</li>
            <li>Align worklogs with planned effort</li>
          </ul>
        )}

        {kpi.category === "PREDICTABILITY" && (
          <ul>
            <li>Control scope creep</li>
            <li>Improve sprint discipline</li>
          </ul>
        )}
      </div>
    </div>
  );
};

export default KpiDrilldownPage;

