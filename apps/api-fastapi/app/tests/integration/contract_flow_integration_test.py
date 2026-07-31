import pytest
import uuid
from decimal import Decimal
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models import (
    User, UserRole, Building, Room, RoomStatus, Tenant, Contract, ContractStatus,
    ContractTenant, ContractTenantRole
)

@pytest.mark.asyncio
async def test_contract_lifecycle_flow_integration(db_session: AsyncSession):
    suffix = str(uuid.uuid4())[:8]

    # 1. Setup Owner, Building & Room
    owner = User(
        id=f"usr_{suffix}",
        phone=f"0981{suffix}",
        email=f"owner_{suffix}@test.com",
        fullName="Owner Contract Test",
        passwordHash="hash",
        role=UserRole.OWNER,
        isActive=True,
    )
    building = Building(id=f"bld_{suffix}", ownerId=owner.id, name="Building Test", address="123 Street")
    room = Room(id=f"room_{suffix}", buildingId=building.id, roomNumber="P201", floor=2, roomType="STUDIO", basePrice=Decimal("4000000"), areaSqM=Decimal("30"), status=RoomStatus.VACANT)
    tenant = Tenant(id=f"tnt_{suffix}", ownerId=owner.id, fullName="Tenant Test", phone=f"0911{suffix}", idCardNumber=f"333{suffix}")
    
    db_session.add_all([owner, building, room, tenant])
    await db_session.flush()

    # 2. Create Contract DRAFT
    contract = Contract(
        id=f"ctr_{suffix}",
        roomId=room.id,
        contractCode=f"HD-{suffix}",
        startDate=datetime(2026, 1, 1),
        endDate=datetime(2026, 12, 31),
        depositAmount=Decimal("4000000"),
        monthlyPrice=Decimal("4000000"),
        billingDay=5,
        status=ContractStatus.DRAFT,
    )
    db_session.add(contract)
    await db_session.flush()
    assert contract.status == ContractStatus.DRAFT

    # 3. Add PRIMARY Tenant
    ct = ContractTenant(id=f"ct_{suffix}", contractId=contract.id, tenantId=tenant.id, role=ContractTenantRole.PRIMARY)
    db_session.add(ct)
    await db_session.flush()

    # 4. Activate Contract & Update Room Status to RENTED
    contract.status = ContractStatus.ACTIVE
    room.status = RoomStatus.RENTED
    await db_session.flush()
    assert contract.status == ContractStatus.ACTIVE
    assert room.status == RoomStatus.RENTED

    # 5. Terminate Contract & Update Room Status to VACANT
    contract.status = ContractStatus.TERMINATED
    room.status = RoomStatus.VACANT
    await db_session.commit()

    # Query back DB
    res = await db_session.execute(select(Room).where(Room.id == room.id))
    db_room = res.scalar_one()
    assert db_room.status == RoomStatus.VACANT
