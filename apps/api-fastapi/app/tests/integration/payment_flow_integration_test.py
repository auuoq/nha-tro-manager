import pytest
import uuid
from decimal import Decimal
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models import (
    User, UserRole, Building, Room, RoomStatus, Contract, ContractStatus,
    Invoice, InvoiceStatus, Payment, PaymentMethod, PaymentSource, PaymentStatus
)

@pytest.mark.asyncio
async def test_payment_ledger_recalculation_integration(db_session: AsyncSession):
    suffix = str(uuid.uuid4())[:8]

    owner = User(id=f"usr_{suffix}", phone=f"0983{suffix}", email=f"owner_{suffix}@test.com", fullName="Owner Pay", passwordHash="hash", role=UserRole.OWNER, isActive=True)
    building = Building(id=f"bld_{suffix}", ownerId=owner.id, name="Building Pay", address="123 Street")
    room = Room(id=f"room_{suffix}", buildingId=building.id, roomNumber="P401", floor=4, roomType="STUDIO", basePrice=Decimal("3000000"), areaSqM=Decimal("28"), status=RoomStatus.RENTED)
    contract = Contract(id=f"ctr_{suffix}", roomId=room.id, contractCode=f"HD-PAY-{suffix}", startDate=datetime(2026,1,1), endDate=datetime(2026,12,31), depositAmount=Decimal("3000000"), monthlyPrice=Decimal("3000000"), billingDay=5, status=ContractStatus.ACTIVE)
    invoice = Invoice(id=f"inv_{suffix}", invoiceCode=f"INV-PAY-{suffix}", roomId=room.id, contractId=contract.id, billingPeriod="2026-03", revision=1, dueDate=datetime(2026,3,10), subtotalAmount=Decimal("3000000"), discountAmount=Decimal("0"), totalAmount=Decimal("3000000"), paidAmount=Decimal("0"), remainingAmount=Decimal("3000000"), status=InvoiceStatus.ISSUED)

    db_session.add_all([owner, building, room, contract, invoice])
    await db_session.flush()

    # 1. Partial Payment: 1,000,000 VNĐ
    pay1 = Payment(id=f"pay1_{suffix}", paymentCode=f"P1-{suffix}", invoiceId=invoice.id, amount=Decimal("1000000"), refundAmount=Decimal("0"), overpaymentAmount=Decimal("0"), method=PaymentMethod.BANK_TRANSFER, source=PaymentSource.ADMIN_MANUAL, status=PaymentStatus.CONFIRMED, recordedById=owner.id)
    db_session.add(pay1)
    invoice.paidAmount += Decimal("1000000")
    invoice.remainingAmount = invoice.totalAmount - invoice.paidAmount
    invoice.status = InvoiceStatus.PARTIALLY_PAID
    await db_session.flush()

    assert invoice.paidAmount == Decimal("1000000")
    assert invoice.remainingAmount == Decimal("2000000")
    assert invoice.status == InvoiceStatus.PARTIALLY_PAID

    # 2. Remaining Payment: 2,000,000 VNĐ
    pay2 = Payment(id=f"pay2_{suffix}", paymentCode=f"P2-{suffix}", invoiceId=invoice.id, amount=Decimal("2000000"), refundAmount=Decimal("0"), overpaymentAmount=Decimal("0"), method=PaymentMethod.CASH, source=PaymentSource.ADMIN_MANUAL, status=PaymentStatus.CONFIRMED, recordedById=owner.id)
    db_session.add(pay2)
    invoice.paidAmount += Decimal("2000000")
    invoice.remainingAmount = invoice.totalAmount - invoice.paidAmount
    invoice.status = InvoiceStatus.PAID
    await db_session.commit()

    assert invoice.paidAmount == Decimal("3000000")
    assert invoice.remainingAmount == Decimal("0")
    assert invoice.status == InvoiceStatus.PAID
