import pandas as pd
from services.quality_service import (
     assign_severity,
        generate_business_impact,
        generate_recommendation
)


def calculate_duplicate_summary(df):
   
    total_records = len(df)

    duplicate_records = df.duplicated().sum()

    duplicate_percentage = (
        duplicate_records / total_records
    ) * 100

    return {
        "Total Records": total_records,
        "Duplicate Records": duplicate_records,
        "Duplicate Percentage": round(duplicate_percentage, 2)
    }


def get_duplicate_records(df):
    
    duplicate_records = df[df.duplicated(keep=False)]

    return duplicate_records


def generate_duplicate_report(df):

    # Calculate duplicate statistics
    summary = calculate_duplicate_summary(df)

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

    # Get duplicate rows
    duplicate_records = get_duplicate_records(df)

    return summary_report, duplicate_records