import pandas as pd
from services.quality_service import (
    assign_severity,
    generate_business_impact,
    generate_recommendation
)


def calculate_missing_percentage(df):
    missing_count = df.isnull().sum()

    missing_percentage = (missing_count / len(df)) * 100

    missing_report = pd.DataFrame({
        "Column": df.columns,
        "Missing Count": missing_count.values,                                  
        "Missing Percentage": missing_percentage.round(2).values                
    })

    return missing_report

def generate_missing_report(df):
    #  Calculate missing values
    missing_report = calculate_missing_percentage(df)

    #  Add Severity
    missing_report["Severity"] = (
        missing_report["Missing Percentage"].apply(assign_severity)
    )

    #  Add Business Impact
    missing_report["Business Impact"] = (
    missing_report["Severity"].apply(
        lambda severity: generate_business_impact("missing",severity)
    )
)

    #  Add Recommendation
    missing_report["Recommendation"] = (
    missing_report["Severity"].apply(
        lambda severity: generate_recommendation("missing",severity)
    )
)

    return missing_report