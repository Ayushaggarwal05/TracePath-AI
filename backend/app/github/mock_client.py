from typing import Any, Dict, List, Optional
from app.github.interface import (
    GitHubCommitInfo,
    GitHubFileContent,
    GitHubRepoInfo,
    IGitHubClient,
)


class MockGitHubClient(IGitHubClient):
    """
    Mock GitHub Client for Phase 1 testing and foundation verification.
    Real Octokit/PyGithub implementation will be added in Phase 2.
    """

    def __init__(self):
        self._mock_repos = [
            GitHubRepoInfo(
                id="gh-repo-1001",
                name="tracepath-sample-service",
                full_name="tracepath-org/tracepath-sample-service",
                default_branch="main",
                is_private=False,
                html_url="https://github.com/tracepath-org/tracepath-sample-service",
                description="Sample microservice for TracePath AI testing",
            ),
            GitHubRepoInfo(
                id="gh-repo-1002",
                name="auth-gateway",
                full_name="tracepath-org/auth-gateway",
                default_branch="main",
                is_private=True,
                html_url="https://github.com/tracepath-org/auth-gateway",
                description="OAuth2 and API Gateway service",
            ),
        ]

    async def get_repository(self, full_name: str) -> GitHubRepoInfo:
        for repo in self._mock_repos:
            if repo.full_name == full_name:
                return repo
        return GitHubRepoInfo(
            id=f"gh-repo-{abs(hash(full_name)) % 10000}",
            name=full_name.split("/")[-1],
            full_name=full_name,
            default_branch="main",
            is_private=False,
            html_url=f"https://github.com/{full_name}",
            description="Mock repository",
        )

    async def list_user_repositories(self, installation_id: Optional[str] = None) -> List[GitHubRepoInfo]:
        return self._mock_repos

    async def get_commit_diff(self, full_name: str, commit_sha: str) -> GitHubCommitInfo:
        return GitHubCommitInfo(
            sha=commit_sha,
            message="feat: update payment gateway API endpoints and schema",
            author="engineer@tracepath.ai",
            timestamp="2026-09-16T12:00:00Z",
            changed_files=[
                {
                    "filename": "src/api/payment.py",
                    "status": "modified",
                    "additions": 25,
                    "deletions": 5,
                    "patch": "@@ -10,5 +10,25 @@\n+ async def process_refund(refund_id: str): ...",
                },
                {
                    "filename": "src/models/payment.py",
                    "status": "modified",
                    "additions": 12,
                    "deletions": 0,
                    "patch": "@@ -5,3 +5,15 @@\n+ class RefundStatus(str, Enum): ...",
                },
            ],
        )

    async def get_file_content(self, full_name: str, path: str, ref: str = "main") -> Optional[GitHubFileContent]:
        return GitHubFileContent(
            path=path,
            content="# API Documentation\n\nExisting endpoints: /charge, /status\n",
            sha="mock-blob-sha-12345",
        )

    async def create_or_update_file(
        self,
        full_name: str,
        path: str,
        content: str,
        message: str,
        branch: str,
        sha: Optional[str] = None,
    ) -> str:
        return f"mock-commit-sha-{abs(hash(message)) % 1000000:06d}"

    async def create_pull_request(
        self,
        full_name: str,
        title: str,
        body: str,
        head_branch: str,
        base_branch: str = "main",
    ) -> str:
        return f"https://github.com/{full_name}/pull/42"


mock_github_client = MockGitHubClient()
