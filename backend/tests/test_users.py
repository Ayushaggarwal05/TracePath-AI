import pytest
from httpx import AsyncClient
from app.core.security import DEFAULT_MOCK_USER


@pytest.mark.asyncio
async def test_get_current_user_profile(async_client: AsyncClient):
    response = await async_client.get("/api/v1/users/me")
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == DEFAULT_MOCK_USER.email
    assert data["full_name"] == DEFAULT_MOCK_USER.full_name
    assert data["is_active"] is True
    assert "id" in data
