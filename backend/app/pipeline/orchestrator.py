import asyncio
from datetime import datetime
import logging
from typing import Any, Dict, List, Optional
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.agents.change_analyzer import change_analyzer_agent
from app.agents.doc_generator import doc_generator_agent
from app.agents.impact_planner import impact_planner_agent
from app.core.security import decrypt_token
from app.github.interface import IGitHubClient
from app.github import get_github_client
from app.models.execution import Execution, ExecutionStatus
from app.models.github_connection import GitHubConnection
from app.pipeline.context_builder import context_builder
from app.services.execution_service import execution_service

logger = logging.getLogger("tracepath.pipeline")


def _record_event(
    telemetry_logs: List[Dict[str, Any]],
    stage: str,
    level: str,
    message: str,
    **kwargs: Any,
) -> None:
    telemetry_logs.append({
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "stage": stage,
        "level": level,
        "message": message,
        **kwargs,
    })


class PipelineOrchestrator:
    """
    Coordinates the autonomous documentation sync lifecycle:
    GitHub Push Event
    ↓
    Bounded Context Builder
    ↓
    Agent 1 (Understand What Changed)
    ↓
    Agent 2 (Determine Documentation Impact)
    ↓
    [If affected] Agent 3 (Generate Minimal Doc Updates & Validate)
    ↓
    Deterministic Backend GitHub Write-Back (Direct Commit or Pull Request)
    ↓
    Execution Complete (Audit Saved)
    """

    async def execute_sync_pipeline(
        self,
        db: AsyncSession,
        execution_id: UUID,
        repository_full_name: str,
        commit_sha: str,
        branch: str = "main",
        doc_paths: Optional[List[str]] = None,
        github_client: Optional[IGitHubClient] = None,
        auto_commit: bool = True,
        create_pull_request: bool = False,
    ) -> Execution:
        telemetry_logs: List[Dict[str, Any]] = []

        _record_event(
            telemetry_logs,
            stage="Ingestion",
            level="INFO",
            message=f"Initializing pipeline execution for {repository_full_name} on branch {branch}...",
        )

        # Step -1: Resolve authenticated GitHub client if not explicitly passed
        client = github_client
        if not client:
            token = None
            try:
                stmt = select(GitHubConnection).order_by(GitHubConnection.created_at.desc())
                res = await db.execute(stmt)
                conn = res.scalars().first()
                if conn and conn.access_token_enc:
                    token = decrypt_token(conn.access_token_enc)
            except Exception as e:
                logger.warning(f"Could not retrieve GitHub token from DB: {e}")
            client = get_github_client(token=token)

        # Step -0.5: Resolve real commit SHA if generic or requested latest
        if hasattr(client, "get_latest_commit_sha"):
            if not commit_sha or commit_sha in ("latest", "HEAD", "latest-commit") or commit_sha.startswith("bill"):
                try:
                    latest_sha = await client.get_latest_commit_sha(repository_full_name, branch)
                    if latest_sha:
                        commit_sha = latest_sha
                        _record_event(
                            telemetry_logs,
                            stage="Ingestion",
                            level="INFO",
                            message=f"Resolved latest commit SHA: {latest_sha[:8]}",
                        )
                        await execution_service.update_execution_progress(
                            db,
                            execution_id,
                            update_in={"commit_sha": latest_sha, "telemetry_logs": telemetry_logs},
                        )
                except Exception as e:
                    logger.warning(f"Could not resolve latest commit SHA from GitHub: {e}")

        logger.info(f"Starting pipeline execution {execution_id} for {repository_full_name} @ {commit_sha[:8]}")

        # Step 0: Build Bounded Context from GitHub API
        try:
            context = await context_builder.build_context(
                github_client=client,
                repo_full_name=repository_full_name,
                commit_sha=commit_sha,
                branch=branch,
                configured_doc_paths=doc_paths,
            )
            _record_event(
                telemetry_logs,
                stage="Ingestion",
                level="INFO",
                message=f"Context assembled: {len(context.changed_files)} changed files, {len(context.existing_docs)} tracked docs loaded ({len(context.git_diff)} chars diff)",
            )
        except Exception as err:
            return await self._handle_failure(
                db, execution_id, "ContextBuilder", f"Failed to build repository context from GitHub: {str(err)}", telemetry_logs
            )

        # Fast Loop Protection: Check if commit originated from TracePath AI
        commit_msg = (context.commit_message or "").lower()
        commit_author = (context.author or "").lower()
        if (
            "[tracepath-sync" in commit_msg
            or "[skip-tracepath]" in commit_msg
            or "docs(tracepath):" in commit_msg
            or "tracepath" in commit_author
            or "bot@tracepath.dev" in commit_author
        ):
            logger.info(f"Loop Prevention: Skipped execution {execution_id} for TracePath AI generated commit.")
            _record_event(
                telemetry_logs,
                stage="Pipeline Complete",
                level="INFO",
                message="Self-Sync Prevention: Detected commit generated by TracePath AI ([tracepath-sync]). Skipped to prevent recursive loops. 0 tokens spent.",
            )
            return await execution_service.update_execution_progress(
                db,
                execution_id,
                update_in={
                    "status": ExecutionStatus.SKIPPED,
                    "changed_files": context.changed_files,
                    "analysis_result": {"summary": "Self-sync protection: Commit was generated by TracePath AI."},
                    "documentation_decision": {
                        "overall_decision": "NO_UPDATE_REQUIRED",
                        "decision_rationale": "Commit originated from TracePath AI autonomous documentation sync. Skipped to prevent recursive loops.",
                    },
                    "updated_documents": [],
                    "generated_diff": "",
                    "telemetry_logs": telemetry_logs,
                },
            )

        # Step 1: Update status to ANALYZING and record changed files
        await execution_service.update_execution_progress(
            db,
            execution_id,
            update_in={
                "status": ExecutionStatus.ANALYZING,
                "changed_files": context.changed_files,
                "telemetry_logs": telemetry_logs,
            },
        )

        # Step 2: Run Agent 1 (Analysis Agent)
        _record_event(
            telemetry_logs,
            stage="Agent 1 (Analysis)",
            level="INFO",
            message="Agent 1 extracting structural code modifications and semantic intent...",
        )
        agent1_res = await change_analyzer_agent.run(
            {
                "changed_files": context.changed_files,
                "git_diff": context.git_diff,
                "commit_message": context.commit_message,
                "repo_name": context.repo_name,
                "branch": context.branch,
                "telemetry_collector": telemetry_logs,
            }
        )
        if not agent1_res.success:
            return await self._handle_failure(
                db, execution_id, "Agent1_AnalysisAgent", agent1_res.error or "Analysis Agent failed", telemetry_logs
            )

        analysis_data = agent1_res.data
        _record_event(
            telemetry_logs,
            stage="Agent 1 (Analysis)",
            level="INFO",
            message=f"Agent 1 analysis complete: {analysis_data.get('summary', '')[:120]}...",
        )

        # Step 3: Update status to PLANNING and record Agent 1 output
        await execution_service.update_execution_progress(
            db,
            execution_id,
            update_in={
                "status": ExecutionStatus.PLANNING,
                "analysis_result": analysis_data,
                "telemetry_logs": telemetry_logs,
            },
        )

        # Step 4: Run Agent 2 (Differential / Decision Agent)
        _record_event(
            telemetry_logs,
            stage="Agent 2 (Decision)",
            level="INFO",
            message="Agent 2 evaluating documentation impact across architecture, README, and API specs...",
        )
        agent2_res = await impact_planner_agent.run(
            {
                "analysis_result": analysis_data,
                "git_diff": context.git_diff,
                "existing_docs": context.existing_docs,
                "doc_paths": context.doc_paths,
                "telemetry_collector": telemetry_logs,
            }
        )
        if not agent2_res.success:
            return await self._handle_failure(
                db, execution_id, "Agent2_DecisionAgent", agent2_res.error or "Decision Agent failed", telemetry_logs
            )

        decision_data = agent2_res.data
        overall_decision = decision_data.get("overall_decision", "UPDATE_REQUIRED")
        doc_decisions = decision_data.get("document_decisions", [])
        affected_docs = [d for d in doc_decisions if d.get("is_affected", False)]

        _record_event(
            telemetry_logs,
            stage="Agent 2 (Decision)",
            level="INFO",
            message=f"Agent 2 decision: {overall_decision} ({len(affected_docs)} docs impacted)",
        )

        # Check if NO update is required (e.g. Bugfix/Typo/Tests)
        if overall_decision == "NO_UPDATE_REQUIRED" or not affected_docs:
            logger.info(
                f"Execution {execution_id}: Agent 2 determined NO_UPDATE_REQUIRED ({decision_data.get('decision_rationale')})"
            )
            _record_event(
                telemetry_logs,
                stage="Pipeline Complete",
                level="INFO",
                message=f"No documentation update required. Rationale: {decision_data.get('decision_rationale')}",
            )
            return await execution_service.update_execution_progress(
                db,
                execution_id,
                update_in={
                    "status": ExecutionStatus.SKIPPED,
                    "documentation_decision": decision_data,
                    "updated_documents": [],
                    "generated_diff": "",
                    "telemetry_logs": telemetry_logs,
                },
            )

        # Step 5: Update status to GENERATING and record Agent 2 output
        await execution_service.update_execution_progress(
            db,
            execution_id,
            update_in={
                "status": ExecutionStatus.GENERATING,
                "documentation_decision": decision_data,
                "telemetry_logs": telemetry_logs,
            },
        )

        # Step 6: Run Agent 3 (Documentation Generator)
        _record_event(
            telemetry_logs,
            stage="Agent 3 (Generator)",
            level="INFO",
            message=f"Agent 3 generating minimal markdown deltas for {len(affected_docs)} affected documents...",
        )
        agent3_res = await doc_generator_agent.run(
            {
                "analysis_result": analysis_data,
                "documentation_decision": decision_data,
                "existing_docs": context.existing_docs,
                "git_diff": context.git_diff,
                "telemetry_collector": telemetry_logs,
            }
        )
        if not agent3_res.success:
            return await self._handle_failure(
                db, execution_id, "Agent3_DocGeneratorAgent", agent3_res.error or "Doc Generator Agent failed", telemetry_logs
            )

        doc_gen_data = agent3_res.data
        raw_updated_docs = doc_gen_data.get("updates", [])
        unified_diff = doc_gen_data.get("unified_diff", "")

        # Documentation Safety: Filter out empty or unchanged documents
        updated_docs = []
        for u in raw_updated_docs:
            clean_path = u.get("doc_path", "").replace("\\", "/").strip().lstrip("/")
            if ".." in clean_path.split("/"):
                logger.warning(f"Rejected unsafe document path traversal attempt: {u.get('doc_path')}")
                continue
            orig = u.get("original_content", "")
            upd = u.get("updated_content", "")
            # Only include if content was actually changed and is non-empty
            if upd and upd != orig and u.get("action") != "no_change":
                u["doc_path"] = clean_path
                updated_docs.append(u)

        if not updated_docs:
            logger.info(
                f"Execution {execution_id}: Agent 3 generated 0 substantive document modifications. Marking SKIPPED."
            )
            _record_event(
                telemetry_logs,
                stage="Pipeline Complete",
                level="INFO",
                message="Agent 3 produced no substantive documentation changes. Marked SKIPPED.",
            )
            return await execution_service.update_execution_progress(
                db,
                execution_id,
                update_in={
                    "status": ExecutionStatus.SKIPPED,
                    "updated_documents": [],
                    "generated_diff": "",
                    "telemetry_logs": telemetry_logs,
                },
            )

        _record_event(
            telemetry_logs,
            stage="Agent 3 (Generator)",
            level="INFO",
            message=f"Agent 3 successfully assembled deltas for: {', '.join(u.get('doc_path', '') for u in updated_docs)}",
        )

        # Step 7: Update status to COMMITTING
        await execution_service.update_execution_progress(
            db,
            execution_id,
            update_in={
                "status": ExecutionStatus.COMMITTING,
                "updated_documents": updated_docs,
                "generated_diff": unified_diff,
                "telemetry_logs": telemetry_logs,
            },
        )

        # Step 8: Deterministic Backend GitHub Write-Back
        final_commit_sha: Optional[str] = None
        pr_url: Optional[str] = None

        try:
            commit_tag = f"[tracepath-sync:{commit_sha[:7]}]"
            commit_message = f"docs(tracepath): synchronize engineering documentation {commit_tag}"

            files_to_commit = [
                {"path": u.get("doc_path", ""), "content": u.get("updated_content", "")}
                for u in updated_docs
                if u.get("doc_path") and u.get("updated_content")
            ]

            if auto_commit:
                _record_event(
                    telemetry_logs,
                    stage="GitHub Sync",
                    level="INFO",
                    message=f"Directly committing {len(files_to_commit)} documentation file(s) in 1 atomic commit to branch {branch}...",
                )
                if hasattr(client, "create_or_update_files_batch") and len(files_to_commit) > 0:
                    try:
                        final_commit_sha = await client.create_or_update_files_batch(
                            full_name=repository_full_name,
                            files=files_to_commit,
                            message=commit_message,
                            branch=branch,
                        )
                    except Exception as batch_err:
                        logger.warning(f"Batch commit via Git Trees API encountered error, using single-file fallback: {batch_err}")
                        for update_item in updated_docs:
                            final_commit_sha = await client.create_or_update_file(
                                full_name=repository_full_name,
                                path=update_item.get("doc_path", ""),
                                content=update_item.get("updated_content", ""),
                                message=commit_message,
                                branch=branch,
                            )
                else:
                    for update_item in updated_docs:
                        final_commit_sha = await client.create_or_update_file(
                            full_name=repository_full_name,
                            path=update_item.get("doc_path", ""),
                            content=update_item.get("updated_content", ""),
                            message=commit_message,
                            branch=branch,
                        )
            else:
                target_pr_branch = f"tracepath/sync-{commit_sha[:7]}"
                _record_event(
                    telemetry_logs,
                    stage="GitHub Sync",
                    level="INFO",
                    message=f"Opening Pull Request on branch {target_pr_branch} with {len(files_to_commit)} updated file(s)...",
                )
                if hasattr(client, "create_branch"):
                    try:
                        await client.create_branch(repository_full_name, target_pr_branch, commit_sha)
                    except Exception as branch_err:
                        logger.warning(f"Branch creation note: {branch_err}")

                if hasattr(client, "create_or_update_files_batch") and len(files_to_commit) > 0:
                    try:
                        final_commit_sha = await client.create_or_update_files_batch(
                            full_name=repository_full_name,
                            files=files_to_commit,
                            message=commit_message,
                            branch=target_pr_branch,
                        )
                    except Exception as batch_err:
                        logger.warning(f"Batch PR commit via Git Trees API encountered error, using single-file fallback: {batch_err}")
                        for update_item in updated_docs:
                            final_commit_sha = await client.create_or_update_file(
                                full_name=repository_full_name,
                                path=update_item.get("doc_path", ""),
                                content=update_item.get("updated_content", ""),
                                message=commit_message,
                                branch=target_pr_branch,
                            )
                else:
                    for update_item in updated_docs:
                        final_commit_sha = await client.create_or_update_file(
                            full_name=repository_full_name,
                            path=update_item.get("doc_path", ""),
                            content=update_item.get("updated_content", ""),
                            message=commit_message,
                            branch=target_pr_branch,
                        )

                pr_url = await client.create_pull_request(
                    full_name=repository_full_name,
                    title=f"docs: synchronize documentation with code changes ({commit_sha[:7]})",
                    body=(
                        f"## Autonomous Documentation Synchronization\n\n"
                        f"**Trigger Commit:** `{commit_sha}`\n"
                        f"**Analysis Summary:** {analysis_data.get('summary', '')}\n\n"
                        f"### Updated Documents ({len(updated_docs)}):\n"
                        + "\n".join(f"- `{u.get('doc_path')}`: {u.get('summary_of_changes')}" for u in updated_docs)
                        + "\n\n*Generated autonomously by TracePath AI Multi-Agent Engine.*"
                    ),
                    head_branch=target_pr_branch,
                    base_branch=branch,
                )

        except Exception as err:
            logger.error(f"Backend GitHub write operation failed for execution {execution_id}: {err}")
            return await self._handle_failure(
                db, execution_id, "GitHubCommitService", f"Failed to write documentation to GitHub: {str(err)}", telemetry_logs
            )

        _record_event(
            telemetry_logs,
            stage="Pipeline Complete",
            level="INFO",
            message=f"Pipeline execution completed successfully. Final commit: {final_commit_sha or 'synced'}",
        )

        # Step 9: Update status to COMPLETED
        final_execution = await execution_service.update_execution_progress(
            db,
            execution_id,
            update_in={
                "status": ExecutionStatus.COMPLETED,
                "final_commit_sha": final_commit_sha or f"sync-{commit_sha[:8]}",
                "pull_request_url": pr_url,
                "telemetry_logs": telemetry_logs,
            },
        )

        logger.info(f"Successfully finished pipeline execution {execution_id} -> COMPLETED")
        return final_execution

    async def _handle_failure(
        self,
        db: AsyncSession,
        execution_id: UUID,
        stage_name: str,
        error_msg: str,
        telemetry_logs: Optional[List[Dict[str, Any]]] = None,
    ) -> Execution:
        logs = telemetry_logs or []
        _record_event(
            logs,
            stage=stage_name,
            level="ERROR",
            message=f"Pipeline failure: {error_msg}",
        )
        logger.error(f"Pipeline execution {execution_id} failed at {stage_name}: {error_msg}")
        return await execution_service.update_execution_progress(
            db,
            execution_id,
            update_in={
                "status": ExecutionStatus.FAILED,
                "error_information": {
                    "stage": stage_name,
                    "error": error_msg,
                },
                "telemetry_logs": logs,
            },
        )


pipeline_orchestrator = PipelineOrchestrator()
