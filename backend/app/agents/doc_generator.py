from typing import Any, Dict, List
from pydantic import BaseModel
from app.agents.base import AgentExecutionResult, BaseAgent
from app.core.config import settings


class GeneratedDocUpdate(BaseModel):
    path: str
    action: str
    original_content: str
    updated_content: str
    diff: str
    validation_status: str  # "valid", "needs_review"


class DocGeneratorOutput(BaseModel):
    updates: List[GeneratedDocUpdate]
    unified_diff: str
    validation_passed: bool
    summary: str


class DocGeneratorAgent(BaseAgent):
    """
    Agent 3: Generate Minimal Documentation Updates & Validate.
    Produces high-fidelity, minimal diff documentation updates and validates markdown correctness.
    """

    def __init__(self):
        super().__init__(
            name="DocGeneratorAgent",
            config=settings.doc_generator_config,
        )

    async def run(self, context: Dict[str, Any]) -> AgentExecutionResult:
        # Phase 1 stub implementation
        impact_plan = context.get("impact_plan", {})
        doc_targets = impact_plan.get("target_documents", [{"file_path": "README.md"}])

        diff_sample = (
            "--- a/README.md\n"
            "+++ b/README.md\n"
            "@@ -15,3 +15,6 @@\n"
            " ### API Reference\n"
            "+- `POST /api/v1/refund`: Process customer refunds\n"
        )

        updates = [
            GeneratedDocUpdate(
                path=target.get("file_path", "docs/api.md"),
                action="update",
                original_content="# Documentation\n",
                updated_content="# Documentation\n\n### API Reference\n- `POST /api/v1/refund`: Process customer refunds\n",
                diff=diff_sample,
                validation_status="valid",
            )
            for target in doc_targets
        ]

        output = DocGeneratorOutput(
            updates=updates,
            unified_diff=diff_sample,
            validation_passed=True,
            summary=f"Generated minimal documentation updates for {len(updates)} files.",
        )

        return AgentExecutionResult(
            success=True,
            data=output.model_dump(),
            model_name=self.config.model,
            tokens_used=350,
        )


doc_generator_agent = DocGeneratorAgent()
