import os
import unittest

from flask import Flask, jsonify

from auth.repository import UserRepository
from auth.security import require_auth
from database.mongodb import MongoDB


def build_test_app(allow_fallback=True):
    app = Flask(__name__)
    app.config["TESTING"] = True
    app.config["JWT_SECRET_KEY"] = "test-secret-key"

    from routes.auth import auth_bp, auth_service
    auth_service.repository = UserRepository(allow_fallback=allow_fallback)
    app.register_blueprint(auth_bp)

    @app.route("/private")
    @require_auth
    def private_route():
        return jsonify({"success": True, "message": "ok"})

    return app


class AuthIntegrationTests(unittest.TestCase):
    def setUp(self):
        os.environ["MONGODB_URI"] = "mongodb://localhost:27017"
        os.environ["JWT_SECRET_KEY"] = "test-secret-key"
        MongoDB.close()
        UserRepository._fallback_store.clear()
        self.app = build_test_app(allow_fallback=True)
        self.client = self.app.test_client()

    def tearDown(self):
        MongoDB.close()

    def test_register_and_login_user(self):
        resp = self.client.post(
            "/auth/register",
            json={"name": "Jane Doe", "email": "JANE@EXAMPLE.COM", "password": "StrongPass123!"}
        )
        self.assertEqual(resp.status_code, 201, resp.get_data(as_text=True))
        payload = resp.get_json()
        self.assertTrue(payload["success"])
        self.assertEqual(payload["user"]["email"], "jane@example.com")
        self.assertNotIn("password_hash", payload["user"])

        login = self.client.post(
            "/auth/login",
            json={"email": "jane@example.com", "password": "StrongPass123!"}
        )
        self.assertEqual(login.status_code, 200, login.get_data(as_text=True))
        data = login.get_json()
        self.assertTrue(data["success"])
        self.assertTrue(data["token"])

    def test_duplicate_email_is_rejected(self):
        body = {"name": "John", "email": "john@example.com", "password": "StrongPass123!"}
        first = self.client.post("/auth/register", json=body)
        second = self.client.post("/auth/register", json=body)

        self.assertEqual(first.status_code, 201)
        self.assertEqual(second.status_code, 409)
        self.assertFalse(second.get_json()["success"])

    def test_protected_route_requires_auth(self):
        resp = self.client.get("/private")
        self.assertEqual(resp.status_code, 401)
        self.assertFalse(resp.get_json()["success"])

    def test_me_route_requires_valid_token(self):
        unauthorized = self.client.get("/auth/me")
        self.assertEqual(unauthorized.status_code, 401)

        login = self.client.post(
            "/auth/login",
            json={"email": "missing@example.com", "password": "StrongPass123!"}
        )
        self.assertEqual(login.status_code, 401)

    def test_invalid_credentials_are_client_errors(self):
        invalid_registration = self.client.post(
            "/auth/register",
            json={"name": "Invalid", "email": "not-an-email", "password": "short"}
        )
        self.assertEqual(invalid_registration.status_code, 400)
        self.assertFalse(invalid_registration.get_json()["success"])

        invalid_login = self.client.post(
            "/auth/login",
            json={"email": "not-an-email", "password": "anything"}
        )
        self.assertEqual(invalid_login.status_code, 400)
        self.assertFalse(invalid_login.get_json()["success"])

    def test_mongodb_client_can_be_closed(self):
        client = MongoDB.get_client()
        self.assertIsNotNone(client)

        MongoDB.close()

        self.assertIsNone(MongoDB._client)
        self.assertIsNone(MongoDB._database)

    def test_production_repository_rejects_fallback_storage(self):
        UserRepository._fallback_store["fallback@example.com"] = {
            "_id": "fallback-user",
            "email": "fallback@example.com",
            "password_hash": "not-used",
        }
        MongoDB.close()
        os.environ.pop("MONGODB_URI", None)
        self.app = build_test_app(allow_fallback=False)
        self.client = self.app.test_client()
        response = self.client.post(
            "/auth/login",
            json={"email": "fallback@example.com", "password": "StrongPass123!"},
        )

        self.assertEqual(response.status_code, 503)
        self.assertFalse(response.get_json()["success"])
        self.assertNotIn("token", response.get_json())

    def test_missing_mongodb_configuration_fails_registration_without_jwt(self):
        MongoDB.close()
        os.environ.pop("MONGODB_URI", None)
        self.app = build_test_app(allow_fallback=False)
        self.client = self.app.test_client()
        response = self.client.post(
            "/auth/register",
            json={"name": "No Mongo", "email": "nomongo@example.com", "password": "StrongPass123!"},
        )

        self.assertEqual(response.status_code, 503)
        self.assertFalse(response.get_json()["success"])
        self.assertNotIn("token", response.get_json())

    def test_unreachable_mongodb_fails_login_without_jwt(self):
        MongoDB.close()
        os.environ["MONGODB_URI"] = "mongodb://127.0.0.1:1"
        self.app = build_test_app(allow_fallback=False)
        self.client = self.app.test_client()
        response = self.client.post(
            "/auth/login",
            json={"email": "unreachable@example.com", "password": "StrongPass123!"},
        )

        self.assertEqual(response.status_code, 503)
        self.assertFalse(response.get_json()["success"])
        self.assertNotIn("token", response.get_json())


if __name__ == "__main__":
    unittest.main()
