from typing import Optional, List, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from app.models.building import Building
from app.models.room import Room
from app.models.contract import Contract
from app.models.enums import ContractStatus

class BuildingRepository:
    async def get_by_id(self, db: AsyncSession, building_id: str, owner_id: Optional[str] = None) -> Optional[Building]:
        query = select(Building).where(Building.id == building_id, Building.deletedAt.is_(None))
        if owner_id:
            query = query.where(Building.ownerId == owner_id)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    async def get_all_by_owner(
        self, db: AsyncSession, owner_id: str, page: int = 1, page_size: int = 20
    ) -> Tuple[List[Building], int]:
        count_stmt = select(func.count(Building.id)).where(
            Building.ownerId == owner_id,
            Building.deletedAt.is_(None),
        )
        count_res = await db.execute(count_stmt)
        total = count_res.scalar_one()

        offset = (page - 1) * page_size
        stmt = (
            select(Building)
            .where(Building.ownerId == owner_id, Building.deletedAt.is_(None))
            .order_by(Building.createdAt.desc())
            .offset(offset)
            .limit(page_size)
        )
        result = await db.execute(stmt)
        items = list(result.scalars().all())

        return items, total

    async def count_active_contracts(self, db: AsyncSession, building_id: str) -> int:
        stmt = (
            select(func.count(Contract.id))
            .join(Room, Contract.roomId == Room.id)
            .where(
                Room.buildingId == building_id,
                Contract.status == ContractStatus.ACTIVE,
                Contract.deletedAt.is_(None),
                Room.deletedAt.is_(None),
            )
        )
        res = await db.execute(stmt)
        return res.scalar_one()

    async def create(self, db: AsyncSession, building: Building) -> Building:
        db.add(building)
        return building
