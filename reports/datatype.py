import pandas as pd

from services.datatype_service import (
    detect_column_type,
    calculate_type_confidence,
    calculate_invalid_values
)

from services.quality_service import (
    assign_severity,
    generate_business_impact,
    generate_recommendation
)


def calculate_datatype_summary(df):
    summary = []

    for column in df.columns:

        total_values = len(df[column].dropna())

        detected_type = str(df[column].dtype)

        expected_type = detect_column_type(df[column])

        confidence = calculate_type_confidence(df[column])

        invalid_values = calculate_invalid_values(df[column])

        invalid_percentage = (
            (invalid_values / total_values) * 100
            if total_values > 0
            else 0
        )

        severity = assign_severity(invalid_percentage)
        
        summary.append({
            "Column": column,
            "Detected Datatype": detected_type,
            "Expected Datatype": expected_type,
            "Confidence (%)": confidence,
            "Invalid Values": invalid_values,
            "Severity": severity
        })

    return pd.DataFrame(summary)



def generate_datatype_report(df):
    report = calculate_datatype_summary(df)

    report["Business Impact"] = report.apply(
        lambda row: generate_business_impact("datatype",row["Severity"]),
        axis=1
    )

    report["Recommendation"] = report.apply(
        lambda row: generate_recommendation("datatype",row["Severity"]),
        axis=1
    )

    return report