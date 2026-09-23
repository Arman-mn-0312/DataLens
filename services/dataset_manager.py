import os
from threading import RLock
import pandas as pd
from werkzeug.utils import secure_filename
from services.upload_storage import get_user_upload_path

class DatasetManager:
    _sessions = {}
    _locks = {}
    _sessions_lock = RLock()

    @staticmethod
    def parse_csv_file(filepath):
        """Parse a CSV using the primary and compatibility pandas engines."""
        try:
            try:
                return pd.read_csv(filepath), None
            except Exception:
                return pd.read_csv(filepath, engine="python"), None
        except Exception as exc:
            return None, f"Failed to parse CSV file: {str(exc)}"

    @staticmethod
    def _update_session(session, filename, df):
        session["active_filename"] = filename
        session["active_df"] = df
        session["metadata"] = {
            "filename": filename,
            "rows": len(df),
            "columns": len(df.columns),
            "numeric_columns": len(df.select_dtypes(include=["number"]).columns),
            "categorical_columns": len(df.select_dtypes(include=["object", "category"]).columns),
            "datetime_columns": len(df.select_dtypes(include=["datetime"]).columns),
            "memory_usage_mb": round(df.memory_usage(deep=True).sum() / (1024 * 1024), 2)
        }

    @classmethod
    def activate_dataframe(cls, filename, df, session_key=None):
        """Set a parsed and validated upload as the user's active dataset."""
        clean_filename = secure_filename(filename)
        if not clean_filename:
            return None, "Invalid filename parameter."
        _, session, lock = cls._get_session(session_key)
        with lock:
            cls._update_session(session, clean_filename, df)
        return df, None

    @classmethod
    def _get_session(cls, session_key):
        key = session_key or "default"
        with cls._sessions_lock:
            if key not in cls._sessions:
                cls._sessions[key] = {
                    "active_filename": None,
                    "active_df": None,
                    "metadata": None,
                }
            if key not in cls._locks:
                cls._locks[key] = RLock()
            return key, cls._sessions[key], cls._locks[key]

    @classmethod
    def load_dataset(cls, filename, session_key=None):
        """
        Load dataset from disk into memory if not already active.
        Reuse cached DataFrame if already active.
        """
        if not filename:
            return None, "Filename parameter is required."

        clean_filename = secure_filename(filename)
        if not clean_filename:
            return None, "Invalid filename parameter."

        _, session, lock = cls._get_session(session_key)
        with lock:
            # Return cached DataFrame if matching active filename
            if session["active_filename"] == clean_filename and session["active_df"] is not None:
                return session["active_df"], None

            filepath = get_user_upload_path(clean_filename, session_key)
            if not os.path.exists(filepath):
                return None, f"File '{filename}' not found."

            df, err = cls.parse_csv_file(filepath)
            if err:
                cls.clear_cache(session_key)
                return None, err

            cls._update_session(session, clean_filename, df)
            return df, None

    @classmethod
    def get_preview_payload(cls, filesize_str=None, session_key=None):
        _, session, lock = cls._get_session(session_key)
        with lock:
            df = session["active_df"]
            if df is None:
                return None
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
            meta = session["metadata"] or {}
            return {
                "filename": session["active_filename"],
                "filesize": filesize_str or f"{meta.get('memory_usage_mb', 0)} MB",
                "uploadedAt": "Just now",
                "totalRows": len(df),
                "columns": columns,
                "rows": preview_rows
            }

    @classmethod
    def get_dataframe(cls, filename=None, session_key=None):
        """
        Retrieve active DataFrame or load from disk if necessary.
        """
        if filename:
            return cls.load_dataset(filename, session_key)
        _, session, lock = cls._get_session(session_key)
        with lock:
            if session["active_df"] is not None:
                return session["active_df"], None
        return None, "No active dataset loaded."

    @classmethod
    def get_metadata(cls, session_key=None):
        """
        Retrieve cached metadata for the active dataset.
        """
        _, session, lock = cls._get_session(session_key)
        with lock:
            return session["metadata"]

    @classmethod
    def get_active_filename(cls, session_key=None):
        _, session, lock = cls._get_session(session_key)
        with lock:
            return session["active_filename"]

    @classmethod
    def clear_cache(cls, session_key=None):
        """
        Clear active dataset and metadata from memory.
        """
        _, session, lock = cls._get_session(session_key)
        with lock:
            session["active_filename"] = None
            session["active_df"] = None
            session["metadata"] = None
