const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000";

console.log("🌐 API BASE URL:", BASE_URL);

// ==============================
// 🔥 GENERIC FETCH WRAPPER (KEY FIX)
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

    const data = await res.json();
    return data;

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

  const url = `${BASE_URL}/report/upload`;

  console.log("🚀 Upload URL:", url);

  return fetchWrapper(url, {
    method: "POST",
    body: formData,
  }, 60000); // longer timeout for upload
};

// ==============================
// FETCH SUMMARY
// ==============================
export const fetchReportSummary = async () => {
  return fetchWrapper(`${BASE_URL}/report/summary`);
};

// ==============================
// FETCH KPIs
// ==============================
export const fetchReportKpis = async () => {
  return fetchWrapper(`${BASE_URL}/report/kpis`);
};

// ==============================
// FETCH FULL REPORT
// ==============================
export const fetchReport = async () => {
  return fetchWrapper(`${BASE_URL}/report`);
};

// ==============================
// 🔥 AI STATUS (NEW - REQUIRED)
// ==============================
export const fetchAIStatus = async () => {
  return fetchWrapper(`${BASE_URL}/report/ai-status`);
};

// ==============================
// FETCH ACTIONS
// ==============================
export const fetchReportActions = async () => {
  return fetchWrapper(`${BASE_URL}/report/actions`);
};

// ==============================
// UPDATE ACTION
// ==============================
export const patchActionStatus = async (id, status) => {
  return fetchWrapper(`${BASE_URL}/report/actions/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
};

// ==============================
// FETCH WIDGETS
// ==============================
export const fetchReportWidgets = async () => {
  return fetchWrapper(`${BASE_URL}/report/widgets`);
};

// ==============================
// UPDATE WIDGETS
// ==============================
export const updateReportWidgets = async (widgets) => {
  return fetchWrapper(`${BASE_URL}/report/widgets`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ widgets }),
  });
};

// ==============================
// FETCH CONFIG
// ==============================
export const fetchConfig = async () => {
  return fetchWrapper(`${BASE_URL}/config`);
};

// ==============================
// UPDATE CONFIG
// ==============================
export const updateConfig = async (config) => {
  return fetchWrapper(`${BASE_URL}/config`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(config),
  });
};
