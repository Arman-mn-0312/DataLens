import os
import pandas as pd
# pyrefly: ignore [missing-import]
import numpy as np
# pyrefly: ignore [missing-import]
from flask import Blueprint, jsonify, request
# pyrefly: ignore [missing-import]
from werkzeug.utils import secure_filename

from config.upload_config import UPLOAD_FOLDER
from services.upload_service import save_uploaded_file
from services.dashboard_service import (
    get_highest_severity,
    calculate_health_score,
    get_dataset_status
)
from services.quality_service import (
    generate_business_impact,
    generate_recommendation
)
from reports.overview import generate_overview_report
from reports.missing import generate_missing_report
from reports.duplicate import generate_duplicate_report
from reports.datatype import generate_datatype_report
from reports.outlier import generate_outlier_report
from reports.dashboard import generate_dashboard_report

api = Blueprint("api", __name__)


def get_dataset_df(filename):
    if not filename:
        return None, "Filename parameter is required."
    
    filepath = os.path.join(UPLOAD_FOLDER, secure_filename(filename))
    if not os.path.exists(filepath):
        return None, f"File '{filename}' not found."
    
    try:
        df = pd.read_csv(filepath)
        return df, None
    except Exception as e:
        return None, f"Failed to parse CSV file: {str(e)}"


def sanitize_val(val):
    if pd.isna(val):
        return None
    if isinstance(val, (np.integer, int)):
        return int(val)
    if isinstance(val, (np.floating, float)):
        return round(float(val), 4)
    return str(val)


@api.route("/")
def home():

    return jsonify({
        "project": "DataLens",
        "version": "1.0",
        "status": "Running",
        "backend": "Flask",
        "frontend": "React"
    })


@api.route("/health")
def health():

    return jsonify({
        "status": "Healthy",
        "message": "Backend is working correctly."
    })



# ==========================
# File Upload 
# ==========================

@api.route("/upload", methods=["POST"])
def upload_dataset():

    if "file" not in request.files:
        return jsonify({
            "success": False,
            "message": "No file uploaded."
        }), 400

    file = request.files["file"]

    filepath = save_uploaded_file(file)

    if filepath is None:
        return jsonify({
            "success": False,
            "message": "Only CSV files are allowed."
        }), 400

    return jsonify({
        "success": True,
        "message": "Dataset uploaded successfully.",
        "filename": file.filename
    }), 200


# ==========================
# Lazy Loading Report APIs
# ==========================

@api.route("/reports/overview", methods=["GET"])
def get_overview_report():
    filename = request.args.get("filename")
    df, err = get_dataset_df(filename)
    if err:
        return jsonify({"success": False, "message": err}), 400

    overview_df = generate_overview_report(df)
    missing_df = generate_missing_report(df)
    dup_df, _ = generate_duplicate_report(df)
    dtype_df = generate_datatype_report(df)
    outlier_df = generate_outlier_report(df)

    health_res = calculate_health_score(missing_df, dup_df, dtype_df, outlier_df)
    health_score = health_res["Health Score"]
    health_rating = get_dataset_status(health_score)

    metrics = dict(zip(overview_df["Metric"], overview_df["Value"]))

    response_payload = {
        "dataset_name": filename,
        "total_rows": int(metrics.get("Rows", len(df))),
        "total_columns": int(metrics.get("Columns", len(df.columns))),
        "memory_usage_mb": float(metrics.get("Memory Usage (MB)", 0)),
        "numeric_columns": int(metrics.get("Numeric Columns", 0)),
        "categorical_columns": int(metrics.get("Categorical Columns", 0)),
        "total_missing_values": int(metrics.get("Missing Values", 0)),
        "total_duplicate_records": int(metrics.get("Duplicate Rows", 0)),
        "health_score": health_score,
        "health_rating": health_rating,
        "analyzed_at": "Just now"
    }

    return jsonify(response_payload), 200


@api.route("/reports/missing", methods=["GET"])
def get_missing_report_api():
    filename = request.args.get("filename")
    df, err = get_dataset_df(filename)
    if err:
        return jsonify({"success": False, "message": err}), 400

    missing_df = generate_missing_report(df)

    total_missing = int(missing_df["Missing Count"].sum()) if not missing_df.empty else 0
    pct_missing_rows = round((df.isnull().any(axis=1).sum() / len(df)) * 100, 2) if len(df) > 0 else 0.0

    overall_severity = get_highest_severity(missing_df) if not missing_df.empty else "No Issue"
    business_impact = generate_business_impact("missing", overall_severity)
    recommendation = generate_recommendation("missing", overall_severity)

    columns = []
    for _, row in missing_df.iterrows():
        col_name = str(row["Column"])
        columns.append({
            "column_name": col_name,
            "missing_count": int(row["Missing Count"]),
            "missing_pct": float(row["Missing Percentage"]),
            "datatype": str(df[col_name].dtype) if col_name in df.columns else "unknown",
            "severity": str(row["Severity"])
        })

    response_payload = {
        "total_missing_values": total_missing,
        "percentage_missing_rows": pct_missing_rows,
        "overall_severity": overall_severity,
        "business_impact": business_impact,
        "recommendation": recommendation,
        "columns": columns
    }

    return jsonify(response_payload), 200


@api.route("/reports/duplicate", methods=["GET"])
def get_duplicate_report_api():
    filename = request.args.get("filename")
    df, err = get_dataset_df(filename)
    if err:
        return jsonify({"success": False, "message": err}), 400

    summary_df, duplicate_records = generate_duplicate_report(df)

    total_duplicates = int(summary_df["Duplicate Records"].iloc[0]) if not summary_df.empty else 0
    pct_duplicates = float(summary_df["Duplicate Percentage"].iloc[0]) if not summary_df.empty else 0.0
    overall_severity = str(summary_df["Severity"].iloc[0]) if not summary_df.empty else "No Issue"
    business_impact = str(summary_df["Business Impact"].iloc[0]) if not summary_df.empty else "No duplicate issue."
    recommendation = str(summary_df["Recommendation"].iloc[0]) if not summary_df.empty else "No action required."

    samples = []
    if not duplicate_records.empty:
        raw_samples = duplicate_records.head(20).to_dict(orient="records")
        for record in raw_samples:
            clean_record = {k: sanitize_val(v) for k, v in record.items()}
            clean_record["duplicate_count"] = 2
            samples.append(clean_record)

    response_payload = {
        "total_duplicate_rows": total_duplicates,
        "percentage_duplicates": pct_duplicates,
        "overall_severity": overall_severity,
        "business_impact": business_impact,
        "recommendation": recommendation,
        "duplicate_samples": samples
    }

    return jsonify(response_payload), 200


@api.route("/reports/datatype", methods=["GET"])
def get_datatype_report_api():
    filename = request.args.get("filename")
    df, err = get_dataset_df(filename)
    if err:
        return jsonify({"success": False, "message": err}), 400

    datatype_df = generate_datatype_report(df)

    total_invalid = int(datatype_df["Invalid Values"].sum()) if not datatype_df.empty else 0
    overall_severity = get_highest_severity(datatype_df) if not datatype_df.empty else "No Issue"
    business_impact = generate_business_impact("datatype", overall_severity)
    recommendation = generate_recommendation("datatype", overall_severity)

    issues = []
    for _, row in datatype_df.iterrows():
        invalid_cnt = int(row["Invalid Values"])
        issues.append({
            "column_name": str(row["Column"]),
            "expected_type": str(row["Expected Datatype"]),
            "detected_type": str(row["Detected Datatype"]),
            "invalid_count": invalid_cnt,
            "severity": str(row["Severity"]),
            "issue_description": f"Found {invalid_cnt} values inconsistent with expected type '{row['Expected Datatype']}'."
        })

    response_payload = {
        "total_invalid_types": total_invalid,
        "columns_analyzed": len(df.columns),
        "overall_severity": overall_severity,
        "business_impact": business_impact,
        "recommendation": recommendation,
        "issues": issues
    }

    return jsonify(response_payload), 200


@api.route("/reports/outlier", methods=["GET"])
def get_outlier_report_api():
    filename = request.args.get("filename")
    df, err = get_dataset_df(filename)
    if err:
        return jsonify({"success": False, "message": err}), 400

    outlier_df = generate_outlier_report(df)

    total_outliers = int(outlier_df["Outlier Count"].sum()) if not outlier_df.empty else 0
    overall_severity = get_highest_severity(outlier_df) if not outlier_df.empty else "No Issue"
    business_impact = generate_business_impact("outlier", overall_severity)
    recommendation = generate_recommendation("outlier", overall_severity)

    num_cols = df.select_dtypes(include=["number"]).columns

    summary = []
    for _, row in outlier_df.iterrows():
        col_name = str(row["Column"])
        series = df[col_name].dropna() if col_name in df.columns else pd.Series(dtype=float)
        summary.append({
            "column_name": col_name,
            "outlier_count": int(row["Outlier Count"]),
            "percentage": float(row["Outlier Percentage"]),
            "lower_bound": float(row["Lower Bound"]),
            "upper_bound": float(row["Upper Bound"]),
            "min_val": sanitize_val(series.min()) if not series.empty else 0,
            "max_val": sanitize_val(series.max()) if not series.empty else 0,
            "severity": str(row["Severity"])
        })

    response_payload = {
        "total_outliers": total_outliers,
        "columns_analyzed": len(num_cols),
        "overall_severity": overall_severity,
        "business_impact": business_impact,
        "recommendation": recommendation,
        "summary": summary
    }

    return jsonify(response_payload), 200


@api.route("/reports/dashboard", methods=["GET"])
def get_dashboard_report_api():
    filename = request.args.get("filename")
    df, err = get_dataset_df(filename)
    if err:
        return jsonify({"success": False, "message": err}), 400

    missing_df = generate_missing_report(df)
    dup_df, _ = generate_duplicate_report(df)
    dtype_df = generate_datatype_report(df)
    outlier_df = generate_outlier_report(df)

    dash_report = generate_dashboard_report(missing_df, dup_df, dtype_df, outlier_df)
    dash_summary_df = dash_report["dashboard_summary"]
    score_breakdown = dash_report["score_breakdown"]

    metrics = dict(zip(dash_summary_df["Metric"], dash_summary_df["Value"]))

    health_score = int(metrics.get("Health Score", 100))
    status = str(metrics.get("Dataset Status", "Unknown"))
    highest_priority = str(metrics.get("Highest Priority Issue", "None"))

    total_missing = int(missing_df["Missing Count"].sum()) if not missing_df.empty else 0
    total_dups = int(dup_df["Duplicate Records"].iloc[0]) if not dup_df.empty else 0
    total_invalid = int(dtype_df["Invalid Values"].sum()) if not dtype_df.empty else 0
    total_outliers = int(outlier_df["Outlier Count"].sum()) if not outlier_df.empty else 0
    total_issues = total_missing + total_dups + total_invalid + total_outliers

    critical_issues = 0
    high_issues = 0
    for rep in [missing_df, dtype_df, outlier_df]:
        if not rep.empty and "Severity" in rep.columns:
            critical_issues += int((rep["Severity"] == "Critical").sum())
            high_issues += int((rep["Severity"] == "High").sum())

    quick_insights = [
        f"Dataset health score is {health_score}/100 ({status}). Highest priority issue: {highest_priority}.",
        f"Total missing values identified across attributes: {total_missing}.",
        f"Total duplicate records detected in dataset: {total_dups}.",
        f"Schema type mismatches: {total_invalid}, statistical outliers: {total_outliers}."
    ]

    response_payload = {
        "summary": {
            "health_score": health_score,
            "status": status,
            "highest_priority": highest_priority,
            "total_issues": total_issues,
            "critical_issues": critical_issues,
            "high_issues": high_issues
        },
        "score_breakdown": score_breakdown,
        "quick_insights": quick_insights
    }

    return jsonify(response_payload), 200