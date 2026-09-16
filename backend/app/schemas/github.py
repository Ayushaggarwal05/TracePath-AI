from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict


class GitHubConnectionBase(BaseModel):
    github_user_id: str
    username: str
    avatar_url: Optional[str] = None
    installation_id: Optional[str] = None


class GitHubConnectionCreate(GitHubConnectionBase):
    user_id: UUID
    access_token_enc: Optional[str] = None


class GitHubConnectionResponse(GitHubConnectionBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime
