from datetime import datetime, timezone
import logging
from typing import Optional
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings
from app.core.exceptions import EntityNotFoundException, InvalidStateTransitionException
from app.core.security import decrypt_token
from app.github import get_github_client
from app.models.github_connection import GitHubConnection
from app.models.repository import Repository
from app.models.repository_automation import AutomationStatus, RepositoryAutomation
from app.repositories.automation_repository import automation_repo
from app.repositories.repository_repository import repository_repo
from app.schemas.repository_automation import (
    AutomationToggleResponse,
    RepositoryAutomationUpdate,
)

logger = logging.getLogger("tracepath.automation")


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

    async def _resolve_github_client_for_repo(
        self, db: AsyncSession, repo: Repository
    ):
        """Resolves authenticated GitHub client using repository owner's stored token."""
        token: Optional[str] = None
        try:
            if repo.user_id:
                stmt = select(GitHubConnection).where(GitHubConnection.user_id == repo.user_id).order_by(GitHubConnection.created_at.desc())
                res = await db.execute(stmt)
                conn = res.scalars().first()
                if conn and conn.access_token_enc:
                    token = decrypt_token(conn.access_token_enc)
        except Exception as e:
            logger.warning(f"Could not retrieve token for repo {repo.full_name}: {e}")

        return get_github_client(token=token)

    async def activate_automation(
        self, db: AsyncSession, repo_id: str | UUID
    ) -> AutomationToggleResponse:
        repo = await repository_repo.resolve_repository(db, repo_id)
        if not repo:
            raise EntityNotFoundException("Repository", str(repo_id))

        automation = await automation_repo.get_or_create_default(db, repo.id)

        # 1. Automatically register or ensure GitHub repository webhook
        try:
            gh_client = await self._resolve_github_client_for_repo(db, repo)
            webhook_url = f"{settings.WEBHOOK_BASE_URL.rstrip('/')}/api/v1/github/webhooks"
            webhook_id = await gh_client.create_or_ensure_webhook(
                full_name=repo.full_name,
                webhook_url=webhook_url,
                secret=settings.GITHUB_WEBHOOK_SECRET,
            )
            if webhook_id:
                automation.github_webhook_id = str(webhook_id)
                logger.info(f"Associated GitHub webhook ID {webhook_id} with repository {repo.full_name}")
        except Exception as e:
            logger.error(f"Automatic webhook setup failed for {repo.full_name}: {e}")

        # 2. Activate automation state in DB
        automation.activate()
        await db.commit()
        await db.refresh(automation)

        return AutomationToggleResponse(
            repository_id=automation.repository_id,
            status=AutomationStatus.ACTIVE,
            message=f"Automation successfully activated. Push events to '{automation.target_branch}' will trigger autonomous sync.",
            updated_at=automation.last_activated_at or datetime.now(timezone.utc),
        )

    async def deactivate_automation(
        self, db: AsyncSession, repo_id: str | UUID
    ) -> AutomationToggleResponse:
        repo = await repository_repo.resolve_repository(db, repo_id)
        if not repo:
            raise EntityNotFoundException("Repository", str(repo_id))

        automation = await automation_repo.get_or_create_default(db, repo.id)

        # 1. Automatically delete webhook from GitHub repository if registered
        if automation.github_webhook_id:
            try:
                gh_client = await self._resolve_github_client_for_repo(db, repo)
                try:
                    hook_int = int(automation.github_webhook_id)
                    await gh_client.delete_webhook(full_name=repo.full_name, webhook_id=hook_int)
                except ValueError:
                    pass
                automation.github_webhook_id = None
            except Exception as e:
                logger.warning(f"Could not delete webhook from GitHub on deactivation: {e}")

        # 2. Deactivate automation state in DB
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

