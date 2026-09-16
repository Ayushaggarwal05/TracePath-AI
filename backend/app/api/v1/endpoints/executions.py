import math
from typing import Optional
from uuid import UUID
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.dependencies import get_database_session
from app.models.execution import ExecutionStatus
from app.schemas.common import PaginatedResponse
from app.schemas.execution import (
    ExecutionCreate,
    ExecutionDetailResponse,
    ExecutionResponse,
)
from app.services.execution_service import execution_service
from app.pipeline.orchestrator import pipeline_orchestrator
from app.services.repository_service import repository_service

router = APIRouter()


@router.get(
    "",
    summary="List Executions",
    response_model=PaginatedResponse[ExecutionResponse],
    status_code=status.HTTP_200_OK,
)
async def list_executions(
    repository_id: Optional[UUID] = Query(default=None, description="Filter by repository ID"),
    status: Optional[ExecutionStatus] = Query(default=None, description="Filter by execution status"),
    branch: Optional[str] = Query(default=None, description="Filter by branch"),
    page: int = Query(default=1, ge=1, description="Page number"),
    page_size: int = Query(default=20, ge=1, le=100, description="Items per page"),
    db: AsyncSession = Depends(get_database_session),
) -> PaginatedResponse[ExecutionResponse]:
    """
    List executions across all repositories with optional status/branch filtering.
    """
    skip = (page - 1) * page_size
    items, total = await execution_service.get_filtered_executions(
        db,
        repository_id=repository_id,
        status=status,
        branch=branch,
        skip=skip,
        limit=page_size,
    )
    total_pages = math.ceil(total / page_size) if total > 0 else 1

    return PaginatedResponse(
        items=[ExecutionResponse.model_validate(e) for e in items],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.post(
    "",
    summary="Create & Trigger Execution",
    response_model=ExecutionDetailResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_execution(
    execution_in: ExecutionCreate,
    run_pipeline: bool = Query(default=False, description="Run sync pipeline immediately (Phase 1 demo)"),
    db: AsyncSession = Depends(get_database_session),
) -> ExecutionDetailResponse:
    """
    Create a new documentation synchronization execution job.
    Optionally triggers the multi-agent pipeline simulation.
    """
    execution = await execution_service.create_execution(db, execution_in)

    if run_pipeline:
        repo = await repository_service.get_repository(db, execution.repository_id)
        doc_paths = repo.automation.doc_paths if repo.automation else None
        execution = await pipeline_orchestrator.execute_sync_pipeline(
            db=db,
            execution_id=execution.id,
            repository_full_name=repo.full_name,
            commit_sha=execution.commit_sha,
            doc_paths=doc_paths,
        )

    return ExecutionDetailResponse.model_validate(execution)


@router.get(
    "/{execution_id}",
    summary="Get Execution Details",
    response_model=ExecutionDetailResponse,
    status_code=status.HTTP_200_OK,
)
async def get_execution_details(
    execution_id: UUID,
    db: AsyncSession = Depends(get_database_session),
) -> ExecutionDetailResponse:
    """
    Retrieve full execution record including changed files, agent decisions, diffs, and error logs.
    """
    execution = await execution_service.get_execution(db, execution_id)
    return ExecutionDetailResponse.model_validate(execution)
