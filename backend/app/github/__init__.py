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
    """Returns real GitHub API client if token is provided or configured, else mock client."""
    if token:
        return GitHubAPIClient(token=token)
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
