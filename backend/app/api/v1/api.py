from fastapi import APIRouter
from app.api.v1.endpoints import executions, health, repositories, users

api_router = APIRouter()

api_router.include_router(health.router, tags=["Health"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(repositories.router, prefix="/repositories", tags=["Repositories"])
api_router.include_router(executions.router, prefix="/executions", tags=["Executions"])
