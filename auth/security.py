import os
from datetime import datetime, timedelta, timezone
from typing import Any

import jwt
from flask import g, jsonify, request
from werkzeug.exceptions import Unauthorized


def get_jwt_secret() -> str:
    secret = (
        os.getenv("JWT_SECRET_KEY")
        or os.getenv("FLASK_SECRET_KEY")
    )
    if not secret:
        import warnings
        warnings.warn(
            "JWT_SECRET_KEY is not set. Using an insecure development default. "
            "Set JWT_SECRET_KEY in your .env file for production.",
            stacklevel=2,
        )
        secret = "datalens-dev-secret-change-me"
    return secret


def create_access_token(user_id: str, provider: str = "local") -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user_id),
        "provider": provider,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(hours=12)).timestamp()),
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm="HS256")


def decode_access_token(token: str) -> dict[str, Any] | None:
    try:
        return jwt.decode(token, get_jwt_secret(), algorithms=["HS256"])
    except jwt.PyJWTError:
        return None


def get_auth_token_from_request() -> str | None:
    auth_header = request.headers.get("Authorization", "")
    if not auth_header:
        return None
    parts = auth_header.split(" ", 1)
    if len(parts) != 2 or parts[0].lower() != "bearer":
        return None
    token = parts[1].strip()
    return token or None


def get_current_user_from_request() -> dict[str, Any] | None:
    token = get_auth_token_from_request()
    if not token:
        return None
    payload = decode_access_token(token)
    if not payload:
        return None
    return payload


def require_auth(view_func):
    def wrapped(*args, **kwargs):
        try:
            user_payload = get_current_user_from_request()
            if not user_payload:
                return jsonify({"success": False, "message": "Authentication required."}), 401
            g.current_user = user_payload
            return view_func(*args, **kwargs)
        except Exception:
            return jsonify({"success": False, "message": "Authentication required."}), 401

    wrapped.__name__ = view_func.__name__
    wrapped.__doc__ = view_func.__doc__
    return wrapped
