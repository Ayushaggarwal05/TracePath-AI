import hashlib
import hmac
import json
import pytest
from httpx import AsyncClient
from app.core.config import settings
from app.core.security import MOCK_USER_ID
from app.api.v1.endpoints.webhooks import verify_github_signature


def _generate_signature(payload: bytes, secret: str) -> str:
    digest = hmac.new(secret.encode("utf-8"), payload, hashlib.sha256).hexdigest()
    return f"sha256={digest}"


def test_signature_verification():
    secret = "test-secret-key-123"
    settings.GITHUB_WEBHOOK_SECRET = secret
    body = b'{"action": "push"}'

    valid_sig = _generate_signature(body, secret)
    assert verify_github_signature(body, valid_sig) is True

    invalid_sig = "sha256=invalid1234567890abcdef"
    assert verify_github_signature(body, invalid_sig) is False

    assert verify_github_signature(body, None) is False

    # Reset secret
    settings.GITHUB_WEBHOOK_SECRET = None


@pytest.mark.asyncio
async def test_webhook_ping_event(async_client: AsyncClient):
    """Test ping webhook returns 200 OK."""
    headers = {
        "X-GitHub-Event": "ping",
        "Content-Type": "application/json",
    }
    response = await async_client.post(
        "/api/v1/github/webhooks",
        headers=headers,
        content=json.dumps({"zen": "Keep it logically awesome."}),
    )
    assert response.status_code == 202 or response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"


@pytest.mark.asyncio
async def test_webhook_loop_prevention_tracepath_committer(async_client: AsyncClient):
    """Test that commits made by TracePath AI bot are ignored to prevent infinite loops."""
    payload = {
        "repository": {
            "id": 99999,
            "name": "sample-repo",
            "full_name": "tracepath-org/sample-repo",
        },
        "ref": "refs/heads/main",
        "head_commit": {
            "id": "c991a44e5566778899aabbccddeeff0011223344",
            "message": "docs(tracepath): synchronize engineering documentation [tracepath-sync:a8f4c21]",
            "author": {
                "name": "TracePath AI",
                "email": "bot@tracepath.dev",
            },
            "committer": {
                "name": "TracePath AI",
                "email": "bot@tracepath.dev",
            },
        },
    }

    headers = {
        "X-GitHub-Event": "push",
        "Content-Type": "application/json",
    }

    response = await async_client.post(
        "/api/v1/github/webhooks",
        headers=headers,
        content=json.dumps(payload),
    )
    assert response.status_code == 202
    data = response.json()
    assert data["status"] == "skipped"
    assert "Loop prevention" in data["message"]


@pytest.mark.asyncio
async def test_webhook_push_active_repository(async_client: AsyncClient):
    """Test webhook ingestion for an active connected repository creates execution and returns 202."""
    # 1. Register a repository
    repo_payload = {
        "github_repo_id": "gh-hook-test-1",
        "name": "webhook-test-repo",
        "full_name": "test-org/webhook-test-repo",
        "default_branch": "main",
        "user_id": str(MOCK_USER_ID),
    }
    repo_res = await async_client.post("/api/v1/repositories", json=repo_payload)
    assert repo_res.status_code == 201
    repo_id = repo_res.json()["id"]

    # 2. Activate automation for this repository
    activate_res = await async_client.post(f"/api/v1/repositories/{repo_id}/automation/activate")
    assert activate_res.status_code == 200

    # 3. Send GitHub Webhook Push
    commit_sha = "e110a2233445566778899aabbccddeeff0011223"
    webhook_payload = {
        "repository": {
            "id": "gh-hook-test-1",
            "name": "webhook-test-repo",
            "full_name": "test-org/webhook-test-repo",
        },
        "ref": "refs/heads/main",
        "head_commit": {
            "id": commit_sha,
            "message": "feat: add user authentication tokens",
            "author": {
                "name": "Developer",
                "email": "dev@company.com",
            },
            "committer": {
                "name": "Developer",
                "email": "dev@company.com",
            },
        },
    }

    headers = {
        "X-GitHub-Event": "push",
        "Content-Type": "application/json",
    }

    res = await async_client.post(
        "/api/v1/github/webhooks",
        headers=headers,
        content=json.dumps(webhook_payload),
    )
    assert res.status_code == 202
    res_data = res.json()
    assert res_data["status"] == "accepted"
    assert "execution_id" in res_data
    assert res_data["commit_sha"] == commit_sha

    # 4. Idempotency test: Send the exact same webhook payload again
    dup_res = await async_client.post(
        "/api/v1/github/webhooks",
        headers=headers,
        content=json.dumps(webhook_payload),
    )
    assert dup_res.status_code == 202
    dup_data = dup_res.json()
    assert dup_data["status"] == "duplicate"
