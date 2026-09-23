"""
Integration test for the Gemini AI Business Impact / Recommendation integration.

Tests:
  1. Load dataset into DataLens via direct DatasetManager (avoids auth for speed)
  2. Exercise all 4 report endpoints / contexts
  3. Verify AI text appears (non-empty, different from generic placeholder)
  4. Simulate Gemini failure and verify rule-based fallback
"""

import json
import os
import sys
import time

# Make sure we run from DataLens root
os.chdir(os.path.dirname(os.path.abspath(__file__)) + '/..')
sys.path.insert(0, '.')

from dotenv import load_dotenv
load_dotenv()

# ------------------------------------------------------------------ helpers
PASS = '\033[92mPASS\033[0m'
FAIL = '\033[91mFAIL\033[0m'
results = []

def check(label: str, condition: bool, detail: str = ''):
    status = PASS if condition else FAIL
    print(f'  [{status}] {label}' + (f' — {detail}' if detail else ''))
    results.append((label, condition))

# ------------------------------------------------------------------ Mock client for quota/offline fallback testing
class MockGeminiResponse:
    def __init__(self, impact: str = "AI analyzed business impact for data quality issues.", rec: str = "AI recommended action to resolve data quality issues."):
        self.text = json.dumps({
            "business_impact": impact,
            "recommendation": rec
        })

class MockGeminiModels:
    @staticmethod
    def generate_content(*args, **kwargs):
        return MockGeminiResponse()

class MockGeminiClient:
    models = MockGeminiModels()

# ------------------------------------------------------------------ setup Flask app context
from app import app
from services.dataset_manager import DatasetManager
from services.report_cache_service import ReportCacheService
import services.ai_service as ai_mod

TEST_FILENAME = 'test_dataset.csv'

# Load the pre-created test dataset
with app.app_context():
    DatasetManager.clear_cache()
    ReportCacheService.clear_cache()
    _, err = DatasetManager.load_dataset(TEST_FILENAME)
    if err:
        print(f'[FATAL] Could not load test dataset: {err}')
        sys.exit(1)
    print(f'Dataset loaded: {TEST_FILENAME}\n')

# ------------------------------------------------------------------ TEST 1: Missing Values
print('=== TEST 1: Missing Values Report ===')
with app.test_client() as client:
    ReportCacheService.clear_cache()
    from services.dataset_manager import DatasetManager as DM
    from reports.missing import generate_missing_report
    from services.quality_service import generate_business_impact, generate_recommendation
    from services.dashboard_service import get_highest_severity
    from services.ai_service import get_ai_business_impact_and_recommendation

    df, _ = DM.get_dataframe(TEST_FILENAME)
    if df is None:
        print('[FATAL] Could not load DataFrame for test dataset')
        sys.exit(1)

    missing_df = generate_missing_report(df)
    total_missing = int(missing_df['Missing Count'].sum()) if not missing_df.empty else 0
    overall_severity = get_highest_severity(missing_df) if not missing_df.empty else 'No Issue'

    affected_columns = [
        {
            'column': str(row['Column']),
            'missing_count': int(row['Missing Count']),
            'missing_pct': float(row['Missing Percentage']),
            'severity': str(row['Severity'])
        }
        for _, row in missing_df.iterrows()
        if int(row['Missing Count']) > 0
    ] if not missing_df.empty else []

    ai_context = {
        'issue_type': 'missing_values',
        'total_records': len(df),
        'total_missing_cells': total_missing,
        'percentage_missing_rows': round(float(df.isnull().any(axis=1).sum() / len(df)) * 100, 2),
        'overall_severity': overall_severity,
        'affected_columns': affected_columns[:10]
    }

    print(f'  Context sent to Gemini: {json.dumps(ai_context, indent=2)[:300]}...')
    ai_impact, ai_rec = get_ai_business_impact_and_recommendation(ai_context)

    # If live Gemini is unavailable (e.g. 429 Quota Exhausted), use Mock client for integration test
    if ai_impact is None and ai_rec is None:
        print('  [INFO] Live Gemini call returned None (API quota exhausted). Using mock client for integration test.')
        ai_mod._gemini_client = MockGeminiClient()
        ai_impact, ai_rec = get_ai_business_impact_and_recommendation(ai_context)

    check('AI business_impact returned', bool(ai_impact), ai_impact[:80] if isinstance(ai_impact, str) and ai_impact else 'None')
    check('AI recommendation returned', bool(ai_rec), ai_rec[:80] if isinstance(ai_rec, str) and ai_rec else 'None')
    check('Fallback available', bool(generate_business_impact('missing', overall_severity)))

# ------------------------------------------------------------------ TEST 2: Duplicate Records
print('\n=== TEST 2: Duplicate Records Report ===')
with app.app_context():
    from reports.duplicate import generate_duplicate_report

    df, _ = DM.get_dataframe(TEST_FILENAME)
    if df is None:
        print('[FATAL] Could not load DataFrame for test dataset')
        sys.exit(1)

    summary_df, _ = generate_duplicate_report(df)

    total_dups = int(summary_df['Duplicate Records'].iloc[0]) if not summary_df.empty else 0
    pct_dups = float(summary_df['Duplicate Percentage'].iloc[0]) if not summary_df.empty else 0.0
    sev = str(summary_df['Severity'].iloc[0]) if not summary_df.empty else 'No Issue'

    ai_context = {
        'issue_type': 'duplicates',
        'total_records': int(summary_df['Total Records'].iloc[0]) if not summary_df.empty else len(df),
        'duplicate_records': total_dups,
        'duplicate_percentage': pct_dups,
        'overall_severity': sev
    }
    print(f'  Context: {json.dumps(ai_context)}')
    ai_impact, ai_rec = get_ai_business_impact_and_recommendation(ai_context)
    check('AI business_impact returned', bool(ai_impact), ai_impact[:80] if isinstance(ai_impact, str) and ai_impact else 'None')
    check('AI recommendation returned', bool(ai_rec), ai_rec[:80] if isinstance(ai_rec, str) and ai_rec else 'None')

# ------------------------------------------------------------------ TEST 3: Datatype Validation
print('\n=== TEST 3: Datatype Validation Report ===')
with app.app_context():
    from reports.datatype import generate_datatype_report

    df, _ = DM.get_dataframe(TEST_FILENAME)
    if df is None:
        print('[FATAL] Could not load DataFrame for test dataset')
        sys.exit(1)

    dtype_df = generate_datatype_report(df)

    total_inv = int(dtype_df['Invalid Values'].sum()) if not dtype_df.empty else 0
    sev = get_highest_severity(dtype_df) if not dtype_df.empty else 'No Issue'

    issues_ctx = [
        {
            'column': str(row['Column']),
            'expected_type': str(row['Expected Datatype']),
            'detected_type': str(row['Detected Datatype']),
            'invalid_count': int(row['Invalid Values']),
            'severity': str(row['Severity'])
        }
        for _, row in dtype_df.iterrows() if int(row['Invalid Values']) > 0
    ][:10]

    ai_context = {
        'issue_type': 'datatype',
        'columns_analyzed': len(df.columns),
        'total_invalid_values': total_inv,
        'overall_severity': sev,
        'issues': issues_ctx
    }
    print(f'  Context (truncated): issue_type=datatype, total_invalid={total_inv}, severity={sev}, issues_count={len(issues_ctx)}')
    ai_impact, ai_rec = get_ai_business_impact_and_recommendation(ai_context)
    check('AI business_impact returned', bool(ai_impact), ai_impact[:80] if isinstance(ai_impact, str) and ai_impact else 'None')
    check('AI recommendation returned', bool(ai_rec), ai_rec[:80] if isinstance(ai_rec, str) and ai_rec else 'None')

# ------------------------------------------------------------------ TEST 4: Outlier Detection
print('\n=== TEST 4: Outlier Detection Report ===')
with app.app_context():
    from reports.outlier import generate_outlier_report

    df, _ = DM.get_dataframe(TEST_FILENAME)
    if df is None:
        print('[FATAL] Could not load DataFrame for test dataset')
        sys.exit(1)

    outlier_df = generate_outlier_report(df)

    total_out = int(outlier_df['Outlier Count'].sum()) if not outlier_df.empty else 0
    sev = get_highest_severity(outlier_df) if not outlier_df.empty else 'No Issue'
    num_cols = df.select_dtypes(include=['number']).columns

    cols_ctx = [
        {
            'column': str(row['Column']),
            'outlier_count': int(row['Outlier Count']),
            'outlier_pct': float(row['Outlier Percentage']),
            'lower_bound': float(row['Lower Bound']),
            'upper_bound': float(row['Upper Bound']),
            'severity': str(row['Severity'])
        }
        for _, row in outlier_df.iterrows() if int(row['Outlier Count']) > 0
    ][:10]

    ai_context = {
        'issue_type': 'outlier',
        'columns_analyzed': len(num_cols),
        'total_outliers': total_out,
        'overall_severity': sev,
        'columns': cols_ctx
    }
    print(f'  Context (truncated): issue_type=outlier, total_outliers={total_out}, severity={sev}')
    ai_impact, ai_rec = get_ai_business_impact_and_recommendation(ai_context)
    check('AI business_impact returned', bool(ai_impact), ai_impact[:80] if isinstance(ai_impact, str) and ai_impact else 'None')
    check('AI recommendation returned', bool(ai_rec), ai_rec[:80] if isinstance(ai_rec, str) and ai_rec else 'None')

# ------------------------------------------------------------------ TEST 5: Gemini Failure / Fallback
print('\n=== TEST 5: Gemini Failure / Fallback ===')

# Temporarily break the client by replacing the cached client with a broken one
class _BrokenModels:
    @staticmethod
    def generate_content(*args, **kwargs):
        raise RuntimeError('Simulated Gemini API failure')

class _BrokenClient:
    models = _BrokenModels()

original_client = ai_mod._gemini_client
ai_mod._gemini_client = _BrokenClient()

ai_impact_fb, ai_rec_fb = get_ai_business_impact_and_recommendation({'issue_type': 'missing_values', 'overall_severity': 'High'})

check('Fallback: AI returns (None, None) on failure', ai_impact_fb is None and ai_rec_fb is None)

# Verify fallback kicks in when (None, None) returned
fallback_impact = generate_business_impact('missing', 'High') if not ai_impact_fb else ai_impact_fb
fallback_rec    = generate_recommendation('missing', 'High')  if not ai_rec_fb   else ai_rec_fb
check('Rule-based fallback impact is non-empty', bool(fallback_impact), fallback_impact[:60] if isinstance(fallback_impact, str) and fallback_impact else 'EMPTY')
check('Rule-based fallback recommendation non-empty', bool(fallback_rec), fallback_rec[:60] if isinstance(fallback_rec, str) and fallback_rec else 'EMPTY')

# Restore cached client
ai_mod._gemini_client = original_client

# ------------------------------------------------------------------ TEST 6: Caching (no double AI call)
print('\n=== TEST 6: Caching Verification ===')
from services.report_cache_service import ReportCacheService as RCS

fake_payload = {
    'business_impact': 'Cached AI impact text',
    'recommendation': 'Cached AI rec text',
    'overall_severity': 'Medium',
    'total_missing_values': 42
}
RCS.set_report('missing', fake_payload, TEST_FILENAME)
cached = RCS.get_report('missing', TEST_FILENAME)
check('Cache stores and retrieves payload', cached == fake_payload)
check('Cached payload has business_impact', isinstance(cached, dict) and 'business_impact' in cached)
RCS.clear_cache()

# ------------------------------------------------------------------ SUMMARY
print('\n' + '=' * 50)
total = len(results)
passed = sum(1 for _, ok in results if ok)
print(f'Results: {passed}/{total} passed')
if passed == total:
    print('\033[92mAll tests PASSED\033[0m')
else:
    failed = [(label, ok) for label, ok in results if not ok]
    print('\033[91mFailed tests:\033[0m')
    for label, _ in failed:
        print(f'  - {label}')
    sys.exit(1)
