import uuid
from typing import List, Optional, TYPE_CHECKING
from sqlalchemy import Boolean, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import BaseModel, GUID

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.repository_automation import RepositoryAutomation
    from app.models.execution import Execution


class Repository(BaseModel):
    __tablename__ = "repositories"

    user_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    github_repo_id: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(510), index=True, nullable=False)
    default_branch: Mapped[str] = mapped_column(String(100), default="main", nullable=False)
    is_private: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    html_url: Mapped[str] = mapped_column(String(500), nullable=True)
    description: Mapped[Optional[str]] = mapped_column(String(1000), nullable=True)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="repositories")
    automation: Mapped["RepositoryAutomation"] = relationship(
        "RepositoryAutomation",
        back_populates="repository",
        uselist=False,
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    executions: Mapped[List["Execution"]] = relationship(
        "Execution",
        back_populates="repository",
        cascade="all, delete-orphan",
        order_by="desc(Execution.created_at)",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return f"<Repository {self.full_name} ({self.id})>"
