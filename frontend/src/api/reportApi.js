// ==============================
// BASE URL
// ==============================
const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000";

console.log("🌐 API BASE URL:", BASE_URL);

// ==============================
// FETCH WRAPPER
// ==============================
const fetchWrapper = async (url, options = {}, timeout = 30000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`API Error (${res.status}): ${text}`);
    }

    return await res.json();

  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("Request timeout");
    }
    console.error("❌ API Error:", error);
    throw error;
  } finally {
    clearTimeout(id);
  }
};

// ==============================
// UPLOAD REPORT
// ==============================
export const uploadReport = async (file, skipAI = false) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("skip_ai", skipAI ? "true" : "false");

  return fetchWrapper(`${BASE_URL}/report/upload`, {
    method: "POST",
    body: formData,
  }, 60000);
};

// ==============================
// 🔥 FETCH REPORT (FIXED)
// ==============================
export const fetchReport = async () => {
  const [summaryRes, kpiRes] = await Promise.all([
    fetchWrapper(`${BASE_URL}/report/summary`),
    fetchWrapper(`${BASE_URL}/report/kpis`)
  ]);

  return {
    summary: summaryRes || {},
    kpis: kpiRes?.kpis || []
  };
};

// ==============================
// BACKWARD COMPATIBILITY
// ==============================
export const fetchReportSummary = async () => {
  const res = await fetchReport();
  return res.summary;
};

export const fetchReportKpis = async () => {
  const res = await fetchReport();
  return { kpis: res.kpis };
};

// ==============================
// AI STATUS
// ==============================
export const fetchAIStatus = async () => {
  return fetchWrapper(`${BASE_URL}/report/ai-status`);
};

// ==============================
// ACTIONS
// ==============================
export const fetchReportActions = async () => {
  return fetchWrapper(`${BASE_URL}/report/actions`);
};

export const patchActionStatus = async (id, status) => {
  return fetchWrapper(`${BASE_URL}/report/actions/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
};

// ==============================
// WIDGETS
// ==============================
export const fetchReportWidgets = async () => {
  return fetchWrapper(`${BASE_URL}/report/widgets`);
};

export const updateReportWidgets = async (widgets) => {
  return fetchWrapper(`${BASE_URL}/report/widgets`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ widgets }),
  });
};

// ==============================
// CONFIG
// ==============================
export const fetchConfig = async () => {
  return fetchWrapper(`${BASE_URL}/config`);
};

export const updateConfig = async (config) => {
  return fetchWrapper(`${BASE_URL}/config`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(config),
  });
};

