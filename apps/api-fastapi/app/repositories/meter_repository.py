from typing import Optional, List, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from app.models.meter import Meter
from app.models.room import Room
from app.models.building import Building
from app.models.enums import MeterType

class MeterRepository:
    async def get_by_id(self, db: AsyncSession, meter_id: str, owner_id: Optional[str] = None, lock: bool = False) -> Optional[Meter]:
        query = (
            select(Meter)
            .join(Room, Meter.roomId == Room.id)
            .join(Building, Room.buildingId == Building.id)
            .where(Meter.id == meter_id, Room.deletedAt.is_(None), Building.deletedAt.is_(None))
        )
        if owner_id:
            query = query.where(Building.ownerId == owner_id)
        if lock:
            query = query.with_for_update()
        res = await db.execute(query)
        return res.scalar_one_or_none()

    async def get_active_by_room_and_type(
        self, db: AsyncSession, room_id: str, meter_type: MeterType
    ) -> Optional[Meter]:
        stmt = select(Meter).where(
            Meter.roomId == room_id,
            Meter.type == meter_type,
            Meter.isActive.is_(True),
        )
        res = await db.execute(stmt)
        return res.scalar_one_or_none()

    async def get_all_by_owner(
        self,
        db: AsyncSession,
        owner_id: str,
        building_id: Optional[str] = None,
        room_id: Optional[str] = None,
        meter_type: Optional[MeterType] = None,
        is_active: Optional[bool] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> Tuple[List[Tuple[Meter, str, str]], int]:
        base_where = [
            Building.ownerId == owner_id,
            Room.deletedAt.is_(None),
            Building.deletedAt.is_(None),
        ]
        if building_id:
            base_where.append(Room.buildingId == building_id)
        if room_id:
            base_where.append(Meter.roomId == room_id)
        if meter_type:
            base_where.append(Meter.type == meter_type)
        if is_active is not None:
            base_where.append(Meter.isActive == is_active)

        count_stmt = select(func.count(Meter.id)).join(Room, Meter.roomId == Room.id).join(Building, Room.buildingId == Building.id).where(and_(*base_where))
        count_res = await db.execute(count_stmt)
        total = count_res.scalar_one()

        offset = (page - 1) * page_size
        stmt = (
            select(Meter, Room.roomNumber, Building.name.label("buildingName"))
            .join(Room, Meter.roomId == Room.id)
            .join(Building, Room.buildingId == Building.id)
            .where(and_(*base_where))
            .order_by(Meter.createdAt.desc())
            .offset(offset)
            .limit(page_size)
        )
        res = await db.execute(stmt)
        items = list(res.all())

        return items, total

    async def create(self, db: AsyncSession, meter: Meter) -> Meter:
        db.add(meter)
        return meter
