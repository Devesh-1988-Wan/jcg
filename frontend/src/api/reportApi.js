// ==============================
// BASE URL
// ==============================
const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000";

console.log("🌐 API BASE URL:", BASE_URL);

// ==============================
// FETCH WRAPPER (ENHANCED)
// ==============================
const fetchWrapper = async (url, options = {}, timeout = 30000, retries = 1) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    // 🔍 Handle non-JSON safely
    const contentType = res.headers.get("content-type") || "";

    let data;
    if (contentType.includes("application/json")) {
      data = await res.json();
    } else {
      const text = await res.text();
      data = { message: text };
    }

    if (!res.ok) {
      throw new Error(
        `API Error (${res.status}): ${data?.message || JSON.stringify(data)}`
      );
    }

    return data;

  } catch (error) {
    // 🔁 Retry logic (network flakiness)
    if (retries > 0) {
      console.warn("🔁 Retrying request:", url);
      return fetchWrapper(url, options, timeout, retries - 1);
    }

    if (error.name === "AbortError") {
      throw new Error("Request timeout");
    }

    // 🚨 Better debug info
    console.error("❌ API Error:", {
      url,
      method: options?.method || "GET",
      error: error.message,
    });

    throw new Error(
      error.message === "Failed to fetch"
        ? "Backend not reachable. Is server running?"
        : error.message
    );

  } finally {
    clearTimeout(id);
  }
};

// ==============================
// 🔍 HEALTH CHECK (NEW)
// ==============================
export const checkBackend = async () => {
  return fetchWrapper(`${BASE_URL}/`);
};

// ==============================
// UPLOAD REPORT
// ==============================
export const uploadReport = async (file, skipAI = false) => {
  if (!file) throw new Error("No file selected");

  const formData = new FormData();
  formData.append("file", file);
  formData.append("skip_ai", skipAI ? "true" : "false");

  return fetchWrapper(`${BASE_URL}/report/upload`, {
    method: "POST",
    body: formData,
  }, 60000);
};

// ==============================
// FETCH REPORT
// ==============================
export const fetchReport = async () => {
  try {
    const [summaryRes, kpiRes] = await Promise.all([
      fetchWrapper(`${BASE_URL}/report/summary`),
      fetchWrapper(`${BASE_URL}/report/kpis`)
    ]);

    return {
      summary: summaryRes || {},
      kpis: kpiRes?.kpis || []
    };
  } catch (err) {
    console.error("❌ fetchReport failed:", err);
    return { summary: {}, kpis: [] };
  }
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
  if (!id) throw new Error("Missing action ID");

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