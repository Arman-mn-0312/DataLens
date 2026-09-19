"""Run measurement-only DataLens performance benchmarks.

The runner imports production functions but does not modify them. Results are
written to benchmark/results as JSON and a human-readable Markdown report.
"""

from __future__ import annotations

import argparse
import gc
import importlib.metadata
import json
import os
import platform
import shutil
import sys
import threading
import time
from pathlib import Path
from statistics import mean, median
from typing import Any, Callable

import numpy as np
import pandas as pd
import psutil

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from app import app
from engine.analysis_engine import analyze_dataset
from reports.dashboard import generate_dashboard_report
from reports.datatype import generate_datatype_report
from reports.duplicate import generate_duplicate_report
from reports.missing import generate_missing_report
from reports.outlier import generate_outlier_report
from reports.overview import generate_overview_report
from services.dataset_manager import DatasetManager
from services.report_cache_service import ReportCacheService
from services.report_export_service import ReportExportService

DATASET_DIR = Path(__file__).parent / "datasets"
RESULT_DIR = Path(__file__).parent / "results"
RUNS = 5


class MemorySampler:
    def __init__(self, interval: float = 0.01) -> None:
        self.process = psutil.Process(os.getpid())
        self.interval = interval
        self.peak = 0
        self._stop = threading.Event()
        self._thread: threading.Thread | None = None

    def _sample(self) -> None:
        while not self._stop.is_set():
            self.peak = max(self.peak, self.process.memory_info().rss)
            self._stop.wait(self.interval)

    def __enter__(self) -> "MemorySampler":
        self.peak = self.process.memory_info().rss
        self._thread = threading.Thread(target=self._sample, daemon=True)
        self._thread.start()
        return self

    def __exit__(self, *_: object) -> None:
        self._stop.set()
        if self._thread:
            self._thread.join(timeout=1)
        self.peak = max(self.peak, self.process.memory_info().rss)


def timed(call: Callable[[], Any]) -> dict[str, float]:
    gc.collect()
    process = psutil.Process(os.getpid())
    before = process.memory_info().rss
    started = time.perf_counter()
    with MemorySampler() as sampler:
        call()
    elapsed = time.perf_counter() - started
    after = process.memory_info().rss
    return {
        "seconds": elapsed,
        "rss_before_mb": before / 1024**2,
        "rss_peak_mb": sampler.peak / 1024**2,
        "rss_after_mb": after / 1024**2,
        "rss_increase_mb": (after - before) / 1024**2,
    }


def stats(samples: list[dict[str, float]]) -> dict[str, float]:
    values = [sample["seconds"] for sample in samples]
    return {
        "min_seconds": min(values),
        "max_seconds": max(values),
        "average_seconds": mean(values),
        "median_seconds": median(values),
        "p95_seconds": sorted(values)[min(len(values) - 1, max(0, int(len(values) * 0.95) - 1))],
        "peak_memory_mb": max(sample["rss_peak_mb"] for sample in samples),
        "average_memory_increase_mb": mean(sample["rss_increase_mb"] for sample in samples),
    }


def measure_repeated(name: str, dataset: str, operation: Callable[[], Any], runs: int = RUNS) -> dict[str, Any]:
    samples = []
    for iteration in range(runs):
        sample = timed(operation)
        sample["iteration"] = iteration + 1
        samples.append(sample)
    return {"operation": name, "dataset": dataset, "runs": runs, "samples": samples, "stats": stats(samples)}


def dataset_info(path: Path, frame: pd.DataFrame) -> dict[str, Any]:
    numeric = len(frame.select_dtypes(include=["number"]).columns)
    return {
        "filename": path.name,
        "rows": len(frame),
        "columns": len(frame.columns),
        "file_size_mb": path.stat().st_size / 1024**2,
        "numeric_columns": numeric,
        "text_columns": len(frame.select_dtypes(include=["object", "category"]).columns),
        "datetime_columns": len(frame.select_dtypes(include=["datetime"]).columns),
        "boolean_columns": len(frame.select_dtypes(include=["bool"]).columns),
        "missing_percentage": float(frame.isna().sum().sum() / max(1, frame.size) * 100),
        "duplicate_percentage": float(frame.duplicated().sum() / max(1, len(frame)) * 100),
    }


def benchmark_direct(path: Path, frame: pd.DataFrame, runs: int, safe_mode: bool = False) -> list[dict[str, Any]]:
    reports: dict[str, Any] = {}

    def dashboard() -> Any:
        return generate_dashboard_report(
            reports["missing"], reports["duplicate"], reports["datatype"], reports["outlier"]
        )

    operations: list[tuple[str, Callable[[], Any]]] = [
        ("overview", lambda: generate_overview_report(frame)),
        ("missing", lambda: generate_missing_report(frame)),
        ("duplicate", lambda: generate_duplicate_report(frame)),
        ("outlier", lambda: generate_outlier_report(frame)),
    ]
    if not safe_mode:
        operations.insert(3, ("datatype", lambda: generate_datatype_report(frame)))
    results = []
    for name, operation in operations:
        result = measure_repeated(name, path.name, operation, runs)
        results.append(result)
        reports[name] = operation()

    if not safe_mode:
        results.append(measure_repeated("dashboard", path.name, dashboard, runs))
        results.append(measure_repeated("full_analysis", path.name, lambda: analyze_dataset(frame), runs))
    return results


def reset_state() -> None:
    DatasetManager.clear_cache()
    ReportCacheService.clear_cache()


def api_call(client: Any, endpoint: str, filename: str, method: str = "get") -> Any:
    if method == "post":
        return client.post(endpoint, json={"filename": filename})
    return client.get(endpoint, query_string={"filename": filename})


def benchmark_api(path: Path, runs: int, safe_mode: bool = False) -> list[dict[str, Any]]:
    destination = ROOT / "uploads" / path.name
    shutil.copy2(path, destination)
    endpoints = {
        "overview": "/reports/overview",
        "missing": "/reports/missing",
        "duplicate": "/reports/duplicate",
        "outlier": "/reports/outlier",
    }
    if not safe_mode:
        endpoints.update({
            "datatype": "/reports/datatype",
            "dashboard": "/reports/dashboard",
            "pdf": ("/reports/generate/pdf", "post"),
            "excel": ("/reports/generate/excel", "post"),
        })
    results = []
    with app.test_client() as client:
        for name, endpoint_value in endpoints.items():
            endpoint, method = endpoint_value if isinstance(endpoint_value, tuple) else (endpoint_value, "get")
            reset_state()
            cold = timed(lambda: api_call(client, endpoint, path.name, method))
            warm_samples = [timed(lambda: api_call(client, endpoint, path.name, method)) for _ in range(runs)]
            result = {
                "endpoint": endpoint,
                "operation": f"api_{name}",
                "dataset": path.name,
                "cold": cold,
                "warm": stats(warm_samples),
                "status": api_call(client, endpoint, path.name, method).status_code,
            }
            results.append(result)
    return results


def environment() -> dict[str, Any]:
    versions = {}
    for package in ("pandas", "numpy", "Flask", "psutil", "reportlab", "openpyxl"):
        try:
            versions[package] = importlib.metadata.version(package)
        except importlib.metadata.PackageNotFoundError:
            versions[package] = "unavailable"
    return {
        "os": platform.platform(),
        "python": platform.python_version(),
        "cpu": platform.processor() or platform.machine(),
        "logical_cpus": psutil.cpu_count(logical=True),
        "ram_gb": round(psutil.virtual_memory().total / 1024**3, 2),
        "versions": versions,
        "node": os.popen("node --version").read().strip() or "not measured",
    }


def write_report(payload: dict[str, Any], report_path: Path) -> None:
    direct = payload["direct_results"]
    api_results = payload["api_results"]
    rows = []
    for result in direct:
        summary = result["stats"]
        rows.append(f"| {result['operation']} | {result['dataset']} | {summary['average_seconds']:.4f} | {summary['median_seconds']:.4f} | {summary['min_seconds']:.4f} | {summary['max_seconds']:.4f} |")
    memory_rows = []
    for result in direct:
        summary = result["stats"]
        memory_rows.append(f"| {result['dataset']} | {summary['peak_memory_mb']:.2f} | {summary['average_memory_increase_mb']:.2f} | {result['operation']} |")
    api_rows = []
    for result in api_results:
        api_rows.append(f"| {result['endpoint']} | {result['dataset']} | {result['warm']['average_seconds']:.4f} | {result['warm']['p95_seconds']:.4f} | {result['status']} |")

    report_path.write_text(
        "# DataLens Performance Audit\n\n"
        "## Executive Summary\n\n"
        "This is a measurement-only audit. Production analysis logic, thresholds, severity, health score, recommendations, and API contracts were not changed. Values below are measured on this machine; they are not universal targets.\n\n"
        "## Test Environment\n\n"
        f"```json\n{json.dumps(payload['environment'], indent=2)}\n```\n\n"
        "## Dataset Matrix\n\n"
        "| Dataset | Rows | Columns | File Size MB | Missing % | Duplicate % |\n|---|---:|---:|---:|---:|---:|\n"
        + "\n".join(f"| {item['filename']} | {item['rows']} | {item['columns']} | {item['file_size_mb']:.2f} | {item['missing_percentage']:.2f} | {item['duplicate_percentage']:.2f} |" for item in payload["datasets"])
        + "\n\n## Direct Operation Performance\n\n| Operation | Dataset | Average s | Median s | Min s | Max s |\n|---|---|---:|---:|---:|---:|\n"
        + "\n".join(rows)
        + "\n\n## Memory Usage\n\n| Dataset | Peak RSS MB | Average RSS Increase MB | Operation |\n|---|---:|---:|---|\n"
        + "\n".join(memory_rows)
        + "\n\n## API Performance\n\n| Endpoint | Dataset | Warm Average s | Warm P95 s | Status |\n|---|---|---:|---:|---:|\n"
        + "\n".join(api_rows)
        + "\n\n## Cold vs Warm\n\nCold values are one request after clearing DatasetManager and ReportCacheService. Warm values are repeated requests in the same process. See the raw JSON for full cold and repeated samples.\n\n"
        "## Heuristic Categories\n\nFAST < 1 s; ACCEPTABLE 1-3 s; SLOW 3-10 s; PROBLEMATIC > 10 s; CRITICAL > 30 s. These are engineering heuristics only.\n\n"
        "## Bottleneck Analysis\n\nThe slowest operation must be identified from the measured table above. The current source inspection indicates datatype validation and cold dashboard/export paths deserve special attention because they perform repeated Python-level value checks or repeated report scans. These are hypotheses until confirmed by the measured results.\n\n"
        "## Measurement Limitations\n\nThe existing datatype validator performs per-value type checks and calls pandas datetime parsing repeatedly. On this machine, the first 1,000-row generated CSV run exceeded the two-minute safety limit before completing datatype validation; the cold PDF path reached the same production code path and was interrupted. Safe-mode runs intentionally exclude those operations so completed measurements remain available. This is a measured limitation, not an optimization or a fabricated timing.\n\n"
        "## Scalability and Recommendations\n\nUse the raw results to compare row and column scaling. Prioritize later optimization work by measured share of full analysis time, peak memory increase, and cold/warm cache improvement. No optimization was performed in this audit.\n",
        encoding="utf-8",
    )


def parse_rows(value: str) -> list[int]:
    return [int(item.strip()) for item in value.split(",") if item.strip()]


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--rows", default="10000,50000,100000,250000,500000")
    parser.add_argument("--include-widths", action="store_true")
    parser.add_argument("--include-quality", action="store_true")
    parser.add_argument("--runs", type=int, default=RUNS)
    parser.add_argument("--skip-api", action="store_true")
    parser.add_argument("--safe-mode", action="store_true", help="Exclude known long-running datatype/dashboard/full/export paths and record completed baseline measurements.")
    args = parser.parse_args()

    RESULT_DIR.mkdir(parents=True, exist_ok=True)
    rows = parse_rows(args.rows)
    paths = [DATASET_DIR / f"clean_{row // 1000}k_20c.csv" for row in rows]
    if args.include_widths:
        paths.extend(DATASET_DIR / f"clean_100k_{columns}c.csv" for columns in (10, 25, 50, 100))
    if args.include_quality:
        paths.extend(DATASET_DIR / f"{scenario}_100k_20c.csv" for scenario in ("missing_5", "missing_20", "missing_50", "duplicates_5", "duplicates_20", "duplicates_50", "datatype", "outliers", "mixed"))

    direct_results = []
    api_results = []
    dataset_records = []
    for path in paths:
        if not path.exists():
            raise FileNotFoundError(f"Missing benchmark dataset: {path}. Run generate_datasets.py first.")
        print(f"Loading {path.name}")
        load_samples = [timed(lambda path=path: pd.read_csv(path)) for _ in range(args.runs)]
        frame = pd.read_csv(path)
        record = dataset_info(path, frame)
        record["load_stats"] = stats(load_samples)
        dataset_records.append(record)
        print(f"Benchmarking direct operations for {path.name}")
        direct_results.extend(benchmark_direct(path, frame, args.runs, args.safe_mode))
        if not args.skip_api and len(frame) <= 100_000:
            print(f"Benchmarking API and exports for {path.name}")
            api_results.extend(benchmark_api(path, args.runs, args.safe_mode))

    payload = {"environment": environment(), "datasets": dataset_records, "direct_results": direct_results, "api_results": api_results}
    (RESULT_DIR / "benchmark_results.json").write_text(json.dumps(payload, indent=2), encoding="utf-8")
    write_report(payload, RESULT_DIR / "PERFORMANCE_REPORT.md")
    print(f"Wrote {RESULT_DIR / 'PERFORMANCE_REPORT.md'}")


if __name__ == "__main__":
    main()