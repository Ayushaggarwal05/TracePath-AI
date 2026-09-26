from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field


class ExecutionStatusEnum(str, Enum):
    PENDING = "PENDING"
    ANALYZING = "ANALYZING"
    PLANNING = "PLANNING"
    GENERATING = "GENERATING"
    COMMITTING = "COMMITTING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    SKIPPED = "SKIPPED"


class ChangedFileItem(BaseModel):
    filename: str
    status: str = "modified"  # added, modified, removed
    additions: int = 0
    deletions: int = 0
    patch: Optional[str] = None


class UpdatedDocumentItem(BaseModel):
    path: str
    action: str = "updated"  # updated, created, deleted
    title: Optional[str] = None
    summary_of_changes: Optional[str] = None


class ExecutionBase(BaseModel):
    repository_id: UUID
    event_type: str = Field(default="push", max_length=50)
    commit_sha: str = Field(default="latest", min_length=1, max_length=100)
    branch: str = Field(default="main", max_length=100)


class ExecutionCreate(ExecutionBase):
    status: ExecutionStatusEnum = ExecutionStatusEnum.PENDING
    changed_files: Optional[List[Dict[str, Any]]] = None


class ExecutionUpdate(BaseModel):
    status: Optional[ExecutionStatusEnum] = None
    commit_sha: Optional[str] = None
    start_time: Optional[datetime] = None
    completion_time: Optional[datetime] = None
    changed_files: Optional[List[Dict[str, Any]]] = None
    analysis_result: Optional[Dict[str, Any]] = None
    documentation_decision: Optional[Dict[str, Any]] = None
    updated_documents: Optional[List[Dict[str, Any]]] = None
    generated_diff: Optional[str] = None
    final_commit_sha: Optional[str] = None
    pull_request_url: Optional[str] = None
    error_information: Optional[Dict[str, Any]] = None
    telemetry_logs: Optional[List[Dict[str, Any]]] = None


class ExecutionResponse(ExecutionBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    status: ExecutionStatusEnum
    start_time: Optional[datetime] = None
    completion_time: Optional[datetime] = None
    final_commit_sha: Optional[str] = None
    pull_request_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    changed_files: Optional[List[Dict[str, Any]]] = None
    analysis_result: Optional[Dict[str, Any]] = None
    documentation_decision: Optional[Dict[str, Any]] = None
    updated_documents: Optional[List[Dict[str, Any]]] = None
    error_information: Optional[Dict[str, Any]] = None
    telemetry_logs: Optional[List[Dict[str, Any]]] = None


class ExecutionDetailResponse(ExecutionResponse):
    generated_diff: Optional[str] = None


class ExecutionFilterParams(BaseModel):
    repository_id: Optional[UUID] = None
    status: Optional[ExecutionStatusEnum] = None
    branch: Optional[str] = None
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, ge=1, le=100)
