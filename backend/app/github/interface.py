from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional
from pydantic import BaseModel


class GitHubCommitInfo(BaseModel):
    sha: str
    message: str
    author: str
    timestamp: str
    changed_files: List[Dict[str, Any]] = []


class GitHubRepoInfo(BaseModel):
    id: str
    name: str
    full_name: str
    default_branch: str
    is_private: bool
    html_url: str
    description: Optional[str] = None


class GitHubFileContent(BaseModel):
    path: str
    content: str
    sha: str


class IGitHubClient(ABC):
    """Abstract interface contract for GitHub API operations."""

    @abstractmethod
    async def get_repository(self, full_name: str) -> GitHubRepoInfo:
        """Fetch repository details from GitHub."""
        pass

    @abstractmethod
    async def list_user_repositories(self, installation_id: Optional[str] = None) -> List[GitHubRepoInfo]:
        """List accessible repositories."""
        pass

    @abstractmethod
    async def get_commit_diff(self, full_name: str, commit_sha: str) -> GitHubCommitInfo:
        """Fetch changed files and diff for a commit."""
        pass

    @abstractmethod
    async def get_file_content(self, full_name: str, path: str, ref: str = "main") -> Optional[GitHubFileContent]:
        """Fetch raw content of a file in the repository."""
        pass

    @abstractmethod
    async def get_latest_commit_sha(self, full_name: str, branch: str = "main") -> str:
        """Fetch latest commit SHA for a branch."""
        pass

    @abstractmethod
    async def create_branch(self, full_name: str, new_branch: str, base_branch: str = "main") -> bool:
        """Create a new branch from base_branch reference."""
        pass

    @abstractmethod
    async def create_or_update_file(
        self,
        full_name: str,
        path: str,
        content: str,
        message: str,
        branch: str,
        sha: Optional[str] = None,
    ) -> str:
        """Commit an updated file and return the new commit SHA."""
        pass

    @abstractmethod
    async def create_pull_request(
        self,
        full_name: str,
        title: str,
        body: str,
        head_branch: str,
        base_branch: str = "main",
    ) -> str:
        """Create a PR for doc updates and return the PR URL."""
        pass
