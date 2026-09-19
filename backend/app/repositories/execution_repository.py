from typing import Optional, Sequence, Tuple
from uuid import UUID
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.models.execution import Execution, ExecutionStatus
from app.schemas.execution import ExecutionCreate, ExecutionUpdate
from app.repositories.base import BaseRepository


class ExecutionRepository(BaseRepository[Execution, ExecutionCreate, ExecutionUpdate]):
    def __init__(self):
        super().__init__(Execution)

    async def get_by_repository_id(
        self,
        db: AsyncSession,
        repository_id: UUID,
        status: Optional[ExecutionStatus] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> Sequence[Execution]:
        stmt = select(Execution).where(Execution.repository_id == repository_id).options(selectinload(Execution.repository))
        if status:
            stmt = stmt.where(Execution.status == status)
        stmt = stmt.order_by(Execution.created_at.desc()).offset(skip).limit(limit)
        result = await db.execute(stmt)
        return result.scalars().all()

    async def count_by_repository_id(
        self,
        db: AsyncSession,
        repository_id: UUID,
        status: Optional[ExecutionStatus] = None,
    ) -> int:
        stmt = select(func.count()).select_from(Execution).where(Execution.repository_id == repository_id)
        if status:
            stmt = stmt.where(Execution.status == status)
        result = await db.execute(stmt)
        return result.scalar_one()

    async def get_filtered(
        self,
        db: AsyncSession,
        repository_id: Optional[UUID] = None,
        status: Optional[ExecutionStatus] = None,
        branch: Optional[str] = None,
        skip: int = 0,
        limit: int = 20,
    ) -> Tuple[Sequence[Execution], int]:
        stmt = select(Execution).options(selectinload(Execution.repository))
        count_stmt = select(func.count()).select_from(Execution)

        if repository_id:
            stmt = stmt.where(Execution.repository_id == repository_id)
            count_stmt = count_stmt.where(Execution.repository_id == repository_id)
        if status:
            stmt = stmt.where(Execution.status == status)
            count_stmt = count_stmt.where(Execution.status == status)
        if branch:
            stmt = stmt.where(Execution.branch == branch)
            count_stmt = count_stmt.where(Execution.branch == branch)

        count_res = await db.execute(count_stmt)
        total = count_res.scalar_one()

        stmt = stmt.order_by(Execution.created_at.desc()).offset(skip).limit(limit)
        result = await db.execute(stmt)
        items = result.scalars().all()

        return items, total


execution_repo = ExecutionRepository()

