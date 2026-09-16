import pytest
from httpx import AsyncClient
from app.core.security import MOCK_USER_ID


@pytest.mark.asyncio
async def test_register_and_list_repository(async_client: AsyncClient):
    # 1. Register a new repository
    payload = {
        "github_repo_id": "gh-998877",
        "name": "sample-backend",
        "full_name": "tracepath-ai/sample-backend",
        "default_branch": "main",
        "is_private": False,
        "html_url": "https://github.com/tracepath-ai/sample-backend",
        "description": "Sample backend for TracePath AI",
        "user_id": str(MOCK_USER_ID),
    }

    create_res = await async_client.post("/api/v1/repositories", json=payload)
    assert create_res.status_code == 201
    created_repo = create_res.json()
    assert created_repo["name"] == "sample-backend"
    assert created_repo["full_name"] == "tracepath-ai/sample-backend"
    assert created_repo["automation"]["status"] == "INACTIVE"
    repo_id = created_repo["id"]

    # 2. Duplicate registration check (should return 409 Conflict)
    dup_res = await async_client.post("/api/v1/repositories", json=payload)
    assert dup_res.status_code == 409

    # 3. List repositories
    list_res = await async_client.get("/api/v1/repositories")
    assert list_res.status_code == 200
    list_data = list_res.json()
    assert list_data["total"] >= 1
    assert any(r["id"] == repo_id for r in list_data["items"])

    # 4. Get repository details
    detail_res = await async_client.get(f"/api/v1/repositories/{repo_id}")
    assert detail_res.status_code == 200
    detail_data = detail_res.json()
    assert detail_data["id"] == repo_id
    assert detail_data["name"] == "sample-backend"

    # 5. Update repository
    update_res = await async_client.patch(
        f"/api/v1/repositories/{repo_id}",
        json={"description": "Updated repository description"},
    )
    assert update_res.status_code == 200
    assert update_res.json()["description"] == "Updated repository description"
