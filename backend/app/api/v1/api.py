from fastapi import APIRouter
from app.api.v1.endpoints import (
    activity,
    executions,
    github,
    health,
    repositories,
    users,
    webhooks,
)

api_router = APIRouter()

api_router.include_router(health.router, tags=["Health"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(github.router, prefix="/github", tags=["GitHub"])
api_router.include_router(webhooks.router, prefix="/github", tags=["Webhooks"])
api_router.include_router(repositories.router, prefix="/repositories", tags=["Repositories"])
api_router.include_router(executions.router, prefix="/executions", tags=["Executions"])
api_router.include_router(activity.router, prefix="/activity", tags=["Activity"])
