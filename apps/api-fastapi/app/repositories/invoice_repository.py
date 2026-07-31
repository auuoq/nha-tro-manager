from datetime import date
from decimal import Decimal
from typing import Optional, List, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from app.models.invoice import Invoice
from app.models.invoice_item import InvoiceItem
from app.models.room import Room
from app.models.building import Building
from app.models.contract import Contract
from app.models.enums import InvoiceStatus

class InvoiceRepository:
    async def get_by_id(self, db: AsyncSession, invoice_id: str, owner_id: Optional[str] = None, lock: bool = False) -> Optional[Invoice]:
        query = (
            select(Invoice)
            .join(Room, Invoice.roomId == Room.id)
            .join(Building, Room.buildingId == Building.id)
            .where(Invoice.id == invoice_id, Invoice.deletedAt.is_(None), Room.deletedAt.is_(None), Building.deletedAt.is_(None))
        )
        if owner_id:
            query = query.where(Building.ownerId == owner_id)
        if lock:
            query = query.with_for_update()
        res = await db.execute(query)
        return res.scalar_one_or_none()

    async def get_active_invoice_by_contract_and_period(
        self, db: AsyncSession, contract_id: str, period: str
    ) -> Optional[Invoice]:
        stmt = select(Invoice).where(
            Invoice.contractId == contract_id,
            Invoice.billingPeriod == period.strip(),
            Invoice.status != InvoiceStatus.CANCELLED,
            Invoice.deletedAt.is_(None),
        )
        res = await db.execute(stmt)
        return res.scalar_one_or_none()

    async def get_all_by_owner(
        self,
        db: AsyncSession,
        owner_id: str,
        building_id: Optional[str] = None,
        contract_id: Optional[str] = None,
        status: Optional[InvoiceStatus] = None,
        period: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> Tuple[List[Tuple[Invoice, str, str]], int]:
        base_where = [
            Building.ownerId == owner_id,
            Invoice.deletedAt.is_(None),
            Room.deletedAt.is_(None),
            Building.deletedAt.is_(None),
        ]
        if building_id:
            base_where.append(Room.buildingId == building_id)
        if contract_id:
            base_where.append(Invoice.contractId == contract_id)
        if status:
            base_where.append(Invoice.status == status)
        if period:
            base_where.append(Invoice.billingPeriod == period.strip())

        count_stmt = select(func.count(Invoice.id)).join(Room, Invoice.roomId == Room.id).join(Building, Room.buildingId == Building.id).where(and_(*base_where))
        count_res = await db.execute(count_stmt)
        total = count_res.scalar_one()

        offset = (page - 1) * page_size
        stmt = (
            select(Invoice, Room.roomNumber, Building.name.label("buildingName"))
            .join(Room, Invoice.roomId == Room.id)
            .join(Building, Room.buildingId == Building.id)
            .where(and_(*base_where))
            .order_by(Invoice.createdAt.desc())
            .offset(offset)
            .limit(page_size)
        )
        res = await db.execute(stmt)
        items = list(res.all())

        return items, total

    async def get_tenant_invoices(self, db: AsyncSession, contract_ids: List[str]) -> List[Invoice]:
        if not contract_ids:
            return []
        stmt = (
            select(Invoice)
            .where(
                Invoice.contractId.in_(contract_ids),
                Invoice.status.in_([InvoiceStatus.ISSUED, InvoiceStatus.PARTIALLY_PAID, InvoiceStatus.PAID, InvoiceStatus.OVERDUE]),
                Invoice.deletedAt.is_(None),
            )
            .order_by(Invoice.createdAt.desc())
        )
        res = await db.execute(stmt)
        return list(res.scalars().all())

    async def calculate_previous_outstanding(self, db: AsyncSession, contract_id: str, current_invoice_id: Optional[str] = None) -> Decimal:
        conditions = [
            Invoice.contractId == contract_id,
            Invoice.status.in_([InvoiceStatus.ISSUED, InvoiceStatus.PARTIALLY_PAID, InvoiceStatus.OVERDUE]),
            Invoice.deletedAt.is_(None),
        ]
        if current_invoice_id:
            conditions.append(Invoice.id != current_invoice_id)

        stmt = select(func.coalesce(func.sum(Invoice.remainingAmount), 0)).where(and_(*conditions))
        res = await db.execute(stmt)
        return res.scalar_one()

    async def generate_invoice_code(self, db: AsyncSession) -> str:
        count_stmt = select(func.count(Invoice.id))
        res = await db.execute(count_stmt)
        seq = res.scalar_one() + 1
        return f"INV-{date.today().strftime('%Y%m')}-{seq:04d}"

    async def create(self, db: AsyncSession, invoice: Invoice) -> Invoice:
        db.add(invoice)
        return invoice
