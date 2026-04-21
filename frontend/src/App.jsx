import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";

import ExecutiveSummaryPage from "./pages/ExecutiveSummaryPage";
import SlideBriefPage from "./pages/SlideBriefPage";
import DetailedFindingsPage from "./pages/DetailedFindingsPage";
import KpiAppendixPage from "./pages/KpiAppendixPage";
import UploadReportPage from "./pages/UploadReportPage";
import WidgetEditorPage from "./pages/WidgetEditorPage";

function App() {
  // ✅ GLOBAL STATE (critical)
  const [data, setData] = useState([]);

  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>

        {/* Redirect */}
        <Route index element={<Navigate to="/upload" />} />

        {/* Upload FIRST (important UX) */}
        <Route path="upload" element={<UploadReportPage setData={setData} />} />

        {/* Dashboard Pages (receive data) */}
        <Route path="summary" element={<ExecutiveSummaryPage data={data} />} />
        <Route path="slides" element={<SlideBriefPage data={data} />} />
        <Route path="findings" element={<DetailedFindingsPage data={data} />} />
        <Route path="appendix" element={<KpiAppendixPage data={data} />} />

        {/* Editor (optional data) */}
        <Route path="editor" element={<WidgetEditorPage data={data} />} />

      </Route>
    </Routes>
  );
}

export default App;