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
    summary="List Consolidated Activity Feed Events",
    status_code=status.HTTP_200_OK,
)
async def list_activity(
    repository_id: Optional[UUID] = Query(None, description="Filter by repository ID"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(50, ge=1, le=100, description="Items per page"),
    db: AsyncSession = Depends(get_database_session),
) -> Dict[str, Any]:
    """
    Returns a unified, consolidated chronological activity feed.
    Each execution run is represented as one clean, comprehensive event card.
    """
    limit = max(page_size * page, 50)
    executions, total_execs = await execution_repo.get_filtered(
        db,
        repository_id=repository_id,
        skip=0,
        limit=limit,
    )

    # Pre-fetch repository names
    repos = await repository_repo.get_multi(db, limit=100)
    repo_map = {repo.id: repo for repo in repos}

    events: List[Dict[str, Any]] = []

    # 1. Add repository activation events
    for repo in repos:
        if repository_id and repo.id != repository_id:
            continue
        events.append({
            "id": f"evt-repo-{repo.id}-act",
            "type": "AUTOMATION_ACTIVATED",
            "repository_id": str(repo.id),
            "repository_name": repo.full_name,
            "title": f"Autonomous pipeline active for {repo.name}",
            "description": f"Monitoring branch {repo.default_branch} with 3 AI agents.",
            "actor": "System",
            "created_at": _to_iso_utc(repo.created_at),
            "metadata": {
                "branch": repo.default_branch,
            },
        })

    # 2. Add one clean, unified event per execution run
    for exec_item in executions:
        repo = repo_map.get(exec_item.repository_id)
        repo_name = repo.full_name if repo else (exec_item.repository.full_name if exec_item.repository else "unknown/repository")
        status_val = exec_item.status.value if hasattr(exec_item.status, "value") else str(exec_item.status)
        doc_count = len(exec_item.updated_documents or [])
        analysis_summary = (exec_item.analysis_result or {}).get("summary")
        files_count = len(exec_item.changed_files or [])

        # Scenario A: Completed Successfully with Commit / PR
        if status_val == "COMPLETED":
            events.append({
                "id": f"evt-{exec_item.id}",
                "type": "COMMIT_CREATED",
                "repository_id": str(exec_item.repository_id),
                "repository_name": repo_name,
                "execution_id": str(exec_item.id),
                "commit_sha": exec_item.final_commit_sha or exec_item.commit_sha,
                "branch": exec_item.branch,
                "title": f"Documentation synchronized ({doc_count} file{'s' if doc_count != 1 else ''} updated)",
                "description": analysis_summary or f"Synchronized {doc_count} documentation files across {files_count} code changes.",
                "actor": "TracePath AI",
                "created_at": _to_iso_utc(exec_item.completion_time or exec_item.created_at),
                "metadata": {
                    "docs_updated_count": doc_count,
                    "files_changed_count": files_count,
                    "pull_request_url": exec_item.pull_request_url,
                },
            })

        # Scenario B: Failed Run
        elif status_val == "FAILED":
            err_info = exec_item.error_information or {}
            stage = err_info.get("stage", "Execution")
            error_msg = err_info.get("error", "Execution failed.")
            
            # Form clean, informative combined description
            if analysis_summary:
                desc = f"Agent 1 analyzed '{analysis_summary}'. Halted at {stage}: {error_msg}"
            else:
                desc = f"Pipeline halted during {stage}: {error_msg}"

            events.append({
                "id": f"evt-{exec_item.id}",
                "type": "EXECUTION_FAILED",
                "repository_id": str(exec_item.repository_id),
                "repository_name": repo_name,
                "execution_id": str(exec_item.id),
                "commit_sha": exec_item.commit_sha,
                "branch": exec_item.branch,
                "title": f"Pipeline halted at {stage}",
                "description": desc[:250],
                "actor": "TracePath AI",
                "created_at": _to_iso_utc(exec_item.updated_at or exec_item.created_at),
                "metadata": {
                    "agent_stage": stage,
                    "error_message": error_msg,
                    "files_changed_count": files_count,
                },
            })

        # Scenario C: Skipped (No Doc Changes Needed)
        elif status_val == "SKIPPED":
            events.append({
                "id": f"evt-{exec_item.id}",
                "type": "AI_ANALYSIS_COMPLETED",
                "repository_id": str(exec_item.repository_id),
                "repository_name": repo_name,
                "execution_id": str(exec_item.id),
                "commit_sha": exec_item.commit_sha,
                "branch": exec_item.branch,
                "title": f"Code analyzed — Documentation up-to-date",
                "description": analysis_summary or "Autonomous analysis determined existing documentation is completely accurate.",
                "actor": "Agent 2: Impact Planner",
                "created_at": _to_iso_utc(exec_item.completion_time or exec_item.created_at),
                "metadata": {
                    "files_changed_count": files_count,
                },
            })

        # Scenario D: In-Flight Execution
        else:
            events.append({
                "id": f"evt-{exec_item.id}",
                "type": "CODE_CHANGE_DETECTED",
                "repository_id": str(exec_item.repository_id),
                "repository_name": repo_name,
                "execution_id": str(exec_item.id),
                "commit_sha": exec_item.commit_sha,
                "branch": exec_item.branch,
                "title": f"Pipeline in progress: {status_val}",
                "description": f"Processing commit {exec_item.commit_sha[:8]} on {exec_item.branch} with 3 AI agents.",
                "actor": "TracePath Pipeline",
                "created_at": _to_iso_utc(exec_item.created_at),
                "metadata": {
                    "files_changed_count": files_count,
                },
            })

    # Sort events by created_at descending
    events.sort(key=lambda e: e["created_at"], reverse=True)

    start_idx = (page - 1) * page_size
    paged_items = events[start_idx : start_idx + page_size]

    return {
        "items": paged_items,
        "total": len(events),
        "page": page,
        "page_size": page_size,
    }
