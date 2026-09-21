import asyncio
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
                        await execution_service.update_execution_progress(
                            db,
                            execution_id,
                            update_in={"commit_sha": latest_sha},
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
        except Exception as err:
            return await self._handle_failure(
                db, execution_id, "ContextBuilder", f"Failed to build repository context from GitHub: {str(err)}"
            )

        # Step 1: Update status to ANALYZING and record changed files
        await execution_service.update_execution_progress(
            db,
            execution_id,
            update_in={
                "status": ExecutionStatus.ANALYZING,
                "changed_files": context.changed_files,
            },
        )

        # Step 2: Run Agent 1 (Analysis Agent)
        agent1_res = await change_analyzer_agent.run(
            {
                "changed_files": context.changed_files,
                "git_diff": context.git_diff,
                "commit_message": context.commit_message,
                "repo_name": context.repo_name,
                "branch": context.branch,
            }
        )
        if not agent1_res.success:
            return await self._handle_failure(
                db, execution_id, "Agent1_AnalysisAgent", agent1_res.error or "Analysis Agent failed"
            )

        analysis_data = agent1_res.data

        # Step 3: Update status to PLANNING and record Agent 1 output
        await execution_service.update_execution_progress(
            db,
            execution_id,
            update_in={
                "status": ExecutionStatus.PLANNING,
                "analysis_result": analysis_data,
            },
        )

        # Step 4: Run Agent 2 (Differential / Decision Agent)
        await asyncio.sleep(1.0)
        agent2_res = await impact_planner_agent.run(
            {
                "analysis_result": analysis_data,
                "git_diff": context.git_diff,
                "existing_docs": context.existing_docs,
                "doc_paths": context.doc_paths,
            }
        )
        if not agent2_res.success:
            return await self._handle_failure(
                db, execution_id, "Agent2_DecisionAgent", agent2_res.error or "Decision Agent failed"
            )

        decision_data = agent2_res.data
        overall_decision = decision_data.get("overall_decision", "UPDATE_REQUIRED")
        doc_decisions = decision_data.get("document_decisions", [])
        affected_docs = [d for d in doc_decisions if d.get("is_affected", False)]

        # Check if NO update is required (e.g. Bugfix/Typo/Tests)
        if overall_decision == "NO_UPDATE_REQUIRED" or not affected_docs:
            logger.info(
                f"Execution {execution_id}: Agent 2 determined NO_UPDATE_REQUIRED ({decision_data.get('decision_rationale')})"
            )
            return await execution_service.update_execution_progress(
                db,
                execution_id,
                update_in={
                    "status": ExecutionStatus.SKIPPED,
                    "documentation_decision": decision_data,
                    "updated_documents": [],
                    "generated_diff": "",
                },
            )

        # Step 5: Update status to GENERATING and record Agent 2 output
        await execution_service.update_execution_progress(
            db,
            execution_id,
            update_in={
                "status": ExecutionStatus.GENERATING,
                "documentation_decision": decision_data,
            },
        )

        # Step 6: Run Agent 3 (Documentation Generator)
        await asyncio.sleep(1.0)
        agent3_res = await doc_generator_agent.run(
            {
                "analysis_result": analysis_data,
                "documentation_decision": decision_data,
                "existing_docs": context.existing_docs,
                "git_diff": context.git_diff,
            }
        )
        if not agent3_res.success:
            return await self._handle_failure(
                db, execution_id, "Agent3_DocGeneratorAgent", agent3_res.error or "Doc Generator Agent failed"
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
            return await execution_service.update_execution_progress(
                db,
                execution_id,
                update_in={
                    "status": ExecutionStatus.SKIPPED,
                    "updated_documents": [],
                    "generated_diff": "",
                },
            )

        # Step 7: Update status to COMMITTING
        await execution_service.update_execution_progress(
            db,
            execution_id,
            update_in={
                "status": ExecutionStatus.COMMITTING,
                "updated_documents": updated_docs,
                "generated_diff": unified_diff,
            },
        )

        # Step 8: Deterministic Backend GitHub Write-Back
        # Note: The AI agents DO NOT write to GitHub directly.
        final_commit_sha: Optional[str] = None
        pr_url: Optional[str] = None

        try:
            commit_tag = f"[tracepath-sync:{commit_sha[:7]}]"
            commit_message = f"docs(tracepath): synchronize engineering documentation {commit_tag}"

            if auto_commit:
                # Direct commit to target branch
                for update_item in updated_docs:
                    final_commit_sha = await client.create_or_update_file(
                        full_name=repository_full_name,
                        path=update_item.get("doc_path", ""),
                        content=update_item.get("updated_content", ""),
                        message=commit_message,
                        branch=branch,
                    )
            else:
                # Open a Pull Request on a sync branch
                target_pr_branch = f"tracepath/sync-{commit_sha[:7]}"
                if hasattr(client, "create_branch"):
                    try:
                        await client.create_branch(repository_full_name, target_pr_branch, commit_sha)
                    except Exception as branch_err:
                        logger.warning(f"Branch creation note: {branch_err}")

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
                db, execution_id, "GitHubCommitService", f"Failed to write documentation to GitHub: {str(err)}"
            )

        # Step 9: Update status to COMPLETED
        final_execution = await execution_service.update_execution_progress(
            db,
            execution_id,
            update_in={
                "status": ExecutionStatus.COMPLETED,
                "final_commit_sha": final_commit_sha or f"sync-{commit_sha[:8]}",
                "pull_request_url": pr_url,
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
    ) -> Execution:
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
            },
        )


pipeline_orchestrator = PipelineOrchestrator()
