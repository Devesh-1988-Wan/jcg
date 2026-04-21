def compute_risk(data):
    total_score = 0
    total_weight = 0
    category_scores = {}

    for item in data:
        score = {
            "GREEN": 0,
            "AMBER": 50,
            "RED": 100
        }[item["status"]]

        weighted = score * item["weight"]

        total_score += weighted
        total_weight += item["weight"]

        cat = item["category"]

        category_scores.setdefault(cat, []).append(weighted)

    overall = round(total_score / total_weight, 2)

    category_avg = {
        k: round(sum(v)/len(v), 2)
        for k, v in category_scores.items()
    }

    return {
        "overall": overall,
        "categories": category_avg
    }