// -----------------------------
// SAFE KPI NORMALIZATION
// -----------------------------
const normalizeKpis = (input) => {
  if (Array.isArray(input)) return input;

  if (input?.kpis && Array.isArray(input.kpis)) return input.kpis;

  if (input?.data && Array.isArray(input.data)) return input.data;

  return [];
};

// -----------------------------
// FILTER VALID KPIs
// -----------------------------
const filterKpis = (kpis) => {
  return normalizeKpis(kpis)
    .filter(k => k && typeof k === "object")
    .filter(k => k.value !== null && k.value !== undefined);
};

// -----------------------------
// BUILD AI PAYLOAD (SAFE)
// -----------------------------
const buildAiPayload = (kpis) => {
  return (Array.isArray(kpis) ? kpis : []).map(k => ({
    metric: k?.name || "Unknown Metric",
    value: typeof k?.value === "number" ? k.value : Number(k?.value) || 0,
    status: k?.status || "UNKNOWN"
  }));
};

// -----------------------------
// GEMINI API CALL
// -----------------------------
const callGemini = async (prompt, API_KEY, model) => {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3 }
      })
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText);
  }

  const data = await res.json();

  return data?.candidates?.[0]?.content?.parts?.[0]?.text;
};

// -----------------------------
// RETRY + FALLBACK LOGIC
// -----------------------------
const sleep = (ms) => new Promise(res => setTimeout(res, ms));

const generateWithRetry = async (prompt, API_KEY) => {
  const models = [
    "gemini-2.5-flash", // primary
    "gemini-2.5-pro",   // fallback
    "gemini-2.0-flash"  // backup
  ];

  for (let i = 0; i < models.length; i++) {
    try {
      console.log(`🔄 Trying model: ${models[i]}`);

      const result = await callGemini(prompt, API_KEY, models[i]);

      if (result) return result;

    } catch (err) {
      console.warn(`⚠️ Model failed: ${models[i]}`, err.message);

      // wait before retrying next model
      await sleep(1000 * (i + 1));
    }
  }

  return null;
};

// -----------------------------
// MAIN AI FUNCTION
// -----------------------------
export async function generateAIInsights(kpis) {
  try {
    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

    if (!API_KEY) {
      console.error("❌ Gemini API key missing");
      return "Configuration error: API key missing";
    }

    console.log("RAW KPIS:", kpis);

    const filtered = filterKpis(kpis);
    const payload = buildAiPayload(filtered);

    console.log("AI PAYLOAD:", payload);

    if (!payload.length) {
      return "No valid KPI data available for AI analysis";
    }

    // -----------------------------
    // PROMPT
    // -----------------------------
    const prompt = `
You are an Agile delivery governance expert.

Analyze Agile KPI risks.

Input:
${JSON.stringify(payload, null, 2)}

Return:
- Top risks
- Root causes
- Actions

Max 120 words.
`;

    // -----------------------------
    // AI CALL WITH RETRY
    // -----------------------------
    const result = await generateWithRetry(prompt, API_KEY);

    if (!result) {
      console.warn("⚠️ AI unavailable, returning fallback insight");

      return `
Top Risks:
- Missing ownership and parent linkage

Root Causes:
- Weak backlog governance
- Incomplete planning discipline

Actions:
- Enforce mandatory ownership
- Validate parent-child hierarchy
- Add sprint readiness checks
`;
    }

    return result;

  } catch (err) {
    console.error("AI Error:", err);

    return `
Top Risks:
- KPI analysis unavailable

Root Causes:
- AI service failure

Actions:
- Retry later
- Validate KPI data integrity
`;
  }
}