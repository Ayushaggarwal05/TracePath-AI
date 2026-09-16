from datetime import datetime
from enum import Enum
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field


class AutomationStatusEnum(str, Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"


class RepositoryAutomationBase(BaseModel):
    target_branch: str = Field(default="main", max_length=100)
    doc_paths: List[str] = Field(default=["docs/", "README.md"])
    auto_commit: bool = False
    create_pull_request: bool = True
    pr_target_branch: str = Field(default="main", max_length=100)


class RepositoryAutomationCreate(RepositoryAutomationBase):
    repository_id: UUID
    status: AutomationStatusEnum = AutomationStatusEnum.INACTIVE


class RepositoryAutomationUpdate(BaseModel):
    target_branch: Optional[str] = None
    doc_paths: Optional[List[str]] = None
    auto_commit: Optional[bool] = None
    create_pull_request: Optional[bool] = None
    pr_target_branch: Optional[str] = None


class RepositoryAutomationResponse(RepositoryAutomationBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    repository_id: UUID
    status: AutomationStatusEnum
    last_activated_at: Optional[datetime] = None
    last_deactivated_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime


class AutomationToggleResponse(BaseModel):
    repository_id: UUID
    status: AutomationStatusEnum
    message: str
    updated_at: datetime
