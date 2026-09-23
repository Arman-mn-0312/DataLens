import pandas as pd
from services.quality_service import (
     assign_severity,
        generate_business_impact,
        generate_recommendation
)


def calculate_duplicate_summary(df):
    total_records = len(df)
    duplicate_records = int(df.duplicated().sum()) if total_records else 0
    duplicate_percentage = (duplicate_records / total_records * 100) if total_records else 0.0

    return {
        "Total Records": total_records,
        "Duplicate Records": duplicate_records,
        "Duplicate Percentage": round(duplicate_percentage, 2)
    }


def get_duplicate_records(df):
    
    duplicate_records = df[df.duplicated(keep=False)]

    return duplicate_records


def generate_duplicate_report(df):
    # Find the duplicate subset once. Counting repeated rows within this subset
    # gives the same count as df.duplicated(), without scanning the full dataset
    # a second time when the dataset contains few or no duplicates.
    duplicate_records = get_duplicate_records(df)
    total_records = len(df)
    duplicate_count = int(duplicate_records.duplicated().sum())
    duplicate_percentage = (duplicate_count / total_records * 100) if total_records else 0.0
    summary = {
        "Total Records": total_records,
        "Duplicate Records": duplicate_count,
        "Duplicate Percentage": round(duplicate_percentage, 2),
    }

    # Assign severity
    severity = assign_severity(summary["Duplicate Percentage"])

    # Create summary report
    summary_report = pd.DataFrame({
        "Total Records": [summary["Total Records"]],
        "Duplicate Records": [summary["Duplicate Records"]],
        "Duplicate Percentage": [summary["Duplicate Percentage"]],
        "Severity": [severity],
        "Business Impact": [generate_business_impact("duplicate", severity)],
        "Recommendation": [generate_recommendation("duplicate", severity)]
    })

    return summary_report, duplicate_records
