import logging
import os
import threading
import time

from config.upload_config import (
    UPLOAD_CLEANUP_INTERVAL_SECONDS,
    UPLOAD_FOLDER,
    UPLOAD_TTL_HOURS,
)

logger = logging.getLogger("datalens.upload_cleanup")
_worker_lock = threading.Lock()
_worker_started = False


def cleanup_expired_uploads(now=None):
    """Delete old upload and staging files; leave unrelated runtime files alone."""
    if not os.path.isdir(UPLOAD_FOLDER):
        return 0
    cutoff = (now if now is not None else time.time()) - UPLOAD_TTL_HOURS * 3600
    removed = 0
    for root, directories, filenames in os.walk(UPLOAD_FOLDER, topdown=False):
        for filename in filenames:
            path = os.path.join(root, filename)
            try:
                if os.path.isfile(path) and os.path.getmtime(path) < cutoff:
                    os.remove(path)
                    removed += 1
            except FileNotFoundError:
                pass
            except OSError:
                logger.warning("Could not remove expired upload %s", path, exc_info=True)
        for directory in directories:
            path = os.path.join(root, directory)
            try:
                os.rmdir(path)
            except OSError:
                pass
    return removed


def touch_upload(filename, session_key=None):
    from services.upload_storage import get_user_upload_path

    path = get_user_upload_path(filename, session_key)
    if path and os.path.isfile(path):
        try:
            os.utime(path, None)
        except OSError:
            logger.debug("Could not refresh upload activity time", exc_info=True)


def start_upload_cleanup_worker():
    """Start a small process-local janitor; safe if imported more than once."""
    global _worker_started
    with _worker_lock:
        if _worker_started:
            return
        _worker_started = True

    def run():
        while True:
            try:
                removed = cleanup_expired_uploads()
                if removed:
                    logger.info("Removed %s expired upload file(s)", removed)
            except Exception:
                logger.exception("Upload cleanup pass failed")
            time.sleep(UPLOAD_CLEANUP_INTERVAL_SECONDS)

    threading.Thread(target=run, name="datalens-upload-cleanup", daemon=True).start()
