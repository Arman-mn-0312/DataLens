import os
import pandas as pd
from werkzeug.utils import secure_filename
from config.upload_config import UPLOAD_FOLDER

class DatasetManager:
    _active_filename = None
    _active_df = None
    _metadata = None

    @classmethod
    def load_dataset(cls, filename):
        """
        Load dataset from disk into memory if not already active.
        Reuse cached DataFrame if already active.
        """
        if not filename:
            return None, "Filename parameter is required."

        clean_filename = secure_filename(filename)
        if not clean_filename:
            return None, "Invalid filename parameter."

        # Return cached DataFrame if matching active filename
        if cls._active_filename == clean_filename and cls._active_df is not None:
            return cls._active_df, None

        filepath = os.path.join(UPLOAD_FOLDER, clean_filename)
        if not os.path.exists(filepath):
            return None, f"File '{filename}' not found."

        try:
            try:
                df = pd.read_csv(filepath)
            except Exception:
                df = pd.read_csv(filepath, engine="python")

            cls._active_filename = clean_filename
            cls._active_df = df
            cls._metadata = {
                "filename": clean_filename,
                "rows": len(df),
                "columns": len(df.columns),
                "numeric_columns": len(df.select_dtypes(include=["number"]).columns),
                "categorical_columns": len(df.select_dtypes(include=["object", "category"]).columns),
                "datetime_columns": len(df.select_dtypes(include=["datetime"]).columns),
                "memory_usage_mb": round(df.memory_usage(deep=True).sum() / (1024 * 1024), 2)
            }
            return df, None
        except Exception as e:
            cls.clear_cache()
            return None, f"Failed to parse CSV file: {str(e)}"

    @classmethod
    def get_preview_payload(cls, filesize_str=None):
        if cls._active_df is None:
            return None
        df = cls._active_df
        sample_df = df.head(10)
        preview_rows = []
        for record in sample_df.to_dict(orient="records"):
            clean_record = {}
            for k, v in record.items():
                if pd.isna(v):
                    clean_record[str(k)] = None
                elif isinstance(v, (int, float)) and not isinstance(v, bool):
                    clean_record[str(k)] = round(float(v), 4) if isinstance(v, float) else int(v)
                else:
                    clean_record[str(k)] = str(v)
            preview_rows.append(clean_record)

        columns = [{"name": str(col)} for col in df.columns]

        meta = cls._metadata or {}
        return {
            "filename": cls._active_filename,
            "filesize": filesize_str or f"{meta.get('memory_usage_mb', 0)} MB",
            "uploadedAt": "Just now",
            "totalRows": len(df),
            "columns": columns,
            "rows": preview_rows
        }

    @classmethod
    def get_dataframe(cls, filename=None):
        """
        Retrieve active DataFrame or load from disk if necessary.
        """
        if filename:
            return cls.load_dataset(filename)
        if cls._active_df is not None:
            return cls._active_df, None
        return None, "No active dataset loaded."

    @classmethod
    def get_metadata(cls):
        """
        Retrieve cached metadata for the active dataset.
        """
        return cls._metadata

    @classmethod
    def get_active_filename(cls):
        return cls._active_filename

    @classmethod
    def clear_cache(cls):
        """
        Clear active dataset and metadata from memory.
        """
        cls._active_filename = None
        cls._active_df = None
        cls._metadata = None
