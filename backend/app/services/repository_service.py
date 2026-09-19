from typing import Sequence, Tuple
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.exceptions import EntityAlreadyExistsException, EntityNotFoundException
from app.models.repository import Repository
from app.repositories.repository_repository import repository_repo
from app.repositories.automation_repository import automation_repo
from app.schemas.repository import RepositoryCreate, RepositoryUpdate


class RepositoryService:
    async def get_user_repositories(
        self,
        db: AsyncSession,
        user_id: UUID,
        skip: int = 0,
        limit: int = 100,
    ) -> Tuple[Sequence[Repository], int]:
        items = await repository_repo.get_by_user_id(db, user_id=user_id, skip=skip, limit=limit)
        total = await repository_repo.count_by_user_id(db, user_id=user_id)
        return items, total

    async def get_repository(self, db: AsyncSession, repo_id: UUID) -> Repository:
        repo = await repository_repo.get_by_id_with_relations(db, repo_id)
        if not repo:
            raise EntityNotFoundException("Repository", repo_id)
        return repo

    async def register_repository(
        self,
        db: AsyncSession,
        user_id: UUID,
        repo_data: RepositoryCreate,
    ) -> Repository:
        # Check if already registered
        existing = await repository_repo.get_by_github_repo_id(db, repo_data.github_repo_id)
        if existing:
            raise EntityAlreadyExistsException("Repository", "github_repo_id", repo_data.github_repo_id)

        # Create repository with user_id
        repo_dict = repo_data.model_dump()
        if not repo_dict.get("user_id"):
            repo_dict["user_id"] = user_id

        repo = await repository_repo.create(db, obj_in=repo_dict)
        
        # Ensure default automation configuration exists
        automation = await automation_repo.get_or_create_default(db, repo.id)
        repo.automation = automation
        await db.commit()
        await db.refresh(repo)
        return repo

    async def update_repository(
        self,
        db: AsyncSession,
        repo_id: UUID,
        update_data: RepositoryUpdate,
    ) -> Repository:
        repo = await self.get_repository(db, repo_id)
        updated = await repository_repo.update(db, db_obj=repo, obj_in=update_data)
        await db.commit()
        await db.refresh(updated)
        return updated



repository_service = RepositoryService()
