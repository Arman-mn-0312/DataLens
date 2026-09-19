import json
import sys
import time
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from app import app
from reports.dashboard import generate_dashboard_report
from reports.datatype import generate_datatype_report
from reports.duplicate import generate_duplicate_report
from reports.missing import generate_missing_report
from reports.outlier import generate_outlier_report
from reports.overview import generate_overview_report
from services.dataset_manager import DatasetManager
from services.report_cache_service import ReportCacheService

path = ROOT / "benchmark" / "datasets" / "clean_1k_20c.csv"
frame = pd.read_csv(path)
results = []

def measure(name, function):
    started = time.perf_counter()
    try:
        value = function()
        results.append({"operation": name, "status": "completed", "seconds": time.perf_counter() - started})
        return value
    except BaseException as error:
        results.append({"operation": name, "status": "failed", "seconds": time.perf_counter() - started, "error": f"{type(error).__name__}: {error}"})
        return None

missing = measure("missing_for_dashboard", lambda: generate_missing_report(frame))
duplicate = measure("duplicate_for_dashboard", lambda: generate_duplicate_report(frame))
datatype = measure("datatype", lambda: generate_datatype_report(frame))
outlier = measure("outlier_for_dashboard", lambda: generate_outlier_report(frame))
if all(value is not None for value in (missing, duplicate, datatype, outlier)):
    measure("dashboard", lambda: generate_dashboard_report(missing, duplicate, datatype, outlier))
else:
    results.append({"operation": "dashboard", "status": "blocked", "reason": "dependency report failed"})
measure("full_analysis", lambda: __import__("engine.analysis_engine", fromlist=["analyze_dataset"]).analyze_dataset(frame))

with app.test_client() as client:
    destination = ROOT / "uploads" / path.name
    destination.write_bytes(path.read_bytes())
    for name, endpoint, method in (("api_datatype", "/reports/datatype", "get"), ("api_dashboard", "/reports/dashboard", "get"), ("pdf", "/reports/generate/pdf", "post"), ("excel", "/reports/generate/excel", "post")):
        DatasetManager.clear_cache()
        ReportCacheService.clear_cache()
        def request(endpoint=endpoint, method=method):
            return client.post(endpoint, json={"filename": path.name}) if method == "post" else client.get(endpoint, query_string={"filename": path.name})
        started = time.perf_counter()
        try:
            response = request()
            results.append({"operation": name, "status": "completed" if response.status_code < 400 else "http_error", "http_status": response.status_code, "seconds": time.perf_counter() - started})
        except BaseException as error:
            results.append({"operation": name, "status": "failed", "seconds": time.perf_counter() - started, "error": f"{type(error).__name__}: {error}"})

output = ROOT / "benchmark" / "results" / "continuation_results.json"
output.write_text(json.dumps(results, indent=2), encoding="utf-8")
print(output)
for result in results:
    print(result)
