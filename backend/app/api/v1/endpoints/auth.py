import logging
from typing import Any, Dict, List, Optional
from uuid import UUID
import httpx
from fastapi import APIRouter, Cookie, Depends, Header, HTTPException, Request, Response, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings
from app.core.security import (
    COOKIE_SESSION_NAME,
    create_access_token,
    decode_access_token,
    decrypt_token,
    encrypt_token,
    hash_password,
    verify_password,
)
from app.database.session import get_db
from app.models.github_connection import GitHubConnection
from app.models.repository import Repository
from app.models.user import User

router = APIRouter()
logger = logging.getLogger("tracepath.auth")


class SignUpRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, description="Password (at least 8 characters)")
    full_name: Optional[str] = Field(None, max_length=255)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class ConnectGitHubRequest(BaseModel):
    token: Optional[str] = Field(None, description="GitHub Personal Access Token (ghp_... or github_pat_...)")
    username: Optional[str] = Field(None, description="GitHub username to fetch public repositories")


def _format_user_response(user: User) -> Dict[str, Any]:
    """Helper to format sanitized user object."""
    gh_conn = user.github_connections[0] if user.github_connections else None
    token_status = getattr(gh_conn, "token_status", "VALID") or "VALID" if gh_conn else "VALID"
    return {
        "id": str(user.id),
        "email": user.email,
        "full_name": user.full_name or user.email.split("@")[0],
        "is_active": user.is_active,
        "github_connected": gh_conn is not None,
        "github_username": gh_conn.username if gh_conn else None,
        "github_avatar_url": gh_conn.avatar_url if gh_conn else None,
        "token_status": token_status,
        "github_connections": [
            {
                "id": str(conn.id),
                "user_id": str(conn.user_id),
                "github_user_id": conn.github_user_id,
                "username": conn.username,
                "avatar_url": conn.avatar_url,
                "token_status": getattr(conn, "token_status", "VALID") or "VALID",
                "created_at": conn.created_at.isoformat() if conn.created_at else "",
            }
            for conn in (user.github_connections or [])
        ],
        "created_at": user.created_at.isoformat() if user.created_at else None,
    }


def _set_auth_cookie(response: Response, token: str) -> None:
    """Sets a secure HTTP-Only session cookie."""
    response.set_cookie(
        key=COOKIE_SESSION_NAME,
        value=token,
        httponly=True,
        secure=settings.is_production,
        samesite="lax",
        max_age=60 * 60 * 24 * 7,  # 7 days
        path="/",
    )


async def get_authenticated_user(
    request: Request,
    authorization: Optional[str] = Header(None),
    tracepath_session: Optional[str] = Cookie(None),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Dependency that resolves authenticated User via HTTP-Only cookie or Bearer header."""
    token = tracepath_session
    if not token and authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1].strip()

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please log in.",
        )

    payload = decode_access_token(token)
    if not payload or not payload.get("sub"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired or invalid. Please log in again.",
        )

    try:
        user_id = UUID(payload["sub"])
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user session identifier.",
        )

    stmt = select(User).where(User.id == user_id)
    res = await db.execute(stmt)
    user = res.scalars().first()

    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account not found or deactivated.",
        )

    return user


import re

def validate_password_strength(password: str) -> None:
    """Validates strong enterprise password policy."""
    if len(password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters long.",
        )
    if not re.search(r"[A-Z]", password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must contain at least one uppercase letter (A-Z).",
        )
    if not re.search(r"[a-z]", password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must contain at least one lowercase letter (a-z).",
        )
    if not re.search(r"\d", password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must contain at least one number (0-9).",
        )
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>\-_+=]", password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must contain at least one special character (!@#$%^&*...).",
        )


@router.post("/signup")
async def signup(
    payload: SignUpRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Registers a new user with Email + Hashed Password,
    stores user in Supabase, and issues a secure HTTP-Only session cookie.
    """
    email = payload.email.strip().lower()
    validate_password_strength(payload.password)

    stmt = select(User).where(User.email == email)
    res = await db.execute(stmt)
    existing_user = res.scalars().first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists. Please log in.",
        )

    hashed = hash_password(payload.password)
    user = User(
        email=email,
        hashed_password=hashed,
        full_name=payload.full_name or email.split("@")[0],
        is_active=True,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    token = create_access_token(str(user.id), user.email)
    _set_auth_cookie(response, token)

    logger.info(f"New user registered: {user.email} ({user.id})")
    return {
        "status": "success",
        "message": "Account created successfully.",
        "token": token,
        "user": _format_user_response(user),
    }


@router.post("/login")
async def login(
    payload: LoginRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Authenticates an existing user via Email + Password,
    verifies bcrypt hash against Supabase, and issues a secure HTTP-Only session cookie.
    """
    email = payload.email.strip().lower()
    stmt = select(User).where(User.email == email)
    res = await db.execute(stmt)
    user = res.scalars().first()

    if not user or not user.hashed_password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    if not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    token = create_access_token(str(user.id), user.email)
    _set_auth_cookie(response, token)

    logger.info(f"User logged in: {user.email} ({user.id})")
    return {
        "status": "success",
        "message": "Logged in successfully.",
        "token": token,
        "user": _format_user_response(user),
    }


@router.get("/me")
async def get_current_user_profile(
    user: User = Depends(get_authenticated_user),
) -> Dict[str, Any]:
    """Returns verified server-side session user profile."""
    return {
        "status": "authenticated",
        "user": _format_user_response(user),
    }


@router.post("/logout")
async def logout(response: Response) -> Dict[str, str]:
    """Deletes the HTTP-Only session cookie."""
    response.delete_cookie(
        key=COOKIE_SESSION_NAME,
        httponly=True,
        secure=settings.is_production,
        samesite="lax",
        path="/",
    )
    return {"status": "success", "message": "Logged out successfully."}


@router.post("/connect-github")
async def connect_github_account(
    payload: ConnectGitHubRequest,
    user: User = Depends(get_authenticated_user),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Links a GitHub Account (via PAT or username) to the logged-in user account.
    Validates token against api.github.com, encrypts with AES-256 at rest,
    and synchronizes repositories directly to Supabase.
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
        # Fine-grained PATs require Bearer, classic tokens work with Bearer or token
        headers["Authorization"] = f"Bearer {token}"

    try:
        async with httpx.AsyncClient(timeout=30.0) as http_client:
            if token:
                user_res = await http_client.get("https://api.github.com/user", headers=headers)
            else:
                user_res = await http_client.get(f"https://api.github.com/users/{username}", headers=headers)

            if user_res.status_code == 401:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid or expired GitHub Personal Access Token. Please verify your token and try again.",
                )
            elif user_res.status_code == 403:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="GitHub API access forbidden (HTTP 403). Your token may lack user/repo permissions or rate limit was exceeded.",
                )
            elif user_res.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"GitHub validation failed (HTTP {user_res.status_code}): {user_res.text[:200]}",
                )

            gh_user = user_res.json()
            gh_username = gh_user.get("login", username or "")
            gh_name = gh_user.get("name") or gh_username
            gh_id = str(gh_user.get("id", ""))
            avatar_url = gh_user.get("avatar_url", "")

            # Encrypt sensitive token at rest
            encrypted_token = encrypt_token(token) if token else None

            # Check if GitHubConnection already exists for this user
            stmt = select(GitHubConnection).where(GitHubConnection.user_id == user.id)
            res = await db.execute(stmt)
            connection = res.scalars().first()

            if connection:
                connection.github_user_id = gh_id
                connection.username = gh_username
                connection.avatar_url = avatar_url
                connection.access_token_enc = encrypted_token
                connection.token_status = "VALID"
            else:
                connection = GitHubConnection(
                    user_id=user.id,
                    github_user_id=gh_id,
                    username=gh_username,
                    avatar_url=avatar_url,
                    access_token_enc=encrypted_token,
                    token_status="VALID",
                )
                db.add(connection)

            # Update user full_name if empty
            if not user.full_name or user.full_name == user.email.split("@")[0]:
                user.full_name = gh_name

            await db.commit()
            await db.refresh(user)

            # Synchronize repositories list from GitHub
            imported_repos_count = 0
            try:
                if token:
                    repos_res = await http_client.get(
                        "https://api.github.com/user/repos?per_page=100&sort=updated",
                        headers=headers,
                    )
                else:
                    repos_res = await http_client.get(
                        f"https://api.github.com/users/{gh_username}/repos?per_page=100&sort=updated",
                        headers=headers,
                    )

                if repos_res.status_code == 200:
                    repos_data = repos_res.json()
                    for r in repos_data:
                        gh_repo_id = str(r["id"])
                        stmt_r = select(Repository).where(Repository.github_repo_id == gh_repo_id)
                        res_r = await db.execute(stmt_r)
                        repo_obj = res_r.scalars().first()

                        if repo_obj:
                            repo_obj.user_id = user.id
                            repo_obj.name = r["name"]
                            repo_obj.full_name = r["full_name"]
                            repo_obj.default_branch = r.get("default_branch", "main")
                            repo_obj.is_private = r.get("private", False)
                            repo_obj.html_url = r.get("html_url", f"https://github.com/{r['full_name']}")
                            repo_obj.description = r.get("description")
                        else:
                            repo_obj = Repository(
                                user_id=user.id,
                                github_repo_id=gh_repo_id,
                                name=r["name"],
                                full_name=r["full_name"],
                                default_branch=r.get("default_branch", "main"),
                                is_private=r.get("private", False),
                                html_url=r.get("html_url", f"https://github.com/{r['full_name']}"),
                                description=r.get("description"),
                            )
                            db.add(repo_obj)
                            imported_repos_count += 1

                    await db.commit()
                    await db.refresh(user)
            except Exception as repo_err:
                logger.warning(f"Non-critical: repository sync warning for @{gh_username}: {repo_err}")

            logger.info(f"GitHub account @{gh_username} successfully linked to user {user.email}. Imported {imported_repos_count} repos.")
            return {
                "status": "success",
                "message": f"Successfully connected GitHub account @{gh_username}!",
                "github_username": gh_username,
                "repositories_imported": imported_repos_count,
                "user": _format_user_response(user),
            }

    except HTTPException:
        raise
    except httpx.RequestError as e:
        logger.error(f"Network error connecting to GitHub API: {e}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Network error connecting to GitHub: {str(e)}",
        )
    except Exception as e:
        await db.rollback()
        logger.error(f"Unexpected error linking GitHub account: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to link GitHub account: {str(e)}",
        )
