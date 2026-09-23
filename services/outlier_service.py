import pandas as pd
import numpy as np


def _to_clean_series(column):
    if isinstance(column, (int, float, str, np.number)):
        s = pd.Series([column])
    elif not isinstance(column, pd.Series):
        s = pd.Series(column)
    else:
        s = column
    s = pd.to_numeric(s, errors="coerce")
    if isinstance(s, pd.Series):
        return s.dropna()
    return pd.Series(dtype=float)


def calculate_iqr(column):
    try:
        column = _to_clean_series(column)
        if len(column) == 0:
            return {"Q1": 0.0, "Q3": 0.0, "IQR": 0.0}

        q1 = float(column.quantile(0.25))
        q3 = float(column.quantile(0.75))
        iqr = q3 - q1

        if pd.isna(q1) or pd.isna(q3) or pd.isna(iqr):
            return {"Q1": 0.0, "Q3": 0.0, "IQR": 0.0}

        return {
            "Q1": q1,
            "Q3": q3,
            "IQR": iqr
        }
    except Exception:
        return {"Q1": 0.0, "Q3": 0.0, "IQR": 0.0}


def calculate_outlier_bounds(column):
    iqr_result = calculate_iqr(column)

    lower_bound = iqr_result["Q1"] - 1.5 * iqr_result["IQR"]
    upper_bound = iqr_result["Q3"] + 1.5 * iqr_result["IQR"]

    return {
        "Lower Bound": lower_bound,
        "Upper Bound": upper_bound
    }


def detect_outliers(column):
    try:
        column = _to_clean_series(column)
        if len(column) == 0:
            return pd.Series(dtype=float)

        bounds = calculate_outlier_bounds(column)
        lower = bounds.get("Lower Bound")
        upper = bounds.get("Upper Bound")

        if lower is None or upper is None or pd.isna(lower) or pd.isna(upper):
            return pd.Series(dtype=float)

        outliers = column[
            (column < lower) |
            (column > upper)
        ]
        return outliers
    except Exception:
        return pd.Series(dtype=float)


def calculate_outlier_percentage(column):
    try:
        column = _to_clean_series(column)
        if len(column) == 0:
            return 0.0

        outliers = detect_outliers(column)

        outlier_percentage = (
            len(outliers) / len(column)
        ) * 100

        return round(float(outlier_percentage), 2)
    except Exception:
        return 0.0