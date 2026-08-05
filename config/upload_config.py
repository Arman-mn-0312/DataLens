import os

UPLOAD_FOLDER = os.path.join(os.getcwd(), "uploads")

ALLOWED_EXTENSIONS = {"csv"}

MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16 MB