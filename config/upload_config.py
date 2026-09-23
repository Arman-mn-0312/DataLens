import os

# User uploads are temporary runtime data. Keep them outside the source tree and
# allow deployments to mount a persistent writable volume at a custom location.
DATA_FOLDER = os.path.abspath(
    os.getenv("DATALENS_DATA_DIR")
    or os.path.join(os.path.dirname(os.path.dirname(__file__)), "instance", "datalens_data")
)
UPLOAD_FOLDER = os.path.join(DATA_FOLDER, "uploads")
UPLOAD_TTL_HOURS = max(1, int(os.getenv("DATALENS_UPLOAD_TTL_HOURS", "24")))
UPLOAD_CLEANUP_INTERVAL_SECONDS = max(60, int(os.getenv("DATALENS_UPLOAD_CLEANUP_INTERVAL_SECONDS", "900")))

ALLOWED_EXTENSIONS = {"csv"}

MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16 MB
