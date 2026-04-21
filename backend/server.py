from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import pdfplumber
import json
import tempfile
import os
import requests

app = FastAPI()

# ---------------------------
# CONFIG
# ---------------------------
USE_AI = True  # 🔥 Toggle AI ON/OFF

# ---------------------------
# GLOBAL STORE (for dashboard)
# ---------------------------
GLOBAL_REPORT_DATA = {
    "data": [],
    "report": "",
    "mode": ""
}

# ---------------------------
# CORS (DEV MODE)
# ---------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------
# HEALTH CHECK
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
                text = page.extract_text() or ""
                lines = text.split("\n")

                for line in lines:
                    if "AUD-" in line:
                        parts = line.split()

                        try:
                            audit_id = next(p for p in parts if p.startswith("AUD-"))
                            status = parts[-2]
                            value = int(parts[-1].replace("%", ""))

                            name_parts = [p for p in parts if p != audit_id][:-2]
                            name = " ".join(name_parts)

                            data.append({
                                "id": audit_id,
                                "name": name,
                                "status": status,
                                "value": value
                            })
                        except:
                            continue

    except Exception as e:
        print("PDF parsing error:", e)

    return data

# ---------------------------
# AI GENERATION
# ---------------------------
def generate_ai_report(data):
    try:
        prompt = f"""
You are a senior Agile Transformation Consultant.

Analyze the following Jira Compliance Audit data and generate a leadership report.

DATA:
{json.dumps(data, indent=2)}

OUTPUT FORMAT:
1. Executive Summary
2. Key Risk Areas
3. Operational Insights
4. Impact on Delivery
5. Recommendations
6. Maturity Score
"""

        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "llama3",
                "prompt": prompt,
                "stream": False
            },
            timeout=60
        )

        result = response.json()
        return result.get("response", "No AI response")

    except Exception as e:
        print("AI error:", e)
        return "AI generation failed (Ollama API issue)"

# ---------------------------
# FALLBACK REPORT
# ---------------------------
def generate_fallback_report(data):
    if not data:
        return "No data available to generate report"

    red = [d for d in data if d["status"] == "RED"]
    amber = [d for d in data if d["status"] == "AMBER"]
    green = [d for d in data if d["status"] == "GREEN"]

    score = (len(green) + 0.5 * len(amber)) / len(data)

    return f"""
EXECUTIVE SUMMARY
Compliance Score: {round(score * 100)}%

KEY RISKS
- {len(red)} RED issues
- Major breakdown in SLA and parent linkage

TOP ISSUES
{chr(10).join([f"- {r['name']} ({r['value']}%)" for r in red[:5]])}

INSIGHTS
- Weak governance controls
- High SLA breach rate
- Missing RCA practices

RECOMMENDATIONS
1. Enforce parent linkage
2. Mandate root cause field
3. Introduce SLA dashboards

MATURITY
Level 2 (Emerging)
"""

# ---------------------------
# ✅ REPORT UPLOAD (WITH SKIP AI)
# ---------------------------
@app.post("/report/upload")
async def upload_report(
    file: UploadFile = File(...),
    skip_ai: bool = Form(False)
):
    try:
        if not file:
            return {"error": "No file uploaded"}

        if not file.filename.endswith(".pdf"):
            return {"error": "Only PDF files allowed"}

        with tempfile.NamedTemporaryFile(delete=False) as tmp:
            tmp.write(await file.read())
            tmp_path = tmp.name

        parsed_data = parse_pdf(tmp_path)

        print("Parsed Data:", parsed_data)
        print("Skip AI:", skip_ai)

        if not parsed_data:
            print("⚠️ No data extracted from PDF")

        # ✅ Skip AI / AI Logic
        if skip_ai:
            report = generate_fallback_report(parsed_data)
            mode = "FALLBACK"
        else:
            if USE_AI:
                report = generate_ai_report(parsed_data)
                mode = "AI"
            else:
                report = generate_fallback_report(parsed_data)
                mode = "RULE_BASED"

        # ✅ STORE FOR DASHBOARD
        GLOBAL_REPORT_DATA["data"] = parsed_data
        GLOBAL_REPORT_DATA["report"] = report
        GLOBAL_REPORT_DATA["mode"] = mode

        os.remove(tmp_path)

        return {
            "data": parsed_data,
            "report": report,
            "mode": mode
        }

    except Exception as e:
        print("UPLOAD ERROR:", e)
        return {
            "error": str(e),
            "report": "Upload failed"
        }

# ---------------------------
# ORIGINAL UPLOAD (UNCHANGED)
# ---------------------------
@app.post("/upload")
@app.post("/upload/")
async def upload_pdf(file: UploadFile = File(...)):
    try:
        if not file:
            return {"error": "No file uploaded"}

        if not file.filename.endswith(".pdf"):
            return {"error": "Only PDF files allowed"}

        with tempfile.NamedTemporaryFile(delete=False) as tmp:
            tmp.write(await file.read())
            tmp_path = tmp.name

        parsed_data = parse_pdf(tmp_path)

        print("Parsed Data:", parsed_data)

        if USE_AI:
            report = generate_ai_report(parsed_data)
            mode = "AI"
        else:
            report = generate_fallback_report(parsed_data)
            mode = "RULE_BASED"

        os.remove(tmp_path)

        return {
            "data": parsed_data,
            "report": report,
            "mode": mode
        }

    except Exception as e:
        print("UPLOAD ERROR:", e)
        return {
            "error": str(e),
            "report": "Upload failed"
        }

# ---------------------------
# SUMMARY (DYNAMIC)
# ---------------------------
@app.get("/report/summary")
def get_summary():
    data = GLOBAL_REPORT_DATA.get("data", [])

    if not data:
        return {
            "summary": {
                "complianceScore": 0,
                "red": 0,
                "amber": 0,
                "green": 0,
                "insight": "No data uploaded"
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
            "insight": "Derived from uploaded report"
        }
    }

# ---------------------------
# KPI DATA
# ---------------------------
@app.get("/report/kpis")
def get_kpis():
    return {
        "kpis": GLOBAL_REPORT_DATA.get("data", [])
    }

# ---------------------------
# FULL REPORT
# ---------------------------
@app.get("/report")
def get_report():
    return {
        "report": GLOBAL_REPORT_DATA.get("report", "Upload a PDF to generate a report")
    }

# ---------------------------
# ACTIONS
# ---------------------------
@app.get("/report/actions")
def get_actions():
    return {
        "actions": [
            {"id": 1, "title": "Fix parent linkage", "status": "OPEN"},
            {"id": 2, "title": "Enforce SLA compliance", "status": "OPEN"},
            {"id": 3, "title": "Add root cause validation", "status": "IN_PROGRESS"}
        ]
    }

# ---------------------------
# UPDATE ACTION
# ---------------------------
@app.patch("/report/actions/{action_id}")
def update_action(action_id: int, payload: dict):
    return {
        "id": action_id,
        "status": payload.get("status", "UNKNOWN"),
        "message": "Updated successfully"
    }

# ---------------------------
# WIDGET CONFIG
# ---------------------------
@app.get("/report/widgets")
def get_widgets():
    return {
        "widgets": [
            {"id": "summary", "visible": True},
            {"id": "actions", "visible": True},
            {"id": "kpi", "visible": True}
        ]
    }

@app.put("/report/widgets")
def update_widgets(payload: dict):
    return {
        "message": "Widgets updated",
        "widgets": payload.get("widgets", [])
    }

# ---------------------------
# RISK COMPUTE
# ---------------------------
from risk_engine import compute_risk

@app.post("/upload")
async def upload(file: UploadFile = File(...)):
    ...
    data = extract_audit_data(file_path)

    summary = compute_summary(data)
    risk = compute_risk(data)

    return {
        "summary": summary,
        "kpis": data,
        "risk": risk
    }

@app.get("/config")
def get_config():
    return CONFIG

# ---------------------------
# CONFIG
# ---------------------------
@app.post("/config")
def update_config(new_config: dict):
    with open("governance_config.json", "w") as f:
        json.dump(new_config, f, indent=2)
    return {"status": "updated"}