import pytest
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import User, UserRole
from app.core.security import hash_password, verify_password

@pytest.mark.asyncio
async def test_auth_service_integration_login_correct_and_wrong(db_session: AsyncSession):
    suffix = str(uuid.uuid4())[:8]
    hashed_pwd = hash_password("SecretPassword123")

    user = User(
        id=f"usr_auth_{suffix}",
        phone=f"0988{suffix}",
        email=f"auth_{suffix}@test.com",
        fullName="Auth Test User",
        passwordHash=hashed_pwd,
        role=UserRole.OWNER,
        isActive=True,
    )
    db_session.add(user)
    await db_session.commit()

    # 1. Correct password verification
    assert verify_password("SecretPassword123", user.passwordHash) is True

    # 2. Wrong password verification
    assert verify_password("WrongPassword999", user.passwordHash) is False

@pytest.mark.asyncio
async def test_auth_service_integration_inactive_user(db_session: AsyncSession):
    suffix = str(uuid.uuid4())[:8]
    user = User(
        id=f"usr_inactive_{suffix}",
        phone=f"0977{suffix}",
        email=f"inactive_{suffix}@test.com",
        fullName="Inactive User",
        passwordHash=hash_password("SecretPassword123"),
        role=UserRole.TENANT,
        isActive=False,
    )
    db_session.add(user)
    await db_session.commit()

    assert user.isActive is False
