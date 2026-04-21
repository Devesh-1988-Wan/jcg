import { filterKpis } from "../utils/filterKpis";
import { buildAiPayload } from "../utils/buildAiPayload";

// 🔥 Simple in-memory cache (optional but powerful)
const aiCache = {};

export async function generateAIInsights(kpis = []) {
  try {
    if (!kpis.length) return null;

    // ---------------------------
    // FILTER (FAST MODE)
    // ---------------------------
    const filtered = filterKpis(kpis, "FAST");

    // ---------------------------
    // BUILD PAYLOAD
    // ---------------------------
    const payload = buildAiPayload(filtered);

    // ---------------------------
    // CACHE KEY
    // ---------------------------
    const cacheKey = JSON.stringify(payload);

    if (aiCache[cacheKey]) {
      return aiCache[cacheKey]; // ⚡ instant return
    }

    // ---------------------------
    // API CALL
    // ---------------------------
    const res = await fetch("http://127.0.0.1:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama3",
        prompt: `
Analyze Agile delivery risks.

Input:
${JSON.stringify(payload)}

Return:
- Top 3 risks
- Root causes
- Actions

Max 100 words.
`,
        stream: false
      })
    });

    if (!res.ok) {
      throw new Error(`AI API failed: ${res.status}`);
    }

    const data = await res.json();

    const result = data?.response || "AI analysis not available";

    // ---------------------------
    // STORE CACHE
    // ---------------------------
    aiCache[cacheKey] = result;

    return result;

  } catch (error) {
    console.error("❌ AI Service Error:", error);

    // ✅ Safe fallback
    return "AI insights unavailable. Please try again.";
  }
}

