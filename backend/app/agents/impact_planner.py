from typing import Any, Dict, List
from pydantic import BaseModel
from app.agents.base import AgentExecutionResult, BaseAgent
from app.core.config import settings


class DocImpactTarget(BaseModel):
    file_path: str
    action_needed: str  # "update", "create", "delete", "no_change"
    reason: str
    priority: str  # "high", "medium", "low"


class ImpactPlannerOutput(BaseModel):
    documentation_required: bool
    confidence_score: float
    target_documents: List[DocImpactTarget]
    strategy_rationale: str


class ImpactPlannerAgent(BaseAgent):
    """
    Agent 2: Determine Documentation Impact.
    Correlates semantic changes from Agent 1 against existing repository documentation to plan exact updates.
    """

    def __init__(self):
        super().__init__(
            name="ImpactPlannerAgent",
            config=settings.impact_planner_config,
        )

    async def run(self, context: Dict[str, Any]) -> AgentExecutionResult:
        # Phase 1 stub implementation
        analysis_result = context.get("analysis_result", {})
        doc_paths = context.get("doc_paths", ["docs/api.md", "README.md"])

        targets = [
            DocImpactTarget(
                file_path=path,
                action_needed="update",
                reason="API contract changed in related source files.",
                priority="high",
            )
            for path in doc_paths[:2]
        ]

        plan = ImpactPlannerOutput(
            documentation_required=True,
            confidence_score=0.96,
            target_documents=targets,
            strategy_rationale="Updates are required to align endpoints and schemas with newly modified routes.",
        )

        return AgentExecutionResult(
            success=True,
            data=plan.model_dump(),
            model_name=self.config.model,
            tokens_used=180,
        )


impact_planner_agent = ImpactPlannerAgent()
