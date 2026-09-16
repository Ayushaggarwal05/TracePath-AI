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


repository_repo = RepositoryRepository()
