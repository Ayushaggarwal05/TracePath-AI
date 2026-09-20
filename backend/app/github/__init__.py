from typing import Optional
from app.github.client import GitHubAPIClient
from app.github.interface import (
    GitHubCommitInfo,
    GitHubFileContent,
    GitHubRepoInfo,
    IGitHubClient,
)
from app.github.mock_client import MockGitHubClient, mock_github_client


def get_github_client(token: Optional[str] = None) -> IGitHubClient:
    """Returns real GitHub API client if token is provided or configured in settings, else mock client for testing."""
    from app.core.config import settings
    resolved_token = token or settings.GITHUB_PERSONAL_ACCESS_TOKEN
    if resolved_token:
        return GitHubAPIClient(token=resolved_token)
    return mock_github_client


__all__ = [
    "IGitHubClient",
    "GitHubCommitInfo",
    "GitHubRepoInfo",
    "GitHubFileContent",
    "GitHubAPIClient",
    "MockGitHubClient",
    "mock_github_client",
    "get_github_client",
]
