import { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";

import MainLayout from "./components/layout/MainLayout";

import UploadReportPage from "./pages/UploadReportPage";
import DashboardPage from "./pages/DashboardPage";
import ExecutiveSummaryPage from "./components/ExecutiveSummaryPage";
import SlideBriefPage from "./pages/SlideBriefPage";
import DetailedFindingsPage from "./pages/DetailedFindingsPage";
import KpiAppendixPage from "./pages/KpiAppendixPage";
import WidgetEditorPage from "./pages/WidgetEditorPage";
import ReportPage from "./pages/ReportPage";

export default function App() {
  const [kpis, setKpis] = useState([]);

  return (
    <Routes>

      {/* REPORT PAGE (NO LAYOUT) */}
      <Route path="/report" element={<ReportPage />} />

      {/* MAIN APP */}
      <Route path="/" element={<MainLayout />}>

        {/* DEFAULT → UPLOAD */}
        <Route
          index
          element={
            <UploadWrapper setKpis={setKpis} />
          }
        />

        {/* EXPLICIT UPLOAD */}
        <Route
          path="upload"
          element={
            <UploadWrapper setKpis={setKpis} />
          }
        />

        {/* DASHBOARD */}
        <Route
          path="dashboard"
          element={<DashboardPage kpis={kpis} />}
        />

        {/* OTHER PAGES */}
        <Route path="summary" element={<ExecutiveSummaryPage data={kpis} />} />
        <Route path="slides" element={<SlideBriefPage data={kpis} />} />
        <Route path="findings" element={<DetailedFindingsPage data={kpis} />} />
        <Route path="appendix" element={<KpiAppendixPage data={kpis} />} />
        <Route path="editor" element={<WidgetEditorPage data={kpis} />} />

        {/* FALLBACK */}
        <Route path="*" element={<div className="p-6">Page Not Found</div>} />

      </Route>
    </Routes>
  );
}

/* ---------------------------
   UPLOAD WRAPPER (CRITICAL FIX)
---------------------------- */
function UploadWrapper({ setKpis }) {
  const navigate = useNavigate();

  return (
    <UploadReportPage
      onUploadSuccess={({ reportData }) => {
        setKpis(reportData);     // ✅ update global state

        console.log("✅ NEW DATA LOADED:", reportData);

        // 🔥 IMPORTANT: move to dashboard
        navigate("/dashboard");
      }}
    />
  );
}