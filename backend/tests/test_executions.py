import pytest
from httpx import AsyncClient
from app.core.security import MOCK_USER_ID


@pytest.mark.asyncio
async def test_execution_lifecycle_and_pipeline(async_client: AsyncClient):
    # 1. Create a repository
    repo_payload = {
        "github_repo_id": "gh-exec-9999",
        "name": "payment-service",
        "full_name": "tracepath-ai/payment-service",
        "default_branch": "main",
        "user_id": str(MOCK_USER_ID),
    }
    repo_res = await async_client.post("/api/v1/repositories", json=repo_payload)
    assert repo_res.status_code == 201
    repo_id = repo_res.json()["id"]

    # 2. Create manual execution record without running pipeline
    exec_payload = {
        "repository_id": repo_id,
        "event_type": "push",
        "commit_sha": "a1b2c3d4e5f678901234567890abcdef12345678",
        "branch": "main",
        "status": "PENDING",
        "changed_files": [
            {"filename": "src/routes.py", "status": "modified", "additions": 15, "deletions": 2}
        ],
    }
    create_exec_res = await async_client.post("/api/v1/executions", json=exec_payload)
    assert create_exec_res.status_code == 201
    created_exec = create_exec_res.json()
    exec_id = created_exec["id"]
    assert created_exec["status"] == "PENDING"
    assert created_exec["commit_sha"] == "a1b2c3d4e5f678901234567890abcdef12345678"

    # 3. Retrieve execution details
    get_exec_res = await async_client.get(f"/api/v1/executions/{exec_id}")
    assert get_exec_res.status_code == 200
    exec_detail = get_exec_res.json()
    assert exec_detail["id"] == exec_id
    assert len(exec_detail["changed_files"]) == 1

    # 4. Create execution and run full pipeline simulation
    pipeline_payload = {
        "repository_id": repo_id,
        "event_type": "push",
        "commit_sha": "f9e8d7c6b5a432109876543210fedcba98765432",
        "branch": "main",
    }
    pipeline_res = await async_client.post(
        "/api/v1/executions?run_pipeline=true", json=pipeline_payload
    )
    assert pipeline_res.status_code == 201
    piped_data = pipeline_res.json()
    assert piped_data["status"] == "COMPLETED"
    assert piped_data["final_commit_sha"] is not None
    assert piped_data["pull_request_url"] is not None
    assert piped_data["analysis_result"] is not None
    assert piped_data["documentation_decision"] is not None
    assert piped_data["updated_documents"] is not None
    assert piped_data["generated_diff"] is not None

    # 5. List executions for repository
    repo_execs_res = await async_client.get(f"/api/v1/repositories/{repo_id}/executions")
    assert repo_execs_res.status_code == 200
    repo_execs = repo_execs_res.json()
    assert repo_execs["total"] == 2

    # 6. Global filtered executions list
    filter_res = await async_client.get("/api/v1/executions?status=COMPLETED")
    assert filter_res.status_code == 200
    filter_data = filter_res.json()
    assert filter_data["total"] >= 1
    assert all(e["status"] == "COMPLETED" for e in filter_data["items"])


@pytest.mark.asyncio
async def test_execution_not_found(async_client: AsyncClient):
    random_id = "00000000-0000-0000-0000-000000000999"
    res = await async_client.get(f"/api/v1/executions/{random_id}")
    assert res.status_code == 404
    assert res.json()["error"] == "NOT_FOUND"


@pytest.mark.asyncio
async def test_create_execution_invalid_repo(async_client: AsyncClient):
    payload = {
        "repository_id": "00000000-0000-0000-0000-000000000999",
        "event_type": "push",
        "commit_sha": "abcdef1234567890abcdef1234567890abcdef12",
        "branch": "main",
    }
    res = await async_client.post("/api/v1/executions", json=payload)
    assert res.status_code == 404
    assert res.json()["error"] == "NOT_FOUND"
