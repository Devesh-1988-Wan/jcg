import json

with open("governance_config.json") as f:
    CONFIG = json.load(f)


def get_kpi_config(kpi_id, name):
    for rule in CONFIG["kpi_rules"]:
        if rule["id"] == kpi_id or rule["name"].lower() in name.lower():
            return rule
    return None


def compute_rag(value, config=None):
    if config and "thresholds" in config:
        red = config["thresholds"]["red"]
        amber = config["thresholds"]["amber"]
    else:
        red = CONFIG["global_thresholds"]["red"]
        amber = CONFIG["global_thresholds"]["amber"]

    if value > red:
        return "RED"
    elif value > amber:
        return "AMBER"
    return "GREEN"