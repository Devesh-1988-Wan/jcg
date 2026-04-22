import { useState } from "react";
import { Routes, Route } from "react-router-dom";

// Layout
import MainLayout from "./components/layout/MainLayout";

// Pages
import UploadReportPage from "./pages/UploadReportPage";
import DashboardPage from "./pages/DashboardPage";
import ExecutiveSummaryPage from "./components/ExecutiveSummaryPage";
import SlideBriefPage from "./pages/SlideBriefPage";
import DetailedFindingsPage from "./pages/DetailedFindingsPage";
import KpiAppendixPage from "./pages/KpiAppendixPage";
import WidgetEditorPage from "./pages/WidgetEditorPage";
import ReportPage from "./pages/ReportPage";

export default function App() {
  const [data, setData] = useState([]);

  return (
    <Routes>

      {/* -----------------------------
          REPORT PAGE (NO LAYOUT)
         ----------------------------- */}
      <Route path="/report" element={<ReportPage />} />

      {/* -----------------------------
          MAIN APP WITH LAYOUT
         ----------------------------- */}
      <Route path="/" element={<MainLayout />}>

        {/* Default = Upload */}
        <Route
          index
          element={
            <UploadReportPage
              onUploadSuccess={({ reportData }) => setData(reportData)}
            />
          }
        />

        {/* Upload */}
        <Route
          path="upload"
          element={
            <UploadReportPage
              onUploadSuccess={({ reportData }) => setData(reportData)}
            />
          }
        />

        {/* Dashboard */}
        <Route
          path="dashboard"
          element={<DashboardPage data={data} />}
        />

        {/* Other Pages */}
        <Route
          path="summary"
          element={<ExecutiveSummaryPage data={data} />}
        />

        <Route
          path="slides"
          element={<SlideBriefPage data={data} />}
        />

        <Route
          path="findings"
          element={<DetailedFindingsPage />}
        />

        <Route
          path="appendix"
          element={<KpiAppendixPage data={data} />}
        />

        <Route
          path="editor"
          element={<WidgetEditorPage data={data} />}
        />

        {/* Fallback */}
        <Route path="*" element={<div>Page Not Found</div>} />

      </Route>

    </Routes>
  );
}