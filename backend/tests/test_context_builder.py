import pytest
from app.github.mock_client import MockGitHubClient
from app.pipeline.context_builder import PipelineContextBuilder


@pytest.mark.asyncio
async def test_context_builder_bounds_and_retrieval():
    builder = PipelineContextBuilder()
    client = MockGitHubClient()

    context = await builder.build_context(
        github_client=client,
        repo_full_name="tracepath-org/tracepath-sample-service",
        commit_sha="a1b2c3d4e5f678901234567890abcdef12345678",
        branch="main",
        configured_doc_paths=["README.md", "docs/api.md"],
    )

    assert context.repo_name == "tracepath-org/tracepath-sample-service"
    assert context.commit_sha == "a1b2c3d4e5f678901234567890abcdef12345678"
    assert context.branch == "main"
    assert len(context.changed_files) == 2
    assert "src/api/payment.py" in [f["filename"] for f in context.changed_files]
    assert context.git_diff != ""
    assert not context.is_diff_truncated
    assert len(context.existing_docs) > 0
    assert "README.md" in context.existing_docs or "docs/api.md" in context.existing_docs


@pytest.mark.asyncio
async def test_context_builder_diff_truncation():
    builder = PipelineContextBuilder()
    
    class LargeDiffMockClient(MockGitHubClient):
        async def get_commit_diff(self, full_name: str, commit_sha: str):
            res = await super().get_commit_diff(full_name, commit_sha)
            # Create a very large patch exceeding MAX_DIFF_CHARS
            res.changed_files = [
                {
                    "filename": f"large_file_{i}.py",
                    "status": "modified",
                    "patch": "+ large content " * 1000,
                }
                for i in range(10)
            ]
            return res

    large_client = LargeDiffMockClient()
    context = await builder.build_context(
        github_client=large_client,
        repo_full_name="tracepath-org/sample",
        commit_sha="commit-9999",
    )

    assert context.is_diff_truncated is True
    assert "[... GIT DIFF TRUNCATED DUE TO SIZE LIMIT ...]" in context.git_diff
