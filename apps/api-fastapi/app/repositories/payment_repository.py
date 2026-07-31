from datetime import datetime
from typing import Optional, List, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from app.models.payment import Payment
from app.models.invoice import Invoice
from app.models.room import Room
from app.models.building import Building
from app.models.enums import PaymentMethod, PaymentStatus

class PaymentRepository:
    async def get_by_id(self, db: AsyncSession, payment_id: str, owner_id: Optional[str] = None, lock: bool = False) -> Optional[Payment]:
        query = (
            select(Payment)
            .join(Invoice, Payment.invoiceId == Invoice.id)
            .join(Room, Invoice.roomId == Room.id)
            .join(Building, Room.buildingId == Building.id)
            .where(Payment.id == payment_id, Invoice.deletedAt.is_(None), Room.deletedAt.is_(None), Building.deletedAt.is_(None))
        )
        if owner_id:
            query = query.where(Building.ownerId == owner_id)
        if lock:
            query = query.with_for_update()
        res = await db.execute(query)
        return res.scalar_one_or_none()

    async def get_valid_payments_by_invoice(self, db: AsyncSession, invoice_id: str) -> List[Payment]:
        stmt = select(Payment).where(
            Payment.invoiceId == invoice_id,
            Payment.status.in_([PaymentStatus.CONFIRMED, PaymentStatus.PARTIALLY_REFUNDED]),
        )
        res = await db.execute(stmt)
        return list(res.scalars().all())

    async def get_all_by_owner(
        self,
        db: AsyncSession,
        owner_id: str,
        invoice_id: Optional[str] = None,
        building_id: Optional[str] = None,
        method: Optional[PaymentMethod] = None,
        status: Optional[PaymentStatus] = None,
        from_date: Optional[datetime] = None,
        to_date: Optional[datetime] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> Tuple[List[Payment], int]:
        base_where = [
            Building.ownerId == owner_id,
            Invoice.deletedAt.is_(None),
            Room.deletedAt.is_(None),
            Building.deletedAt.is_(None),
        ]
        if invoice_id:
            base_where.append(Payment.invoiceId == invoice_id)
        if building_id:
            base_where.append(Room.buildingId == building_id)
        if method:
            base_where.append(Payment.method == method)
        if status:
            base_where.append(Payment.status == status)
        if from_date:
            base_where.append(Payment.paidAt >= from_date)
        if to_date:
            base_where.append(Payment.paidAt <= to_date)

        count_stmt = (
            select(func.count(Payment.id))
            .join(Invoice, Payment.invoiceId == Invoice.id)
            .join(Room, Invoice.roomId == Room.id)
            .join(Building, Room.buildingId == Building.id)
            .where(and_(*base_where))
        )
        count_res = await db.execute(count_stmt)
        total = count_res.scalar_one()

        offset = (page - 1) * page_size
        stmt = (
            select(Payment)
            .join(Invoice, Payment.invoiceId == Invoice.id)
            .join(Room, Invoice.roomId == Room.id)
            .join(Building, Room.buildingId == Building.id)
            .where(and_(*base_where))
            .order_by(Payment.paidAt.desc())
            .offset(offset)
            .limit(page_size)
        )
        res = await db.execute(stmt)
        items = list(res.scalars().all())

        return items, total

    async def get_tenant_payments_by_invoice(self, db: AsyncSession, invoice_id: str) -> List[Payment]:
        stmt = select(Payment).where(Payment.invoiceId == invoice_id).order_by(Payment.paidAt.desc())
        res = await db.execute(stmt)
        return list(res.scalars().all())

    async def create(self, db: AsyncSession, payment: Payment) -> Payment:
        db.add(payment)
        return payment
