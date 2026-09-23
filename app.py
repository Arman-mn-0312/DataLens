import os
import logging
import uuid
from logging.handlers import RotatingFileHandler
from pathlib import Path

from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from authlib.integrations.flask_client import OAuth
from werkzeug.exceptions import HTTPException
from config.upload_config import MAX_CONTENT_LENGTH

load_dotenv()

from routes.api import api
from routes.auth import auth_bp

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = MAX_CONTENT_LENGTH

BASE_DIR = Path(__file__).resolve().parent
LOG_DIR = BASE_DIR / "logs"
LOG_DIR.mkdir(exist_ok=True)

logger = logging.getLogger("datalens")
logger.setLevel(logging.INFO)
logger.propagate = False
if not logger.handlers:
    log_formatter = logging.Formatter(
        "%(asctime)s %(levelname)s %(name)s %(message)s"
    )

    file_handler = RotatingFileHandler(
        LOG_DIR / "app.log",
        maxBytes=10 * 1024 * 1024,
        backupCount=5,
        encoding="utf-8",
    )
    file_handler.setFormatter(log_formatter)
    logger.addHandler(file_handler)

    console_handler = logging.StreamHandler()
    console_handler.setFormatter(log_formatter)
    logger.addHandler(console_handler)

app.config["SECRET_KEY"] = os.getenv("FLASK_SECRET_KEY") or os.getenv("JWT_SECRET_KEY", "development-secret")
app.config["SESSION_COOKIE_HTTPONLY"] = True
app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
# Allow both localhost and 127.0.0.1 variants for dev
_cors_origins = list({frontend_url, frontend_url.replace("localhost", "127.0.0.1"), frontend_url.replace("127.0.0.1", "localhost")})

CORS(
    app,
    resources={
        r"/auth/*": {"origins": _cors_origins},
        r"/reports/*": {"origins": _cors_origins},
        r"/upload": {"origins": _cors_origins},
        r"/reports/generate/*": {"origins": _cors_origins},
    },
    supports_credentials=True,
)

oauth = OAuth()
oauth.init_app(app)

app.register_blueprint(api)
app.register_blueprint(auth_bp)


@app.errorhandler(413)
def handle_upload_too_large(_error):
    return jsonify({
        "success": False,
        "message": f"CSV file exceeds the {MAX_CONTENT_LENGTH // (1024 * 1024)} MB upload limit.",
    }), 413


@app.errorhandler(Exception)
def handle_unexpected_exception(error):
    if isinstance(error, HTTPException):
        return error

    error_id = uuid.uuid4().hex[:8]
    logger.exception(
        "Unhandled exception error_id=%s method=%s path=%s query=%s filename=%s",
        error_id,
        request.method,
        request.path,
        request.query_string.decode("utf-8", errors="replace"),
        request.args.get("filename") or request.args.get("file"),
    )
    return jsonify({
        "success": False,
        "message": "Internal server error",
        "error_id": error_id,
    }), 500


@app.after_request
def add_security_headers(response):
    response.headers.setdefault("Referrer-Policy", "no-referrer")
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("X-Frame-Options", "DENY")
    if request.path.startswith("/auth/"):
        response.headers["Cache-Control"] = "no-store"
    return response

if __name__ == "__main__":
    debug = os.getenv("FLASK_DEBUG", "0").lower() in {"1", "true", "yes"}
    # threaded=True is required on Python 3.14+ where the single-threaded
    # Werkzeug dev server deadlocks — accepting TCP connections but never
    # processing requests, causing all frontend fetch() calls to hang.
    app.run(debug=debug, host="0.0.0.0", port=5000, threaded=True)
