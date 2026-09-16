from datetime import datetime, timezone
from typing import Any, Dict
from fastapi import APIRouter, Depends, status
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.dependencies import get_database_session
from app.core.config import settings

router = APIRouter()


@router.get(
    "/health",
    summary="Service Health Check",
    status_code=status.HTTP_200_OK,
    response_model=Dict[str, Any],
)
async def health_check(
    db: AsyncSession = Depends(get_database_session),
) -> Dict[str, Any]:
    """
    Returns API health status, version, environment, and database connectivity.
    """
    db_status = "connected"
    try:
        await db.execute(text("SELECT 1"))
    except Exception as exc:
        db_status = f"unhealthy: {str(exc)}"

    return {
        "status": "healthy" if db_status == "connected" else "degraded",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "database": db_status,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
