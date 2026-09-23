from __future__ import annotations

import re
from datetime import datetime, timezone
from typing import Any

import bcrypt

from auth.repository import UserRepository, normalize_email
from auth.security import create_access_token


class AuthService:
    def __init__(self, repository: UserRepository | None = None):
        self.repository = repository or UserRepository()

    def _safe_user(self, user: dict[str, Any]) -> dict[str, Any]:
        user_id = str(user.get("_id"))
        return {
            "id": user_id,
            "name": user.get("name"),
            "email": user.get("email"),
            "auth_provider": user.get("auth_provider", "local"),
            "created_at": user.get("created_at"),
            "updated_at": user.get("updated_at"),
        }

    def validate_email(self, email: str | None) -> str:
        normalized = normalize_email(email)
        if not normalized:
            raise ValueError("Email is required.")
        if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", normalized):
            raise ValueError("Please provide a valid email address.")
        return normalized

    def validate_password(self, password: str | None) -> str:
        if not password or len(password) < 8:
            raise ValueError("Password must be at least 8 characters long.")
        if not re.search(r"[A-Za-z]", password) or not re.search(r"\d", password):
            raise ValueError("Password must contain letters and numbers.")
        return password

    def register_user(self, name: str | None, email: str | None, password: str | None) -> tuple[dict[str, Any], int]:
        clean_name = (name or "").strip()
        if not clean_name:
            return {"success": False, "message": "Name is required."}, 400

        try:
            normalized_email = self.validate_email(email)
            validated_password = self.validate_password(password)
        except ValueError as exc:
            return {"success": False, "message": str(exc)}, 400

        if self.repository.find_by_email(normalized_email):
            return {"success": False, "message": "An account with this email already exists."}, 409

        now = datetime.now(timezone.utc).isoformat()
        user_document = {
            "name": clean_name,
            "email": normalized_email,
            "email_normalized": normalized_email,
            "password_hash": bcrypt.hashpw(validated_password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8"),
            "auth_provider": "local",
            "provider_user_id": None,
            "created_at": now,
            "updated_at": now,
        }
        saved = self.repository.create_user(user_document)
        token = create_access_token(str(saved.get("_id")), provider="local")
        return {
            "success": True,
            "message": "Registration successful.",
            "token": token,
            "user": self._safe_user(saved),
        }, 201

    def login_user(self, email: str | None, password: str | None) -> tuple[dict[str, Any], int]:
        try:
            normalized_email = self.validate_email(email)
        except ValueError as exc:
            return {"success": False, "message": str(exc)}, 400

        user = self.repository.find_by_email(normalized_email)

        password_hash = user.get("password_hash") if user else None
        if not user or not isinstance(password, str) or not password or not isinstance(password_hash, str):
            return {"success": False, "message": "Invalid email or password."}, 401

        if not bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8")):
            return {"success": False, "message": "Invalid email or password."}, 401

        token = create_access_token(str(user.get("_id")), provider=user.get("auth_provider", "local"))
        return {
            "success": True,
            "message": "Login successful.",
            "token": token,
            "user": self._safe_user(user),
        }, 200

    def get_user_by_token(self, token: str) -> dict[str, Any] | None:
        from auth.security import decode_access_token

        payload = decode_access_token(token)
        if not payload:
            return None
        user_id = payload.get("sub")
        if not user_id:
            return None
        user = self.repository.find_by_id(str(user_id))
        return user

    def get_safe_current_user(self, token: str) -> dict[str, Any] | None:
        user = self.get_user_by_token(token)
        if not user:
            return None
        return self._safe_user(user)

    def find_or_create_google_user(self, google_user: dict[str, Any]) -> tuple[dict[str, Any], bool]:
        email = self.validate_email(google_user["email"])
        provider_user_id = str(google_user["provider_user_id"])

        existing_local = self.repository.find_by_email(email)
        if existing_local and existing_local.get("auth_provider") == "local":
            return {
                "success": False,
                "message": "An account with this email already exists. Please log in with your existing email and password before linking Google.",
            }, False

        existing_google = self.repository.find_by_provider_user("google", provider_user_id)
        if existing_google:
            token = create_access_token(str(existing_google.get("_id")), provider="google")
            return {
                "success": True,
                "message": "Google login successful.",
                "token": token,
                "user": self._safe_user(existing_google),
            }, True

        now = datetime.now(timezone.utc).isoformat()
        user_document = {
            "name": google_user.get("name") or email.split("@")[0],
            "email": email,
            "email_normalized": email,
            "password_hash": None,
            "auth_provider": "google",
            "provider_user_id": provider_user_id,
            "created_at": now,
            "updated_at": now,
        }
        saved = self.repository.create_user(user_document)
        token = create_access_token(str(saved.get("_id")), provider="google")
        return {
            "success": True,
            "message": "Google login successful.",
            "token": token,
            "user": self._safe_user(saved),
        }, True
