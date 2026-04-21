import { Routes, Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";

import UploadReportPage from "../pages/upload/UploadReportPage";
import DashboardPage from "../pages/dashboard/DashboardPage";
import ExecutiveSummaryPage from "../pages/summary/ExecutiveSummaryPage";
import SlideBriefPage from "../pages/slides/SlideBriefPage";
import DetailedFindingsPage from "../pages/findings/DetailedFindingsPage";
import KpiAppendixPage from "../pages/appendix/KpiAppendixPage";
import WidgetEditorPage from "../pages/editor/WidgetEditorPage";

export default function AppRoutes({ data, setData }) {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>

        {/* Default Landing */}
        <Route
          index
          element={
            <UploadReportPage
              onUploadSuccess={({ reportData }) => setData(reportData)}
            />
          }
        />

        <Route path="dashboard" element={<DashboardPage data={data} />} />
        <Route path="summary" element={<ExecutiveSummaryPage data={data} />} />
        <Route path="slides" element={<SlideBriefPage data={data} />} />
        <Route path="findings" element={<DetailedFindingsPage data={data} />} />
        <Route path="appendix" element={<KpiAppendixPage data={data} />} />
        <Route path="editor" element={<WidgetEditorPage data={data} />} />

        {/* Future expansion */}
        {/* <Route path="governance" element={<GovernanceConfigPage />} /> */}
        {/* <Route path="risk" element={<RiskDashboardPage />} /> */}

      </Route>
    </Routes>
  );
}