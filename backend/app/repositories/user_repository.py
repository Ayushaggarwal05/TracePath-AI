from typing import Optional
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from app.repositories.base import BaseRepository


class UserRepository(BaseRepository[User, UserCreate, UserUpdate]):
    def __init__(self):
        super().__init__(User)

    async def get_by_email(self, db: AsyncSession, email: str) -> Optional[User]:
        result = await db.execute(
            select(User).options(selectinload(User.github_connections)).where(User.email == email)
        )
        return result.scalars().first()

    async def get_or_create(self, db: AsyncSession, *, email: str, full_name: Optional[str] = None) -> User:
        user = await self.get_by_email(db, email=email)
        if not user:
            user = await self.create(db, obj_in=UserCreate(email=email, full_name=full_name))
        return user


user_repo = UserRepository()
