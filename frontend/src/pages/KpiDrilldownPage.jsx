import React, { useEffect, useState } from "react";
import { fetchReport } from "../api/reportApi";

const KpiDrilldownPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [kpi, setKpi] = useState(null);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const report = await fetchReport();
        const cfg = await fetchConfig();

        const found = report.kpis.find((k) => k.id === id);

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

  // 🔍 Find KPI config
  const kpiRule =
    config?.kpi_rules?.find(
      (r) => r.id === kpi.id || kpi.name.toLowerCase().includes(r.name.toLowerCase())
    ) || null;

  // 🎯 Resolve thresholds
  const redThreshold =
    kpiRule?.thresholds?.red ?? config?.global_thresholds?.red;

  const amberThreshold =
    kpiRule?.thresholds?.amber ?? config?.global_thresholds?.amber;

  // 🔴 Risk badge
  const getRiskColor = (status) => {
    if (status === "RED") return "red";
    if (status === "AMBER") return "orange";
    return "green";
  };

  const isMismatch = kpi.original_status !== kpi.status;

  return (
    <div style={{ padding: "20px" }}>
      <button onClick={() => navigate(-1)}>⬅ Back</button>

      <h1 style={{ marginTop: "10px" }}>
        {kpi.id} - {kpi.name}
      </h1>

      {/* KPI VALUE */}
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

        <h4>
          Original Status:{" "}
          <span style={{ color: getRiskColor(kpi.original_status) }}>
            {kpi.original_status}
          </span>
        </h4>

        {isMismatch && (
          <div style={{ color: "red", marginTop: "10px" }}>
            ⚠️ RAG mismatch detected (PDF vs Governance Rule)
          </div>
        )}
      </div>

      {/* GOVERNANCE DETAILS */}
      <div style={{ marginTop: "30px" }}>
        <h3>Governance Configuration</h3>

        <p>
          <strong>Category:</strong> {kpi.category}
        </p>

        <p>
          <strong>Weight:</strong> {kpi.weight}
        </p>

        <p>
          <strong>Red Threshold:</strong> {redThreshold}%
        </p>

        <p>
          <strong>Amber Threshold:</strong> {amberThreshold}%
        </p>

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
            This KPI is in critical condition and requires immediate action.
          </p>
        )}

        {kpi.status === "AMBER" && (
          <p style={{ color: "orange" }}>
            This KPI indicates moderate risk and should be monitored closely.
          </p>
        )}

        {kpi.status === "GREEN" && (
          <p style={{ color: "green" }}>
            This KPI is within acceptable limits.
          </p>
        )}
      </div>

      {/* ACTION SUGGESTIONS */}
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
            <li>Improve sprint commitment discipline</li>
          </ul>
        )}
      </div>
    </div>
  );
};

export default KpiDrilldownPage;