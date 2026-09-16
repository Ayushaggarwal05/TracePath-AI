from typing import AsyncGenerator
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.security import CurrentUser, get_current_user_context
from app.database.session import get_db


async def get_database_session() -> AsyncGenerator[AsyncSession, None]:
    """Provides async database session."""
    async for session in get_db():
        yield session


def get_current_user() -> CurrentUser:
    """Provides authenticated current user context."""
    return get_current_user_context()
