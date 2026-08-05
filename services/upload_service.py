import os
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


def save_uploaded_file(file):

    if not allowed_file(file.filename):
        return None

    filename = secure_filename(file.filename)

    filepath = os.path.join(
        UPLOAD_FOLDER,
        filename
    )

    os.makedirs(UPLOAD_FOLDER, exist_ok=True)

    file.save(filepath)

    return filepath