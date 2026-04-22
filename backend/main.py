from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import os
from openai import OpenAI

# Load env
load_dotenv()

# Init app
app = FastAPI()

# Enable CORS (important for your React frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Request model
class KPIRequest(BaseModel):
    kpis: list

# Health check
@app.get("/")
def root():
    return {"status": "Backend running"}

# AI Endpoint
@app.post("/ai/insights")
def generate_insights(req: KPIRequest):
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "You are an Agile delivery governance expert."
                },
                {
                    "role": "user",
                    "content": f"""
Analyze Agile KPI risks.

Input:
{req.kpis}

Return:
- Top risks
- Root causes
- Actions

Max 120 words.
"""
                }
            ],
            temperature=0.3
        )

        return {
            "insight": response.choices[0].message.content
        }

    except Exception as e:
        return {"error": str(e)}