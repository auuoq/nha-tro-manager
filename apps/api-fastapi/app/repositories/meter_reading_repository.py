from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from app.models.meter_reading import MeterReading
from app.models.meter import Meter
from app.models.room import Room
from app.models.building import Building

class MeterReadingRepository:
    async def get_by_id(self, db: AsyncSession, reading_id: str, owner_id: Optional[str] = None) -> Optional[MeterReading]:
        query = (
            select(MeterReading)
            .join(Meter, MeterReading.meterId == Meter.id)
            .join(Room, Meter.roomId == Room.id)
            .join(Building, Room.buildingId == Building.id)
            .where(MeterReading.id == reading_id, Room.deletedAt.is_(None), Building.deletedAt.is_(None))
        )
        if owner_id:
            query = query.where(Building.ownerId == owner_id)
        res = await db.execute(query)
        return res.scalar_one_or_none()

    async def get_by_meter_and_period(self, db: AsyncSession, meter_id: str, period: str) -> Optional[MeterReading]:
        stmt = select(MeterReading).where(
            MeterReading.meterId == meter_id,
            MeterReading.period == period.strip(),
        )
        res = await db.execute(stmt)
        return res.scalar_one_or_none()

    async def get_latest_reading_before_period(self, db: AsyncSession, meter_id: str, period: str) -> Optional[MeterReading]:
        stmt = (
            select(MeterReading)
            .where(
                MeterReading.meterId == meter_id,
                MeterReading.period < period.strip(),
            )
            .order_by(MeterReading.period.desc())
            .limit(1)
        )
        res = await db.execute(stmt)
        return res.scalar_one_or_none()

    async def get_readings_by_meter(self, db: AsyncSession, meter_id: str) -> List[MeterReading]:
        stmt = select(MeterReading).where(MeterReading.meterId == meter_id).order_by(MeterReading.period.desc())
        res = await db.execute(stmt)
        return list(res.scalars().all())

    async def get_room_readings_for_period(
        self, db: AsyncSession, room_id: str, period: str, meter_type: str
    ) -> List[MeterReading]:
        stmt = (
            select(MeterReading)
            .join(Meter, MeterReading.meterId == Meter.id)
            .where(
                Meter.roomId == room_id,
                Meter.type == meter_type,
                MeterReading.period == period.strip(),
            )
            .order_by(MeterReading.period.asc())
        )
        res = await db.execute(stmt)
        return list(res.scalars().all())

    async def create(self, db: AsyncSession, reading: MeterReading) -> MeterReading:
        db.add(reading)
        return reading
