import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "./components/layout/MainLayout";
import UploadReportPage from "./pages/UploadReportPage";
import DashboardPage from "./pages/DashboardPage";
import ExecutiveSummaryPage from "./components/ExecutiveSummaryPage";
import SlideBriefPage from "./pages/SlideBriefPage";
import DetailedFindingsPage from "./pages/DetailedFindingsPage";
import KpiAppendixPage from "./pages/KpiAppendixPage";
import WidgetEditorPage from "./pages/WidgetEditorPage";

export default function App() {
  const [data, setData] = useState([]);

  return (
    <Routes>
      {/* Upload */}
      <Route
        path="/"
        element={
          <UploadReportPage
            onUploadSuccess={({ reportData }) => setData(reportData)}
          />
        }
      />

      {/* Dashboard */}
      <Route path="/dashboard" element={<DashboardPage data={data} />} />

      {/* Layout Routes */}
      <Route path="/" element={<MainLayout />}>
        <Route path="summary" element={<ExecutiveSummaryPage data={data} />} />
        <Route path="slides" element={<SlideBriefPage data={data} />} />
        <Route path="findings" element={<DetailedFindingsPage data={data} />} />
        <Route path="appendix" element={<KpiAppendixPage data={data} />} />
        <Route path="editor" element={<WidgetEditorPage data={data} />} />
      </Route>
    </Routes>
  );
}