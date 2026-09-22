from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Sequence, Tuple, Union
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.exceptions import EntityNotFoundException
from app.models.execution import Execution, ExecutionStatus
from app.repositories.execution_repository import execution_repo
from app.repositories.repository_repository import repository_repo
from app.schemas.execution import ExecutionCreate, ExecutionUpdate


class ExecutionService:
    async def create_execution(
        self,
        db: AsyncSession,
        execution_in: ExecutionCreate,
    ) -> Execution:
        # Verify repository exists
        repo = await repository_repo.get_by_id(db, execution_in.repository_id)
        if not repo:
            raise EntityNotFoundException("Repository", execution_in.repository_id)

        execution = await execution_repo.create(
            db,
            obj_in=execution_in,
        )
        await db.commit()
        await db.refresh(execution)
        return execution

    async def get_execution(self, db: AsyncSession, execution_id: UUID) -> Execution:
        execution = await execution_repo.get_by_id(db, execution_id)
        if not execution:
            raise EntityNotFoundException("Execution", execution_id)
        return execution

    async def get_executions_by_repository(
        self,
        db: AsyncSession,
        repository_id: UUID,
        status: Optional[ExecutionStatus] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> Tuple[Sequence[Execution], int]:
        repo = await repository_repo.get_by_id(db, repository_id)
        if not repo:
            raise EntityNotFoundException("Repository", repository_id)

        items = await execution_repo.get_by_repository_id(
            db,
            repository_id=repository_id,
            status=status,
            skip=skip,
            limit=limit,
        )
        total = await execution_repo.count_by_repository_id(
            db,
            repository_id=repository_id,
            status=status,
        )
        return items, total

    async def get_filtered_executions(
        self,
        db: AsyncSession,
        repository_id: Optional[UUID] = None,
        status: Optional[ExecutionStatus] = None,
        branch: Optional[str] = None,
        skip: int = 0,
        limit: int = 20,
    ) -> Tuple[Sequence[Execution], int]:
        return await execution_repo.get_filtered(
            db,
            repository_id=repository_id,
            status=status,
            branch=branch,
            skip=skip,
            limit=limit,
        )

    async def update_execution_progress(
        self,
        db: AsyncSession,
        execution_id: UUID,
        update_in: Union[ExecutionUpdate, Dict[str, Any]],
    ) -> Execution:
        execution = await self.get_execution(db, execution_id)
        
        status_val = update_in.get("status") if isinstance(update_in, dict) else update_in.status
        completion_time_val = (
            update_in.get("completion_time") if isinstance(update_in, dict) else update_in.completion_time
        )
        start_time_val = (
            update_in.get("start_time") if isinstance(update_in, dict) else update_in.start_time
        )

        update_dict = update_in if isinstance(update_in, dict) else update_in.model_dump(exclude_unset=True)

        # If status changed to COMPLETED or FAILED and completion_time is not set, set it
        if status_val in [ExecutionStatus.COMPLETED, ExecutionStatus.FAILED, ExecutionStatus.SKIPPED, "COMPLETED", "FAILED", "SKIPPED"]:
            if not completion_time_val and not execution.completion_time:
                update_dict["completion_time"] = datetime.now(timezone.utc)

        if status_val in [ExecutionStatus.ANALYZING, "ANALYZING"] and not execution.start_time:
            if not start_time_val:
                update_dict["start_time"] = datetime.now(timezone.utc)

        updated_exec = await execution_repo.update(db, db_obj=execution, obj_in=update_dict)
        await db.commit()
        await db.refresh(updated_exec)
        return updated_exec


execution_service = ExecutionService()
