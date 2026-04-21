import requests

OLLAMA_URL = "http://localhost:11434/api/generate"

def generate_ai_report(kpis):
    try:
        prompt = build_prompt(kpis)

        response = requests.post(
            OLLAMA_URL,
            json={
                "model": "llama3",
                "prompt": prompt,
                "stream": False
            },
            timeout=60
        )

        data = response.json()
        return data.get("response", "No AI response")

    except Exception as e:
        print("❌ Ollama Error:", str(e))
        return None