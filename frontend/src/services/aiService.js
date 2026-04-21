import { filterKpis } from "../utils/filterKpis";
import { buildAiPayload } from "../utils/buildAiPayload";

export async function generateAIInsights(kpis) {
  const filtered = filterKpis(kpis);
  const payload = buildAiPayload(filtered);

  const res = await fetch("http://127.0.0.1:11434/api/generate", {
    method: "POST",
    body: JSON.stringify({
      model: "llama3",
      prompt: `
Analyze critical Agile delivery risks.

${JSON.stringify(payload)}

Return:
- Risks
- Causes
- Actions
(Max 100 words)
`,
      stream: false
    })
  });

  const data = await res.json();
  return data.response;
}