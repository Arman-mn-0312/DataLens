import hashlib
import os
from werkzeug.utils import secure_filename

from config.upload_config import UPLOAD_FOLDER


def get_user_upload_dir(session_key=None):
    """Return an isolated upload directory without storing raw user IDs in paths."""
    key = str(session_key or "default").encode("utf-8")
    directory = os.path.join(UPLOAD_FOLDER, hashlib.sha256(key).hexdigest())
    os.makedirs(directory, exist_ok=True)
    return directory


def get_user_upload_path(filename, session_key=None):
    clean_filename = secure_filename(filename or "")
    if not clean_filename:
        return None
    return os.path.join(get_user_upload_dir(session_key), clean_filename)
