import math
from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.dependencies import get_current_user, get_database_session
from app.core.security import CurrentUser
from app.models.execution import ExecutionStatus
from app.schemas.common import PaginatedResponse
from app.schemas.execution import ExecutionResponse
from app.schemas.repository import (
    RepositoryCreate,
    RepositoryDetailResponse,
    RepositoryResponse,
    RepositoryUpdate,
)
from app.schemas.repository_automation import (
    AutomationToggleResponse,
    RepositoryAutomationResponse,
    RepositoryAutomationUpdate,
)
from app.services.automation_service import automation_service
from app.services.execution_service import execution_service
from app.services.repository_service import repository_service
from app.services.user_service import user_service

router = APIRouter()


@router.get(
    "",
    summary="List Repositories",
    response_model=PaginatedResponse[RepositoryResponse],
    status_code=status.HTTP_200_OK,
)
async def list_repositories(
    page: int = Query(default=1, ge=1, description="Page number"),
    page_size: int = Query(default=20, ge=1, le=100, description="Items per page"),
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_database_session),
) -> PaginatedResponse[RepositoryResponse]:
    """
    List connected repositories for the current user.
    """
    user = await user_service.get_or_create_user(db, current_user)
    skip = (page - 1) * page_size
    repos, total = await repository_service.get_user_repositories(
        db, user_id=user.id, skip=skip, limit=page_size
    )

    items = [RepositoryResponse.model_validate(r) for r in repos]
    total_pages = math.ceil(total / page_size) if total > 0 else 1

    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.post(
    "",
    summary="Register Repository",
    response_model=RepositoryResponse,
    status_code=status.HTTP_201_CREATED,
)
async def register_repository(
    repo_in: RepositoryCreate,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_database_session),
) -> RepositoryResponse:
    """
    Register a GitHub repository for documentation tracking.
    """
    user = await user_service.get_or_create_user(db, current_user)
    repo_in.user_id = user.id
    repo = await repository_service.register_repository(db, user_id=user.id, repo_data=repo_in)
    return RepositoryResponse.model_validate(repo)


@router.get(
    "/{repository_id}",
    summary="Get Repository Details",
    response_model=RepositoryDetailResponse,
    status_code=status.HTTP_200_OK,
)
async def get_repository_details(
    repository_id: UUID,
    db: AsyncSession = Depends(get_database_session),
) -> RepositoryDetailResponse:
    """
    Fetch comprehensive repository details including automation configuration and execution stats.
    """
    repo = await repository_service.get_repository(db, repository_id)
    response = RepositoryDetailResponse.model_validate(repo)
    response.execution_count = len(repo.executions)
    return response


@router.patch(
    "/{repository_id}",
    summary="Update Repository",
    response_model=RepositoryResponse,
    status_code=status.HTTP_200_OK,
)
async def update_repository(
    repository_id: UUID,
    update_in: RepositoryUpdate,
    db: AsyncSession = Depends(get_database_session),
) -> RepositoryResponse:
    """
    Update repository metadata.
    """
    repo = await repository_service.update_repository(db, repository_id, update_in)
    return RepositoryResponse.model_validate(repo)


@router.get(
    "/{repository_id}/automation",
    summary="Get Repository Automation Status & Settings",
    response_model=RepositoryAutomationResponse,
    status_code=status.HTTP_200_OK,
)
async def get_repository_automation(
    repository_id: UUID,
    db: AsyncSession = Depends(get_database_session),
) -> RepositoryAutomationResponse:
    """
    Get the automation status (ACTIVE / INACTIVE) and target documentation configurations.
    """
    automation = await automation_service.get_automation_by_repo_id(db, repository_id)
    return RepositoryAutomationResponse.model_validate(automation)


@router.post(
    "/{repository_id}/automation/activate",
    summary="Activate Repository Automation",
    response_model=AutomationToggleResponse,
    status_code=status.HTTP_200_OK,
)
async def activate_automation(
    repository_id: UUID,
    db: AsyncSession = Depends(get_database_session),
) -> AutomationToggleResponse:
    """
    Activate documentation automation for the repository.
    """
    return await automation_service.activate_automation(db, repository_id)


@router.post(
    "/{repository_id}/automation/deactivate",
    summary="Deactivate Repository Automation",
    response_model=AutomationToggleResponse,
    status_code=status.HTTP_200_OK,
)
async def deactivate_automation(
    repository_id: UUID,
    db: AsyncSession = Depends(get_database_session),
) -> AutomationToggleResponse:
    """
    Deactivate documentation automation for the repository.
    """
    return await automation_service.deactivate_automation(db, repository_id)


@router.patch(
    "/{repository_id}/automation",
    summary="Update Automation Configuration",
    response_model=RepositoryAutomationResponse,
    status_code=status.HTTP_200_OK,
)
async def update_automation_config(
    repository_id: UUID,
    update_in: RepositoryAutomationUpdate,
    db: AsyncSession = Depends(get_database_session),
) -> RepositoryAutomationResponse:
    """
    Update documentation paths, branches, or commit modes for the repository automation.
    """
    updated = await automation_service.update_automation_config(db, repository_id, update_in)
    return RepositoryAutomationResponse.model_validate(updated)


@router.get(
    "/{repository_id}/executions",
    summary="List Repository Executions",
    response_model=PaginatedResponse[ExecutionResponse],
    status_code=status.HTTP_200_OK,
)
async def list_repository_executions(
    repository_id: UUID,
    status: Optional[ExecutionStatus] = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    db: AsyncSession = Depends(get_database_session),
) -> PaginatedResponse[ExecutionResponse]:
    """
    List execution history specifically for this repository.
    """
    skip = (page - 1) * page_size
    items, total = await execution_service.get_executions_by_repository(
        db,
        repository_id=repository_id,
        status=status,
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
