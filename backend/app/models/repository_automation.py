import enum
import uuid
from datetime import datetime, timezone
from typing import List, Optional, TYPE_CHECKING
from sqlalchemy import Boolean, DateTime, Enum as SQLEnum, ForeignKey, JSON, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import BaseModel, GUID

if TYPE_CHECKING:
    from app.models.repository import Repository


class AutomationStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"


class RepositoryAutomation(BaseModel):
    __tablename__ = "repository_automations"

    repository_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("repositories.id", ondelete="CASCADE"),
        unique=True,
        index=True,
        nullable=False,
    )
    status: Mapped[AutomationStatus] = mapped_column(
        SQLEnum(AutomationStatus, native_enum=False, length=20),
        default=AutomationStatus.INACTIVE,
        nullable=False,
        index=True,
    )
    target_branch: Mapped[str] = mapped_column(String(100), default="main", nullable=False)
    # JSON list of paths or glob patterns where docs are located, e.g. ["docs/", "README.md"]
    doc_paths: Mapped[Optional[List[str]]] = mapped_column(
        JSON,
        default=lambda: ["docs/", "README.md", "ARCHITECTURE.md"],
        nullable=True,
    )
    # Whether changes are auto-committed directly or submitted via Pull Request
    auto_commit: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    create_pull_request: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    pr_target_branch: Mapped[str] = mapped_column(String(100), default="main", nullable=False)

    last_activated_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    last_deactivated_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    repository: Mapped["Repository"] = relationship("Repository", back_populates="automation")

    def activate(self) -> None:
        self.status = AutomationStatus.ACTIVE
        self.last_activated_at = datetime.now(timezone.utc)

    def deactivate(self) -> None:
        self.status = AutomationStatus.INACTIVE
        self.last_deactivated_at = datetime.now(timezone.utc)

    def __repr__(self) -> str:
        return f"<RepositoryAutomation repo={self.repository_id} status={self.status}>"
