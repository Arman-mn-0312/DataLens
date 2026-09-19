"""Generate reproducible DataLens benchmark CSVs without touching production data."""

from __future__ import annotations

import argparse
from pathlib import Path

import numpy as np
import pandas as pd


DEFAULT_SEED = 20260919


def make_dataset(rows: int, columns: int = 20, scenario: str = "clean", seed: int = DEFAULT_SEED) -> pd.DataFrame:
    scenario_seed = sum((index + 1) * ord(character) for index, character in enumerate(scenario))
    rng = np.random.default_rng(seed + rows + columns + scenario_seed)
    data: dict[str, object] = {}

    for index in range(columns):
        column_type = index % 5
        name = f"field_{index + 1:03d}"
        if column_type in (0, 1):
            data[name] = rng.normal(100, 25, rows).round(4)
        elif column_type == 2:
            data[name] = rng.choice(["north", "south", "east", "west"], rows)
        elif column_type == 3:
            data[name] = pd.date_range("2020-01-01", periods=rows, freq="min").astype(str)
        else:
            data[name] = rng.choice(["true", "false"], rows)

    frame = pd.DataFrame(data)
    numeric_columns = list(frame.select_dtypes(include=["number"]).columns)

    if scenario.startswith("missing_"):
        percentage = float(scenario.split("_")[1]) / 100
        for column in frame.columns:
            indexes = rng.choice(rows, max(1, int(rows * percentage)), replace=False)
            frame.loc[indexes, column] = np.nan
    elif scenario.startswith("duplicates_"):
        percentage = float(scenario.split("_")[1]) / 100
        count = max(1, int(rows * percentage))
        frame.iloc[-count:] = frame.iloc[:count].to_numpy()
    elif scenario == "datatype":
        for column in numeric_columns:
            indexes = rng.choice(rows, max(1, rows // 10), replace=False)
            frame.loc[indexes, column] = "invalid-number"
        for column in frame.columns:
            if frame[column].dtype == object:
                indexes = rng.choice(rows, max(1, rows // 20), replace=False)
                frame.loc[indexes, column] = "not-a-date-or-boolean"
    elif scenario == "outliers":
        for column in numeric_columns:
            indexes = rng.choice(rows, max(1, rows // 100), replace=False)
            frame.loc[indexes, column] = 1_000_000
    elif scenario == "mixed":
        for column in frame.columns:
            indexes = rng.choice(rows, max(1, rows // 10), replace=False)
            frame.loc[indexes, column] = np.nan
        duplicate_count = max(1, rows // 5)
        frame.iloc[-duplicate_count:] = frame.iloc[:duplicate_count].to_numpy()
        for column in numeric_columns:
            indexes = rng.choice(rows, max(1, rows // 100), replace=False)
            frame.loc[indexes, column] = 1_000_000

    return frame


def dataset_name(rows: int, columns: int, scenario: str) -> str:
    return f"{scenario}_{rows // 1000}k_{columns}c.csv"


def write_dataset(output_dir: Path, rows: int, columns: int, scenario: str, seed: int = DEFAULT_SEED) -> Path:
    output_dir.mkdir(parents=True, exist_ok=True)
    path = output_dir / dataset_name(rows, columns, scenario)
    if not path.exists():
        make_dataset(rows, columns, scenario, seed).to_csv(path, index=False)
    return path


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=Path(__file__).parent / "datasets")
    parser.add_argument("--rows", type=int, nargs="+", default=[10_000, 50_000, 100_000, 250_000, 500_000])
    parser.add_argument("--columns", type=int, default=20)
    parser.add_argument("--include-widths", action="store_true")
    parser.add_argument("--include-quality", action="store_true")
    args = parser.parse_args()

    for rows in args.rows:
        print(write_dataset(args.output, rows, args.columns, "clean"))
    if args.include_widths:
        for columns in (10, 25, 50, 100):
            print(write_dataset(args.output, 100_000, columns, "clean"))
    if args.include_quality:
        for scenario in ("missing_5", "missing_20", "missing_50", "duplicates_5", "duplicates_20", "duplicates_50", "datatype", "outliers", "mixed"):
            print(write_dataset(args.output, 100_000, 20, scenario))


if __name__ == "__main__":
    main()