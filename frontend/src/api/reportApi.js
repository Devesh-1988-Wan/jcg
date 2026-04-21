const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

// ==============================
// UPLOAD REPORT (WITH SKIP AI)
// ==============================
export const uploadReport = async (file, skipAI = false) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("skip_ai", skipAI);

    const url = `${BASE_URL}/report/upload`;

    console.log("🚀 Upload URL:", url);
    console.log("📄 File:", file);
    console.log("⚙️ Skip AI:", skipAI);

    const res = await fetch(url, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      throw new Error(`Upload failed with status ${res.status}`);
    }

    const data = await res.json();
    console.log("✅ Upload response:", data);

    return data;

  } catch (error) {
    console.error("❌ uploadReport error:", error);
    throw error;
  }
};

// ==============================
// FETCH SUMMARY
// ==============================
export const fetchReportSummary = async () => {
  const url = `${BASE_URL}/report/summary`;

  console.log("📊 Calling:", url);

  const res = await fetch(url);

  console.log(`📡 Response from ${url}:`, res.status);

  if (!res.ok) {
    throw new Error("Failed to fetch summary");
  }

  const data = await res.json();

  console.log("✅ Data from summary:", data);

  return data;
};

// ==============================
// FETCH FULL REPORT
// ==============================
export const fetchReport = async () => {
  const res = await fetch(`${BASE_URL}/report`);

  if (!res.ok) {
    throw new Error("Failed to fetch report");
  }

  return res.json();
};

// ==============================
// FETCH ACTIONS
// ==============================
export const fetchReportActions = async () => {
  const res = await fetch(`${BASE_URL}/report/actions`);

  if (!res.ok) {
    throw new Error("Failed to fetch actions");
  }

  return res.json();
};

// ==============================
// UPDATE ACTION
// ==============================
export const patchActionStatus = async (id, status) => {
  const res = await fetch(`${BASE_URL}/report/actions/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    throw new Error("Failed to update action");
  }

  return res.json();
};

// ==============================
// FETCH WIDGETS
// ==============================
export const fetchReportWidgets = async () => {
  const res = await fetch(`${BASE_URL}/report/widgets`);

  if (!res.ok) {
    throw new Error("Failed to fetch widgets");
  }

  return res.json();
};

// ==============================
// UPDATE WIDGETS
// ==============================
export const updateReportWidgets = async (widgets) => {
  const res = await fetch(`${BASE_URL}/report/widgets`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ widgets }),
  });

  if (!res.ok) {
    throw new Error("Failed to update widgets");
  }

  return res.json();
};

// ==============================
// FETCH CONFIG
// ==============================

export const fetchConfig = async () => {
  const res = await fetch("/config");
  return res.json();
};

export const updateConfig = async (config) => {
  const res = await fetch("/config", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(config)
  });
  return res.json();
};