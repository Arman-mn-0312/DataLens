# DataLens Performance Benchmark

This directory contains measurement-only tooling. It imports existing DataLens production functions but does not modify analysis logic, thresholds, severity, recommendations, health scores, routes, or report formats.

## Generate datasets

From the repository root:

```powershell
python benchmark/generate_datasets.py --include-widths --include-quality
```

The generator uses a fixed seed and records reproducible scale, column-width, missingness, duplicate, datatype, outlier, and mixed-quality cases.

## Run the audit

```powershell
python benchmark/benchmark_runner.py --include-widths --include-quality
```

The default is five repeated measurements. Dataset loading, direct report operations, full analysis, Flask test-client endpoints, and PDF/Excel exports are measured. API/export runs are limited to datasets up to 100,000 rows by default to avoid an unsafe accidental stress export; direct analysis still includes larger requested scales.

Use `--skip-api` for direct-only runs, `--runs 10` for more repetitions, or `--rows 10000,50000,100000` for a bounded run.

## Outputs

- `datasets/`: generated CSV inputs.
- `results/benchmark_results.json`: raw samples, memory observations, environment, and dataset metadata.
- `results/PERFORMANCE_REPORT.md`: generated audit report.

Peak memory is sampled from the benchmark process RSS using `psutil`. This captures native pandas/library allocations more reliably than Python-only allocation tracing, but it remains an approximate process-level measurement.