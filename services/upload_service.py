import os
import tempfile
from werkzeug.utils import secure_filename

from config.upload_config import (
    ALLOWED_EXTENSIONS
)
from services.upload_storage import get_user_upload_dir


def allowed_file(filename):
    return (
        "." in filename and
        filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS
    )


def save_uploaded_file(file, staging=False, session_key=None):

    if not allowed_file(file.filename):
        return None

    filename = secure_filename(file.filename)

    user_upload_dir = get_user_upload_dir(session_key)
    if staging:
        descriptor, filepath = tempfile.mkstemp(prefix=".datalens-upload-", suffix=".tmp", dir=user_upload_dir)
        os.close(descriptor)
    else:
        filepath = os.path.join(user_upload_dir, filename)

    try:
        file.save(filepath)
    except Exception:
        if staging and os.path.exists(filepath):
            os.remove(filepath)
        raise

    return filepath
