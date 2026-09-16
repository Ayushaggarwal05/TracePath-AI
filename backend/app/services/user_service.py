from typing import Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.exceptions import EntityNotFoundException
from app.core.security import CurrentUser
from app.models.user import User
from app.repositories.user_repository import user_repo
from app.schemas.user import UserCreate, UserResponse, UserUpdate


class UserService:
    async def get_or_create_user(self, db: AsyncSession, current_user: CurrentUser) -> User:
        user = await user_repo.get_by_id(db, current_user.id)
        if not user:
            # Check by email
            user = await user_repo.get_by_email(db, current_user.email)
            if not user:
                user = User(
                    id=current_user.id,
                    email=current_user.email,
                    full_name=current_user.full_name,
                    is_active=current_user.is_active,
                )
                db.add(user)
                await db.flush()
                await db.refresh(user)
        return user

    async def get_user_profile(self, db: AsyncSession, user_id: UUID) -> User:
        user = await user_repo.get_by_id(db, user_id)
        if not user:
            raise EntityNotFoundException("User", user_id)
        return user


user_service = UserService()
