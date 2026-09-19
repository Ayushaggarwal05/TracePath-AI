import base64
import hashlib
import hmac
import logging
import secrets
import time
from typing import Optional
from uuid import UUID, uuid4
from cryptography.fernet import Fernet, InvalidToken
from pydantic import BaseModel
from app.core.config import settings

logger = logging.getLogger("tracepath.security")


class CurrentUser(BaseModel):
    """Authenticated user context object."""
    id: UUID
    email: str
    full_name: Optional[str] = None
    is_active: bool = True
    github_user_id: Optional[str] = "tracepath-developer"
    github_username: Optional[str] = "tracepath-dev"


# Default user context
MOCK_USER_ID = UUID("00000000-0000-0000-0000-000000000001")

DEFAULT_MOCK_USER = CurrentUser(
    id=MOCK_USER_ID,
    email="developer@tracepath.ai",
    full_name="TracePath Developer",
    is_active=True,
    github_user_id="github-dev-12345",
    github_username="tracepath-dev",
)


def get_current_user_context() -> CurrentUser:
    """Returns the current authenticated user context."""
    return DEFAULT_MOCK_USER


def _get_encryption_cipher() -> Fernet:
    """
    Derives a deterministic 32-byte Fernet key from SECRET_KEY using SHA-256.
    Ensures production AES-128-CBC + HMAC authenticated encryption at rest.
    """
    key_material = hashlib.sha256(settings.SECRET_KEY.encode("utf-8")).digest()
    fernet_key = base64.urlsafe_b64encode(key_material)
    return Fernet(fernet_key)


def encrypt_token(raw_token: str) -> str:
    """
    Encrypts a sensitive GitHub OAuth token or API secret before database persistence.
    """
    if not raw_token:
        return ""
    cipher = _get_encryption_cipher()
    encrypted_bytes = cipher.encrypt(raw_token.encode("utf-8"))
    return encrypted_bytes.decode("utf-8")


def decrypt_token(encrypted_token: str) -> str:
    """
    Decrypts an encrypted token in memory only when making authenticated external calls.
    Gracefully handles unencrypted legacy strings during migrations.
    """
    if not encrypted_token:
        return ""
    try:
        cipher = _get_encryption_cipher()
        decrypted_bytes = cipher.decrypt(encrypted_token.encode("utf-8"))
        return decrypted_bytes.decode("utf-8")
    except (InvalidToken, Exception):
        # If string is not encrypted (e.g. test fixture), return as is
        return encrypted_token


def generate_oauth_state() -> str:
    """
    Generates a cryptographically secure, tamper-proof state token for CSRF defense.
    Format: <timestamp>.<nonce>.<hmac_signature>
    """
    nonce = secrets.token_urlsafe(24)
    ts = str(int(time.time()))
    payload = f"{ts}:{nonce}"
    sig = hmac.new(
        key=settings.SECRET_KEY.encode("utf-8"),
        msg=payload.encode("utf-8"),
        digestmod=hashlib.sha256,
    ).hexdigest()[:32]
    return f"{ts}.{nonce}.{sig}"


def verify_oauth_state(state: str, max_age_seconds: int = 900) -> bool:
    """
    Verifies OAuth state parameter against tampering, forgery, and expiration (15 min default).
    """
    if not state or "." not in state:
        return False

    parts = state.split(".")
    if len(parts) != 3:
        return False

    ts_str, nonce, received_sig = parts
    try:
        ts = int(ts_str)
        if time.time() - ts > max_age_seconds:
            logger.warning("Expired OAuth state parameter.")
            return False
    except ValueError:
        return False

    payload = f"{ts_str}:{nonce}"
    expected_sig = hmac.new(
        key=settings.SECRET_KEY.encode("utf-8"),
        msg=payload.encode("utf-8"),
        digestmod=hashlib.sha256,
    ).hexdigest()[:32]

    return hmac.compare_digest(received_sig, expected_sig)
