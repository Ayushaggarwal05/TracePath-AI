from datetime import datetime, timezone
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.exceptions import EntityNotFoundException, InvalidStateTransitionException
from app.models.repository_automation import AutomationStatus, RepositoryAutomation
from app.repositories.automation_repository import automation_repo
from app.repositories.repository_repository import repository_repo
from app.schemas.repository_automation import (
    AutomationToggleResponse,
    RepositoryAutomationUpdate,
)


class AutomationService:
    async def get_automation_by_repo_id(
        self, db: AsyncSession, repo_id: str | UUID
    ) -> RepositoryAutomation:
        # Verify and resolve repository
        repo = await repository_repo.resolve_repository(db, repo_id)
        if not repo:
            raise EntityNotFoundException("Repository", str(repo_id))

        automation = await automation_repo.get_or_create_default(db, repo.id)
        return automation

    async def activate_automation(
        self, db: AsyncSession, repo_id: str | UUID
    ) -> AutomationToggleResponse:
        automation = await self.get_automation_by_repo_id(db, repo_id)
        
        automation.activate()
        await db.commit()
        await db.refresh(automation)

        return AutomationToggleResponse(
            repository_id=automation.repository_id,
            status=AutomationStatus.ACTIVE,
            message="Automation successfully activated for repository.",
            updated_at=automation.last_activated_at or datetime.now(timezone.utc),
        )

    async def deactivate_automation(
        self, db: AsyncSession, repo_id: str | UUID
    ) -> AutomationToggleResponse:
        automation = await self.get_automation_by_repo_id(db, repo_id)
        
        automation.deactivate()
        await db.commit()
        await db.refresh(automation)

        return AutomationToggleResponse(
            repository_id=automation.repository_id,
            status=AutomationStatus.INACTIVE,
            message="Automation successfully deactivated for repository.",
            updated_at=automation.last_deactivated_at or datetime.now(timezone.utc),
        )

    async def update_automation_config(
        self,
        db: AsyncSession,
        repo_id: str | UUID,
        update_data: RepositoryAutomationUpdate,
    ) -> RepositoryAutomation:
        automation = await self.get_automation_by_repo_id(db, repo_id)
        updated = await automation_repo.update(db, db_obj=automation, obj_in=update_data)
        await db.commit()
        return updated


automation_service = AutomationService()

