import pytest
import uuid
from decimal import Decimal
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy import select
from app.models import (
  User, UserRole, Building, Room, RoomStatus, Tenant, Contract, ContractStatus,
  Meter, MeterType, MeterReading, MeterReadingStatus,
  Invoice, InvoiceStatus, Payment, PaymentMethod, PaymentSource, PaymentStatus
)

TEST_DB_URL = "postgresql+asyncpg://postgres:postgres@127.0.0.1:5432/nha_tro_integration_test"

@pytest.fixture
async def real_db_session():
    engine = create_async_engine(TEST_DB_URL, echo=False)
    async_session = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)
    async with async_session() as session:
        yield session
    await engine.dispose()

@pytest.mark.asyncio
async def test_full_business_flow_real_postgresql_db(real_db_session: AsyncSession):
    """Real PostgreSQL Integration Test: Inserts & Queries real records with FK constraints."""
    session = real_db_session
    suffix = str(uuid.uuid4())[:8]

    # 1. Insert Owner User
    owner = User(
        id=f"usr_owner_{suffix}",
        phone=f"0987{suffix}",
        email=f"owner_{suffix}@test.com",
        fullName="Chủ Trọ Test Real DB",
        passwordHash="hashed_password",
        role=UserRole.OWNER,
        isActive=True,
    )
    session.add(owner)
    await session.flush()

    # 2. Insert Building
    building = Building(
        id=f"bld_{suffix}",
        ownerId=owner.id,
        name=f"Tòa Nhà Test Real DB {suffix}",
        address="123 Đường Test, Q1",
    )
    session.add(building)
    await session.flush()

    # 3. Insert Room
    room = Room(
        id=f"room_{suffix}",
        buildingId=building.id,
        roomNumber=f"P101_{suffix}",
        floor=1,
        roomType="STUDIO",
        basePrice=Decimal("3500000"),
        areaSqM=Decimal("25.5"),
        status=RoomStatus.RENTED,
    )
    session.add(room)
    await session.flush()

    # 4. Insert Tenant
    tenant = Tenant(
        id=f"tnt_{suffix}",
        ownerId=owner.id,
        fullName="Khách Thuê Test Real DB",
        phone=f"0912{suffix}",
        idCardNumber=f"123456{suffix}",
    )
    session.add(tenant)
    await session.flush()

    # 5. Insert Contract
    contract = Contract(
        id=f"ctr_{suffix}",
        roomId=room.id,
        contractCode=f"HD-REAL-{suffix}",
        startDate=datetime(2026, 1, 1),
        endDate=datetime(2026, 12, 31),
        depositAmount=Decimal("3500000"),
        monthlyPrice=Decimal("3500000"),
        billingDay=5,
        status=ContractStatus.ACTIVE,
    )
    session.add(contract)
    await session.flush()

    # 6. Insert Meter & MeterReading
    meter = Meter(
        id=f"mtr_{suffix}",
        roomId=room.id,
        type=MeterType.ELECTRICITY,
        serialNumber=f"E-REAL-{suffix}",
        initialReading=Decimal("100.00"),
        isActive=True,
    )
    session.add(meter)
    await session.flush()

    reading = MeterReading(
        id=f"rdg_{suffix}",
        meterId=meter.id,
        period="2026-01",
        previousValue=Decimal("100.00"),
        currentValue=Decimal("150.00"),
        consumption=Decimal("50.00"),
        status=MeterReadingStatus.RECORDED,
        recordedById=owner.id,
    )
    session.add(reading)
    await session.flush()

    # 7. Insert Invoice & Payment
    invoice = Invoice(
        id=f"inv_{suffix}",
        invoiceCode=f"INV-REAL-{suffix}",
        roomId=room.id,
        contractId=contract.id,
        billingPeriod="2026-01",
        revision=1,
        dueDate=datetime(2026, 1, 10),
        subtotalAmount=Decimal("3750000"),
        discountAmount=Decimal("0"),
        totalAmount=Decimal("3750000"),
        paidAmount=Decimal("3750000"),
        remainingAmount=Decimal("0"),
        status=InvoiceStatus.PAID,
    )
    session.add(invoice)
    await session.flush()

    payment = Payment(
        id=f"pay_{suffix}",
        paymentCode=f"PAY-REAL-{suffix}",
        invoiceId=invoice.id,
        amount=Decimal("3750000"),
        refundAmount=Decimal("0"),
        overpaymentAmount=Decimal("0"),
        method=PaymentMethod.BANK_TRANSFER,
        source=PaymentSource.ADMIN_MANUAL,
        status=PaymentStatus.CONFIRMED,
        recordedById=owner.id,
    )
    session.add(payment)
    await session.commit()

    # Query back & Verify FK Integrity in PostgreSQL
    stmt = select(Invoice).where(Invoice.id == invoice.id)
    res = await session.execute(stmt)
    db_invoice = res.scalar_one()

    assert db_invoice.invoiceCode == f"INV-REAL-{suffix}"
    assert db_invoice.totalAmount == Decimal("3750000")
    assert db_invoice.status == InvoiceStatus.PAID
