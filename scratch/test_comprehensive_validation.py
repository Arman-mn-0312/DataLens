import sys
import os
import io
import pandas as pd
import openpyxl
from pathlib import Path

root_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(root_dir))

from app import app
from services.dataset_manager import DatasetManager
from services.report_cache_service import ReportCacheService
from services.report_export_service import ReportExportService

def run_comprehensive_validation():
    print("==================================================")
    print("DATALENS COMPREHENSIVE END-TO-END VALIDATION")
    print("==================================================")

    client = app.test_client()

    # Step 1: Upload CSV
    sample_csv_path = os.path.join(root_dir, "data", "sample", "combined_dataset.csv")
    with open(sample_csv_path, "rb") as f:
        upload_resp = client.post(
            "/upload",
            data={"file": (f, "combined_dataset.csv")},
            content_type="multipart/form-data"
        )
    print(f"1. Upload Response: {upload_resp.status_code}")
    assert upload_resp.status_code == 200, f"Upload failed: {upload_resp.data}"
    upload_data = upload_resp.get_json()
    assert upload_data["success"] is True
    print(f"   Uploaded filename: {upload_data['filename']}")

    # Step 2: Fetch all reports to simulate user viewing pages
    print("2. Simulating User Workflow (Loading all Report Pages)...")
    for rep in ["overview", "missing", "duplicate", "datatype", "outlier", "dashboard"]:
        r = client.get(f"/reports/{rep}?filename=combined_dataset.csv")
        assert r.status_code == 200, f"Failed to fetch {rep}: {r.status_code}"
        payload = r.get_json()
        print(f"   [OK] Fetched /reports/{rep} successfully (Cached: {ReportCacheService.has_report(rep, 'combined_dataset.csv')})")

    # Verify cache values
    overview_data = ReportCacheService.get_report("overview", "combined_dataset.csv")
    dashboard_data = ReportCacheService.get_report("dashboard", "combined_dataset.csv")
    assert overview_data is not None, "Expected overview report to be cached"
    assert dashboard_data is not None, "Expected dashboard report to be cached"

    summary = dashboard_data.get("summary") or {}
    expected_score = summary.get("health_score")
    expected_status = summary.get("status")
    print(f"   Extracted Analysis Score: {expected_score}/100, Status: {expected_status}")

    # Step 3: Test PDF Generation & Verification
    print("3. Testing PDF Generation Endpoint (POST /reports/generate/pdf)...")
    pdf_resp = client.post("/reports/generate/pdf?filename=combined_dataset.csv")
    assert pdf_resp.status_code == 200
    assert "application/pdf" in pdf_resp.content_type
    assert pdf_resp.data.startswith(b"%PDF")
    content_disp = pdf_resp.headers.get("Content-Disposition", "")
    assert "DataLens_combined_dataset_report.pdf" in content_disp
    print(f"   [OK] PDF Exported: Size={len(pdf_resp.data)} bytes, Disposition={content_disp}")

    # Step 4: Test Excel Generation & Sheet Verification
    print("4. Testing Excel Generation Endpoint (POST /reports/generate/excel)...")
    excel_resp = client.post("/reports/generate/excel?filename=combined_dataset.csv")
    assert excel_resp.status_code == 200
    assert "spreadsheetml" in excel_resp.content_type
    assert excel_resp.data.startswith(b"PK")
    content_disp_xl = excel_resp.headers.get("Content-Disposition", "")
    assert "DataLens_combined_dataset_report.xlsx" in content_disp_xl
    print(f"   [OK] Excel Exported: Size={len(excel_resp.data)} bytes, Disposition={content_disp_xl}")

    # Inspect Excel Worksheets
    wb = openpyxl.load_workbook(io.BytesIO(excel_resp.data))
    expected_sheets = [
        "Executive Summary",
        "Dataset Overview",
        "Missing Values",
        "Duplicate Records",
        "Datatype Validation",
        "Outlier Detection",
        "Recommendations"
    ]
    print(f"   Excel Sheet Names: {wb.sheetnames}")
    for sheet_name in expected_sheets:
        assert sheet_name in wb.sheetnames, f"Missing expected sheet: {sheet_name}"
        ws = wb[sheet_name]
        assert ws.max_row >= 4, f"Sheet {sheet_name} has insufficient rows ({ws.max_row})"
        print(f"     - Sheet '{sheet_name}': {ws.max_row} rows, {ws.max_column} cols [OK]")

    # Verify values inside Excel Sheet 1 (Executive Summary)
    ws_exec = wb["Executive Summary"]
    found_score = False
    for r in range(1, 12):
        cell_val = str(ws_exec[f"B{r}"].value or "")
        if f"{expected_score} / 100" in cell_val:
            found_score = True
            print(f"     - Verified Health Score in Sheet 1: {cell_val} matches single source of truth!")
            break
    assert found_score, f"Health Score {expected_score} / 100 not found in Sheet 1"

    # Step 5: Test Export without pre-fetching (Cold cache on fresh upload)
    print("5. Testing Cold Export (Generating PDF/Excel without prior page loads)...")
    ReportCacheService.clear_cache()
    cold_pdf_resp = client.post("/reports/generate/pdf?filename=combined_dataset.csv")
    assert cold_pdf_resp.status_code == 200
    assert cold_pdf_resp.data.startswith(b"%PDF")
    print(f"   [OK] Cold PDF Export succeeded: Size={len(cold_pdf_resp.data)} bytes")

    # Step 6: Test Error handling for invalid dataset
    print("6. Testing Error Handling...")
    err_resp = client.post("/reports/generate/pdf?filename=non_existent_123.csv")
    assert err_resp.status_code == 400, f"Expected 400, got {err_resp.status_code}"
    print(f"   [OK] Invalid file correctly rejected with status {err_resp.status_code}")

    print("==================================================")
    print("ALL VERIFICATIONS COMPLETED WITH 100% SUCCESS!")
    print("==================================================")
    return True

if __name__ == "__main__":
    success = run_comprehensive_validation()
    sys.exit(0 if success else 1)
