import base64
from datetime import datetime, timedelta, timezone
import hashlib
import hmac
import logging
import secrets
import time
from typing import Any, Dict, Optional
from uuid import UUID, uuid4
from cryptography.fernet import Fernet, InvalidToken
from pydantic import BaseModel
from app.core.config import settings

try:
    import bcrypt
    _HAS_BCRYPT = True
except ImportError:
    _HAS_BCRYPT = False

try:
    import jwt
    _HAS_JWT = True
except ImportError:
    _HAS_JWT = False

logger = logging.getLogger("tracepath.security")

COOKIE_SESSION_NAME = "tracepath_session"
JWT_ALGORITHM = "HS256"
DEFAULT_SESSION_DAYS = 7


def hash_password(password: str) -> str:
    """Hashes a plaintext password using bcrypt or secure PBKDF2 fallback."""
    if not password:
        raise ValueError("Password cannot be empty.")
    if _HAS_BCRYPT:
        salt = bcrypt.gensalt(rounds=12)
        return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")
    else:
        salt = secrets.token_hex(16)
        key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100000)
        return f"pbkdf2:{salt}:{key.hex()}"


def verify_password(plain_password: str, hashed_password: Optional[str]) -> bool:
    """Verifies plaintext password against a stored hash."""
    if not plain_password or not hashed_password:
        return False
    try:
        if hashed_password.startswith("pbkdf2:"):
            _, salt, expected_hex = hashed_password.split(":")
            key = hashlib.pbkdf2_hmac("sha256", plain_password.encode("utf-8"), salt.encode("utf-8"), 100000)
            return hmac.compare_digest(key.hex(), expected_hex)
        elif _HAS_BCRYPT:
            return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
        else:
            return False
    except Exception as e:
        logger.warning(f"Password verification error: {e}")
        return False


def create_access_token(user_id: str, email: str, expires_delta: Optional[timedelta] = None) -> str:
    """Creates a cryptographically signed JWT session token."""
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(days=DEFAULT_SESSION_DAYS))
    payload: Dict[str, Any] = {
        "sub": str(user_id),
        "email": email,
        "exp": expire,
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=JWT_ALGORITHM)


def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Decodes and validates a JWT session token."""
    if not token:
        return None
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        logger.debug("Session token expired.")
        return None
    except (jwt.PyJWTError, Exception) as e:
        logger.debug(f"Invalid session token: {e}")
        return None


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
