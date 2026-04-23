import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DeliveryHealthWidget from "../components/DeliveryHealthWidget";
import ExecutiveSummary from "../components/ExecutiveSummaryPage";
import ExportPdfModal from "../components/ExportPdfModal";
import EditableInsights from "../components/EditableInsights";
import RiskDrivers from "../components/RiskDrivers";

import { generateAIInsights } from "../services/aiService";
import { generatePresentation } from "../utils/pptGenerator";

import {
  calculateDeliveryHealth,
  getRiskLevel,
} from "../utils/deliveryHealth";

export default function DashboardPage({ kpis = [] }) {
  const navigate = useNavigate();

  const [aiInsights, setAiInsights] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [showExport, setShowExport] = useState(false);

  // ---------------------------
  // DELIVERY HEALTH
  // ---------------------------
  const health = useMemo(() => calculateDeliveryHealth(kpis), [kpis]);
  const risk = getRiskLevel(health.score);

  // ---------------------------
  // EMPTY STATE
  // ---------------------------
  if (!kpis.length) {
    return (
      <div className="p-6 text-gray-500">
        No data available. Please upload a report.
      </div>
    );
  }

  // ---------------------------
  // TOP RISKS (PDF-style)
  // ---------------------------
  const topRisks = useMemo(() => {
    return kpis
      .filter((k) => k.status === "RED")
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [kpis]);

  // ---------------------------
  // AI INSIGHTS (SAFE + LOADING)
  // ---------------------------
  useEffect(() => {
    const fetchAI = async () => {
      setLoadingAI(true);
      try {
        const res = await generateAIInsights({
          kpis,
          health,
          risk,
        });

        setAiInsights(res);
      } catch (err) {
        console.error("AI failed:", err);

        setAiInsights({
          summary:
            "System is showing high delivery risk driven by flow congestion and execution instability.",
          recommendations: [
            "Enforce WIP limits",
            "Reduce aging items",
            "Improve sprint planning discipline",
          ],
        });
      } finally {
        setLoadingAI(false);
      }
    };

    fetchAI();
  }, [kpis]);

  // ---------------------------
  // SUMMARY (SMART FALLBACK)
  // ---------------------------
  const summary =
    aiInsights?.summary ||
    `Delivery Health Score ${health.score} (${risk.label}). Flow and execution require attention.`;

  // ---------------------------
  // EXPORT PAYLOAD (IMPORTANT)
  // ---------------------------
  const exportPayload = {
    kpis,
    aiInsights,
    deliveryHealth: health,
    risk,
    topRisks,
    summary,
  };

  // ---------------------------
  // RENDER
  // ---------------------------
  return (
    <div className="p-6 space-y-6">

      {/* 🔥 DELIVERY HEALTH (PRIMARY SIGNAL) */}
      <DeliveryHealthWidget kpis={kpis} />

      {/* 🔥 EXECUTIVE INSIGHTS (EDITABLE) */}
      <EditableInsights aiInsights={aiInsights} />

      {/* 🔥 TOP RISK DRIVERS */}
      <RiskDrivers data={topRisks} />

      {/* 🔥 ACTION BUTTONS */}
      <div className="flex gap-3">

        <button
          onClick={() => setShowExport(true)}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Export PDF
        </button>

        <button
          onClick={() =>
            generatePresentation(summary, kpis, health, topRisks)
          }
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Generate PPT
        </button>
      </div>

      {/* 🔥 EXEC SUMMARY (VISUAL + AI) */}
      <ExecutiveSummary
        data={kpis}
        aiInsights={aiInsights}
        loading={loadingAI}
      />

      {/* 🔥 EXPORT MODAL */}
      {showExport && (
        <ExportPdfModal
          onClose={() => setShowExport(false)}
          onExport={(selected) => {
            setShowExport(false);

            navigate("/report", {
              state: {
                ...exportPayload,
                selectedPages: selected,
                autoExport: true,
              },
            });
          }}
        />
      )}
    </div>
  );
}