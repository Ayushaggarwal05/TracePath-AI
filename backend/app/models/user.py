from typing import List, TYPE_CHECKING
from sqlalchemy import Boolean, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import BaseModel

if TYPE_CHECKING:
    from app.models.github_connection import GitHubConnection
    from app.models.repository import Repository


class User(BaseModel):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relationships
    github_connections: Mapped[List["GitHubConnection"]] = relationship(
        "GitHubConnection",
        back_populates="user",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    repositories: Mapped[List["Repository"]] = relationship(
        "Repository",
        back_populates="user",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return f"<User {self.email} ({self.id})>"
