
from reports.overview import generate_overview_report
from reports.missing import generate_missing_report
from reports.duplicate import generate_duplicate_report
from reports.datatype import generate_datatype_report
from reports.outlier import generate_outlier_report
from reports.dashboard import generate_dashboard_report


def analyze_dataset(df):
    """
    Run complete dataset analysis.
    """

    overview_report = generate_overview_report(df)

    missing_report = generate_missing_report(df)

    duplicate_report, duplicate_records = generate_duplicate_report(df)

    datatype_report = generate_datatype_report(df)

    outlier_report = generate_outlier_report(df)

    dashboard_report = generate_dashboard_report(
        missing_report,
        duplicate_report,
        datatype_report,
        outlier_report
    )

    return {
        "overview": overview_report,
        "missing": missing_report,
        "duplicate": duplicate_report,
        "duplicate_records": duplicate_records,
        "datatype": datatype_report,
        "outlier": outlier_report,
        "dashboard": dashboard_report
    }