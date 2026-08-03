import pandas as pd

from engine.analysis_engine import analyze_dataset


def main():

    df = pd.read_csv("data/sample/combined_dataset.csv")

    result = analyze_dataset(df)

    print("=" * 100)
    print("DATASET OVERVIEW")
    print("=" * 100)
    print(result["overview"])

    print("\n")

    print("=" * 100)
    print("MISSING REPORT")
    print("=" * 100)
    print(result["missing"])

    print("\n")

    print("=" * 100)
    print("DUPLICATE REPORT")
    print("=" * 100)
    print(result["duplicate"])

    print("\n")

    print("=" * 100)
    print("DUPLICATE RECORDS")
    print("=" * 100)
    print(result["duplicate_records"])

    print("\n")

    print("=" * 100)
    print("DATATYPE REPORT")
    print("=" * 100)
    print(result["datatype"])

    print("\n")

    print("=" * 100)
    print("OUTLIER REPORT")
    print("=" * 100)
    print(result["outlier"])

    print("\n")

    print("=" * 100)
    print("DASHBOARD")
    print("=" * 100)
    print(result["dashboard"]["dashboard_summary"])

    print("\n")

    print("=" * 100)
    print("SCORE BREAKDOWN")
    print("=" * 100)

    for report, score in result["dashboard"]["score_breakdown"].items():
        print(f"{report:<15} : -{score}")


if __name__ == "__main__":
    main()