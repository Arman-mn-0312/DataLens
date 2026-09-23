import os
import tempfile
from werkzeug.utils import secure_filename

from config.upload_config import (
    UPLOAD_FOLDER,
    ALLOWED_EXTENSIONS
)


def allowed_file(filename):
    return (
        "." in filename and
        filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS
    )


def save_uploaded_file(file, staging=False):

    if not allowed_file(file.filename):
        return None

    filename = secure_filename(file.filename)

    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    if staging:
        descriptor, filepath = tempfile.mkstemp(prefix=".datalens-upload-", suffix=".tmp", dir=UPLOAD_FOLDER)
        os.close(descriptor)
    else:
        filepath = os.path.join(UPLOAD_FOLDER, filename)

    try:
        file.save(filepath)
    except Exception:
        if staging and os.path.exists(filepath):
            os.remove(filepath)
        raise

    return filepath
