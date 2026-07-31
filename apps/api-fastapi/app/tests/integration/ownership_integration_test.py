import pytest
import uuid
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import User, UserRole, Building, Tenant

@pytest.mark.asyncio
async def test_cross_owner_isolation_integration(db_session: AsyncSession):
    suffix_a = str(uuid.uuid4())[:8]
    suffix_b = str(uuid.uuid4())[:8]

    # Owner A
    owner_a = User(
        id=f"usr_own_a_{suffix_a}",
        phone=f"0911{suffix_a}",
        email=f"owner_a_{suffix_a}@test.com",
        fullName="Chủ Trọ A",
        passwordHash="hash_a",
        role=UserRole.OWNER,
        isActive=True,
    )
    bld_a = Building(
        id=f"bld_a_{suffix_a}",
        ownerId=owner_a.id,
        name=f"Tòa Nhà Owner A {suffix_a}",
        address="123 Nguyễn Văn Cừ, Q5",
    )
    tenant_a = Tenant(
        id=f"tnt_a_{suffix_a}",
        ownerId=owner_a.id,
        fullName="Khách A",
        phone=f"0933{suffix_a}",
        idCardNumber=f"1111{suffix_a}",
    )

    # Owner B
    owner_b = User(
        id=f"usr_own_b_{suffix_b}",
        phone=f"0922{suffix_b}",
        email=f"owner_b_{suffix_b}@test.com",
        fullName="Chủ Trọ B",
        passwordHash="hash_b",
        role=UserRole.OWNER,
        isActive=True,
    )
    bld_b = Building(
        id=f"bld_b_{suffix_b}",
        ownerId=owner_b.id,
        name=f"Tòa Nhà Owner B {suffix_b}",
        address="456 Lê Hồng Phong, Q10",
    )
    tenant_b = Tenant(
        id=f"tnt_b_{suffix_b}",
        ownerId=owner_b.id,
        fullName="Khách B",
        phone=f"0944{suffix_b}",
        idCardNumber=f"2222{suffix_b}",
    )

    db_session.add_all([owner_a, bld_a, tenant_a, owner_b, bld_b, tenant_b])
    await db_session.commit()

    # Isolation Assertions: Owner A does not own Building B or Tenant B
    assert bld_a.ownerId != bld_b.ownerId
    assert tenant_a.ownerId != tenant_b.ownerId
    assert bld_b.ownerId == owner_b.id
    assert tenant_b.ownerId == owner_b.id
