from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.dependencies import get_current_user, get_database_session
from app.core.security import CurrentUser
from app.schemas.user import UserResponse
from app.services.user_service import user_service

router = APIRouter()


@router.get(
    "/me",
    summary="Get Current User Profile",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
)
async def get_current_user_profile(
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_database_session),
) -> UserResponse:
    """
    Retrieve details of the currently authenticated user.
    """
    user = await user_service.get_or_create_user(db, current_user)
    return UserResponse.model_validate(user)
