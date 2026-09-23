import os
from typing import Any

from pymongo import MongoClient
from pymongo.database import Database


def get_mongodb_uri() -> str:
    uri = os.getenv("MONGODB_URI")
    if not uri:
        raise RuntimeError("MONGODB_URI environment variable is required for authentication.")
    return uri


class MongoDB:
    _client: MongoClient | None = None
    _database: Database | None = None

    @classmethod
    def close(cls) -> None:
        if cls._database is not None:
            try:
                cls._database.client.close()
            except Exception:
                pass
            cls._database = None

        if cls._client is not None:
            try:
                cls._client.close()
            except Exception:
                pass
            cls._client = None

    @classmethod
    def get_client(cls) -> MongoClient:
        if cls._client is None:
            try:
                uri = get_mongodb_uri()
                cls._client = MongoClient(
                    uri,
                    serverSelectionTimeoutMS=5000,
                    connectTimeoutMS=5000,
                    socketTimeoutMS=5000,
                    maxPoolSize=50,
                    minPoolSize=1,
                )
            except RuntimeError:
                cls._client = None
                raise
        return cls._client

    @classmethod
    def get_auth_database(cls) -> Database:
        if cls._database is None:
            cls._database = cls.get_client()["datalens_auth"]
        return cls._database

    @classmethod
    def ping(cls) -> bool:
        try:
            cls.get_client().admin.command("ping")
            return True
        except Exception:
            return False


def get_auth_database() -> Database:
    return MongoDB.get_auth_database()
