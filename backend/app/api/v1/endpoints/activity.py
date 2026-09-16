import logging
from typing import Any, Dict, List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.dependencies import get_database_session
from app.repositories.execution_repository import execution_repo

router = APIRouter()
logger = logging.getLogger("tracepath.activity")


@router.get("", status_code=status.HTTP_200_OK)
async def get_activity_events(
    repository_id: Optional[UUID] = Query(None, description="Filter activity by repository ID"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_database_session),
) -> Dict[str, Any]:
    """
    Returns a unified chronological audit event feed derived from real database records.
    """
    events: List[Dict[str, Any]] = []

    skip = (page - 1) * page_size
    executions, total = await execution_repo.get_filtered(
        db,
        repository_id=repository_id,
        skip=skip,
        limit=page_size,
    )

    for exec_item in executions:
        repo_name = getattr(exec_item.repository, "full_name", "Repository") if exec_item.repository else "Repository"

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
                "created_at": exec_item.completion_time.isoformat() if exec_item.completion_time else exec_item.created_at.isoformat(),
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
                "created_at": exec_item.updated_at.isoformat(),
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
            "created_at": exec_item.created_at.isoformat(),
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
