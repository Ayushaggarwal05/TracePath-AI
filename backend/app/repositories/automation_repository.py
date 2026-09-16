from typing import Optional
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.repository_automation import AutomationStatus, RepositoryAutomation
from app.schemas.repository_automation import (
    RepositoryAutomationCreate,
    RepositoryAutomationUpdate,
)
from app.repositories.base import BaseRepository


class AutomationRepository(
    BaseRepository[RepositoryAutomation, RepositoryAutomationCreate, RepositoryAutomationUpdate]
):
    def __init__(self):
        super().__init__(RepositoryAutomation)

    async def get_by_repository_id(
        self, db: AsyncSession, repository_id: UUID
    ) -> Optional[RepositoryAutomation]:
        result = await db.execute(
            select(RepositoryAutomation).where(
                RepositoryAutomation.repository_id == repository_id
            )
        )
        return result.scalars().first()

    async def get_or_create_default(
        self, db: AsyncSession, repository_id: UUID
    ) -> RepositoryAutomation:
        automation = await self.get_by_repository_id(db, repository_id)
        if not automation:
            automation = await self.create(
                db,
                obj_in=RepositoryAutomationCreate(
                    repository_id=repository_id,
                    status=AutomationStatus.INACTIVE,
                ),
            )
        return automation


automation_repo = AutomationRepository()
