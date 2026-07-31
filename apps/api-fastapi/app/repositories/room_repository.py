from typing import Optional, List, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from app.models.room import Room
from app.models.building import Building
from app.models.contract import Contract
from app.models.enums import RoomStatus, ContractStatus

class RoomRepository:
    async def get_by_id(self, db: AsyncSession, room_id: str, owner_id: Optional[str] = None) -> Optional[Room]:
        query = (
            select(Room)
            .join(Building, Room.buildingId == Building.id)
            .where(Room.id == room_id, Room.deletedAt.is_(None), Building.deletedAt.is_(None))
        )
        if owner_id:
            query = query.where(Building.ownerId == owner_id)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    async def get_by_building_and_number(
        self, db: AsyncSession, building_id: str, room_number: str
    ) -> Optional[Room]:
        stmt = select(Room).where(
            Room.buildingId == building_id,
            Room.roomNumber == room_number.strip(),
            Room.deletedAt.is_(None),
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_all_by_owner(
        self,
        db: AsyncSession,
        owner_id: str,
        building_id: Optional[str] = None,
        status: Optional[RoomStatus] = None,
        search: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> Tuple[List[Tuple[Room, str]], int]:
        base_where = [
            Building.ownerId == owner_id,
            Room.deletedAt.is_(None),
            Building.deletedAt.is_(None),
        ]
        if building_id:
            base_where.append(Room.buildingId == building_id)
        if status:
            base_where.append(Room.status == status)
        if search and search.strip():
            base_where.append(Room.roomNumber.ilike(f"%{search.strip()}%"))

        count_stmt = select(func.count(Room.id)).join(Building, Room.buildingId == Building.id).where(and_(*base_where))
        count_res = await db.execute(count_stmt)
        total = count_res.scalar_one()

        offset = (page - 1) * page_size
        stmt = (
            select(Room, Building.name.label("buildingName"))
            .join(Building, Room.buildingId == Building.id)
            .where(and_(*base_where))
            .order_by(Building.name.asc(), Room.floor.asc(), Room.roomNumber.asc())
            .offset(offset)
            .limit(page_size)
        )
        result = await db.execute(stmt)
        items = list(result.all())

        return items, total

    async def count_active_contracts(self, db: AsyncSession, room_id: str) -> int:
        stmt = select(func.count(Contract.id)).where(
            Contract.roomId == room_id,
            Contract.status == ContractStatus.ACTIVE,
            Contract.deletedAt.is_(None),
        )
        res = await db.execute(stmt)
        return res.scalar_one()

    async def create(self, db: AsyncSession, room: Room) -> Room:
        db.add(room)
        return room
