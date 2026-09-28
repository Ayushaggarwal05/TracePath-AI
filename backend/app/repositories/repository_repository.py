from typing import List, Optional, Sequence, Tuple
from uuid import UUID
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.models.repository import Repository
from app.schemas.repository import RepositoryCreate, RepositoryUpdate
from app.repositories.base import BaseRepository


class RepositoryRepository(BaseRepository[Repository, RepositoryCreate, RepositoryUpdate]):
    def __init__(self):
        super().__init__(Repository)

    async def get_by_github_repo_id(self, db: AsyncSession, github_repo_id: str) -> Optional[Repository]:
        result = await db.execute(
            select(Repository)
            .where(Repository.github_repo_id == github_repo_id)
            .options(selectinload(Repository.automation))
        )
        return result.scalars().first()

    async def get_by_full_name(self, db: AsyncSession, full_name: str) -> Optional[Repository]:
        result = await db.execute(
            select(Repository)
            .where(Repository.full_name == full_name)
            .options(selectinload(Repository.automation))
        )
        return result.scalars().first()

    async def get_by_id_with_relations(self, db: AsyncSession, id: UUID) -> Optional[Repository]:
        result = await db.execute(
            select(Repository)
            .where(Repository.id == id)
            .options(
                selectinload(Repository.automation),
                selectinload(Repository.executions),
            )
        )
        return result.scalars().first()

    async def get_by_user_id(
        self,
        db: AsyncSession,
        user_id: UUID,
        skip: int = 0,
        limit: int = 100,
    ) -> Sequence[Repository]:
        result = await db.execute(
            select(Repository)
            .where(Repository.user_id == user_id)
            .options(selectinload(Repository.automation))
            .offset(skip)
            .limit(limit)
            .order_by(Repository.name.asc())
        )
        return result.scalars().all()

    async def count_by_user_id(self, db: AsyncSession, user_id: UUID) -> int:
        stmt = select(func.count()).select_from(Repository).where(Repository.user_id == user_id)
        result = await db.execute(stmt)
        return result.scalar_one()

    async def resolve_repository(
        self, db: AsyncSession, repo_identifier: str | UUID, user_id: Optional[UUID] = None
    ) -> Optional[Repository]:
        """
        Resolves a repository flexibly by UUID, GitHub ID, or repo name.
        """
        if isinstance(repo_identifier, UUID):
            return await self.get_by_id_with_relations(db, repo_identifier)

        clean_id = str(repo_identifier).strip()
        if clean_id.startswith("gh_"):
            clean_id = clean_id[3:]

        # Try parsing as UUID
        try:
            val_uuid = UUID(clean_id)
            repo = await self.get_by_id_with_relations(db, val_uuid)
            if repo:
                return repo
        except ValueError:
            pass

        # Try finding by github_repo_id
        repo = await self.get_by_github_repo_id(db, clean_id)
        if repo:
            return repo

        # Try finding by full_name
        repo = await self.get_by_full_name(db, clean_id)
        if repo:
            return repo

        # Try case-insensitive matching by name
        stmt = (
            select(Repository)
            .where(func.lower(Repository.name) == clean_id.lower())
            .options(selectinload(Repository.automation), selectinload(Repository.executions))
        )
        if user_id:
            stmt = stmt.where(Repository.user_id == user_id)
        res = await db.execute(stmt)
        return res.scalars().first()


repository_repo = RepositoryRepository()

