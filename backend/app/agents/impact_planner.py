import json
import logging
from typing import Any, Dict, List, Literal, Optional
from pydantic import BaseModel, Field, ValidationError
from app.agents.base import AgentExecutionResult, BaseAgent
from app.agents.change_analyzer import AnalysisOutput
from app.agents.llm_client import LLMClient
from app.core.config import settings
from app.core.exceptions import AgentExecutionException

logger = logging.getLogger("tracepath.agent2")


class DocumentDecision(BaseModel):
    """Specific differential decision for a single documentation file."""
    doc_path: str = Field(..., description="Target documentation path (e.g., ARCHITECTURE.md, PRD.md, docs/api.md)")
    is_affected: bool = Field(..., description="True if this document requires updates, False otherwise")
    reason: str = Field(..., description="Clear explanation of why this document is or is not affected")
    required_changes: List[str] = Field(default_factory=list, description="Specific sections and updates required")
    evidence: List[str] = Field(default_factory=list, description="Direct references from Agent 1 analysis / code diff")


class DecisionOutput(BaseModel):
    """
    Structured output of Agent 2 (Differential / Decision Agent).
    Decides overall impact and per-document update instructions.
    """
    overall_decision: Literal["UPDATE_REQUIRED", "NO_UPDATE_REQUIRED"] = Field(
        ..., description="Overall decision whether any document needs modification"
    )
    decision_rationale: str = Field(..., description="High-level reasoning for the overall decision")
    document_decisions: List[DocumentDecision] = Field(
        default_factory=list, description="Per-document analysis and decision entries"
    )


SYSTEM_PROMPT = """You are AGENT 2: DIFFERENTIAL / DECISION AGENT of TracePath AI.

YOUR PURPOSE:
Compare code changes analyzed by Agent 1 against existing project documentation (PRD.md, ARCHITECTURE.md, ADR files, and other docs) to determine exact documentation impact.

RESPONSIBILITIES:
1. Review the factual code change analysis from Agent 1.
2. Evaluate each existing document in the repository.
3. For each document, determine:
   - Is it affected? (true / false)
   - Detailed reason for why it is or is not affected.
   - Exact required changes (specific sections, parameters, architectural components).
   - Concrete evidence from the code changes and diffs.
4. Determine overall decision: 'UPDATE_REQUIRED' or 'NO_UPDATE_REQUIRED'.

CRITICAL RULES:
- AVOID UNNECESSARY DOCUMENTATION UPDATES.
- Typical bug fixes, minor typo corrections, test additions, or internal refactorings that do not alter product requirements, public API contracts, or system architecture do NOT require documentation updates (decide 'NO_UPDATE_REQUIRED').
- Architectural shifts (e.g. adding Redis caching, message queues, new databases) require updates to ARCHITECTURE.md and possibly ADRs.
- New product features or billing models (e.g. subscription tiers, payment flows) require updates to PRD.md, ARCHITECTURE.md, and API docs.
- Output MUST be valid JSON conforming strictly to the requested schema.

OUTPUT JSON SCHEMA:
{
  "overall_decision": "UPDATE_REQUIRED" | "NO_UPDATE_REQUIRED",
  "decision_rationale": "High-level summary of decision",
  "document_decisions": [
    {
      "doc_path": "ARCHITECTURE.md",
      "is_affected": true,
      "reason": "Redis cache added to hot query paths",
      "required_changes": ["Add Caching Layer section", "Update system diagram"],
      "evidence": ["Added redis dependency and cache client"]
    }
  ]
}
"""


class DecisionAgent(BaseAgent):
    """
    Agent 2: Differential / Decision Agent
    Evaluates whether PRD.md, ARCHITECTURE.md, ADRs, or API documentation require updates.
    """

    def __init__(self):
        super().__init__(
            name="DecisionAgent",
            config=settings.agent_2_config,
        )
        self.llm = LLMClient(self.config)

    async def run(self, context: Dict[str, Any]) -> AgentExecutionResult:
        analysis_data = context.get("analysis_result", {})
        git_diff = context.get("git_diff", "")
        existing_docs = context.get("existing_docs", {})  # Dict[doc_path, content_snippet]
        doc_paths = context.get("doc_paths", ["PRD.md", "ARCHITECTURE.md", "docs/api.md", "README.md"])

        user_prompt = f"""Evaluate documentation impact for the following code change:

Agent 1 Code Analysis:
{json.dumps(analysis_data, indent=2)}

Available Repository Documentation Files ({len(existing_docs)}):
{json.dumps(list(existing_docs.keys()), indent=2)}

Documentation Content Previews:
{json.dumps({k: v[:600] for k, v in existing_docs.items()}, indent=2)}

Diff Snippet:
{git_diff[:4000]}
"""

        def mock_generator() -> Dict[str, Any]:
            summary = analysis_data.get("summary", "").lower()
            purpose = analysis_data.get("purpose", "").lower()
            key_changes = [str(c).lower() for c in analysis_data.get("key_changes", [])]
            affected_components = [str(c).lower() for c in analysis_data.get("affected_components", [])]

            is_bugfix = any(w in summary or w in purpose for w in ["fix", "bug", "typo", "patch", "correct"])
            is_billing = any("billing" in text or "subscription" in text or "stripe" in text for text in [summary, purpose] + key_changes + affected_components)
            is_caching = any("cache" in text or "redis" in text or "memcached" in text for text in [summary, purpose] + key_changes + affected_components)

            # Available doc targets
            available_paths = list(existing_docs.keys()) or doc_paths or ["ARCHITECTURE.md", "README.md"]

            if is_bugfix and not is_billing and not is_caching:
                # Bug fixes require NO updates
                decisions = []
                for path in available_paths:
                    decisions.append({
                        "doc_path": path,
                        "is_affected": False,
                        "reason": "Bug fix does not alter architectural topology, user requirements, or API specifications.",
                        "required_changes": [],
                        "evidence": ["Agent 1 analysis indicates no public contract or architectural alteration."],
                    })
                return {
                    "overall_decision": "NO_UPDATE_REQUIRED",
                    "decision_rationale": "The change is a targeted bug fix with no behavioral or contract modifications requiring doc updates.",
                    "document_decisions": decisions,
                }
            elif is_billing:
                decisions = []
                for path in available_paths:
                    is_target = any(name in path.upper() for name in ["PRD", "ARCHITECTURE", "API", "README"])
                    if is_target:
                        decisions.append({
                            "doc_path": path,
                            "is_affected": True,
                            "reason": "New subscription billing tiers and payment webhook flows introduced.",
                            "required_changes": [
                                "Document Pro and Enterprise subscription pricing plans",
                                "Add payment webhook ingestion flow and security verification",
                            ],
                            "evidence": ["Added SubscriptionTier and billing endpoints cited by Agent 1."],
                        })
                    else:
                        decisions.append({
                            "doc_path": path,
                            "is_affected": False,
                            "reason": "Document does not cover billing specifications.",
                            "required_changes": [],
                            "evidence": [],
                        })
                return {
                    "overall_decision": "UPDATE_REQUIRED",
                    "decision_rationale": "Major product feature addition (Subscription Billing) requiring updates to PRD and Architecture documentation.",
                    "document_decisions": decisions,
                }
            elif is_caching:
                decisions = []
                for path in available_paths:
                    is_target = any(name in path.upper() for name in ["ARCHITECTURE", "README", "SYSTEM"])
                    if is_target:
                        decisions.append({
                            "doc_path": path,
                            "is_affected": True,
                            "reason": "Redis cache layer added for hot query paths, altering system data flow.",
                            "required_changes": [
                                "Add Redis cache layer to Architecture Component topology",
                                "Document cache TTL (60s) and cache invalidation lifecycle",
                            ],
                            "evidence": ["Added redis>=5.0.0 dependency and cache decorator cited by Agent 1."],
                        })
                    else:
                        decisions.append({
                            "doc_path": path,
                            "is_affected": False,
                            "reason": "Product requirements unchanged by internal caching optimization.",
                            "required_changes": [],
                            "evidence": [],
                        })
                return {
                    "overall_decision": "UPDATE_REQUIRED",
                    "decision_rationale": "System architecture modified with new Redis caching tier.",
                    "document_decisions": decisions,
                }
            else:
                # Default feature change
                decisions = [
                    {
                        "doc_path": available_paths[0] if available_paths else "README.md",
                        "is_affected": True,
                        "reason": "Feature updates require documentation synchronization.",
                        "required_changes": ["Update relevant functional sections."],
                        "evidence": ["Key changes detected in Agent 1 analysis."],
                    }
                ]
                return {
                    "overall_decision": "UPDATE_REQUIRED",
                    "decision_rationale": "Documentation updates required for modified components.",
                    "document_decisions": decisions,
                }

        try:
            raw_response = await self.llm.call_llm(
                system_prompt=SYSTEM_PROMPT,
                user_prompt=user_prompt,
                mock_response_generator=mock_generator,
            )
            validated = DecisionOutput.model_validate(raw_response)
            return AgentExecutionResult(
                success=True,
                data=validated.model_dump(),
                model_name=self.config.model,
                tokens_used=240,
            )
        except ValidationError as err:
            logger.error(f"[{self.name}] Schema validation error: {err}")
            return AgentExecutionResult(
                success=False,
                error=f"Decision schema validation failed: {str(err)}",
                model_name=self.config.model,
            )
        except AgentExecutionException as err:
            logger.error(f"[{self.name}] Agent execution failed: {err.message}")
            return AgentExecutionResult(
                success=False,
                error=err.message,
                model_name=self.config.model,
            )


# Export canonical alias & instance
impact_planner_agent = DecisionAgent()
