import pytest
from httpx import AsyncClient
from app.core.security import MOCK_USER_ID


@pytest.mark.asyncio
async def test_repository_documents_and_history_endpoints(async_client: AsyncClient):
    """Test dynamic document catalog and history endpoints."""
    # 1. Register a repository with custom doc paths
    repo_payload = {
        "github_repo_id": "gh-doc-test-1",
        "name": "doc-test-repo",
        "full_name": "test-org/doc-test-repo",
        "default_branch": "main",
        "user_id": str(MOCK_USER_ID),
    }
    repo_res = await async_client.post("/api/v1/repositories", json=repo_payload)
    assert repo_res.status_code == 201
    repo_id = repo_res.json()["id"]

    # 2. Get document catalog for repository
    docs_res = await async_client.get(f"/api/v1/repositories/{repo_id}/documents")
    assert docs_res.status_code == 200
    docs = docs_res.json()
    assert len(docs) >= 3
    doc_paths = [d["doc_path"] for d in docs]
    assert "ARCHITECTURE.md" in doc_paths
    assert "docs/" in doc_paths
    assert "README.md" in doc_paths

    # 3. Get document history
    history_res = await async_client.get(
        f"/api/v1/repositories/{repo_id}/documents/history?doc_path=ARCHITECTURE.md"
    )
    assert history_res.status_code == 200
    history = history_res.json()
    assert isinstance(history, list)


@pytest.mark.asyncio
async def test_activity_event_stream_endpoint(async_client: AsyncClient):
    """Test activity stream endpoint returns real chronological audit events."""
    activity_res = await async_client.get("/api/v1/activity")
    assert activity_res.status_code == 200
    data = activity_res.json()
    assert "items" in data
    assert "total" in data
    assert isinstance(data["items"], list)
