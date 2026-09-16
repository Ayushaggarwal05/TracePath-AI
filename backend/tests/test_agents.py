import json
import pytest
from app.agents.change_analyzer import AnalysisAgent, AnalysisOutput, change_analyzer_agent
from app.agents.doc_generator import (
    DocGeneratorAgent,
    DocGeneratorOutput,
    GeneratedDocUpdate,
    compute_unified_diff,
    doc_generator_agent,
)
from app.agents.impact_planner import (
    DecisionAgent,
    DecisionOutput,
    DocumentDecision,
    impact_planner_agent,
)
from app.agents.llm_client import extract_json_from_response


def test_extract_json_from_response():
    # 1. Plain JSON string
    raw1 = '{"status": "ok", "count": 5}'
    assert extract_json_from_response(raw1) == {"status": "ok", "count": 5}

    # 2. Markdown wrapped JSON block
    raw2 = 'Here is the response:\n```json\n{\n  "name": "tracepath",\n  "active": true\n}\n```\nHope that helps!'
    assert extract_json_from_response(raw2) == {"name": "tracepath", "active": True}

    # 3. Surrounding commentary without markdown block
    raw3 = 'Some preamble: {"key": "val"} and postamble'
    assert extract_json_from_response(raw3) == {"key": "val"}

    # 4. Invalid JSON raises ValueError
    with pytest.raises(ValueError):
        extract_json_from_response("no json here at all")


def test_compute_unified_diff():
    original = "# Architecture\n\nExisting system overview.\n"
    updated = "# Architecture\n\nExisting system overview.\n\n## Caching Layer\n- Added Redis 60s TTL\n"
    diff = compute_unified_diff(original, updated, "ARCHITECTURE.md")
    
    assert "--- a/ARCHITECTURE.md" in diff
    assert "+++ b/ARCHITECTURE.md" in diff
    assert "+## Caching Layer" in diff
    assert "+- Added Redis 60s TTL" in diff


@pytest.mark.asyncio
async def test_agent_1_analysis_billing_feature():
    context = {
        "changed_files": [
            {"filename": "src/billing/service.py", "status": "added"},
            {"filename": "src/models/subscription.py", "status": "added"},
        ],
        "git_diff": "diff --git a/src/models/subscription.py\n+ class SubscriptionTier(str, Enum): ...",
        "commit_message": "feat(billing): implement subscription tier management and stripe webhooks",
        "repo_name": "tracepath/payment-service",
        "branch": "main",
    }

    result = await change_analyzer_agent.run(context)
    assert result.success is True
    assert result.data is not None

    # Validate strict schema
    output = AnalysisOutput.model_validate(result.data)
    assert output.summary != ""
    assert output.purpose != ""
    assert len(output.key_changes) > 0
    assert len(output.affected_components) > 0
    assert len(output.behavior_changes) > 0
    assert len(output.evidence) > 0
    assert isinstance(output.uncertainties, list)


@pytest.mark.asyncio
async def test_agent_1_analysis_bugfix():
    context = {
        "changed_files": [{"filename": "src/utils/parser.py", "status": "modified"}],
        "git_diff": "diff --git a/src/utils/parser.py\n- if val is None:\n+ if val is None or val == '':",
        "commit_message": "fix: correct empty string handling in parser",
        "repo_name": "tracepath/core",
        "branch": "main",
    }

    result = await change_analyzer_agent.run(context)
    assert result.success is True
    output = AnalysisOutput.model_validate(result.data)
    assert "fix" in output.summary.lower() or "correct" in output.summary.lower()


@pytest.mark.asyncio
async def test_agent_2_decision_for_bugfix_avoids_updates():
    # Bugfix analysis input should result in NO_UPDATE_REQUIRED
    analysis_data = {
        "summary": "Fix null pointer in user parser",
        "purpose": "Correct error handling for null input payload",
        "key_changes": ["Fixed null check in parser.py"],
        "affected_components": ["parser.py"],
        "behavior_changes": ["Graceful handling of null values"],
        "dependencies": [],
        "evidence": ["Modified parser.py"],
        "uncertainties": [],
    }

    context = {
        "analysis_result": analysis_data,
        "git_diff": "diff --git a/parser.py\n+ if not x: return None",
        "existing_docs": {"ARCHITECTURE.md": "# Architecture Doc\n\nOverview\n"},
        "doc_paths": ["ARCHITECTURE.md"],
    }

    result = await impact_planner_agent.run(context)
    assert result.success is True
    output = DecisionOutput.model_validate(result.data)
    
    assert output.overall_decision == "NO_UPDATE_REQUIRED"
    assert all(not d.is_affected for d in output.document_decisions)


@pytest.mark.asyncio
async def test_agent_2_decision_for_caching_requires_architecture_update():
    analysis_data = {
        "summary": "Integrated Redis caching layer for hot repository queries",
        "purpose": "Improve read throughput by caching repo queries in Redis with 60s TTL",
        "key_changes": ["Added Redis connection pool", "Added cache decorator with 60s TTL"],
        "affected_components": ["Cache Layer", "Repository Service"],
        "behavior_changes": ["Repeated queries are served from Redis cache"],
        "dependencies": ["redis>=5.0.0"],
        "evidence": ["Added redis client initialization"],
        "uncertainties": [],
    }

    context = {
        "analysis_result": analysis_data,
        "git_diff": "diff --git a/cache.py\n+ import redis\n+ redis_client = redis.Redis()",
        "existing_docs": {
            "ARCHITECTURE.md": "# System Architecture\n\nCore components include API and Postgres DB.\n",
            "README.md": "# Readme\n\nWelcome to TracePath AI.\n",
        },
        "doc_paths": ["ARCHITECTURE.md", "README.md"],
    }

    result = await impact_planner_agent.run(context)
    assert result.success is True
    output = DecisionOutput.model_validate(result.data)

    assert output.overall_decision == "UPDATE_REQUIRED"
    affected = [d for d in output.document_decisions if d.is_affected]
    assert len(affected) > 0
    assert any("ARCHITECTURE" in d.doc_path.upper() for d in affected)
    assert len(affected[0].required_changes) > 0


@pytest.mark.asyncio
async def test_agent_3_doc_generator():
    analysis_data = {
        "summary": "Integrated Redis caching layer",
        "purpose": "Reduce database read pressure",
    }
    decision_data = {
        "overall_decision": "UPDATE_REQUIRED",
        "document_decisions": [
            {
                "doc_path": "ARCHITECTURE.md",
                "is_affected": True,
                "reason": "Redis cache added to data access tier",
                "required_changes": [
                    "Add Redis Caching Layer section",
                    "Document 60s cache TTL and invalidation",
                ],
                "evidence": ["Added redis dependency"],
            }
        ],
    }

    context = {
        "analysis_result": analysis_data,
        "documentation_decision": decision_data,
        "existing_docs": {
            "ARCHITECTURE.md": "# Architecture\n\nPostgres is used as primary store.\n"
        },
        "git_diff": "+ redis_client = Redis()",
    }

    result = await doc_generator_agent.run(context)
    assert result.success is True
    output = DocGeneratorOutput.model_validate(result.data)

    assert len(output.updates) == 1
    update = output.updates[0]
    assert update.doc_path == "ARCHITECTURE.md"
    assert update.action == "update"
    assert "Postgres is used as primary store." in update.updated_content
    assert "Redis" in update.updated_content
    assert update.diff != ""
    assert "+++ b/ARCHITECTURE.md" in update.diff
