from typing import AsyncGenerator, Optional
from uuid import UUID
from fastapi import Cookie, Depends, Header, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.security import CurrentUser, decode_access_token, DEFAULT_MOCK_USER, COOKIE_SESSION_NAME
from app.database.session import get_db
from app.models.user import User


async def get_database_session() -> AsyncGenerator[AsyncSession, None]:
    """Provides async database session."""
    async for session in get_db():
        yield session


async def get_current_user(
    request: Request,
    authorization: Optional[str] = Header(None),
    tracepath_session: Optional[str] = Cookie(None),
    db: AsyncSession = Depends(get_database_session),
) -> CurrentUser:
    """
    Provides authenticated current user context.
    Extracts session from HTTP-Only cookie or Bearer header,
    resolving the live Supabase user, or falls back to default context.
    """
    token = tracepath_session
    if not token and authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1].strip()

    if token:
        payload = decode_access_token(token)
        if payload and payload.get("sub"):
            try:
                user_id = UUID(payload["sub"])
                stmt = select(User).where(User.id == user_id)
                res = await db.execute(stmt)
                db_user = res.scalars().first()
                if db_user:
                    gh_conn = db_user.github_connections[0] if db_user.github_connections else None
                    return CurrentUser(
                        id=db_user.id,
                        email=db_user.email,
                        full_name=db_user.full_name,
                        is_active=db_user.is_active,
                        github_user_id=gh_conn.github_user_id if gh_conn else None,
                        github_username=gh_conn.username if gh_conn else None,
                    )
            except Exception:
                pass

    return DEFAULT_MOCK_USER

