import pandas as pd

from config.severity import SEVERITY_SCORE


SEVERITY_PRIORITY = {
    "No Issue": 0,
    "Low": 1,
    "Medium": 2,
    "High": 3,
    "Critical": 4
}

HEALTH_STATUS = {
    "Excellent": 90,
    "Good": 75,
    "Average": 60,
    "Poor": 40,
    "Critical": 0
}


def get_highest_severity(report):
    """
    Return the highest severity from a report. Safely handles empty reports.
    """
    if report is None or getattr(report, "empty", True) or "Severity" not in report.columns or len(report["Severity"]) == 0:
        return "No Issue"

    return max(
        report["Severity"],
        key=lambda severity: SEVERITY_PRIORITY.get(severity, 0)
    )





def calculate_health_score(missing_report,duplicate_report,datatype_report,outlier_report):
    score_breakdown = {}

    health_score = 100

    reports = {
        "Missing": missing_report,
        "Duplicate": duplicate_report,
        "Datatype": datatype_report,
        "Outlier": outlier_report
    }

    for report_name, report in reports.items():

        highest_severity = get_highest_severity(report)
 
        deduction = SEVERITY_SCORE.get(highest_severity, 0)

        score_breakdown[report_name] = deduction

        health_score -= deduction

    health_score = max(0, min(100, health_score))

    return {
        "Health Score": health_score,
        "Score Breakdown": score_breakdown
    }







def get_dataset_status(health_score):
    for status, minimum_score in sorted(HEALTH_STATUS.items(),
                                        key=lambda item: item[1],
                                        reverse=True):

        if health_score >= minimum_score:
            return status

    return "Unknown"






def get_highest_priority_issue(missing_report,duplicate_report,datatype_report,outlier_report):
   
    reports = {
        "Missing": missing_report,
        "Duplicate": duplicate_report,
        "Datatype": datatype_report,
        "Outlier": outlier_report
    }

    report_severity = {}

    for report_name, report in reports.items():

        highest_severity = get_highest_severity(report)

        report_severity[report_name] = highest_severity

    highest_priority = max(
        report_severity.values(),
        key=lambda severity: SEVERITY_PRIORITY.get(severity, 0)
    )

    priority_reports = []

    for report_name, severity in report_severity.items():

        if severity == highest_priority:
            priority_reports.append(report_name)

    return priority_reports