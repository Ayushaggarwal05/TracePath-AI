import enum
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional, TYPE_CHECKING
from sqlalchemy import DateTime, Enum as SQLEnum, ForeignKey, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import BaseModel, GUID

if TYPE_CHECKING:
    from app.models.repository import Repository


class ExecutionStatus(str, enum.Enum):
    PENDING = "PENDING"
    ANALYZING = "ANALYZING"
    PLANNING = "PLANNING"
    GENERATING = "GENERATING"
    COMMITTING = "COMMITTING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    SKIPPED = "SKIPPED"


class ExecutionEventType(str, enum.Enum):
    PUSH = "push"
    PULL_REQUEST = "pull_request"
    MANUAL = "manual"
    SCHEDULED = "scheduled"


class Execution(BaseModel):
    __tablename__ = "executions"

    repository_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("repositories.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    event_type: Mapped[str] = mapped_column(String(50), default="push", nullable=False)
    commit_sha: Mapped[str] = mapped_column(String(40), index=True, nullable=False)
    branch: Mapped[str] = mapped_column(String(100), default="main", nullable=False)
    status: Mapped[ExecutionStatus] = mapped_column(
        SQLEnum(ExecutionStatus, native_enum=False, length=30),
        default=ExecutionStatus.PENDING,
        nullable=False,
        index=True,
    )

    start_time: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    completion_time: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # 1. Changed files received from GitHub commit / PR payload
    # Format: [{"filename": "src/api.py", "status": "modified", "additions": 10, "deletions": 2, "patch": "..."}]
    changed_files: Mapped[Optional[List[Dict[str, Any]]]] = mapped_column(JSON, nullable=True)

    # 2. Agent 1 Output: Semantic understanding of the code changes
    analysis_result: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)

    # 3. Agent 2 Output: Impact evaluation and documentation strategy plan
    documentation_decision: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)

    # 4. Agent 3 Output: Updated documents list and details
    # Format: [{"path": "docs/architecture.md", "action": "update", "title": "Architecture Doc"}]
    updated_documents: Mapped[Optional[List[Dict[str, Any]]]] = mapped_column(JSON, nullable=True)

    # 5. Generated diff of documentation changes
    generated_diff: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # 6. Commit SHA created back on GitHub (or PR URL)
    final_commit_sha: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    pull_request_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    # 7. Error information in case of failure
    error_information: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)

    # Relationships
    repository: Mapped["Repository"] = relationship("Repository", back_populates="executions")

    def __repr__(self) -> str:
        return f"<Execution {self.id} (Repo: {self.repository_id}, Status: {self.status})>"
