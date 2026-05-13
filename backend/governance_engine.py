# backend/governance_engine.py

RAG_CONFIG = {
    "RED": lambda x: x >= 25,
    "AMBER": lambda x: 5 <= x < 25,
    "GREEN": lambda x: x < 5
}

KPI_RULES = {
    "AUD-01": {
        "name": "Bugs without owner",
        "risk": "Accountability gap",
        "category": "Data Quality"
    },
    "AUD-04": {
        "name": "Tasks missing parent link",
        "risk": "Traceability issue",
        "category": "Traceability"
    },
    "AUD-29": {
        "name": "Lead Time",
        "risk": "Delivery inefficiency",
        "category": "Flow Metrics"
    }
    # extend till AUD-42
}

def evaluate_rag(value):
    if value >= 25:
        return "RED"
    elif value >= 5:
        return "AMBER"
    return "GREEN"


def process_compliance_input(data):
    results = []
    summary = {"RED": 0, "AMBER": 0, "GREEN": 0}

    for item in data:
        audit_id = item.get("audit_id") or item.get("id")
        value = item.get("value")

        # defensive defaults
        if audit_id is None:
            audit_id = "UNKNOWN"

        if value is None:
            try:
                value = int(item.get("val", 0))
            except Exception:
                value = 0

        rule = KPI_RULES.get(audit_id, {})

        rag = evaluate_rag(value)

        summary[rag] = summary.get(rag, 0) + 1

        results.append({
            "id": audit_id,
            "name": rule.get("name"),
            "value": value,
            "rag": rag,
            "risk": rule.get("risk"),
            "category": rule.get("category")
        })

    return {
        "summary": summary,
        "details": results
    }