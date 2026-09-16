from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from app.core.config import settings


def get_engine_args(database_url: str) -> dict:
    args = {
        "echo": settings.DB_ECHO,
        "future": True,
    }
    if "sqlite" in database_url:
        args["connect_args"] = {"check_same_thread": False}
    else:
        args["pool_size"] = settings.DB_POOL_SIZE
        args["max_overflow"] = settings.DB_MAX_OVERFLOW
        args["pool_pre_ping"] = True
    return args


engine: AsyncEngine = create_async_engine(
    settings.DATABASE_URL,
    **get_engine_args(settings.DATABASE_URL),
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,
)

async_session_factory = AsyncSessionLocal


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency that yields an async database session per request."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
