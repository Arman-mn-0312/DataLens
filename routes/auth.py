import os
import secrets
from urllib.parse import quote

from authlib.integrations.flask_client import OAuth
from flask import Blueprint, current_app, jsonify, redirect, request, session

from auth.repository import AuthenticationPersistenceError
from auth.service import AuthService
from auth.security import get_auth_token_from_request

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")
auth_service = AuthService()

def get_frontend_callback_url() -> str:
    return os.getenv("FRONTEND_URL", "http://localhost:3000")


def get_google_redirect_uri() -> str:
    return os.getenv("GOOGLE_REDIRECT_URI", "http://127.0.0.1:5000/auth/google/callback")


@auth_bp.route("/register", methods=["POST"])
def register_user():
    payload = request.get_json(silent=True) or {}
    name = payload.get("name")
    email = payload.get("email")
    password = payload.get("password")
    try:
        result, status = auth_service.register_user(name, email, password)
    except AuthenticationPersistenceError as exc:
        return jsonify({"success": False, "message": str(exc)}), 503
    return jsonify(result), status


@auth_bp.route("/login", methods=["POST"])
def login_user():
    payload = request.get_json(silent=True) or {}
    email = payload.get("email")
    password = payload.get("password")
    try:
        result, status = auth_service.login_user(email, password)
    except AuthenticationPersistenceError as exc:
        return jsonify({"success": False, "message": str(exc)}), 503
    return jsonify(result), status


@auth_bp.route("/logout", methods=["POST"])
def logout_user():
    return jsonify({"success": True, "message": "Logged out successfully."})


@auth_bp.route("/me", methods=["GET"])
def current_user():
    token = get_auth_token_from_request()
    if not token:
        return jsonify({"success": False, "message": "Authentication required."}), 401

    try:
        user = auth_service.get_user_by_token(token)
    except AuthenticationPersistenceError as exc:
        return jsonify({"success": False, "message": str(exc)}), 503
    if not user:
        return jsonify({"success": False, "message": "Authentication required."}), 401

    return jsonify({"success": True, "user": auth_service._safe_user(user)}), 200


@auth_bp.route("/google/login", methods=["GET"])
def google_login():
    try:
        from auth.oidc import get_google_oauth

        oauth = OAuth()
        oauth.init_app(current_app)
        google = get_google_oauth(oauth)
        state = secrets.token_urlsafe(32)
        nonce = secrets.token_urlsafe(32)
        session["oauth_state"] = state
        session["oauth_nonce"] = nonce
        redirect_uri = get_google_redirect_uri()
        return google.authorize_redirect(redirect_uri, state=state, nonce=nonce)
    except RuntimeError as exc:
        return jsonify({"success": False, "message": str(exc)}), 500


@auth_bp.route("/google/callback", methods=["GET"])
def google_callback():
    try:
        from auth.oidc import get_google_oauth

        oauth = OAuth()
        oauth.init_app(current_app)
        google = get_google_oauth(oauth)
        state = request.args.get("state")
        stored_state = session.pop("oauth_state", None)
        if not state or state != stored_state:
            return redirect(f"{get_frontend_callback_url()}/auth/google/callback?error=invalid_state")

        token = google.authorize_access_token()
        user_info = google.userinfo()
        provider_user_id = str(user_info.get("sub") or user_info.get("id") or "")
        email = user_info.get("email")
        result, _ = auth_service.find_or_create_google_user({
            "name": user_info.get("name") or (email.split("@")[0] if email else "Google User"),
            "email": email,
            "provider_user_id": provider_user_id,
        })

        if not result.get("success"):
            params = "?error=" + result.get("message", "google_auth_failed").replace(" ", "+")
            return redirect(f"{get_frontend_callback_url()}/auth/google/callback{params}")

        frontend_target = (
            f"{get_frontend_callback_url()}/auth/google/callback"
            f"#token={quote(result['token'], safe='')}"
        )
        return redirect(frontend_target)
    except Exception as exc:
        return redirect(f"{get_frontend_callback_url()}/auth/google/callback?error={str(exc).replace(' ', '+')}")
