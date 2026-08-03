import pandas as pd

from services.outlier_service import (
    calculate_outlier_bounds,
    detect_outliers,
    calculate_outlier_percentage
)

from services.quality_service import (
    assign_severity,
    generate_business_impact,
    generate_recommendation
)


def calculate_outlier_summary(df):
    summary = []

    # Select only numeric columns
    numeric_columns = df.select_dtypes(include=["number"]).columns

    for column in numeric_columns:

        bounds = calculate_outlier_bounds(df[column])

        outliers = detect_outliers(df[column])

        outlier_count = len(outliers)

        outlier_percentage = calculate_outlier_percentage(df[column])

        severity = assign_severity(outlier_percentage)

        summary.append({

            "Column": column,

            "Outlier Count": outlier_count,

            "Outlier Percentage": outlier_percentage,

            "Lower Bound": round(bounds["Lower Bound"], 2),

            "Upper Bound": round(bounds["Upper Bound"], 2),

            "Severity": severity
        })

    return pd.DataFrame(summary)




def generate_outlier_report(df):
    report = calculate_outlier_summary(df)

    report["Business Impact"] = report.apply(
        lambda row: generate_business_impact(
            "outlier",
            row["Severity"]),
        axis=1
    )

    report["Recommendation"] = report.apply(
        lambda row: generate_recommendation(
            "outlier",
            row["Severity"]
        ),
        axis=1
    )

    return report