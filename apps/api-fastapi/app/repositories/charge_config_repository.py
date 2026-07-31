from datetime import datetime
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from app.models.charge_config import ChargeConfig
from app.models.enums import ChargeType

class ChargeConfigRepository:
    async def get_by_id(self, db: AsyncSession, config_id: str) -> Optional[ChargeConfig]:
        stmt = select(ChargeConfig).where(ChargeConfig.id == config_id)
        res = await db.execute(stmt)
        return res.scalar_one_or_none()

    async def get_by_building(self, db: AsyncSession, building_id: str) -> List[ChargeConfig]:
        stmt = (
            select(ChargeConfig)
            .where(
                ChargeConfig.buildingId == building_id,
                ChargeConfig.roomId.is_(None),
                ChargeConfig.contractId.is_(None),
            )
            .order_by(ChargeConfig.chargeType.asc(), ChargeConfig.effectiveFrom.desc())
        )
        res = await db.execute(stmt)
        return list(res.scalars().all())

    async def get_by_room(self, db: AsyncSession, room_id: str) -> List[ChargeConfig]:
        stmt = (
            select(ChargeConfig)
            .where(
                ChargeConfig.roomId == room_id,
                ChargeConfig.buildingId.is_(None),
                ChargeConfig.contractId.is_(None),
            )
            .order_by(ChargeConfig.chargeType.asc(), ChargeConfig.effectiveFrom.desc())
        )
        res = await db.execute(stmt)
        return list(res.scalars().all())

    async def find_overlapping(
        self,
        db: AsyncSession,
        charge_type: ChargeType,
        effective_from: datetime,
        effective_to: Optional[datetime],
        building_id: Optional[str] = None,
        room_id: Optional[str] = None,
        exclude_id: Optional[str] = None,
    ) -> List[ChargeConfig]:
        conditions = [ChargeConfig.chargeType == charge_type]

        if building_id:
            conditions.extend([
                ChargeConfig.buildingId == building_id,
                ChargeConfig.roomId.is_(None),
                ChargeConfig.contractId.is_(None),
            ])
        elif room_id:
            conditions.extend([
                ChargeConfig.roomId == room_id,
                ChargeConfig.buildingId.is_(None),
                ChargeConfig.contractId.is_(None),
            ])

        if exclude_id:
            conditions.append(ChargeConfig.id != exclude_id)

        # Overlap date range logic:
        # Existing config starts before new effectiveTo (or infinity) AND ends after new effectiveFrom
        date_overlap = []
        if effective_to:
            date_overlap.append(ChargeConfig.effectiveFrom <= effective_to)
        date_overlap.append(
            or_(
                ChargeConfig.effectiveTo.is_(None),
                ChargeConfig.effectiveTo >= effective_from,
            )
        )
        conditions.append(and_(*date_overlap))

        stmt = select(ChargeConfig).where(and_(*conditions))
        res = await db.execute(stmt)
        return list(res.scalars().all())

    async def create(self, db: AsyncSession, config: ChargeConfig) -> ChargeConfig:
        db.add(config)
        return config
