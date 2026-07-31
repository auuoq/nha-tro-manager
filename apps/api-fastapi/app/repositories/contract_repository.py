from datetime import date
from typing import Optional, List, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from app.models.contract import Contract
from app.models.room import Room
from app.models.building import Building
from app.models.contract_tenant import ContractTenant
from app.models.enums import ContractStatus

class ContractRepository:
    async def get_by_id(self, db: AsyncSession, contract_id: str, owner_id: Optional[str] = None, lock: bool = False) -> Optional[Contract]:
        query = (
            select(Contract)
            .join(Room, Contract.roomId == Room.id)
            .join(Building, Room.buildingId == Building.id)
            .where(Contract.id == contract_id, Contract.deletedAt.is_(None), Room.deletedAt.is_(None), Building.deletedAt.is_(None))
        )
        if owner_id:
            query = query.where(Building.ownerId == owner_id)
        if lock:
            query = query.with_for_update()
        res = await db.execute(query)
        return res.scalar_one_or_none()

    async def get_all_by_owner(
        self,
        db: AsyncSession,
        owner_id: str,
        building_id: Optional[str] = None,
        room_id: Optional[str] = None,
        status: Optional[ContractStatus] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> Tuple[List[Tuple[Contract, str, str]], int]:
        base_where = [
            Building.ownerId == owner_id,
            Contract.deletedAt.is_(None),
            Room.deletedAt.is_(None),
            Building.deletedAt.is_(None),
        ]
        if building_id:
            base_where.append(Room.buildingId == building_id)
        if room_id:
            base_where.append(Contract.roomId == room_id)
        if status:
            base_where.append(Contract.status == status)

        count_stmt = select(func.count(Contract.id)).join(Room, Contract.roomId == Room.id).join(Building, Room.buildingId == Building.id).where(and_(*base_where))
        count_res = await db.execute(count_stmt)
        total = count_res.scalar_one()

        offset = (page - 1) * page_size
        stmt = (
            select(Contract, Room.roomNumber, Building.name.label("buildingName"))
            .join(Room, Contract.roomId == Room.id)
            .join(Building, Room.buildingId == Building.id)
            .where(and_(*base_where))
            .order_by(Contract.createdAt.desc())
            .offset(offset)
            .limit(page_size)
        )
        res = await db.execute(stmt)
        items = list(res.all())

        return items, total

    async def find_overlapping_active_contracts(
        self, db: AsyncSession, room_id: str, start_date: date, end_date: date, exclude_id: Optional[str] = None
    ) -> List[Contract]:
        conditions = [
            Contract.roomId == room_id,
            Contract.status == ContractStatus.ACTIVE,
            Contract.deletedAt.is_(None),
            Contract.startDate <= end_date,
            Contract.endDate >= start_date,
        ]
        if exclude_id:
            conditions.append(Contract.id != exclude_id)

        stmt = select(Contract).where(and_(*conditions))
        res = await db.execute(stmt)
        return list(res.scalars().all())

    async def get_tenant_active_contracts(self, db: AsyncSession, tenant_id: str) -> List[Contract]:
        stmt = (
            select(Contract)
            .join(ContractTenant, Contract.id == ContractTenant.contractId)
            .where(
                ContractTenant.tenantId == tenant_id,
                ContractTenant.leftAt.is_(None),
                Contract.status == ContractStatus.ACTIVE,
                Contract.deletedAt.is_(None),
            )
            .order_by(Contract.startDate.desc())
        )
        res = await db.execute(stmt)
        return list(res.scalars().all())

    async def generate_contract_code(self, db: AsyncSession) -> str:
        count_stmt = select(func.count(Contract.id))
        res = await db.execute(count_stmt)
        seq = res.scalar_one() + 1
        return f"HD-{date.today().strftime('%Y%m')}-{seq:04d}"

    async def create(self, db: AsyncSession, contract: Contract) -> Contract:
        db.add(contract)
        return contract
