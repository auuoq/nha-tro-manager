import pytest
import uuid
from decimal import Decimal
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models import (
    User, UserRole, Building, Room, RoomStatus, Contract, ContractStatus,
    Meter, MeterType, MeterReading, MeterReadingStatus,
    Invoice, InvoiceStatus, InvoiceItem, InvoiceItemType
)

@pytest.mark.asyncio
async def test_invoice_generation_flow_integration(db_session: AsyncSession):
    suffix = str(uuid.uuid4())[:8]

    owner = User(id=f"usr_{suffix}", phone=f"0982{suffix}", email=f"owner_{suffix}@test.com", fullName="Owner Invoice", passwordHash="hash", role=UserRole.OWNER, isActive=True)
    building = Building(id=f"bld_{suffix}", ownerId=owner.id, name="Building Inv", address="123 Street")
    room = Room(id=f"room_{suffix}", buildingId=building.id, roomNumber="P301", floor=3, roomType="STUDIO", basePrice=Decimal("5000000"), areaSqM=Decimal("35"), status=RoomStatus.RENTED)
    contract = Contract(id=f"ctr_{suffix}", roomId=room.id, contractCode=f"HD-INV-{suffix}", startDate=datetime(2026,1,1), endDate=datetime(2026,12,31), depositAmount=Decimal("5000000"), monthlyPrice=Decimal("5000000"), billingDay=5, status=ContractStatus.ACTIVE)
    meter = Meter(id=f"mtr_{suffix}", roomId=room.id, type=MeterType.ELECTRICITY, serialNumber=f"E-INV-{suffix}", initialReading=Decimal("200.00"), isActive=True)
    reading = MeterReading(id=f"rdg_{suffix}", meterId=meter.id, period="2026-02", previousValue=Decimal("200.00"), currentValue=Decimal("300.00"), consumption=Decimal("100.00"), status=MeterReadingStatus.RECORDED, recordedById=owner.id)

    db_session.add_all([owner, building, room, contract, meter, reading])
    await db_session.flush()

    # Create Invoice Draft
    invoice = Invoice(
        id=f"inv_{suffix}",
        invoiceCode=f"INV-DRAFT-{suffix}",
        roomId=room.id,
        contractId=contract.id,
        billingPeriod="2026-02",
        revision=1,
        dueDate=datetime(2026, 2, 10),
        subtotalAmount=Decimal("5350000"),
        discountAmount=Decimal("0"),
        totalAmount=Decimal("5350000"),
        paidAmount=Decimal("0"),
        remainingAmount=Decimal("5350000"),
        status=InvoiceStatus.DRAFT,
    )
    item_room = InvoiceItem(id=f"item_r_{suffix}", invoiceId=invoice.id, type=InvoiceItemType.ROOM, description="Tiền phòng tháng 02/2026", quantity=Decimal("1"), unit="tháng", unitPrice=Decimal("5000000"), amount=Decimal("5000000"), sortOrder=1)
    item_elec = InvoiceItem(id=f"item_e_{suffix}", invoiceId=invoice.id, type=InvoiceItemType.ELECTRICITY, description="Tiền điện (100 kWh)", quantity=Decimal("100"), unit="kWh", unitPrice=Decimal("3500"), amount=Decimal("350000"), meterReadingId=reading.id, sortOrder=2)

    db_session.add_all([invoice, item_room, item_elec])
    await db_session.flush()

    # Issue Invoice
    invoice.status = InvoiceStatus.ISSUED
    invoice.issuedAt = datetime.now()
    await db_session.commit()

    # Verify Issued Status in DB
    res = await db_session.execute(select(Invoice).where(Invoice.id == invoice.id))
    db_inv = res.scalar_one()
    assert db_inv.status == InvoiceStatus.ISSUED
    assert db_inv.totalAmount == Decimal("5350000")
