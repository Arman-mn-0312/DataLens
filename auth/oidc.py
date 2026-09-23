import os
from typing import Any

from authlib.integrations.flask_client import OAuth


def get_google_oauth(oauth: OAuth) -> Any:
    client_id = os.getenv("GOOGLE_CLIENT_ID")
    client_secret = os.getenv("GOOGLE_CLIENT_SECRET")
    if not client_id or not client_secret:
        raise RuntimeError("Google OIDC requires GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.")

    return oauth.register(
        name="google",
        client_id=client_id,
        client_secret=client_secret,
        server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
        client_kwargs={"scope": "openid email profile"},
    )
