def generate_summary(report):
    red = report["summary"]["RED"]
    amber = report["summary"]["AMBER"]

    if red > 10:
        return "Severe governance risk. Immediate intervention required."
    elif red > 5:
        return "Moderate governance concerns."
    return "Governance is under control."