from datetime import datetime, timezone
import math
from typing import Any, Dict, List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.dependencies import get_current_user, get_database_session
from app.core.security import CurrentUser
from app.models.execution import ExecutionStatus
from app.repositories.execution_repository import execution_repo
from app.repositories.repository_repository import repository_repo
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

router = APIRouter()


def _to_iso_utc(dt) -> str:
    if not dt:
        return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
    if hasattr(dt, "tzinfo") and dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.isoformat().replace("+00:00", "Z")
from app.services.repository_service import repository_service

router = APIRouter()


@router.get(
    "",
    summary="List Repositories",
    response_model=PaginatedResponse[RepositoryResponse],
    status_code=status.HTTP_200_OK,
)
async def list_repositories(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_database_session),
) -> PaginatedResponse[RepositoryResponse]:
    """
    List all repositories registered by the authenticated user with pagination and automation status.
    """
    skip = (page - 1) * page_size
    items, total = await repository_service.get_user_repositories(
        db, user_id=user.id, skip=skip, limit=page_size
    )
    total_pages = math.ceil(total / page_size) if total > 0 else 1

    return PaginatedResponse(
        items=[RepositoryResponse.model_validate(r) for r in items],
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
    user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_database_session),
) -> RepositoryResponse:
    """
    Register a new GitHub repository into TracePath AI for autonomous documentation tracking.
    """
    repo = await repository_service.register_repository(
        db, user_id=user.id, repo_data=repo_in
    )
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
    Get deep details for a repository including automation config and recent execution history.
    """
    repo = await repository_service.get_repository(db, repository_id)
    return RepositoryDetailResponse.model_validate(repo)


@router.patch(
    "/{repository_id}",
    summary="Update Repository Settings",
    response_model=RepositoryResponse,
    status_code=status.HTTP_200_OK,
)
async def update_repository(
    repository_id: UUID,
    update_in: RepositoryUpdate,
    db: AsyncSession = Depends(get_database_session),
) -> RepositoryResponse:
    """
    Update general settings for a repository.
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


@router.get(
    "/{repository_id}/documents",
    summary="List Tracked Repository Documents",
    status_code=status.HTTP_200_OK,
)
async def list_repository_documents(
    repository_id: UUID,
    db: AsyncSession = Depends(get_database_session),
) -> List[Dict[str, Any]]:
    """
    Returns the real catalog of tracked documentation files for this repository,
    annotated with the latest diff, sync timestamp, and update count from executions.
    """
    repo = await repository_service.get_repository(db, repository_id)
    doc_paths = repo.automation.doc_paths if repo.automation and repo.automation.doc_paths else ["ARCHITECTURE.md", "PRD.md", "README.md"]
    executions = await execution_repo.get_by_repository_id(db, repository_id, limit=50)

    results: List[Dict[str, Any]] = []

    for path in doc_paths:
        # Categorize
        lower_path = path.lower()
        if "arch" in lower_path:
            category = "architecture"
            title = "System Architecture & Data Flows"
        elif "prd" in lower_path:
            category = "prd"
            title = "Product Requirements & Specifications"
        elif "api" in lower_path:
            category = "api"
            title = "REST API Reference"
        elif "adr" in lower_path:
            category = "adr"
            title = "Architecture Decision Record"
        else:
            category = "general"
            title = f"Document: {path}"
        # Find the latest execution that updated this specific document
        matching_updates = []
        for exec_item in executions:
            if exec_item.updated_documents:
                for doc_update in exec_item.updated_documents:
                    if doc_update.get("doc_path") == path:
                        matching_updates.append((exec_item, doc_update))
                        break

        if matching_updates:
            latest_exec, latest_doc = matching_updates[0]
            results.append({
                "id": f"doc-{repository_id}-{hash(path) % 10000}",
                "repository_id": str(repository_id),
                "doc_path": path,
                "title": title,
                "category": category,
                "last_updated_at": _to_iso_utc(latest_exec.created_at),
                "last_commit_sha": latest_exec.commit_sha,
                "last_execution_id": str(latest_exec.id),
                "total_updates_count": len(matching_updates),
                "summary_of_last_change": latest_doc.get("summary_of_changes", "Autonomous sync update"),
                "diff": latest_doc.get("diff", ""),
                "current_content": latest_doc.get("updated_content", ""),
            })
        else:
            results.append({
                "id": f"doc-{repository_id}-{hash(path) % 10000}",
                "repository_id": str(repository_id),
                "doc_path": path,
                "title": title,
                "category": category,
                "last_updated_at": _to_iso_utc(repo.created_at),
                "last_commit_sha": "initial",
                "last_execution_id": "initial",
                "total_updates_count": 0,
                "summary_of_last_change": "Initial repository documentation setup.",
                "diff": "",
                "current_content": f"# {title}\n\nTracked by TracePath AI.",
            })

    return results


@router.get(
    "/{repository_id}/documents/history",
    summary="Get Document Revision History",
    status_code=status.HTTP_200_OK,
)
async def get_document_history(
    repository_id: UUID,
    doc_path: str = Query(..., description="Path of document to query history for"),
    db: AsyncSession = Depends(get_database_session),
) -> List[Dict[str, Any]]:
    """
    Returns the chronological revision history of a specific document across past executions.
    """
    executions = await execution_repo.get_by_repository_id(db, repository_id, limit=50)
    history: List[Dict[str, Any]] = []

    for exec_item in executions:
        if exec_item.updated_documents:
            for doc_update in exec_item.updated_documents:
                if doc_update.get("doc_path") == doc_path:
                    history.append({
                        "id": f"hist-{exec_item.id}-{hash(doc_path) % 10000}",
                        "doc_path": doc_path,
                        "execution_id": str(exec_item.id),
                        "commit_sha": exec_item.commit_sha,
                        "commit_message": exec_item.analysis_result.get("summary") if exec_item.analysis_result else "Code change update",
                        "author": "TracePath AI",
                        "action": doc_update.get("action", "update"),
                        "summary_of_changes": doc_update.get("summary_of_changes", "Documentation update"),
                        "diff": doc_update.get("diff", ""),
                        "updated_content": doc_update.get("updated_content", ""),
                        "created_at": _to_iso_utc(exec_item.created_at),
                        "validation_passed": True,
                    })

    return history
