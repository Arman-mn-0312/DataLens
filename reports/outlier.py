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


def safe_float(val, default=0.0):
    if val is None or pd.isna(val):
        return default
    try:
        f = float(val)
        return default if pd.isna(f) else round(f, 2)
    except (ValueError, TypeError):
        return default


def calculate_outlier_summary(df):
    summary = []

    if df is None or df.empty:
        return pd.DataFrame(columns=[
            "Column", "Outlier Count", "Outlier Percentage",
            "Lower Bound", "Upper Bound", "Severity"
        ])

    # Select only numeric columns
    numeric_columns = df.select_dtypes(include=["number"]).columns

    for column in numeric_columns:
        bounds = calculate_outlier_bounds(df[column])
        outliers = detect_outliers(df[column])
        outlier_count = len(outliers)
        outlier_percentage = calculate_outlier_percentage(df[column])
        severity = assign_severity(outlier_percentage)

        lower = bounds.get("Lower Bound")
        upper = bounds.get("Upper Bound")

        summary.append({
            "Column": str(column),
            "Outlier Count": outlier_count,
            "Outlier Percentage": safe_float(outlier_percentage),
            "Lower Bound": safe_float(lower),
            "Upper Bound": safe_float(upper),
            "Severity": str(severity)
        })

    return pd.DataFrame(summary)


def generate_outlier_report(df):
    report = calculate_outlier_summary(df)

    if report.empty:
        return pd.DataFrame(columns=[
            "Column", "Outlier Count", "Outlier Percentage",
            "Lower Bound", "Upper Bound", "Severity",
            "Business Impact", "Recommendation"
        ])

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