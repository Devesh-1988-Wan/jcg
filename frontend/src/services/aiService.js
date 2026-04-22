const filterKpis = (kpis) => {
  return kpis?.filter(k => k.value !== null && k.value !== undefined) || [];
};

const buildAiPayload = (kpis) => {
  return kpis.map(k => ({
    metric: k.name,
    value: k.value,
    status: k.status
  }));
};

export async function generateAIInsights(kpis) {
  try {
    const filtered = filterKpis(kpis);
    const payload = buildAiPayload(filtered);

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an Agile delivery governance expert."
          },
          {
            role: "user",
            content: `
Analyze Agile KPI risks.

Input:
${JSON.stringify(payload)}

Return:
- Top risks
- Root causes
- Actions

Max 120 words.
`
          }
        ],
        temperature: 0.3
      })
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(err);
    }

    const data = await res.json();

    return data?.choices?.[0]?.message?.content || "No AI response";
  } catch (err) {
    console.error("AI Error:", err);
    return "AI insights unavailable";
  }
}