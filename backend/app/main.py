from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.api.v1.api import api_router
from app.core.config import settings
from app.core.exceptions import register_exception_handlers
from app.core.logging import logger, setup_logging
from app.database.base import Base
from app.database.session import engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Setup structured logging
    setup_logging()
    logger.info(f"Starting {settings.PROJECT_NAME} (v{settings.VERSION}) in {settings.ENVIRONMENT} mode...")

    # For development/testing with SQLite/Postgres auto-create tables if running locally
    if not settings.is_production:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database tables verified / created.")

    yield

    # Teardown
    logger.info("Shutting down database engine...")
    await engine.dispose()
    logger.info(f"{settings.PROJECT_NAME} shutdown complete.")


def create_application() -> FastAPI:
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.VERSION,
        openapi_url=f"{settings.API_V1_STR}/openapi.json" if not settings.is_production else None,
        docs_url=f"{settings.API_V1_STR}/docs" if not settings.is_production else None,
        redoc_url=f"{settings.API_V1_STR}/redoc" if not settings.is_production else None,
        lifespan=lifespan,
    )

    # CORS Middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Register Domain Exception Handlers
    register_exception_handlers(app)

    # Include API Routers
    app.include_router(api_router, prefix=settings.API_V1_STR)

    @app.get("/", tags=["Root"])
    async def root():
        return JSONResponse(
            content={
                "name": settings.PROJECT_NAME,
                "version": settings.VERSION,
                "status": "online",
                "docs": f"{settings.API_V1_STR}/docs",
                "api": settings.API_V1_STR,
            }
        )

    return app


app = create_application()
