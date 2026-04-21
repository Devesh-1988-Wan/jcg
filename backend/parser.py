from rule_engine import compute_rag, get_kpi_config

def extract_audit_data(file_path):
    ...
    for line in lines:
        match = regex...

        if match:
            value = int(match.group(4))

            config = get_kpi_config(match.group(1), match.group(2))

            computed_status = compute_rag(value, config)

            data.append({
                "id": match.group(1),
                "name": match.group(2),
                "value": value,
                "status": computed_status,
                "original_status": match.group(3),
                "category": config.get("category", "OTHER") if config else "OTHER",
                "weight": config.get("weight", 1) if config else 1
            })