import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.security import MOCK_USER_ID
from app.github.mock_client import MockGitHubClient
from app.models.execution import ExecutionStatus
from app.pipeline.orchestrator import pipeline_orchestrator
from app.services.execution_service import execution_service
from app.services.repository_service import repository_service
from app.schemas.repository import RepositoryCreate
from app.schemas.execution import ExecutionCreate


@pytest.mark.asyncio
async def test_full_pipeline_feature_flow(db_session: AsyncSession):
    # 1. Register repository
    repo_in = RepositoryCreate(
        github_repo_id="gh-pipe-100",
        name="billing-engine",
        full_name="tracepath-org/billing-engine",
        default_branch="main",
        user_id=MOCK_USER_ID,
    )
    repo = await repository_service.register_repository(db_session, MOCK_USER_ID, repo_in)

    # 2. Create execution record
    exec_in = ExecutionCreate(
        repository_id=repo.id,
        event_type="push",
        commit_sha="c1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0",
        branch="main",
    )
    execution = await execution_service.create_execution(db_session, exec_in)

    # 3. Execute multi-agent sync pipeline
    result = await pipeline_orchestrator.execute_sync_pipeline(
        db=db_session,
        execution_id=execution.id,
        repository_full_name=repo.full_name,
        commit_sha=execution.commit_sha,
        branch="main",
        doc_paths=["ARCHITECTURE.md", "README.md"],
    )

    # 4. Verify completion and generated audit state
    assert result.status == ExecutionStatus.COMPLETED
    assert result.analysis_result is not None
    assert result.documentation_decision is not None
    assert result.documentation_decision["overall_decision"] == "UPDATE_REQUIRED"
    assert len(result.updated_documents) > 0
    assert result.generated_diff != ""
    assert result.final_commit_sha is not None
    assert result.pull_request_url is not None


@pytest.mark.asyncio
async def test_full_pipeline_bugfix_skips_doc_generation(db_session: AsyncSession):
    # 1. Register repository
    repo_in = RepositoryCreate(
        github_repo_id="gh-pipe-200",
        name="auth-core",
        full_name="tracepath-org/auth-core",
        default_branch="main",
        user_id=MOCK_USER_ID,
    )
    repo = await repository_service.register_repository(db_session, MOCK_USER_ID, repo_in)

    # 2. Create execution record
    exec_in = ExecutionCreate(
        repository_id=repo.id,
        event_type="push",
        commit_sha="bugfix0000000000000000000000000000000001",
        branch="main",
    )
    execution = await execution_service.create_execution(db_session, exec_in)

    # Mock client returning bugfix commit message
    class BugfixClient(MockGitHubClient):
        async def get_commit_diff(self, full_name: str, commit_sha: str):
            res = await super().get_commit_diff(full_name, commit_sha)
            res.message = "fix(auth): correct typo in token expiration error message"
            res.changed_files = [
                {"filename": "src/auth/token.py", "status": "modified", "patch": "- 'err' + 'error'"}
            ]
            return res

    bugfix_client = BugfixClient()

    # 3. Execute pipeline
    result = await pipeline_orchestrator.execute_sync_pipeline(
        db=db_session,
        execution_id=execution.id,
        repository_full_name=repo.full_name,
        commit_sha=execution.commit_sha,
        branch="main",
        github_client=bugfix_client,
    )

    # 4. Verify skipped execution state
    assert result.status == ExecutionStatus.SKIPPED
    assert result.documentation_decision is not None
    assert result.documentation_decision["overall_decision"] == "NO_UPDATE_REQUIRED"
    assert len(result.updated_documents) == 0


@pytest.mark.asyncio
async def test_pipeline_failure_handling(db_session: AsyncSession):
    # 1. Register repository
    repo_in = RepositoryCreate(
        github_repo_id="gh-pipe-300",
        name="broken-pipeline-repo",
        full_name="tracepath-org/broken-pipeline-repo",
        default_branch="main",
        user_id=MOCK_USER_ID,
    )
    repo = await repository_service.register_repository(db_session, MOCK_USER_ID, repo_in)

    # 2. Create execution record
    exec_in = ExecutionCreate(
        repository_id=repo.id,
        event_type="push",
        commit_sha="fail000000000000000000000000000000000001",
        branch="main",
    )
    execution = await execution_service.create_execution(db_session, exec_in)

    # Client that raises error during commit diff fetch
    class BrokenClient(MockGitHubClient):
        async def get_commit_diff(self, full_name: str, commit_sha: str):
            raise ConnectionError("GitHub API timeout during diff retrieval")

    broken_client = BrokenClient()

    # 3. Execute pipeline
    result = await pipeline_orchestrator.execute_sync_pipeline(
        db=db_session,
        execution_id=execution.id,
        repository_full_name=repo.full_name,
        commit_sha=execution.commit_sha,
        branch="main",
        github_client=broken_client,
    )

    # 4. Verify FAILED execution state and error diagnostic recording
    assert result.status == ExecutionStatus.FAILED
    assert result.error_information is not None
    assert "ContextBuilder" in result.error_information.get("stage", "")
    assert "GitHub API timeout" in result.error_information.get("error", "")
