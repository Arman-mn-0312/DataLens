import os
import math
from typing import Any, Optional, Tuple
import pandas as pd
import numpy as np
from flask import Blueprint, jsonify, request, send_file
from werkzeug.utils import secure_filename

from auth.security import (
    decode_access_token,
    get_auth_token_from_request,
    get_current_user_from_request,
)
from services.upload_service import save_uploaded_file
from services.upload_storage import get_user_upload_path
from services.upload_cleanup_service import touch_upload
from services.dataset_manager import DatasetManager
from services.report_cache_service import ReportCacheService
from services.report_export_service import ReportExportService
from services.dashboard_service import (
    get_highest_severity,
    calculate_health_score,
    get_dataset_status
)
from services.quality_service import (
    generate_business_impact,
    generate_recommendation
)
from services.ai_service import get_ai_business_impact_and_recommendation
from reports.overview import generate_overview_report
from reports.missing import generate_missing_report
from reports.duplicate import generate_duplicate_report, get_duplicate_records
from reports.datatype import generate_datatype_report
from reports.outlier import generate_outlier_report
from reports.dashboard import generate_dashboard_report

api = Blueprint("api", __name__)


@api.before_request
def require_data_auth_for_api_routes():
    if request.method == "OPTIONS":
        return None

    public_paths = {"/", "/health"}
    if request.path in public_paths:
        return None

    if request.path.startswith("/reports") or request.path.startswith("/upload"):
        token = get_auth_token_from_request()
        if not token or decode_access_token(token) is None:
            return jsonify({"success": False, "message": "Authentication required."}), 401
        if request.path.startswith("/reports"):
            touch_upload(request.args.get("filename"), get_session_key())

    return None


def get_session_key() -> str:
    user = get_current_user_from_request()
    return str(user.get("sub")) if user and user.get("sub") is not None else "default"


def to_int(val: Any) -> int:
    """Safely convert Pandas/Numpy scalar or integer representation to Python int."""
    if val is None or pd.isna(val):
        return 0
    if hasattr(val, "item"):
        val = val.item()
    try:
        if math.isnan(float(val)):
            return 0
        return int(val)
    except (ValueError, TypeError, OverflowError):
        return 0


def to_float(val: Any) -> float:
    """Safely convert Pandas/Numpy scalar or float representation to Python float."""
    if val is None or pd.isna(val):
        return 0.0
    if hasattr(val, "item"):
        val = val.item()
    try:
        f = float(val)
        return 0.0 if math.isnan(f) or math.isinf(f) else f
    except (ValueError, TypeError, OverflowError):
        return 0.0


def get_dataset_df(filename: Optional[str]) -> Tuple[Optional[pd.DataFrame], Optional[str]]:
    """
    Retrieve active DataFrame via DatasetManager to prevent repeated CSV disk reads.
    """
    return DatasetManager.get_dataframe(filename, session_key=get_session_key())


def get_cached_health_report(report_key, filename, df, generator):
    """Reuse the existing report cache while preserving health-score inputs."""
    session_key = get_session_key()
    raw_key = f"_health_input_{report_key}"
    cached_report = ReportCacheService.get_report(raw_key, filename, session_key=session_key)
    if isinstance(cached_report, pd.DataFrame):
        return cached_report

    cached_payload = ReportCacheService.get_report(report_key, filename, session_key=session_key)
    if cached_payload is not None:
        if report_key == "missing":
            report = pd.DataFrame({
                "Missing Count": [item.get("missing_count", 0) for item in cached_payload.get("columns", [])],
                "Missing Percentage": [item.get("missing_pct", 0) for item in cached_payload.get("columns", [])],
                "Severity": [item.get("severity", "No Issue") for item in cached_payload.get("columns", [])],
            })
        elif report_key == "datatype":
            report = pd.DataFrame({
                "Invalid Values": [item.get("invalid_count", 0) for item in cached_payload.get("issues", [])],
                "Severity": [item.get("severity", "No Issue") for item in cached_payload.get("issues", [])],
            })
        elif report_key == "outlier":
            report = pd.DataFrame({
                "Outlier Count": [item.get("outlier_count", 0) for item in cached_payload.get("summary", [])],
                "Outlier Percentage": [item.get("percentage", 0) for item in cached_payload.get("summary", [])],
                "Severity": [item.get("severity", "No Issue") for item in cached_payload.get("summary", [])],
            })
        else:
            report = pd.DataFrame({
                "Total Records": [len(df)],
                "Duplicate Records": [cached_payload.get("total_duplicate_rows", 0)],
                "Duplicate Percentage": [cached_payload.get("percentage_duplicates", 0)],
                "Severity": [cached_payload.get("overall_severity", "No Issue")],
            })

        if not report.empty:
            ReportCacheService.set_report(raw_key, report, filename, session_key=session_key)
            return report

    generated = generator(df)
    report = generated[0] if report_key == "duplicate" else generated
    ReportCacheService.set_report(raw_key, report, filename, session_key=session_key)
    return report


def sanitize_val(val: Any) -> Any:
    if pd.isna(val):
        return None
    if isinstance(val, (np.integer, int)):
        return int(val)
    if isinstance(val, (np.floating, float)):
        numeric_val = float(val)
        return None if math.isinf(numeric_val) else round(numeric_val, 4)
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
    if not file or file.filename == "":
        return jsonify({
            "success": False,
            "message": "No file selected."
        }), 400

    session_key = get_session_key()
    filepath = save_uploaded_file(file, staging=True, session_key=session_key)

    if filepath is None:
        return jsonify({
            "success": False,
            "message": "Only CSV files are allowed."
        }), 400

    clean_filename = secure_filename(file.filename)
    dataframe, err = DatasetManager.parse_csv_file(filepath)
    if err:
        os.remove(filepath)
        return jsonify({
            "success": False,
            "message": err
        }), 400

    # Commit only a parseable upload. This keeps the previous active dataset
    # and its reports usable when a replacement CSV is invalid.
    destination = get_user_upload_path(clean_filename, session_key)
    try:
        os.replace(filepath, destination)
    except OSError:
        if os.path.exists(filepath):
            os.remove(filepath)
        raise

    DatasetManager.clear_cache(session_key)
    ReportCacheService.clear_cache(session_key)
    DatasetManager.activate_dataframe(clean_filename, dataframe, session_key=session_key)

    file_size_mb = f"{os.path.getsize(destination) / (1024 * 1024):.2f} MB"
    dataset_payload = DatasetManager.get_preview_payload(
        filesize_str=file_size_mb,
        session_key=session_key,
    )

    return jsonify({
        "success": True,
        "message": "Dataset uploaded successfully.",
        "filename": clean_filename,
        "dataset": dataset_payload
    }), 200


@api.route("/upload", methods=["DELETE"])
def delete_dataset():
    filename = request.args.get("filename")
    if not filename:
        return jsonify({"success": False, "message": "Filename parameter is required."}), 400

    session_key = get_session_key()
    path = get_user_upload_path(filename, session_key)
    if not path or not os.path.isfile(path):
        return jsonify({"success": False, "message": "Dataset file was not found."}), 404

    # Drop in-memory data and report results before removing the user's file.
    DatasetManager.clear_cache(session_key)
    ReportCacheService.clear_cache(session_key)
    try:
        os.remove(path)
    except OSError:
        return jsonify({"success": False, "message": "Could not remove the dataset file."}), 500

    return jsonify({"success": True, "message": "Dataset file removed."}), 200


# ==========================
# Lazy Loading Report APIs
# ==========================

@api.route("/reports/overview", methods=["GET"])
def get_overview_report():
    filename = request.args.get("filename")
    
    # Return cached report if available
    cached = ReportCacheService.get_report("overview", filename, session_key=get_session_key())
    if cached is not None:
        return jsonify(cached), 200

    df, err = get_dataset_df(filename)
    if err or df is None:
        return jsonify({"success": False, "message": err or "Failed to load dataset."}), 400

    overview_df = generate_overview_report(df)
    missing_df = get_cached_health_report("missing", filename, df, generate_missing_report)
    dup_df = get_cached_health_report("duplicate", filename, df, generate_duplicate_report)
    dtype_df = get_cached_health_report("datatype", filename, df, generate_datatype_report)
    outlier_df = get_cached_health_report("outlier", filename, df, generate_outlier_report)

    health_res = calculate_health_score(missing_df, dup_df, dtype_df, outlier_df)
    health_score = health_res["Health Score"]
    health_rating = get_dataset_status(health_score)

    metrics = dict(zip(overview_df["Metric"], overview_df["Value"]))

    response_payload = {
        "dataset_name": filename,
        "total_rows": to_int(metrics.get("Rows", len(df))),
        "total_columns": to_int(metrics.get("Columns", len(df.columns))),
        "memory_usage_mb": to_float(metrics.get("Memory Usage (MB)", 0)),
        "numeric_columns": to_int(metrics.get("Numeric Columns", 0)),
        "categorical_columns": to_int(metrics.get("Categorical Columns", 0)),
        "total_missing_values": to_int(metrics.get("Missing Values", 0)),
        "total_duplicate_records": to_int(metrics.get("Duplicate Rows", 0)),
        "health_score": health_score,
        "health_rating": health_rating,
        "analyzed_at": "Just now"
    }

    ReportCacheService.set_report("overview", response_payload, filename, session_key=get_session_key())
    return jsonify(response_payload), 200


@api.route("/reports/missing", methods=["GET"])
def get_missing_report_api():
    filename = request.args.get("filename")

    # Return cached report if available
    cached = ReportCacheService.get_report("missing", filename, session_key=get_session_key())
    if cached is not None:
        return jsonify(cached), 200

    df, err = get_dataset_df(filename)
    if err or df is None:
        return jsonify({"success": False, "message": err or "Failed to load dataset."}), 400

    missing_df = get_cached_health_report("missing", filename, df, generate_missing_report)

    total_missing = to_int(missing_df["Missing Count"].sum()) if not missing_df.empty else 0
    pct_missing_rows = round(to_float(df.isnull().any(axis=1).sum() / len(df)) * 100, 2) if len(df) > 0 else 0.0

    overall_severity = get_highest_severity(missing_df) if not missing_df.empty else "No Issue"

    # --- Gemini AI interpretation layer ---
    # Build compact context from DataLens-calculated facts only (no raw CSV data)
    affected_columns = [
        {
            "column": str(row["Column"]),
            "missing_count": to_int(row["Missing Count"]),
            "missing_pct": to_float(row["Missing Percentage"]),
            "severity": str(row["Severity"])
        }
        for _, row in missing_df.iterrows()
        if to_int(row["Missing Count"]) > 0
    ] if not missing_df.empty else []

    ai_context = {
        "issue_type": "missing_values",
        "total_records": len(df),
        "total_missing_cells": total_missing,
        "percentage_missing_rows": pct_missing_rows,
        "overall_severity": overall_severity,
        "affected_columns": affected_columns[:10]  # cap at 10 columns for prompt brevity
    }
    ai_impact, ai_rec = (
        get_ai_business_impact_and_recommendation(ai_context)
        if total_missing
        else (None, None)
    )

    # Use AI result if valid; fall back to existing rule-based logic otherwise
    business_impact = ai_impact if ai_impact else generate_business_impact("missing", overall_severity)
    recommendation = ai_rec if ai_rec else generate_recommendation("missing", overall_severity)

    columns = []
    for _, row in missing_df.iterrows():
        col_name = str(row["Column"])
        columns.append({
            "column_name": col_name,
            "missing_count": to_int(row["Missing Count"]),
            "missing_pct": to_float(row["Missing Percentage"]),
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

    ReportCacheService.set_report("missing", response_payload, filename, session_key=get_session_key())
    return jsonify(response_payload), 200


@api.route("/reports/duplicate", methods=["GET"])
def get_duplicate_report_api():
    filename = request.args.get("filename")

    # Return cached report if available
    cached = ReportCacheService.get_report("duplicate", filename, session_key=get_session_key())
    if cached is not None:
        return jsonify(cached), 200

    df, err = get_dataset_df(filename)
    if err or df is None:
        return jsonify({"success": False, "message": err or "Failed to load dataset."}), 400

    summary_df = get_cached_health_report("duplicate", filename, df, generate_duplicate_report)
    duplicate_records = get_duplicate_records(df)

    total_duplicates = to_int(summary_df["Duplicate Records"].iloc[0]) if not summary_df.empty else 0
    pct_duplicates = to_float(summary_df["Duplicate Percentage"].iloc[0]) if not summary_df.empty else 0.0
    overall_severity = str(summary_df["Severity"].iloc[0]) if not summary_df.empty else "No Issue"
    # Preserve rule-based values as the mandatory fallback source
    fallback_impact = str(summary_df["Business Impact"].iloc[0]) if not summary_df.empty else "No duplicate issue."
    fallback_rec = str(summary_df["Recommendation"].iloc[0]) if not summary_df.empty else "No action required."

    # --- Gemini AI interpretation layer ---
    ai_context = {
        "issue_type": "duplicates",
        "total_records": to_int(summary_df["Total Records"].iloc[0]) if not summary_df.empty else len(df),
        "duplicate_records": total_duplicates,
        "duplicate_percentage": pct_duplicates,
        "overall_severity": overall_severity
    }
    ai_impact, ai_rec = (
        get_ai_business_impact_and_recommendation(ai_context)
        if total_duplicates
        else (None, None)
    )

    business_impact = ai_impact if ai_impact else fallback_impact
    recommendation = ai_rec if ai_rec else fallback_rec

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

    ReportCacheService.set_report("duplicate", response_payload, filename, session_key=get_session_key())
    return jsonify(response_payload), 200


@api.route("/reports/datatype", methods=["GET"])
def get_datatype_report_api():
    filename = request.args.get("filename")

    # Return cached report if available
    cached = ReportCacheService.get_report("datatype", filename, session_key=get_session_key())
    if cached is not None:
        return jsonify(cached), 200

    df, err = get_dataset_df(filename)
    if err or df is None:
        return jsonify({"success": False, "message": err or "Failed to load dataset."}), 400

    datatype_df = get_cached_health_report("datatype", filename, df, generate_datatype_report)

    total_invalid = to_int(datatype_df["Invalid Values"].sum()) if not datatype_df.empty else 0
    overall_severity = get_highest_severity(datatype_df) if not datatype_df.empty else "No Issue"

    # --- Gemini AI interpretation layer ---
    datatype_issues_ctx = [
        {
            "column": str(row["Column"]),
            "expected_type": str(row["Expected Datatype"]),
            "detected_type": str(row["Detected Datatype"]),
            "invalid_count": to_int(row["Invalid Values"]),
            "severity": str(row["Severity"])
        }
        for _, row in datatype_df.iterrows()
        if to_int(row["Invalid Values"]) > 0
    ] if not datatype_df.empty else []

    ai_context = {
        "issue_type": "datatype",
        "columns_analyzed": len(df.columns),
        "total_invalid_values": total_invalid,
        "overall_severity": overall_severity,
        "issues": datatype_issues_ctx[:10]  # cap at 10 issues for prompt brevity
    }
    ai_impact, ai_rec = (
        get_ai_business_impact_and_recommendation(ai_context)
        if total_invalid
        else (None, None)
    )

    business_impact = ai_impact if ai_impact else generate_business_impact("datatype", overall_severity)
    recommendation = ai_rec if ai_rec else generate_recommendation("datatype", overall_severity)

    issues = []
    for _, row in datatype_df.iterrows():
        invalid_cnt = to_int(row["Invalid Values"])
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

    ReportCacheService.set_report("datatype", response_payload, filename, session_key=get_session_key())
    return jsonify(response_payload), 200


@api.route("/reports/outlier", methods=["GET"])
def get_outlier_report_api():
    filename = request.args.get("filename") or request.args.get("file")

    # Return cached report if available
    cached = ReportCacheService.get_report("outlier", filename, session_key=get_session_key())
    if cached is not None:
        return jsonify(cached), 200

    df, err = get_dataset_df(filename)
    if err or df is None:
        return jsonify({"success": False, "message": err or "Failed to load dataset."}), 400

    outlier_df = get_cached_health_report("outlier", filename, df, generate_outlier_report)

    total_outliers = to_int(outlier_df["Outlier Count"].sum()) if not outlier_df.empty else 0
    overall_severity = get_highest_severity(outlier_df) if not outlier_df.empty else "No Issue"
    num_cols = df.select_dtypes(include=["number"]).columns
    business_impact = generate_business_impact("outlier", overall_severity)
    recommendation = generate_recommendation("outlier", overall_severity)

    summary = []
    for _, row in outlier_df.iterrows():
        col_name = str(row["Column"])
        series = df[col_name].dropna() if col_name in df.columns else pd.Series(dtype=float)
        summary.append({
            "column_name": col_name,
            "outlier_count": to_int(row["Outlier Count"]),
            "percentage": to_float(row["Outlier Percentage"]),
            "lower_bound": to_float(row["Lower Bound"]),
            "upper_bound": to_float(row["Upper Bound"]),
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

    ReportCacheService.set_report("outlier", response_payload, filename, session_key=get_session_key())
    return jsonify(response_payload), 200


@api.route("/reports/dashboard", methods=["GET"])
def get_dashboard_report_api():
    filename = request.args.get("filename")

    # Return cached report if available
    cached = ReportCacheService.get_report("dashboard", filename, session_key=get_session_key())
    if cached is not None:
        return jsonify(cached), 200

    df, err = get_dataset_df(filename)
    if err or df is None:
        return jsonify({"success": False, "message": err or "Failed to load dataset."}), 400

    missing_df = get_cached_health_report("missing", filename, df, generate_missing_report)
    dup_df = get_cached_health_report("duplicate", filename, df, generate_duplicate_report)
    dtype_df = get_cached_health_report("datatype", filename, df, generate_datatype_report)
    outlier_df = get_cached_health_report("outlier", filename, df, generate_outlier_report)

    dash_report = generate_dashboard_report(missing_df, dup_df, dtype_df, outlier_df)
    dash_summary_df = dash_report["dashboard_summary"]
    score_breakdown = dash_report["score_breakdown"]

    metrics = dict(zip(dash_summary_df["Metric"], dash_summary_df["Value"]))

    health_score = to_int(metrics.get("Health Score", 100))
    status = str(metrics.get("Dataset Status", "Unknown"))
    highest_priority = str(metrics.get("Highest Priority Issue", "None"))

    total_missing = to_int(missing_df["Missing Count"].sum()) if not missing_df.empty else 0
    total_dups = to_int(dup_df["Duplicate Records"].iloc[0]) if not dup_df.empty else 0
    total_invalid = to_int(dtype_df["Invalid Values"].sum()) if not dtype_df.empty else 0
    total_outliers = to_int(outlier_df["Outlier Count"].sum()) if not outlier_df.empty else 0
    total_issues = total_missing + total_dups + total_invalid + total_outliers

    critical_issues = 0
    high_issues = 0
    for rep in [missing_df, dtype_df, outlier_df]:
        if not rep.empty and "Severity" in rep.columns:
            critical_issues += to_int((rep["Severity"] == "Critical").sum())
            high_issues += to_int((rep["Severity"] == "High").sum())

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

    ReportCacheService.set_report("dashboard", response_payload, filename, session_key=get_session_key())
    return jsonify(response_payload), 200


# ==========================
# Report Generation & Export
# ==========================

@api.route("/reports/generate/pdf", methods=["POST"])
def generate_pdf_report():
    filename = (
        request.args.get("filename")
        or (request.get_json(silent=True) or {}).get("filename")
        or DatasetManager.get_active_filename(session_key=get_session_key())
    )
    if not filename:
        return jsonify({
            "success": False,
            "message": "No active dataset loaded. Please upload a dataset first."
        }), 400

    pdf_buffer, err = ReportExportService.generate_pdf(filename, session_key=get_session_key())
    if err or pdf_buffer is None:
        return jsonify({
            "success": False,
            "message": err or "Failed to generate PDF report."
        }), 400

    clean_base = secure_filename(filename)
    if clean_base.lower().endswith(".csv"):
        clean_base = clean_base[:-4]
    download_filename = f"DataLens_{clean_base}_report.pdf"

    return send_file(
        pdf_buffer,
        mimetype="application/pdf",
        as_attachment=True,
        download_name=download_filename
    )


@api.route("/reports/generate/excel", methods=["POST"])
def generate_excel_report():
    filename = (
        request.args.get("filename")
        or (request.get_json(silent=True) or {}).get("filename")
        or DatasetManager.get_active_filename(session_key=get_session_key())
    )
    if not filename:
        return jsonify({
            "success": False,
            "message": "No active dataset loaded. Please upload a dataset first."
        }), 400

    excel_buffer, err = ReportExportService.generate_excel(filename, session_key=get_session_key())
    if err or excel_buffer is None:
        return jsonify({
            "success": False,
            "message": err or "Failed to generate Excel report."
        }), 400

    clean_base = secure_filename(filename)
    if clean_base.lower().endswith(".csv"):
        clean_base = clean_base[:-4]
    download_filename = f"DataLens_{clean_base}_report.xlsx"

    return send_file(
        excel_buffer,
        mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        as_attachment=True,
        download_name=download_filename
    )
