import uuid
from typing import TYPE_CHECKING
from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import BaseModel, GUID

if TYPE_CHECKING:
    from app.models.user import User


class GitHubConnection(BaseModel):
    __tablename__ = "github_connections"

    user_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    github_user_id: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    username: Mapped[str] = mapped_column(String(150), nullable=False)
    avatar_url: Mapped[str] = mapped_column(String(500), nullable=True)
    installation_id: Mapped[str] = mapped_column(String(100), nullable=True)
    access_token_enc: Mapped[str] = mapped_column(String(500), nullable=True)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="github_connections")

    def __repr__(self) -> str:
        return f"<GitHubConnection {self.username} (User: {self.user_id})>"
