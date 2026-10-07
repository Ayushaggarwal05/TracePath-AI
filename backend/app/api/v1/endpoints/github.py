import logging
from typing import Any, Dict, List, Optional
import httpx
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.dependencies import get_current_user
from app.core.config import settings
from app.core.security import CurrentUser, decrypt_token, encrypt_token, generate_oauth_state, verify_oauth_state
from app.database.session import get_db
from app.github.client import GitHubAPIClient
from app.github.interface import GitHubRepoInfo
from app.models.github_connection import GitHubConnection
from app.models.user import User
from app.repositories.user_repository import user_repo

router = APIRouter()
logger = logging.getLogger("tracepath.github_api")


class ConnectTokenRequest(BaseModel):
    token: Optional[str] = Field(None, description="GitHub Personal Access Token (ghp_... or github_pat_...)")
    username: Optional[str] = Field(None, description="GitHub username to fetch public repositories")


@router.get("/login")
async def get_github_login_url(
    redirect_uri: Optional[str] = None,
) -> Dict[str, str]:
    """
    Returns the GitHub OAuth authorization URL with cryptographically signed CSRF state parameter.
    Never exposes client secret or private keys.
    """
    client_id = settings.GITHUB_APP_CLIENT_ID or "mock_client_id_dev"
    scopes = "repo,read:org,user:email"
    callback_url = redirect_uri or "http://localhost:5173/auth/callback"
    state_token = generate_oauth_state()

    oauth_url = (
        f"https://github.com/login/oauth/authorize"
        f"?client_id={client_id}"
        f"&scope={scopes}"
        f"&redirect_uri={callback_url}"
        f"&state={state_token}"
    )

    return {
        "url": oauth_url,
        "client_id": client_id,
        "scopes": scopes,
        "state": state_token,
    }


@router.post("/connect-token")
async def connect_github_token(
    payload: ConnectTokenRequest,
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Connects a user's GitHub account via Personal Access Token or username,
    verifies validity against api.github.com, and encrypts the token at rest with AES-256.
    """
    token = payload.token.strip() if payload.token else None
    username = payload.username.strip() if payload.username else None

    if not token and not username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide a GitHub Personal Access Token or GitHub username.",
        )

    headers = {
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": f"TracePath-AI/{settings.VERSION}",
    }
    if token:
        headers["Authorization"] = f"Bearer {token}"

    async with httpx.AsyncClient(timeout=30.0) as http_client:
        try:
            if token:
                user_res = await http_client.get("https://api.github.com/user", headers=headers)
            else:
                user_res = await http_client.get(f"https://api.github.com/users/{username}", headers=headers)

            if user_res.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid GitHub Token or Username. GitHub returned status " + str(user_res.status_code),
                )

            gh_user = user_res.json()
            gh_username = gh_user.get("login", username)
            gh_name = gh_user.get("name") or gh_username
            gh_email = gh_user.get("email") or f"{gh_username}@users.noreply.github.com"
            gh_id = str(gh_user.get("id", ""))
            avatar_url = gh_user.get("avatar_url", "")

            # Save connection with AES-256 encryption
            current_user = await user_repo.get_or_create(db, email=gh_email, full_name=gh_name)
            if current_user:
                current_user.full_name = gh_name
                current_user.email = gh_email
                encrypted_token = encrypt_token(token) if token else None
                conn = GitHubConnection(
                    user_id=current_user.id,
                    github_user_id=gh_id,
                    username=gh_username,
                    avatar_url=avatar_url,
                    access_token_enc=encrypted_token,
                )
                db.add(conn)
                await db.commit()

            return {
                "status": "connected",
                "name": gh_name,
                "username": gh_username,
                "avatar_url": avatar_url,
                "message": f"Successfully connected GitHub account for @{gh_username}",
            }
        except HTTPException:
            raise
        except Exception as err:
            logger.error(f"Failed to connect GitHub token: {err}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to verify GitHub credentials: {str(err)}",
            )


@router.get("/callback")
async def github_oauth_callback(
    code: str = Query(..., description="Temporary OAuth code received from GitHub"),
    state: Optional[str] = Query(None, description="CSRF protection state token"),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Exchanges temporary code for GitHub access token, verifies CSRF state token,
    encrypts token with AES-256 at rest, and updates the user's GitHubConnection.
    """
    client_id = settings.GITHUB_APP_CLIENT_ID
    client_secret = settings.GITHUB_APP_CLIENT_SECRET

    # Verify state parameter if provided
    if state and not verify_oauth_state(state):
        logger.warning("Invalid or expired OAuth state parameter received.")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OAuth state parameter (CSRF protection failed).",
        )

    # Real GitHub token exchange
    async with httpx.AsyncClient(timeout=30.0) as http_client:
        token_res = await http_client.post(
            "https://github.com/login/oauth/access_token",
            headers={"Accept": "application/json"},
            data={
                "client_id": client_id,
                "client_secret": client_secret,
                "code": code,
            },
        )
        if token_res.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to exchange GitHub authorization code.",
            )

        token_data = token_res.json()
        access_token = token_data.get("access_token")
        if not access_token:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"GitHub OAuth error: {token_data.get('error_description', 'No token returned')}",
            )

        # Retrieve user profile from GitHub
        user_res = await http_client.get(
            "https://api.github.com/user",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Accept": "application/vnd.github.v3+json",
                "User-Agent": f"TracePath-AI/{settings.VERSION}",
            },
        )
        if user_res.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to fetch GitHub user profile.",
            )

        github_user = user_res.json()
        gh_login = github_user.get("login", "")
        gh_email = github_user.get("email") or f"{gh_login}@users.noreply.github.com"
        gh_name = github_user.get("name") or gh_login

        # Update or create connection in DB with AES-256 token encryption at rest
        current_user = await user_repo.get_or_create(db, email=gh_email, full_name=gh_name)
        if current_user:
            current_user.full_name = gh_name
            current_user.email = gh_email
            encrypted_token = encrypt_token(access_token)
            conn = GitHubConnection(
                user_id=current_user.id,
                github_user_id=str(github_user.get("id")),
                username=gh_login,
                avatar_url=github_user.get("avatar_url", ""),
                access_token_enc=encrypted_token,
            )
            db.add(conn)
            await db.commit()

        return {
            "status": "connected",
            "username": github_user.get("login"),
            "avatar_url": github_user.get("avatar_url"),
            "scopes": token_data.get("scope", "").split(","),
            "message": "GitHub account successfully connected.",
        }


@router.get("/status")
async def get_github_connection_status(
    user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Returns the current authenticated user's GitHub connection status without exposing tokens.
    """
    stmt = (
        select(GitHubConnection)
        .where(GitHubConnection.user_id == user.id)
        .order_by(GitHubConnection.created_at.desc())
    )
    res = await db.execute(stmt)
    conn = res.scalars().first()
    if conn:
        return {
            "is_connected": True,
            "username": conn.username,
            "avatar_url": conn.avatar_url,
            "github_user_id": conn.github_user_id,
            "installation_id": conn.installation_id,
        }

    return {
        "is_connected": False,
        "username": None,
        "avatar_url": None,
    }


# In-memory user-scoped cache for GitHub repositories
_REPO_CACHE: Dict[str, List[GitHubRepoInfo]] = {}

@router.get("/repositories", response_model=List[GitHubRepoInfo])
async def list_github_repositories(
    username: Optional[str] = Query(None, description="GitHub username to pull public repos for"),
    user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> List[GitHubRepoInfo]:
    """
    Fetches real repository list accessible to the current authenticated user directly from GitHub API.
    Strictly isolated per user to prevent multi-tenant data leakage.
    """
    stmt = (
        select(GitHubConnection)
        .where(GitHubConnection.user_id == user.id)
        .order_by(GitHubConnection.created_at.desc())
    )
    res = await db.execute(stmt)
    last_conn = res.scalars().first()
    raw_token = None
    target_username = username or (last_conn.username if last_conn else None) or user.github_username

    if last_conn and last_conn.access_token_enc:
        raw_token = decrypt_token(last_conn.access_token_enc)

    # If the user has no connection and no username is requested, return empty list (no data leak)
    if not raw_token and not target_username:
        return []

    cache_key = f"{user.id}_{target_username}_{'auth' if raw_token else 'pub'}"

    # 1. Fetch using user's authenticated token (returns private + public repos)
    if raw_token:
        try:
            client = GitHubAPIClient(token=raw_token)
            repos = await client.list_user_repositories()
            if repos:
                _REPO_CACHE[cache_key] = repos
                return repos
        except Exception as err:
            logger.warning(f"Failed to fetch live repos with token for user {user.id}: {err}")

    # 2. Fetch public repos for the specified target username directly from GitHub API
    if target_username:
        try:
            async with httpx.AsyncClient(timeout=10.0) as http_client:
                res = await http_client.get(
                    f"https://api.github.com/users/{target_username}/repos",
                    headers={
                        "Accept": "application/vnd.github.v3+json",
                        "User-Agent": f"TracePath-AI/{settings.VERSION}",
                    },
                    params={"per_page": 100, "sort": "updated"},
                )
                if res.status_code == 200:
                    repos_data = res.json()
                    parsed = [
                        GitHubRepoInfo(
                            id=str(r.get("id")),
                            name=r.get("name"),
                            full_name=r.get("full_name"),
                            default_branch=r.get("default_branch", "main"),
                            is_private=r.get("private", False),
                            html_url=r.get("html_url", ""),
                            description=r.get("description"),
                        )
                        for r in repos_data
                    ]
                    if parsed:
                        _REPO_CACHE[cache_key] = parsed
                        return parsed
                else:
                    logger.warning(
                        f"GitHub API returned status {res.status_code} for @{target_username}"
                    )
        except Exception as err:
            logger.warning(f"Failed to fetch public repos for @{target_username}: {err}")

    # 3. If live call returned empty/rate limited, return this specific user's cached repositories
    if cache_key in _REPO_CACHE and _REPO_CACHE[cache_key]:
        return _REPO_CACHE[cache_key]

    return []
