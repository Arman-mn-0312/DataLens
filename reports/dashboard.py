import pandas as pd

from services.dashboard_service import (
    calculate_health_score,
    get_dataset_status,
    get_highest_priority_issue
)




def calculate_dashboard_summary(missing_report,duplicate_report,datatype_report,outlier_report):
    health_result = calculate_health_score(
        missing_report,
        duplicate_report,
        datatype_report,
        outlier_report
    )

    dataset_status = get_dataset_status(
        health_result["Health Score"]
    )

    highest_priority = get_highest_priority_issue(
        missing_report,
        duplicate_report,
        datatype_report,
        outlier_report
    )

    summary = pd.DataFrame({
        "Metric": [
            "Health Score",
            "Dataset Status",
            "Highest Priority Issue"
        ],
        "Value": [
            health_result["Health Score"],
            dataset_status,
            ", ".join(highest_priority)
        ]
    })

    return summary, health_result["Score Breakdown"]





def generate_dashboard_report(missing_report,duplicate_report,datatype_report,outlier_report):

    summary, score_breakdown = calculate_dashboard_summary(
        missing_report,
        duplicate_report,
        datatype_report,
        outlier_report
    )

    return {
        "dashboard_summary": summary,
        "score_breakdown": score_breakdown
    }