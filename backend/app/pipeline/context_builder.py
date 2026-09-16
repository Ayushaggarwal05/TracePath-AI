import logging
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field
from app.github.interface import IGitHubClient

logger = logging.getLogger("tracepath.context")

# Max character boundaries to keep LLM context strictly bounded
MAX_DIFF_CHARS = 16000
MAX_DOC_CHARS = 8000
MAX_CHANGED_FILES = 30


class PipelineContext(BaseModel):
    """
    Bounded, prioritized context package prepared for multi-agent execution.
    """
    repo_name: str
    commit_sha: str
    branch: str
    commit_message: str
    author: str
    timestamp: str

    # 1. Prioritized changed files metadata
    changed_files: List[Dict[str, Any]] = Field(default_factory=list)
    
    # 2. Bounded git diff
    git_diff: str = ""
    is_diff_truncated: bool = False

    # 3. Directly related files / components
    related_files: List[str] = Field(default_factory=list)

    # 4. Existing repository documentation content
    existing_docs: Dict[str, str] = Field(default_factory=dict)
    
    # 5. Document target paths configured for the repo
    doc_paths: List[str] = Field(default_factory=list)

    # 6. High-level project structure summary
    project_structure_summary: str = ""


class PipelineContextBuilder:
    """
    Retrieves and bounds repository context, ensuring the LLM receives
    high-priority information without blowing context windows or ingesting irrelevant files.
    """

    DEFAULT_DOC_TARGETS = [
        "ARCHITECTURE.md",
        "PRD.md",
        "README.md",
        "docs/api.md",
        "docs/architecture.md",
        "docs/overview.md",
    ]

    async def build_context(
        self,
        github_client: IGitHubClient,
        repo_full_name: str,
        commit_sha: str,
        branch: str = "main",
        configured_doc_paths: Optional[List[str]] = None,
    ) -> PipelineContext:
        logger.info(f"Building bounded pipeline context for {repo_full_name} @ {commit_sha}")

        # 1. Fetch commit details and diff
        commit_info = await github_client.get_commit_diff(repo_full_name, commit_sha)
        
        # Bound changed files list
        raw_changed = commit_info.changed_files or []
        bounded_changed = raw_changed[:MAX_CHANGED_FILES]

        # 2. Construct bounded git diff string
        diff_snippets = []
        total_chars = 0
        is_truncated = False

        for f in bounded_changed:
            patch = f.get("patch", "")
            fname = f.get("filename", "")
            if patch:
                snippet = f"diff --git a/{fname} b/{fname}\n{patch}\n"
                if total_chars + len(snippet) > MAX_DIFF_CHARS:
                    diff_snippets.append(snippet[: MAX_DIFF_CHARS - total_chars])
                    diff_snippets.append("\n[... GIT DIFF TRUNCATED DUE TO SIZE LIMIT ...]\n")
                    is_truncated = True
                    break
                else:
                    diff_snippets.append(snippet)
                    total_chars += len(snippet)

        git_diff = "".join(diff_snippets) or "(No text diff available in commit)"

        # 3. Identify directly related files based on changed directories
        changed_dirs = {
            f.get("filename", "").rsplit("/", 1)[0]
            for f in bounded_changed
            if "/" in f.get("filename", "")
        }
        related_files = [f.get("filename", "") for f in bounded_changed]

        # 4. Fetch existing documentation files
        target_doc_paths = configured_doc_paths or self.DEFAULT_DOC_TARGETS
        existing_docs: Dict[str, str] = {}

        for doc_path in target_doc_paths:
            try:
                file_obj = await github_client.get_file_content(
                    full_name=repo_full_name,
                    path=doc_path,
                    ref=branch,
                )
                if file_obj and file_obj.content:
                    # Bound individual doc content
                    content = file_obj.content
                    if len(content) > MAX_DOC_CHARS:
                        content = content[:MAX_DOC_CHARS] + "\n\n[... DOCUMENTATION TRUNCATED ...]"
                    existing_docs[doc_path] = content
            except Exception as err:
                logger.debug(f"Could not retrieve doc {doc_path}: {err}")

        # 5. Project structure summary from changed paths
        structure_summary = f"Changed directories: {', '.join(sorted(changed_dirs)) if changed_dirs else 'root'}"

        context = PipelineContext(
            repo_name=repo_full_name,
            commit_sha=commit_sha,
            branch=branch,
            commit_message=commit_info.message,
            author=commit_info.author,
            timestamp=commit_info.timestamp,
            changed_files=bounded_changed,
            git_diff=git_diff,
            is_diff_truncated=is_truncated,
            related_files=related_files,
            existing_docs=existing_docs,
            doc_paths=target_doc_paths,
            project_structure_summary=structure_summary,
        )

        logger.info(
            f"Context built: {len(bounded_changed)} changed files, {len(existing_docs)} docs loaded, "
            f"diff length {len(git_diff)} chars (truncated: {is_truncated})"
        )
        return context


context_builder = PipelineContextBuilder()
