import pandas as pd

def calculate_iqr(column):
    
    column = column.dropna()

    q1 = column.quantile(0.25)

    q3 = column.quantile(0.75)

    iqr = q3 - q1

    return {
        "Q1": q1,
        "Q3": q3,
        "IQR": iqr
    }




def calculate_outlier_bounds(column):
    iqr_result = calculate_iqr(column)

    lower_bound = (iqr_result["Q1"] - 1.5 * iqr_result["IQR"])

    upper_bound = (iqr_result["Q3"] + 1.5 * iqr_result["IQR"])

    return {
        "Lower Bound": lower_bound,
        "Upper Bound": upper_bound
    }



def detect_outliers(column):
    column = column.dropna()

    # Calculate lower and upper bounds
    bounds = calculate_outlier_bounds(column)

    # Filter outlier values
    outliers = column[
        (column < bounds["Lower Bound"]) |
        (column > bounds["Upper Bound"])
    ]

    return outliers



def calculate_outlier_percentage(column):
    column = column.dropna()

    # Handle empty column
    if len(column) == 0:
        return 0.0

    # Detect outliers
    outliers = detect_outliers(column)

    # Calculate percentage
    outlier_percentage = (
        len(outliers) / len(column)
    ) * 100

    return round(outlier_percentage, 2)