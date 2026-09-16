import pytest
from app.github.client import GitHubAPIClient
from app.github.mock_client import mock_github_client


@pytest.mark.asyncio
async def test_mock_github_client_operations():
    """Verify Mock GitHub Client contract compliance."""
    repo = await mock_github_client.get_repository("tracepath-org/tracepath-sample-service")
    assert repo.full_name == "tracepath-org/tracepath-sample-service"

    repos = await mock_github_client.list_user_repositories()
    assert len(repos) >= 2

    diff = await mock_github_client.get_commit_diff("tracepath-org/tracepath-sample-service", "abc1234")
    assert diff.sha == "abc1234"
    assert len(diff.changed_files) == 2

    content = await mock_github_client.get_file_content(
        "tracepath-org/tracepath-sample-service", "README.md"
    )
    assert content is not None
    assert "API Documentation" in content.content

    commit_sha = await mock_github_client.create_or_update_file(
        "tracepath-org/tracepath-sample-service",
        "README.md",
        "# Updated Content",
        "docs: update readme",
        "main",
    )
    assert commit_sha.startswith("mock-commit-sha-")

    pr_url = await mock_github_client.create_pull_request(
        "tracepath-org/tracepath-sample-service",
        "docs: sync",
        "PR body",
        "tracepath/sync-123",
    )
    assert "pull/42" in pr_url


def test_github_api_client_initialization():
    """Verify GitHub API Client header configuration and token handling."""
    client = GitHubAPIClient(token="ghp_test_token_12345")
    headers = client._get_headers()
    assert headers["Authorization"] == "Bearer ghp_test_token_12345"
    assert "TracePath-AI" in headers["User-Agent"]
