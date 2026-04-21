from fastapi import FastAPI, UploadFile, File, Form, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
import pdfplumber
import json
import tempfile
import os
import requests
import threading
import time

app = FastAPI()

USE_AI = True

GLOBAL_REPORT_DATA = {
    "data": [],
    "report": "No report yet",
    "mode": "",
    "status": "idle"   # 🔥 NEW
}

# ---------------------------
# CORS
# ---------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------
# HEALTH
# ---------------------------
@app.get("/")
def health():
    return {"status": "Backend running"}

# ---------------------------
# PDF PARSER
# ---------------------------
def parse_pdf(file_path):
    data = []

    try:
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if not text:
                    continue

                for line in text.split("\n"):
                    parts = line.split()
                    if len(parts) < 3:
                        continue

                    try:
                        value = None
                        for p in parts:
                            if "%" in p:
                                value = int(p.replace("%", ""))

                        if value is None:
                            continue

                        status = "GREEN"
                        if value > 25:
                            status = "RED"
                        elif value > 5:
                            status = "AMBER"

                        data.append({
                            "id": f"AUD-{len(data)+1}",
                            "name": " ".join(parts[:-1]),
                            "status": status,
                            "value": value
                        })

                    except:
                        continue

    except Exception as e:
        print("❌ PDF parsing error:", e)

    return data

# ---------------------------
# KPI COMPRESSION
# ---------------------------
def compress_kpis(data):
    reds = [d for d in data if d["status"] == "RED"]
    ambers = [d for d in data if d["status"] == "AMBER"]

    return {
        "red_count": len(reds),
        "amber_count": len(ambers),
        "top_issues": [r["name"] for r in reds[:5]]
    }

# ---------------------------
# AI REPORT
# ---------------------------
def generate_ai_report(data):
    try:
        compressed = compress_kpis(data)

        prompt = f"""
You are an Agile governance expert.

Analyze this KPI summary:
{json.dumps(compressed, indent=2)}

Provide:
- Executive Summary
- Key Risks
- Recommendations
"""

        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "mistral",
                "prompt": prompt,
                "stream": False,
                "options": {"num_predict": 200}
            },
            timeout=30
        )

        return response.json().get("response", "No AI response")

    except Exception as e:
        print("❌ AI error:", e)
        return "AI generation failed"

# ---------------------------
# BACKGROUND TASK
# ---------------------------
def generate_and_store_ai(data):
    GLOBAL_REPORT_DATA["status"] = "processing"

    report = generate_ai_report(data)

    GLOBAL_REPORT_DATA["report"] = report
    GLOBAL_REPORT_DATA["mode"] = "AI"
    GLOBAL_REPORT_DATA["status"] = "completed"

# ---------------------------
# FALLBACK
# ---------------------------
def generate_fallback_report(data):
    red = [d for d in data if d["status"] == "RED"]
    amber = [d for d in data if d["status"] == "AMBER"]
    green = [d for d in data if d["status"] == "GREEN"]

    score = (len(green) + 0.5 * len(amber)) / len(data)

    return f"""
EXECUTIVE SUMMARY
Score: {round(score * 100)}%

RED Issues: {len(red)}
"""

# ---------------------------
# UPLOAD API (ASYNC)
# ---------------------------
@app.post("/report/upload")
async def upload_report(
    file: UploadFile = File(...),
    skip_ai: bool = Form(False),
    background_tasks: BackgroundTasks = None
):
    try:
        with tempfile.NamedTemporaryFile(delete=False) as tmp:
            tmp.write(await file.read())
            tmp_path = tmp.name

        parsed_data = parse_pdf(tmp_path)

        if not parsed_data:
            parsed_data = [
                {"id": "AUD-1", "name": "SLA Breach", "status": "RED", "value": 32}
            ]

        GLOBAL_REPORT_DATA["data"] = parsed_data

        if skip_ai or not USE_AI:
            GLOBAL_REPORT_DATA["report"] = generate_fallback_report(parsed_data)
            GLOBAL_REPORT_DATA["mode"] = "FALLBACK"
            GLOBAL_REPORT_DATA["status"] = "completed"
        else:
            GLOBAL_REPORT_DATA["report"] = "Processing..."
            GLOBAL_REPORT_DATA["status"] = "processing"

            background_tasks.add_task(generate_and_store_ai, parsed_data)

        os.remove(tmp_path)

        return {
            "status": "success",
            "data": parsed_data,
            "report": GLOBAL_REPORT_DATA["report"],
            "mode": GLOBAL_REPORT_DATA["mode"]
        }

    except Exception as e:
        print("❌ Upload error:", e)
        return {"status": "error", "message": str(e)}
# ---------------------------
# Report Summary
# ---------------------------    

@app.get("/report/summary")
def get_summary():
    data = GLOBAL_REPORT_DATA["data"]

    if not data:
        return {
            "summary": {
                "complianceScore": 0,
                "red": 0,
                "amber": 0,
                "green": 0,
                "insight": "No report uploaded"
            }
        }

    red = [d for d in data if d["status"] == "RED"]
    amber = [d for d in data if d["status"] == "AMBER"]
    green = [d for d in data if d["status"] == "GREEN"]

    score = (len(green) + 0.5 * len(amber)) / len(data)

    return {
        "summary": {
            "complianceScore": round(score * 100),
            "red": len(red),
            "amber": len(amber),
            "green": len(green),
            "insight": "Derived from report"
        }
    }

# ---------------------------
# AI STATUS API
# ---------------------------
@app.get("/report/ai-status")
def ai_status():
    return {
        "status": GLOBAL_REPORT_DATA["status"],
        "report": GLOBAL_REPORT_DATA["report"]
    }

# ---------------------------
# KPI API
# ---------------------------
@app.get("/report/kpis")
def get_kpis():
    return {"kpis": GLOBAL_REPORT_DATA["data"]}