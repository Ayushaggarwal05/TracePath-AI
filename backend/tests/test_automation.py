import pytest
from httpx import AsyncClient
from app.core.security import MOCK_USER_ID


@pytest.mark.asyncio
async def test_repository_automation_state_transitions(async_client: AsyncClient):
    # Register repository first
    repo_payload = {
        "github_repo_id": "gh-auto-12345",
        "name": "auto-test-repo",
        "full_name": "tracepath-ai/auto-test-repo",
        "default_branch": "main",
        "user_id": str(MOCK_USER_ID),
    }
    create_res = await async_client.post("/api/v1/repositories", json=repo_payload)
    assert create_res.status_code == 201
    repo_id = create_res.json()["id"]

    # 1. Fetch initial automation status (should be INACTIVE)
    status_res = await async_client.get(f"/api/v1/repositories/{repo_id}/automation")
    assert status_res.status_code == 200
    assert status_res.json()["status"] == "INACTIVE"

    # 2. Activate automation
    activate_res = await async_client.post(f"/api/v1/repositories/{repo_id}/automation/activate")
    assert activate_res.status_code == 200
    act_data = activate_res.json()
    assert act_data["status"] == "ACTIVE"
    assert act_data["repository_id"] == repo_id
    assert act_data["updated_at"] is not None

    # Verify status reflects ACTIVE
    check_active = await async_client.get(f"/api/v1/repositories/{repo_id}/automation")
    assert check_active.json()["status"] == "ACTIVE"
    assert check_active.json()["last_activated_at"] is not None

    # 3. Update automation configuration
    config_payload = {
        "target_branch": "develop",
        "doc_paths": ["docs/v2/", "API.md"],
        "auto_commit": True,
    }
    patch_res = await async_client.patch(
        f"/api/v1/repositories/{repo_id}/automation", json=config_payload
    )
    assert patch_res.status_code == 200
    patch_data = patch_res.json()
    assert patch_data["target_branch"] == "develop"
    assert patch_data["doc_paths"] == ["docs/v2/", "API.md"]
    assert patch_data["auto_commit"] is True

    # 4. Deactivate automation
    deactivate_res = await async_client.post(
        f"/api/v1/repositories/{repo_id}/automation/deactivate"
    )
    assert deactivate_res.status_code == 200
    deact_data = deactivate_res.json()
    assert deact_data["status"] == "INACTIVE"

    # Verify status reflects INACTIVE
    check_inactive = await async_client.get(f"/api/v1/repositories/{repo_id}/automation")
    assert check_inactive.json()["status"] == "INACTIVE"
    assert check_inactive.json()["last_deactivated_at"] is not None
