# backend/routes/report.py

from datetime import datetime
import re

def extract_score(report_text: str):
    if not report_text:
        return 0
    match = re.search(r"Score:\s*(\d+)", report_text)
    return int(match.group(1)) if match else 0


@app.get("/report")
def get_report():
    raw = generate_report()  # your existing function

    kpis = raw.get("data", [])
    report_text = raw.get("report", "")
    mode = raw.get("mode", "UNKNOWN")

    return {
        "status": "success",
        "summary": {
            "text": report_text,
            "score": extract_score(report_text),
            "mode": mode
        },
        "kpis": kpis,
        "meta": {
            "total": len(kpis),
            "generatedAt": datetime.utcnow().isoformat()
        }
    }

