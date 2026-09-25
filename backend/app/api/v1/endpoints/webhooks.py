import hashlib
import hmac
import logging
from typing import Any, Dict, Optional
from fastapi import APIRouter, BackgroundTasks, Depends, Header, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.dependencies import get_database_session
from app.core.config import settings
from app.database.session import async_session_factory
from app.models.execution import ExecutionEventType, ExecutionStatus
from app.models.repository import Repository
from app.models.repository_automation import AutomationStatus
from app.pipeline.orchestrator import pipeline_orchestrator
from app.repositories.execution_repository import execution_repo
from app.repositories.repository_repository import repository_repo

router = APIRouter()
logger = logging.getLogger("tracepath.webhooks")


def verify_github_signature(payload_body: bytes, signature_header: Optional[str]) -> bool:
    """
    Validates GitHub HMAC-SHA256 signature against settings.GITHUB_WEBHOOK_SECRET.
    If secret is not set, allows in development mode with a warning.
    """
    secret = settings.GITHUB_WEBHOOK_SECRET
    if not secret:
        logger.warning("GITHUB_WEBHOOK_SECRET not set; signature verification bypassed.")
        return True

    if not signature_header:
        logger.error("Missing X-Hub-Signature-256 header in webhook request.")
        return False

    if not signature_header.startswith("sha256="):
        return False

    received_sig = signature_header[7:]
    expected_sig = hmac.new(
        key=secret.encode("utf-8"),
        msg=payload_body,
        digestmod=hashlib.sha256,
    ).hexdigest()

    return hmac.compare_digest(received_sig, expected_sig)


async def _run_orchestrator_in_background(
    execution_id,
    repository_full_name: str,
    commit_sha: str,
    branch: str,
    doc_paths: Optional[list] = None,
    auto_commit: bool = True,
    create_pull_request: bool = False,
):
    """Background worker task executed outside the webhook HTTP response lifecycle."""
    async with async_session_factory() as db_session:
        try:
            await pipeline_orchestrator.execute_sync_pipeline(
                db=db_session,
                execution_id=execution_id,
                repository_full_name=repository_full_name,
                commit_sha=commit_sha,
                branch=branch,
                doc_paths=doc_paths,
                auto_commit=auto_commit,
                create_pull_request=create_pull_request,
            )
        except Exception as exc:
            logger.error(f"Background pipeline execution failed: {exc}", exc_info=True)


@router.post("/webhooks", status_code=status.HTTP_202_ACCEPTED)
async def handle_github_webhook(
    request: Request,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_database_session),
    x_github_event: Optional[str] = Header(None),
    x_hub_signature_256: Optional[str] = Header(None),
) -> Dict[str, Any]:
    """
    Receives GitHub webhook push events, verifies HMAC signature,
    checks automation status, prevents loops, deduplicates, and dispatches background pipeline.
    """
    raw_body = await request.body()

    # 1. Signature Verification
    if not verify_github_signature(raw_body, x_hub_signature_256):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid GitHub webhook signature.",
        )

    # 2. Ping Event Handling (GitHub Webhook Creation Verification)
    if x_github_event == "ping":
        logger.info("Received GitHub ping webhook.")
        return {"status": "ok", "message": "Pong! Webhook configured correctly."}

    # 3. Filter Event Types (Currently Push, extensible for Pull Request)
    if x_github_event != "push":
        logger.info(f"Ignoring unsupported GitHub event type: {x_github_event}")
        return {"status": "ignored", "message": f"Event {x_github_event} ignored."}

    try:
        payload: Dict[str, Any] = await request.json()
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid JSON payload.",
        )

    # 4. Extract Repository & Commit Details
    repo_data = payload.get("repository", {})
    github_repo_id = str(repo_data.get("id", ""))
    full_name = repo_data.get("full_name", "")
    head_commit = payload.get("head_commit") or {}
    commit_sha = head_commit.get("id") or payload.get("after") or ""
    ref = payload.get("ref", "refs/heads/main")
    branch = ref.split("/")[-1] if ref.startswith("refs/heads/") else ref

    if not commit_sha or commit_sha == "0000000000000000000000000000000000000000":
        return {"status": "ignored", "message": "Branch deletion or empty commit."}

    # =========================================================================
    # 5. LOOP PREVENTION (CRITICAL)
    # =========================================================================
    author_info = head_commit.get("author", {})
    committer_info = head_commit.get("committer", {})
    commit_message = head_commit.get("message", "")

    author_name = str(author_info.get("name", "")).lower()
    author_email = str(author_info.get("email", "")).lower()
    committer_name = str(committer_info.get("name", "")).lower()
    committer_email = str(committer_info.get("email", "")).lower()

    # Detect if commit originated from TracePath AI itself
    is_tracepath_author = (
        "tracepath" in author_name
        or "tracepath" in committer_name
        or "bot@tracepath.dev" in author_email
        or "bot@tracepath.dev" in committer_email
        or "[tracepath-sync" in commit_message
        or "[skip-tracepath]" in commit_message
    )

    if is_tracepath_author:
        logger.info(
            f"Loop Prevention: Skipped webhook for commit {commit_sha[:8]} generated by TracePath AI bot."
        )
        return {
            "status": "skipped",
            "message": "Loop prevention: Commit originated from TracePath AI autonomous sync.",
        }

    # =========================================================================
    # 6. Repository & Automation Verification
    # =========================================================================
    repo: Optional[Repository] = None
    if github_repo_id:
        repo = await repository_repo.get_by_github_repo_id(db, github_repo_id)
    if not repo and full_name:
        repo = await repository_repo.get_by_full_name(db, full_name)

    if not repo:
        logger.info(f"Repository {full_name} (ID: {github_repo_id}) is not connected to TracePath AI.")
        return {
            "status": "skipped",
            "message": f"Repository {full_name} is not registered in TracePath AI.",
        }

    automation_active = False
    if repo.automation:
        status_val = repo.automation.status.value if hasattr(repo.automation.status, "value") else str(repo.automation.status)
        automation_active = (status_val == "ACTIVE" or repo.automation.status == AutomationStatus.ACTIVE)

    if not automation_active:
        logger.info(f"Automation for repository {full_name} is INACTIVE. Skipping execution.")
        return {
            "status": "skipped",
            "message": f"Automation is inactive for {full_name}.",
        }

    # =========================================================================
    # 7. Idempotency Check (Prevent duplicate executions)
    # =========================================================================
    existing_execs = await execution_repo.get_by_repository_id(db, repo.id, limit=20)
    for existing in existing_execs:
        if existing.commit_sha == commit_sha and existing.status in [
            ExecutionStatus.PENDING,
            ExecutionStatus.ANALYZING,
            ExecutionStatus.PLANNING,
            ExecutionStatus.GENERATING,
            ExecutionStatus.COMMITTING,
            ExecutionStatus.COMPLETED,
        ]:
            logger.info(f"Idempotency check: Execution for commit {commit_sha[:8]} already exists ({existing.status}).")
            return {
                "status": "duplicate",
                "execution_id": str(existing.id),
                "message": f"Execution already running or completed for commit {commit_sha[:8]}.",
            }

    # =========================================================================
    # 8. Create Execution Record
    # =========================================================================
    execution_in = {
        "repository_id": repo.id,
        "event_type": ExecutionEventType.PUSH,
        "commit_sha": commit_sha,
        "branch": branch,
        "status": ExecutionStatus.PENDING,
    }
    created_execution = await execution_repo.create(db, obj_in=execution_in)

    # =========================================================================
    # 9. Start Background Processing & Return 202 Accepted Fast
    # =========================================================================
    doc_paths = repo.automation.doc_paths if repo.automation else None
    auto_commit = repo.automation.auto_commit if (repo.automation and repo.automation.auto_commit is not None) else True
    create_pr = repo.automation.create_pull_request if (repo.automation and repo.automation.create_pull_request is not None) else False

    background_tasks.add_task(
        _run_orchestrator_in_background,
        execution_id=created_execution.id,
        repository_full_name=repo.full_name,
        commit_sha=commit_sha,
        branch=branch,
        doc_paths=doc_paths,
        auto_commit=auto_commit,
        create_pull_request=create_pr,
    )

    logger.info(
        f"Enqueued background execution {created_execution.id} for {repo.full_name} @ {commit_sha[:8]}"
    )

    return {
        "status": "accepted",
        "execution_id": str(created_execution.id),
        "repository": repo.full_name,
        "commit_sha": commit_sha,
        "message": "Autonomous documentation sync pipeline enqueued in background.",
    }
