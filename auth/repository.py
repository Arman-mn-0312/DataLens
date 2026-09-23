from __future__ import annotations

import uuid
from typing import Any

from database.mongodb import get_auth_database


class AuthenticationPersistenceError(RuntimeError):
    """Raised when authentication storage is unavailable."""


def normalize_email(email: str | None) -> str:
    if not email:
        return ""
    return email.strip().lower()


class UserRepository:
    _fallback_store: dict[str, dict[str, Any]] = {}
    _indexes_ensured: bool = False

    def __init__(self, collection=None, allow_fallback: bool = False):
        self.allow_fallback = allow_fallback
        self._persistence_error: Exception | None = None
        self.collection = collection or self._get_collection()
        self.ensure_indexes()

    def _get_collection(self):
        try:
            return get_auth_database()["users"]
        except Exception as exc:
            self._persistence_error = exc
            return None

    def _mongo_ready(self) -> bool:
        if self.collection is not None:
            return True
        try:
            col = self._get_collection()
            if col is not None:
                col.database.client.admin.command("ping")
                self.collection = col
                return True
        except Exception as exc:
            self.collection = None
            self._persistence_error = exc
        return False

    def ensure_indexes(self):
        if self.collection is None or UserRepository._indexes_ensured:
            return
        try:
            self.collection.create_index("email_normalized", unique=True)
            UserRepository._indexes_ensured = True
        except Exception as exc:
            self.collection = None
            self._persistence_error = exc

    def _use_fallback_or_raise(self) -> None:
        if not self.allow_fallback:
            raise AuthenticationPersistenceError(
                "MongoDB authentication persistence is unavailable."
            ) from self._persistence_error

    def find_by_email(self, email: str) -> dict[str, Any] | None:
        normalized = normalize_email(email)
        if not normalized:
            return None
        if not self._mongo_ready() or self.collection is None:
            self._use_fallback_or_raise()
            return self._fallback_store.get(normalized)
        try:
            return self.collection.find_one({"email_normalized": normalized})
        except Exception as exc:
            self.collection = None
            self._persistence_error = exc
            self._use_fallback_or_raise()
            return self._fallback_store.get(normalized)

    def find_by_provider_user(self, provider: str, provider_user_id: str) -> dict[str, Any] | None:
        if not self._mongo_ready() or self.collection is None:
            self._use_fallback_or_raise()
            for user in self._fallback_store.values():
                if user.get("auth_provider") == provider and str(user.get("provider_user_id")) == provider_user_id:
                    return user
            return None
        try:
            return self.collection.find_one({
                "auth_provider": provider,
                "provider_user_id": provider_user_id,
            })
        except Exception as exc:
            self.collection = None
            self._persistence_error = exc
            self._use_fallback_or_raise()
            return self.find_by_provider_user(provider, provider_user_id)

    def find_by_id(self, user_id: str) -> dict[str, Any] | None:
        if not self._mongo_ready() or self.collection is None:
            self._use_fallback_or_raise()
            for user in self._fallback_store.values():
                if str(user.get("_id")) == user_id:
                    return user
            return None
        from bson import ObjectId

        try:
            return self.collection.find_one({"_id": ObjectId(user_id)})
        except Exception as exc:
            self.collection = None
            self._persistence_error = exc
            self._use_fallback_or_raise()
            return self.find_by_id(user_id)

    def create_user(self, user_document: dict[str, Any]) -> dict[str, Any]:
        if not self._mongo_ready() or self.collection is None:
            self._use_fallback_or_raise()
            email_key = normalize_email(user_document.get("email", ""))
            user_document["_id"] = str(uuid.uuid4())
            self._fallback_store[email_key] = user_document
            return user_document

        try:
            result = self.collection.insert_one(user_document)
            user_document["_id"] = result.inserted_id
            return user_document
        except Exception as exc:
            self.collection = None
            self._persistence_error = exc
            self._use_fallback_or_raise()
            email_key = normalize_email(user_document.get("email", ""))
            user_document["_id"] = str(uuid.uuid4())
            self._fallback_store[email_key] = user_document
            return user_document

    def update_user(self, user_id: str, updates: dict[str, Any]) -> dict[str, Any] | None:
        if not self._mongo_ready() or self.collection is None:
            self._use_fallback_or_raise()
            for user in self._fallback_store.values():
                if str(user.get("_id")) == user_id:
                    user.update(updates)
                    return user
            return None
        from bson import ObjectId
        try:
            self.collection.update_one({"_id": ObjectId(user_id)}, {"$set": updates})
            return self.find_by_id(user_id)
        except Exception as exc:
            self.collection = None
            self._persistence_error = exc
            self._use_fallback_or_raise()
            return self.update_user(user_id, updates)
