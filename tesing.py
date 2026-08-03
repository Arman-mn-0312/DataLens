# ==============================
# Missing REPORT
# ==============================


# import pandas as pd

# from reports.missing import generate_missing_report

# df = pd.read_csv("data/sample/combined_dataset.csv")

# missing_report = generate_missing_report(df)

# print(missing_report)





# ==============================
# DUPLICATE REPORT
# ==============================


# import pandas as pd
# from reports.duplicate import generate_duplicate_report

# df = pd.read_csv("data/sample/combined_dataset.csv")

# summary_report, duplicate_records = generate_duplicate_report(df)

# print("=" * 50)
# print("DUPLICATE SUMMARY")
# print("=" * 50)

# for column in summary_report.columns:
#     value = summary_report.iloc[0][column]

#     if column == "Duplicate Percentage":
#         print(f"{column:<22}: {value}%")
#     else:
#         print(f"{column:<22}: {value}")

# print("\n" + "=" * 50)
# print("DUPLICATE RECORDS")
# print("=" * 50)

# print(duplicate_records)








# ==============================
# Datatype REPORT
# ==============================


# import pandas as pd

# from reports.datatype import generate_datatype_report

# df = pd.read_csv("data/sample/combined_dataset.csv")

# datatype_report = generate_datatype_report(df)

# print(datatype_report)







# ==============================
# Outliers REPORT
# ==============================


# import pandas as pd

# from reports.outlier import generate_outlier_report

# # Load Dataset
# df = pd.read_csv("data/sample/combined_dataset.csv")

# # Generate Report
# outlier_report = generate_outlier_report(df)

# print("=" * 100)
# print("OUTLIER REPORT")
# print("=" * 100)

# print(outlier_report)

# print("\n")

# print("=" * 100)
# print("REPORT INFORMATION")
# print("=" * 100)

# outlier_report.info()

# print("\n")

# print("=" * 100)
# print("REPORT SHAPE")
# print("=" * 100)

# print(outlier_report.shape)





# ==============================
# Overview REPORT
# ==============================


# import pandas as pd

# from reports.overview import generate_overview_report

# # Load Dataset
# df = pd.read_csv("data/sample/combined_dataset.csv")

# # Generate Report
# overview_report = generate_overview_report(df)

# print("=" * 100)
# print("OVERVIEW REPORT")
# print("=" * 100)

# print(overview_report)

# print("\n")

# print("=" * 100)
# print("REPORT INFORMATION")
# print("=" * 100)

# overview_report.info()

# print("\n")

# print("=" * 100)
# print("REPORT SHAPE")
# print("=" * 100)

# print(overview_report.shape)





# ==============================
# DashBoard REPORT
# ==============================


import pandas as pd

from reports.missing import generate_missing_report
from reports.duplicate import generate_duplicate_report
from reports.datatype import generate_datatype_report
from reports.outlier import generate_outlier_report
from reports.dashboard import generate_dashboard_report

# Load Dataset
df = pd.read_csv("data/sample/combined_dataset.csv")

# Generate Individual Reports
missing_report = generate_missing_report(df)
duplicate_report, duplicate_records = generate_duplicate_report(df)
datatype_report = generate_datatype_report(df)
outlier_report = generate_outlier_report(df)


print(type(missing_report))
print(type(duplicate_report))
print(type(datatype_report))
print(type(outlier_report))


# Generate Dashboard Report
dashboard_report = generate_dashboard_report(
    missing_report,
    duplicate_report,
    datatype_report,
    outlier_report
)
    


print("=" * 100)
print("DASHBOARD SUMMARY")
print("=" * 100)

print(dashboard_report["dashboard_summary"])

print("\n")

print("=" * 100)
print("SCORE BREAKDOWN")
print("=" * 100)

for report, deduction in dashboard_report["score_breakdown"].items():
    print(f"{report:<15} : -{deduction}")

print("\n")

print("=" * 100)
print("SUMMARY INFORMATION")
print("=" * 100)

dashboard_report["dashboard_summary"].info()

print("\n")

print("=" * 100)
print("SUMMARY SHAPE")
print("=" * 100)

print(dashboard_report["dashboard_summary"].shape)
