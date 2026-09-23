import warnings
import numpy as np
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
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
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
    _, type_counts = classify_column(column)

    # Return the most common datatype
    return max(type_counts, key=lambda t: type_counts.get(t, 0))


def classify_column(column):
    """Classify values in batches while preserving the existing checker order."""
    column = column.dropna()
    type_counts = {type_name: 0 for type_name in TYPE_CHECKERS}
    if column.empty:
        return [], type_counts
    scalar_values = list(column)

    if pd.api.types.is_numeric_dtype(column.dtype) or pd.api.types.is_bool_dtype(column.dtype):
        type_counts["Numeric"] = len(column)
        return ["Numeric"] * len(column), type_counts
    if pd.api.types.is_datetime64_any_dtype(column.dtype):
        type_counts["Datetime"] = len(column)
        return ["Datetime"] * len(column), type_counts

    # Categorical columns often contain only a handful of distinct values.
    # Classify each distinct value once, then expand the result to the column.
    try:
        value_codes, unique_values = pd.factorize(column, sort=False)
    except TypeError:
        value_codes, unique_values = None, None
    cardinality_limit = min(64, max(4, len(column) // 50))
    if value_codes is not None and len(unique_values) <= cardinality_limit:
        unique_classes = []
        for value in unique_values:
            for type_name, checker in TYPE_CHECKERS.items():
                if checker(value):
                    unique_classes.append(type_name)
                    break
            else:
                unique_classes.append(None)

        classes = np.empty(len(column), dtype=object)
        for code, type_name in enumerate(unique_classes):
            classes[value_codes == code] = type_name
        type_counts = {
            type_name: int((classes == type_name).sum())
            for type_name in TYPE_CHECKERS
        }
        return classes.tolist(), type_counts

    # Numeric coercion handles the common case in C/vectorized code. Keep the
    # existing scalar checker for values coercion marks as missing: pandas can
    # successfully parse strings such as "" or "NaN" as NaN, and the legacy
    # checker counted those as numeric because parsing did not raise.
    normalized = column.astype(str).str.strip()
    numeric_input = normalized.copy()
    for symbol in DATA_TYPE_CONFIG["currency_symbols"]:
        numeric_input = numeric_input.str.replace(symbol, "", regex=False)
    for character in DATA_TYPE_CONFIG["remove_characters"]:
        numeric_input = numeric_input.str.replace(character, "", regex=False)

    numeric_mask = pd.to_numeric(numeric_input, errors="coerce").notna().to_numpy(copy=True)
    boolean_tokens = normalized.str.lower().isin(DATA_TYPE_CONFIG["boolean_values"]).to_numpy()
    for position in np.flatnonzero(boolean_tokens):
        numeric_mask[position] = is_numeric(scalar_values[position])
    ambiguous = np.flatnonzero(~numeric_mask)
    numeric_results: dict[tuple[type, str], bool] = {}
    for position in ambiguous:
        value = scalar_values[position]
        # Python bool is an int subclass and was numeric in the old checker.
        if isinstance(value, (int, float)):
            numeric_mask[position] = True
            continue
        cache_key = (type(value), str(value))
        if cache_key not in numeric_results:
            numeric_results[cache_key] = is_numeric(value)
        numeric_mask[position] = numeric_results[cache_key]

    remaining_positions = np.flatnonzero(~numeric_mask)
    datetime_mask = np.zeros(len(column), dtype=bool)
    if len(remaining_positions):
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            parsed_dates = pd.to_datetime(
                column.iloc[remaining_positions], errors="coerce", format="mixed"
            )
        parsed_date_values = parsed_dates.notna().to_numpy()
        datetime_mask[remaining_positions] = parsed_date_values

        # The scalar legacy parser treated successfully parsed NaT strings
        # (for example "NaN") as dates because it only checked for exceptions.
        # Recheck only vector-parse failures, memoized by value to keep common
        # repeated text columns inexpensive.
        ambiguous_dates = remaining_positions[~parsed_date_values]
        date_results: dict[tuple[type, str], bool] = {}
        for position in ambiguous_dates:
            value = scalar_values[position]
            cache_key = (type(value), str(value))
            if cache_key not in date_results:
                date_results[cache_key] = is_datetime(value)
            datetime_mask[position] = date_results[cache_key]

    boolean_mask = np.zeros(len(column), dtype=bool)
    remaining_positions = np.flatnonzero(~(numeric_mask | datetime_mask))
    if len(remaining_positions):
        boolean_mask[remaining_positions] = column.iloc[remaining_positions].map(is_boolean).to_numpy()

    classes = np.full(len(column), "Text", dtype=object)
    classes[numeric_mask] = "Numeric"
    classes[datetime_mask] = "Datetime"
    classes[boolean_mask] = "Boolean"
    type_counts = {type_name: int((classes == type_name).sum()) for type_name in TYPE_CHECKERS}
    return classes.tolist(), type_counts





# ==========================================
# calculate type confidence
# ==========================================


def calculate_type_confidence(column, classifications=None):
    column = column.dropna()

    # Handle empty column
    if len(column) == 0:
        return 0.0

    if classifications is None:
        _, type_counts = classify_column(column)
    else:
        type_counts = {type_name: classifications.count(type_name) for type_name in TYPE_CHECKERS}

    highest_count = max(type_counts.values())

    confidence = (highest_count / len(column)) * 100

    return round(confidence, 2)





# ==========================================
# calculate type confidence
# ==========================================

def calculate_invalid_values(column, detected_type=None, classifications=None):
    column = column.dropna()

    if detected_type is None:
        detected_type = detect_column_type(column)

    if classifications is not None:
        return sum(classification != detected_type for classification in classifications)

    # Get the corresponding checker function
    checker = TYPE_CHECKERS[detected_type]

    invalid_count = 0

    # Check every value
    for value in column:

        if not checker(value):
            invalid_count += 1

    return invalid_count
