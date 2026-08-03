from config.severity import (
    LOW_THRESHOLD,
    MEDIUM_THRESHOLD,
    HIGH_THRESHOLD
)


# ----------------------------
# Business Impact Messages
# ----------------------------

BUSINESS_IMPACTS = {
    "missing": {
        "No Issue": "No business impact detected.",
        "Low": "Minor missing values are unlikely to significantly affect analysis.",
        "Medium": "Missing values may reduce the reliability of analysis and reporting.",
        "High": "Important information is missing, which may lead to inaccurate business insights and decisions.",
        "Critical": "Extensive missing data severely impacts data quality and may make the dataset unsuitable for reliable analysis."
    },

    "duplicate": {
        "No Issue": "No duplicate records detected.",
        "Low": "A few duplicate records may slightly affect aggregated results.",
        "Medium": "Duplicate records can distort summaries, counts, and business metrics.",
        "High": "A significant number of duplicate records may produce misleading reports and incorrect analytical outcomes.",
        "Critical": "Extensive duplicate records seriously compromise data integrity and business reporting."
    },

    "datatype": {
        "No Issue": "All data types are valid.",
        "Low": "Minor data type inconsistencies are present but have limited business impact.",
        "Medium": "Incorrect data types may cause calculation errors and reduce analysis accuracy.",
        "High": "Invalid data types significantly affect data processing and analytical reliability.",
        "Critical": "Critical data type issues may prevent accurate processing, reporting, and model development."
    },

    "outlier": {
        "No Issue": "No significant outliers detected.",
        "Low": "A few outliers are present with minimal impact on analysis.",
        "Medium": "Outliers may influence statistical summaries and analytical results.",
        "High": "Significant outliers may distort business insights and predictive models.",
        "Critical": "Extreme outliers seriously reduce data reliability and require immediate investigation."
    }
}


# ----------------------------
# Recommendation Messages
# ----------------------------

RECOMMENDATIONS = {
    "missing": {
        "No Issue": "No action required.",
        "Low": "Monitor the missing values and review whether the affected columns are important.",
        "Medium": "Investigate the reason for missing values and consider appropriate handling before analysis.",
        "High": "Resolve missing values before making business decisions or training machine learning models.",
        "Critical": "Immediately investigate and address the missing data before using the dataset."
    },

    "duplicate": {
        "No Issue": "No action required.",
        "Low": "Review duplicate records and confirm whether they are expected.",
        "Medium": "Investigate duplicate records and determine whether they should be removed or merged.",
        "High": "Resolve duplicate records before performing reporting or analysis.",
        "Critical": "Immediately investigate duplicate records to prevent misleading business results."
    },

    "datatype": {
        "No Issue": "No action required.",
        "Low": "Review minor data type inconsistencies.",
        "Medium": "Correct invalid data types before performing calculations or analysis.",
        "High": "Validate and correct data types before generating reports or training models.",
        "Critical": "Immediately resolve critical data type issues before processing the dataset."
    },

    "outlier": {
        "No Issue": "No action required.",
        "Low": "Review outliers to determine whether they are expected observations.",
        "Medium": "Investigate outliers before performing statistical analysis.",
        "High": "Analyze extreme values to determine whether they represent genuine observations or data quality issues.",
        "Critical": "Immediately investigate extreme outliers before using the dataset for reporting or machine learning."
    }
}



def assign_severity(missing_percentage):
    if missing_percentage == 0:
        return "No Issue"
    
    elif missing_percentage <= LOW_THRESHOLD:
        return "Low"

    elif missing_percentage <= MEDIUM_THRESHOLD:
        return "Medium"

    elif missing_percentage <= HIGH_THRESHOLD:
        return "High"
    
    else:
        return "Critical"


def generate_business_impact(issue_type,severity):
    return BUSINESS_IMPACTS.get(issue_type,{}).get(
        severity,"Business impact not available."
    )

def generate_recommendation(issue_type,severity):
    return RECOMMENDATIONS.get(issue_type,{}).get(
        severity,"Recommendation not available."
    )