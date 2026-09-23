from werkzeug.utils import secure_filename
from threading import RLock


class ReportCacheService:
    _sessions = {}
    _locks = {}
    _sessions_lock = RLock()

    @classmethod
    def _get_session(cls, session_key):
        key = session_key or "default"
        with cls._sessions_lock:
            if key not in cls._sessions:
                cls._sessions[key] = {"cache": {}, "cached_filename": None}
            if key not in cls._locks:
                cls._locks[key] = RLock()
            return cls._sessions[key], cls._locks[key]

    @classmethod
    def get_report(cls, report_key, filename=None, session_key=None):
        """
        Retrieve cached report response payload for a given report key and filename.
        """
        session, lock = cls._get_session(session_key)
        with lock:
            clean_filename = secure_filename(filename) if filename else None
            if clean_filename and session["cached_filename"] != clean_filename:
                return None
            return session["cache"].get(report_key)

    @classmethod
    def set_report(cls, report_key, payload, filename=None, session_key=None):
        """
        Cache a generated report response payload.
        """
        session, lock = cls._get_session(session_key)
        with lock:
            clean_filename = secure_filename(filename) if filename else None
            if clean_filename and session["cached_filename"] != clean_filename:
                session["cache"].clear()
                session["cached_filename"] = clean_filename
            session["cache"][report_key] = payload

    @classmethod
    def has_report(cls, report_key, filename=None, session_key=None):
        """
        Check if a report is present in cache.
        """
        session, lock = cls._get_session(session_key)
        with lock:
            clean_filename = secure_filename(filename) if filename else None
            if clean_filename and session["cached_filename"] != clean_filename:
                return False
            return report_key in session["cache"]

    @classmethod
    def clear_cache(cls, session_key=None):
        """
        Clear all cached reports.
        """
        session, lock = cls._get_session(session_key)
        with lock:
            session["cache"].clear()
            session["cached_filename"] = None

