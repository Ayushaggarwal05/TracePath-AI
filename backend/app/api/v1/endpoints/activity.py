from datetime import datetime, timezone
import logging
from typing import Any, Dict, List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.dependencies import get_database_session
from app.repositories.execution_repository import execution_repo
from app.repositories.repository_repository import repository_repo

router = APIRouter()
logger = logging.getLogger("tracepath.activity")


def _to_iso_utc(dt) -> str:
    if not dt:
        return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
    if hasattr(dt, "tzinfo") and dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.isoformat().replace("+00:00", "Z")


@router.get(
    "",
    summary="List Activity Feed Events",
    status_code=status.HTTP_200_OK,
)
async def list_activity(
    repository_id: Optional[UUID] = Query(None, description="Filter by repository ID"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    db: AsyncSession = Depends(get_database_session),
) -> Dict[str, Any]:
    """
    Returns an aggregated activity feed of code pushes, agent execution outcomes,
    and documentation commits.
    """
    limit = page_size * page
    if repository_id:
        executions = await execution_repo.get_by_repository_id(db, repository_id, limit=limit)
    else:
        executions = await execution_repo.get_recent_executions(db, limit=limit)

    # Pre-fetch repository names
    repos = await repository_repo.get_multi(db, limit=100)
    repo_map = {repo.id: repo.full_name for repo in repos}

    events: List[Dict[str, Any]] = []

    for exec_item in executions:
        repo_name = repo_map.get(exec_item.repository_id, "unknown/repository")
        status_val = exec_item.status.value if hasattr(exec_item.status, "value") else str(exec_item.status)

        # 1. Pipeline outcome event
        if status_val == "COMPLETED":
            doc_count = len(exec_item.updated_documents or [])
            events.append({
                "id": f"evt-{exec_item.id}-completed",
                "type": "COMMIT_CREATED",
                "repository_id": str(exec_item.repository_id),
                "repository_name": repo_name,
                "execution_id": str(exec_item.id),
                "commit_sha": exec_item.final_commit_sha or exec_item.commit_sha,
                "branch": exec_item.branch,
                "title": f"Documentation synchronized ({doc_count} files updated)",
                "description": exec_item.analysis_result.get("summary") if exec_item.analysis_result else "Documentation updated and committed.",
                "actor": "TracePath AI",
                "created_at": _to_iso_utc(exec_item.completion_time or exec_item.created_at),
                "metadata": {
                    "docs_updated_count": doc_count,
                    "pull_request_url": exec_item.pull_request_url,
                },
            })
        elif status_val == "FAILED":
            err_info = exec_item.error_information or {}
            events.append({
                "id": f"evt-{exec_item.id}-failed",
                "type": "EXECUTION_FAILED",
                "repository_id": str(exec_item.repository_id),
                "repository_name": repo_name,
                "execution_id": str(exec_item.id),
                "commit_sha": exec_item.commit_sha,
                "branch": exec_item.branch,
                "title": f"Pipeline failed at stage: {err_info.get('stage', 'Unknown')}",
                "description": err_info.get("error", "Execution failed."),
                "actor": "TracePath AI",
                "created_at": _to_iso_utc(exec_item.updated_at or exec_item.created_at),
            })

        # 2. Push change received event
        events.append({
            "id": f"evt-{exec_item.id}-push",
            "type": "CODE_CHANGE_DETECTED",
            "repository_id": str(exec_item.repository_id),
            "repository_name": repo_name,
            "execution_id": str(exec_item.id),
            "commit_sha": exec_item.commit_sha,
            "branch": exec_item.branch,
            "title": f"Code push detected on {exec_item.branch}",
            "description": f"Triggered autonomous analysis for commit {exec_item.commit_sha[:8]}.",
            "actor": "GitHub Webhook",
            "created_at": _to_iso_utc(exec_item.created_at),
            "metadata": {
                "files_changed_count": len(exec_item.changed_files or []),
            },
        })

    # Sort events by created_at descending
    events.sort(key=lambda e: e["created_at"], reverse=True)

    return {
        "items": events[:page_size],
        "total": len(events),
        "page": page,
        "page_size": page_size,
    }
