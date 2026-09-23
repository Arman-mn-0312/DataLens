import sys
import os
from pathlib import Path

# Add root directory to sys.path
root_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(root_dir))

from services.dataset_manager import DatasetManager
from services.report_cache_service import ReportCacheService
from services.report_export_service import ReportExportService

def test_export():
    print("Testing ReportExportService...")
    
    # Load dataset
    sample_file = "combined_dataset.csv"
    df, err = DatasetManager.load_dataset(sample_file)
    if err:
        print(f"Error loading dataset: {err}")
        return False
    
    print(f"Dataset loaded: {len(df)} rows, {len(df.columns)} cols")
    
    # 1. Test PDF generation
    pdf_buffer, pdf_err = ReportExportService.generate_pdf(sample_file)
    if pdf_err or pdf_buffer is None:
        print(f"PDF Generation Failed: {pdf_err}")
        return False
    
    pdf_bytes = pdf_buffer.getvalue()
    print(f"PDF Generated Successfully! Size: {len(pdf_bytes)} bytes. Starts with: {pdf_bytes[:8]}")
    assert pdf_bytes.startswith(b"%PDF"), "Generated PDF does not start with %PDF header"
    
    # 2. Test Excel generation
    excel_buffer, excel_err = ReportExportService.generate_excel(sample_file)
    if excel_err or excel_buffer is None:
        print(f"Excel Generation Failed: {excel_err}")
        return False
    
    excel_bytes = excel_buffer.getvalue()
    print(f"Excel Generated Successfully! Size: {len(excel_bytes)} bytes. Starts with PK: {excel_bytes.startswith(b'PK')}")
    assert excel_bytes.startswith(b"PK"), "Generated Excel does not have standard ZIP/XLSX header"
    
    # Check cache status
    print("Checking ReportCacheService keys:")
    for key in ["overview", "missing", "duplicate", "datatype", "outlier", "dashboard"]:
        has_key = ReportCacheService.has_report(key, sample_file)
        print(f"  - {key}: cached = {has_key}")
        assert has_key, f"Expected {key} to be cached"

    # 3. Test Flask Endpoints
    print("Testing Flask API endpoints...")
    from app import app
    from auth.security import create_access_token
    client = app.test_client()
    headers = {"Authorization": f"Bearer {create_access_token('qa-report-export')}"}

    # Test POST /reports/generate/pdf
    pdf_resp = client.post(f"/reports/generate/pdf?filename={sample_file}", headers=headers)
    print(f"POST /reports/generate/pdf response: {pdf_resp.status_code}, content-type: {pdf_resp.content_type}")
    assert pdf_resp.status_code == 200, f"Expected 200, got {pdf_resp.status_code}"
    assert "application/pdf" in pdf_resp.content_type
    assert pdf_resp.data.startswith(b"%PDF")
    assert "attachment" in pdf_resp.headers.get("Content-Disposition", "")
    print(f"  Content-Disposition: {pdf_resp.headers.get('Content-Disposition')}")

    # Test POST /reports/generate/excel
    excel_resp = client.post(f"/reports/generate/excel?filename={sample_file}", headers=headers)
    print(f"POST /reports/generate/excel response: {excel_resp.status_code}, content-type: {excel_resp.content_type}")
    assert excel_resp.status_code == 200, f"Expected 200, got {excel_resp.status_code}"
    assert "spreadsheetml" in excel_resp.content_type
    assert excel_resp.data.startswith(b"PK")
    assert "attachment" in excel_resp.headers.get("Content-Disposition", "")
    print(f"  Content-Disposition: {excel_resp.headers.get('Content-Disposition')}")

    # Test Error Handling with non-existent dataset
    err_resp = client.post("/reports/generate/pdf?filename=non_existent_file.csv", headers=headers)
    print(f"POST /reports/generate/pdf (invalid file) status: {err_resp.status_code}")
    assert err_resp.status_code == 400, f"Invalid dataset should be a client error, got {err_resp.status_code}"

    print("All backend tests (Unit & API) passed successfully!")
    return True

if __name__ == "__main__":
    success = test_export()
    sys.exit(0 if success else 1)
