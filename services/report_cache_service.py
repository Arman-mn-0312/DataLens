from werkzeug.utils import secure_filename


class ReportCacheService:
    _cache = {}
    _cached_filename = None

    @classmethod
    def get_report(cls, report_key, filename=None):
        """
        Retrieve cached report response payload for a given report key and filename.
        """
        clean_filename = secure_filename(filename) if filename else None
        if clean_filename and cls._cached_filename != clean_filename:
            return None
        return cls._cache.get(report_key)

    @classmethod
    def set_report(cls, report_key, payload, filename=None):
        """
        Cache a generated report response payload.
        """
        clean_filename = secure_filename(filename) if filename else None
        if clean_filename:
            if cls._cached_filename != clean_filename:
                cls.clear_cache()
                cls._cached_filename = clean_filename
        cls._cache[report_key] = payload

    @classmethod
    def has_report(cls, report_key, filename=None):
        """
        Check if a report is present in cache.
        """
        clean_filename = secure_filename(filename) if filename else None
        if clean_filename and cls._cached_filename != clean_filename:
            return False
        return report_key in cls._cache

    @classmethod
    def clear_cache(cls):
        """
        Clear all cached reports.
        """
        cls._cache.clear()
        cls._cached_filename = None

