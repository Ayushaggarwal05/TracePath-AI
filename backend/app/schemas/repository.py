from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field
from app.schemas.repository_automation import RepositoryAutomationResponse


class RepositoryBase(BaseModel):
    github_repo_id: str
    name: str = Field(..., max_length=255)
    full_name: str = Field(..., max_length=510)
    default_branch: str = Field(default="main", max_length=100)
    is_private: bool = False
    html_url: Optional[str] = None
    description: Optional[str] = None


class RepositoryCreate(RepositoryBase):
    user_id: UUID


class RepositoryUpdate(BaseModel):
    default_branch: Optional[str] = None
    is_private: Optional[bool] = None
    html_url: Optional[str] = None
    description: Optional[str] = None


class RepositoryResponse(RepositoryBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    automation: Optional[RepositoryAutomationResponse] = None
    created_at: datetime
    updated_at: datetime


class RepositoryDetailResponse(RepositoryResponse):
    execution_count: int = 0
