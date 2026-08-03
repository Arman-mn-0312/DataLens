import pandas as pd


def calculate_overview_summary(df):
    overview = {

        "Rows": df.shape[0],

        "Columns": df.shape[1],

        "Numeric Columns":
        len(df.select_dtypes(include=["number"]).columns),

        "Categorical Columns":
        len(df.select_dtypes(include=["object", "category"]).columns),

        "Datetime Columns":
        len(df.select_dtypes(include=["datetime"]).columns),

        "Memory Usage (MB)":
        round(
            df.memory_usage(deep=True).sum() / (1024 * 1024),
            2
        ),

        "Missing Values":
        df.isnull().sum().sum(),

        "Duplicate Rows":
        df.duplicated().sum()
    }

    return pd.DataFrame(
        overview.items(),
        columns=["Metric", "Value"]
    )




def generate_overview_report(df):
    report = calculate_overview_summary(df)
    return report