import base64
import logging
from typing import Any, Dict, List, Optional
import httpx
from app.core.config import settings
from app.github.interface import (
    GitHubCommitInfo,
    GitHubFileContent,
    GitHubRepoInfo,
    IGitHubClient,
)

logger = logging.getLogger("tracepath.github")


class GitHubAPIClient(IGitHubClient):
    """
    Production-oriented GitHub REST API client using httpx.AsyncClient.
    Supports user access tokens or GitHub App installations.
    """

    def __init__(self, token: Optional[str] = None, base_url: str = "https://api.github.com"):
        self.token = token
        self.base_url = base_url.rstrip("/")

    def _get_headers(self) -> Dict[str, str]:
        headers = {
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": f"TracePath-AI/{settings.VERSION}",
        }
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"
        return headers

    async def get_repository(self, full_name: str) -> GitHubRepoInfo:
        """Fetch repository details from GitHub."""
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(
                f"{self.base_url}/repos/{full_name}",
                headers=self._get_headers(),
            )
            response.raise_for_status()
            data = response.json()

            return GitHubRepoInfo(
                id=str(data.get("id")),
                name=data.get("name"),
                full_name=data.get("full_name"),
                default_branch=data.get("default_branch", "main"),
                is_private=data.get("private", False),
                html_url=data.get("html_url", f"https://github.com/{full_name}"),
                description=data.get("description"),
            )

    async def list_user_repositories(self, installation_id: Optional[str] = None) -> List[GitHubRepoInfo]:
        """List accessible repositories for authenticated user or GitHub App installation."""
        endpoint = f"{self.base_url}/user/repos"
        if installation_id:
            endpoint = f"{self.base_url}/user/installations/{installation_id}/repositories"

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(
                endpoint,
                headers=self._get_headers(),
                params={"per_page": 100, "sort": "updated"},
            )
            response.raise_for_status()
            data = response.json()
            raw_repos = data.get("repositories", data) if isinstance(data, dict) else data

            results = []
            for item in raw_repos:
                results.append(
                    GitHubRepoInfo(
                        id=str(item.get("id")),
                        name=item.get("name"),
                        full_name=item.get("full_name"),
                        default_branch=item.get("default_branch", "main"),
                        is_private=item.get("private", False),
                        html_url=item.get("html_url", ""),
                        description=item.get("description"),
                    )
                )
            return results

    async def get_commit_diff(self, full_name: str, commit_sha: str) -> GitHubCommitInfo:
        """Fetch changed files, patch diffs, and commit metadata."""
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(
                f"{self.base_url}/repos/{full_name}/commits/{commit_sha}",
                headers=self._get_headers(),
            )
            response.raise_for_status()
            data = response.json()

            commit_obj = data.get("commit", {})
            author_obj = commit_obj.get("author", {})

            changed_files = []
            for f in data.get("files", []):
                changed_files.append(
                    {
                        "filename": f.get("filename"),
                        "status": f.get("status"),
                        "additions": f.get("additions", 0),
                        "deletions": f.get("deletions", 0),
                        "changes": f.get("changes", 0),
                        "patch": f.get("patch", ""),
                    }
                )

            return GitHubCommitInfo(
                sha=data.get("sha", commit_sha),
                message=commit_obj.get("message", ""),
                author=author_obj.get("name", author_obj.get("email", "unknown")),
                timestamp=author_obj.get("date", ""),
                changed_files=changed_files,
            )

    async def get_file_content(self, full_name: str, path: str, ref: str = "main") -> Optional[GitHubFileContent]:
        """Fetch decoded content of a file in the repository."""
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(
                f"{self.base_url}/repos/{full_name}/contents/{path.lstrip('/')}",
                headers=self._get_headers(),
                params={"ref": ref},
            )
            if response.status_code == 404:
                return None
            response.raise_for_status()
            data = response.json()

            if isinstance(data, list):
                # Target is a directory, not a file
                return None

            raw_encoding = data.get("encoding", "base64")
            raw_content = data.get("content", "")

            if raw_encoding == "base64" and raw_content:
                decoded_bytes = base64.b64decode(raw_content)
                decoded_str = decoded_bytes.decode("utf-8", errors="replace")
            else:
                decoded_str = raw_content

            return GitHubFileContent(
                path=data.get("path", path),
                content=decoded_str,
                sha=data.get("sha", ""),
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
        """
        Creates or updates a file directly on a branch with TracePath AI committer signature.
        """
        # If sha is not provided, try to fetch current sha to update existing file
        current_sha = sha
        if not current_sha:
            existing = await self.get_file_content(full_name, path, ref=branch)
            if existing:
                current_sha = existing.sha

        encoded_content = base64.b64encode(content.encode("utf-8")).decode("utf-8")

        payload: Dict[str, Any] = {
            "message": message,
            "content": encoded_content,
            "branch": branch,
            "committer": {
                "name": "TracePath AI",
                "email": "bot@tracepath.dev",
            },
            "author": {
                "name": "TracePath AI",
                "email": "bot@tracepath.dev",
            },
        }
        if current_sha:
            payload["sha"] = current_sha

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.put(
                f"{self.base_url}/repos/{full_name}/contents/{path.lstrip('/')}",
                headers=self._get_headers(),
                json=payload,
            )
            response.raise_for_status()
            data = response.json()
            commit_info = data.get("commit", {})
            return commit_info.get("sha", "committed")

    async def create_pull_request(
        self,
        full_name: str,
        title: str,
        body: str,
        head_branch: str,
        base_branch: str = "main",
    ) -> str:
        """Open a pull request for automated documentation changes."""
        payload = {
            "title": title,
            "body": body,
            "head": head_branch,
            "base": base_branch,
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{self.base_url}/repos/{full_name}/pulls",
                headers=self._get_headers(),
                json=payload,
            )
            response.raise_for_status()
            data = response.json()
            return data.get("html_url", f"https://github.com/{full_name}/pull/{data.get('number', '')}")
