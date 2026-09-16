from typing import Optional
from uuid import UUID, uuid4
from pydantic import BaseModel


class CurrentUser(BaseModel):
    """Authenticated user context object."""
    id: UUID
    email: str
    full_name: Optional[str] = None
    is_active: bool = True
    github_user_id: Optional[str] = "tracepath-developer"
    github_username: Optional[str] = "tracepath-dev"


# Default mock user used in Phase 1 development and initial tests
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
    """
    Returns the current user context.
    In Phase 2, this will decode JWT tokens or validate GitHub session cookies.
    """
    return DEFAULT_MOCK_USER
