from typing import Any, Dict, List
from pydantic import BaseModel
from app.agents.base import AgentExecutionResult, BaseAgent
from app.core.config import settings


class ChangeAnalysisOutput(BaseModel):
    summary: str
    semantic_changes: List[str]
    affected_components: List[str]
    breaking_changes: bool = False
    api_contract_altered: bool = False


class ChangeAnalyzerAgent(BaseAgent):
    """
    Agent 1: Understand What Changed.
    Analyzes raw git diffs, changed files, and commit intent to extract semantic code changes.
    """

    def __init__(self):
        super().__init__(
            name="ChangeAnalyzerAgent",
            config=settings.change_analyzer_config,
        )

    async def run(self, context: Dict[str, Any]) -> AgentExecutionResult:
        # Phase 1 stub implementation
        changed_files = context.get("changed_files", [])
        commit_message = context.get("commit_message", "")

        analysis = ChangeAnalysisOutput(
            summary=f"Analyzed {len(changed_files)} changed files from commit: {commit_message}",
            semantic_changes=[
                f"Detected changes across {len(changed_files)} files.",
                "Identified updated function signatures and models.",
            ],
            affected_components=["API Endpoints", "Data Models"],
            breaking_changes=False,
            api_contract_altered=True,
        )

        return AgentExecutionResult(
            success=True,
            data=analysis.model_dump(),
            model_name=self.config.model,
            tokens_used=120,
        )


change_analyzer_agent = ChangeAnalyzerAgent()
