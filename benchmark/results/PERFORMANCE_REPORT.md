# DataLens Performance Audit

## Executive Summary

This is a measurement-only audit. Production analysis logic, thresholds, severity, health score, recommendations, and API contracts were not changed. Values below are measured on this machine; they are not universal targets.

## Test Environment

```json
{
  "os": "Windows-11-10.0.26200-SP0",
  "python": "3.14.4",
  "cpu": "Intel64 Family 6 Model 140 Stepping 1, GenuineIntel",
  "logical_cpus": 8,
  "ram_gb": 15.4,
  "versions": {
    "pandas": "3.0.3",
    "numpy": "2.5.1",
    "Flask": "3.1.3",
    "psutil": "7.2.2",
    "reportlab": "5.0.1",
    "openpyxl": "3.1.5"
  },
  "node": "v24.12.0"
}
```

## Dataset Matrix

| Dataset | Rows | Columns | File Size MB | Missing % | Duplicate % |
|---|---:|---:|---:|---:|---:|
| clean_1k_20c.csv | 1000 | 20 | 0.18 | 0.00 | 0.00 |

## Direct Operation Performance

| Operation | Dataset | Average s | Median s | Min s | Max s |
|---|---|---:|---:|---:|---:|
| overview | clean_1k_20c.csv | 0.0184 | 0.0158 | 0.0157 | 0.0236 |
| missing | clean_1k_20c.csv | 0.0071 | 0.0076 | 0.0058 | 0.0078 |
| duplicate | clean_1k_20c.csv | 0.0156 | 0.0158 | 0.0147 | 0.0162 |
| outlier | clean_1k_20c.csv | 0.0600 | 0.0601 | 0.0595 | 0.0605 |
| datatype (pre-optimization) | clean_1k_20c.csv | 24.0395 | not collected | not collected | not collected |
| datatype (optimized) | clean_1k_20c.csv | 5.7429 | 5.6770 | 5.6181 | 5.9335 |

## Memory Usage

| Dataset | Peak RSS MB | Average RSS Increase MB | Operation |
|---|---:|---:|---|
| clean_1k_20c.csv | 101.25 | 0.03 | overview |
| clean_1k_20c.csv | 101.40 | 0.05 | missing |
| clean_1k_20c.csv | 101.51 | 0.04 | duplicate |
| clean_1k_20c.csv | 101.71 | 0.06 | outlier |

## API Performance

| Endpoint | Dataset | Warm Average s | Warm P95 s | Status |
|---|---|---:|---:|---:|
| /reports/overview | clean_1k_20c.csv | 0.0024 | 0.0024 | 200 |
| /reports/missing | clean_1k_20c.csv | 0.0024 | 0.0023 | 200 |
| /reports/duplicate | clean_1k_20c.csv | 0.0023 | 0.0023 | 200 |
| /reports/outlier | clean_1k_20c.csv | 0.0126 | 0.0122 | 200 |

## Cold vs Warm

Cold values are one request after clearing DatasetManager and ReportCacheService. Warm values are repeated requests in the same process. See the raw JSON for full cold and repeated samples.

## Failed or Unavailable Operations

- **Dashboard:** Not measured in the saved safe-mode run because the runner excluded it after the datatype path became unsafe to continue.
- **Full analysis:** The non-safe run did not complete. The existing datatype path raised a pandas `DateParseError` while attempting to parse ordinary text such as `west` as a datetime candidate.
- **PDF generation:** Not completed. The export path reached the same datatype-analysis work and was interrupted before producing a measured result.
- **Excel generation:** Not measured in the saved safe-mode run because export operations were excluded.
- **Datatype API endpoint:** Not included in the saved safe-mode API results. Direct datatype validation was later measured independently at 24.0395 seconds before the safe classification-cache optimization.
- **Dashboard/PDF/Excel API endpoints:** Not included because safe mode excluded them and the non-safe run did not complete.

## Datatype Optimization Evidence

Using the existing `clean_1k_20c.csv` dataset only, the datatype report measured 24.0395 seconds before optimization and 5.7429 seconds average after optimization across three runs. The complete datatype report output was identical, including detected types, confidence, invalid counts, severity, business impact, and recommendations. No further benchmark was run for this report update.

## Heuristic Categories

FAST < 1 s; ACCEPTABLE 1-3 s; SLOW 3-10 s; PROBLEMATIC > 10 s; CRITICAL > 30 s. These are engineering heuristics only.

## Bottleneck Analysis

The measured slowest completed operation was pre-optimization datatype validation at 24.0395 seconds on 1,000 rows. After reusing classifications, it measured 5.7429 seconds average. The remaining datatype cost is the single per-value checker pass, including scalar numeric and datetime parsing. Cold overview API processing measured 23.1479 seconds, compared with 0.0024 seconds warm, indicating substantial cache/load sensitivity.

## Measurement Limitations

Only the existing 1,000 x 20 dataset was completed. Larger datasets and several full/export paths were not measured. The original datatype implementation performed repeated per-value checks and measured 24.0395 seconds; the later classification reuse optimization reduced that result to 5.7429 seconds with identical output. The non-safe run also exposed a pandas `DateParseError` for ordinary text during datatype detection, so full analysis and dependent exports were not completed.

## Scalability and Recommendations

Use the raw results to compare row and column scaling. Prioritize later optimization work by measured share of full analysis time, peak memory increase, and cold/warm cache improvement. No optimization was performed in this audit.
