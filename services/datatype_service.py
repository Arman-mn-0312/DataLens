import pandas as pd
from config.datatype_config import DATA_TYPE_CONFIG


# ==========================================
# Numeric Checker
# ==========================================

def is_numeric(value):
    """
    Supports:
    - Integers
    - Floats
    - Negative numbers
    - Numeric strings
    - Currency values
    - Percentage values
    - Comma separated numbers
    """

    # Ignore missing values
    if pd.isna(value):
        return False

    # Already numeric
    if isinstance(value, (int, float)):
        return True

    # Convert to string
    value = str(value).strip()

    # Remove currency symbols
    for symbol in DATA_TYPE_CONFIG["currency_symbols"]:
        value = value.replace(symbol, "")

    # Remove formatting characters
    for character in DATA_TYPE_CONFIG["remove_characters"]:
        value = value.replace(character, "")

    try:
        pd.to_numeric(value)
        return True
    except (ValueError, TypeError):
        return False



# ==========================================
# datetime Checker
# ==========================================


def is_datetime(value):
    # Ignore missing values
    if pd.isna(value):
        return False

    # Numeric values should not be treated as dates
    if is_numeric(value):
        return False

    try:
        pd.to_datetime(value)
        return True
    except (ValueError, TypeError):
        return False




# ==========================================
# boolrsn Checker
# ==========================================

def is_boolean(value):
    # Ignore missing values
    if pd.isna(value):
        return False

    # Handle Python bool type
    if isinstance(value, bool):
        return True

    # Convert to lowercase string
    value = str(value).strip().lower()

    return value in DATA_TYPE_CONFIG["boolean_values"]




# ==========================================
# Text Checker
# ==========================================

def is_text(value):
    # Ignore missing values
    if pd.isna(value):
        return False

    # Any value that belongs to another supported type
    # should not be treated as text.
    if is_numeric(value):
        return False

    if is_datetime(value):
        return False

    if is_boolean(value):
        return False

    return True





# ==========================================
# Type Checker
# ==========================================



TYPE_CHECKERS = {
    "Numeric": is_numeric,
    "Datetime": is_datetime,
    "Boolean": is_boolean,
    "Text": is_text
}





# ==========================================
# Detect column type
# ==========================================

def detect_column_type(column):
    # Remove missing values
    column = column.dropna()

    # Initialize counters
    type_counts = {
        type_name: 0
        for type_name in TYPE_CHECKERS
    }

    # Check every value
    for value in column:

        for type_name, checker in TYPE_CHECKERS.items():

            if checker(value):
                type_counts[type_name] += 1
                break

    # Return the most common datatype
    return max(type_counts, key=type_counts.get)





# ==========================================
# calculate type confidence
# ==========================================


def calculate_type_confidence(column):
    # Remove missing values
    column = column.dropna()

    # Handle empty column
    if len(column) == 0:
        return 0.0

    # Count each datatype
    type_counts = {
        type_name: 0
        for type_name in TYPE_CHECKERS
    }

    for value in column:

        for type_name, checker in TYPE_CHECKERS.items():

            if checker(value):
                type_counts[type_name] += 1
                break

    highest_count = max(type_counts.values())

    confidence = (highest_count / len(column)) * 100

    return round(confidence, 2)





# ==========================================
# calculate type confidence
# ==========================================

def calculate_invalid_values(column):
    # Remove missing values
    column = column.dropna()

    # Detect the expected datatype
    detected_type = detect_column_type(column)

    # Get the corresponding checker function
    checker = TYPE_CHECKERS[detected_type]

    invalid_count = 0

    # Check every value
    for value in column:

        if not checker(value):
            invalid_count += 1

    return invalid_count