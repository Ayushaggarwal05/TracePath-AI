import logging
from typing import Any, Dict, Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from app.agents.change_analyzer import change_analyzer_agent
from app.agents.doc_generator import doc_generator_agent
from app.agents.impact_planner import impact_planner_agent
from app.core.exceptions import AgentExecutionException
from app.github.mock_client import mock_github_client
from app.models.execution import Execution, ExecutionStatus
from app.services.execution_service import execution_service

logger = logging.getLogger("tracepath.pipeline")


class PipelineOrchestrator:
    """
    Orchestrates the autonomous documentation sync lifecycle:
    GitHub Code Change
    → Understand What Changed (Agent 1)
    → Determine Documentation Impact (Agent 2)
    → Generate Minimal Documentation Updates & Validate (Agent 3)
    → Commit Back to GitHub (IGitHubClient)
    """

    async def execute_sync_pipeline(
        self,
        db: AsyncSession,
        execution_id: UUID,
        repository_full_name: str,
        commit_sha: str,
        doc_paths: Optional[list] = None,
    ) -> Execution:
        logger.info(f"Starting pipeline execution {execution_id} for {repository_full_name} @ {commit_sha}")

        # 1. Fetch changed files from GitHub
        commit_info = await mock_github_client.get_commit_diff(repository_full_name, commit_sha)
        
        # Step 1: Status ANALYZING
        await execution_service.update_execution_progress(
            db,
            execution_id,
            update_in={
                "status": ExecutionStatus.ANALYZING,
                "changed_files": commit_info.changed_files,
            },
        )

        # 2. Run Agent 1: Change Analyzer
        agent1_res = await change_analyzer_agent.run({
            "changed_files": commit_info.changed_files,
            "commit_message": commit_info.message,
        })
        if not agent1_res.success:
            return await self._handle_failure(db, execution_id, "ChangeAnalyzerAgent", agent1_res.error or "Unknown error")

        # Step 2: Status PLANNING
        await execution_service.update_execution_progress(
            db,
            execution_id,
            update_in={
                "status": ExecutionStatus.PLANNING,
                "analysis_result": agent1_res.data,
            },
        )

        # 3. Run Agent 2: Impact Planner
        agent2_res = await impact_planner_agent.run({
            "analysis_result": agent1_res.data,
            "doc_paths": doc_paths or ["docs/api.md", "README.md"],
        })
        if not agent2_res.success:
            return await self._handle_failure(db, execution_id, "ImpactPlannerAgent", agent2_res.error or "Unknown error")

        # Step 3: Status GENERATING
        await execution_service.update_execution_progress(
            db,
            execution_id,
            update_in={
                "status": ExecutionStatus.GENERATING,
                "documentation_decision": agent2_res.data,
            },
        )

        # 4. Run Agent 3: Doc Generator & Validator
        agent3_res = await doc_generator_agent.run({
            "impact_plan": agent2_res.data,
            "analysis_result": agent1_res.data,
        })
        if not agent3_res.success:
            return await self._handle_failure(db, execution_id, "DocGeneratorAgent", agent3_res.error or "Unknown error")

        # Step 4: Status COMMITTING
        await execution_service.update_execution_progress(
            db,
            execution_id,
            update_in={
                "status": ExecutionStatus.COMMITTING,
                "updated_documents": agent3_res.data.get("updates", []),
                "generated_diff": agent3_res.data.get("unified_diff", ""),
            },
        )

        # 5. Commit changes back to GitHub / Create PR
        pr_url = await mock_github_client.create_pull_request(
            full_name=repository_full_name,
            title="docs: synchronize documentation with code updates",
            body="Automated documentation synchronization by TracePath AI.",
            head_branch="tracepath/doc-sync",
            base_branch="main",
        )

        final_sha = f"sync-commit-{commit_sha[:8]}"

        # Step 5: Status COMPLETED
        final_execution = await execution_service.update_execution_progress(
            db,
            execution_id,
            update_in={
                "status": ExecutionStatus.COMPLETED,
                "final_commit_sha": final_sha,
                "pull_request_url": pr_url,
            },
        )

        logger.info(f"Successfully completed pipeline execution {execution_id}")
        return final_execution

    async def _handle_failure(
        self,
        db: AsyncSession,
        execution_id: UUID,
        agent_name: str,
        error_msg: str,
    ) -> Execution:
        logger.error(f"Pipeline execution {execution_id} failed at {agent_name}: {error_msg}")
        return await execution_service.update_execution_progress(
            db,
            execution_id,
            update_in={
                "status": ExecutionStatus.FAILED,
                "error_information": {
                    "stage": agent_name,
                    "error": error_msg,
                },
            },
        )


pipeline_orchestrator = PipelineOrchestrator()
