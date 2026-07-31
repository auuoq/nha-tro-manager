from datetime import date
from typing import Optional, Dict
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from app.models.charge_config import ChargeConfig
from app.models.enums import ChargeType
from app.core.exceptions import BusinessException
from fastapi import status

class ChargeResolutionService:
    async def resolve_charge_config(
        self,
        db: AsyncSession,
        charge_type: ChargeType,
        target_date: date,
        contract_id: Optional[str] = None,
        room_id: Optional[str] = None,
        building_id: Optional[str] = None,
    ) -> ChargeConfig:
        # Priority 1: Contract Scope
        if contract_id:
            stmt = select(ChargeConfig).where(
                ChargeConfig.contractId == contract_id,
                ChargeConfig.chargeType == charge_type,
                ChargeConfig.effectiveFrom <= target_date,
                or_(ChargeConfig.effectiveTo.is_(None), ChargeConfig.effectiveTo >= target_date),
            ).order_by(ChargeConfig.effectiveFrom.desc())
            res = await db.execute(stmt)
            config = res.scalar_one_or_none()
            if config:
                return config

        # Priority 2: Room Scope
        if room_id:
            stmt = select(ChargeConfig).where(
                ChargeConfig.roomId == room_id,
                ChargeConfig.chargeType == charge_type,
                ChargeConfig.buildingId.is_(None),
                ChargeConfig.contractId.is_(None),
                ChargeConfig.effectiveFrom <= target_date,
                or_(ChargeConfig.effectiveTo.is_(None), ChargeConfig.effectiveTo >= target_date),
            ).order_by(ChargeConfig.effectiveFrom.desc())
            res = await db.execute(stmt)
            config = res.scalar_one_or_none()
            if config:
                return config

        # Priority 3: Building Scope
        if building_id:
            stmt = select(ChargeConfig).where(
                ChargeConfig.buildingId == building_id,
                ChargeConfig.chargeType == charge_type,
                ChargeConfig.roomId.is_(None),
                ChargeConfig.contractId.is_(None),
                ChargeConfig.effectiveFrom <= target_date,
                or_(ChargeConfig.effectiveTo.is_(None), ChargeConfig.effectiveTo >= target_date),
            ).order_by(ChargeConfig.effectiveFrom.desc())
            res = await db.execute(stmt)
            config = res.scalar_one_or_none()
            if config:
                return config

        raise BusinessException(
            code="MISSING_CHARGE_CONFIG",
            message=f"Thiếu cấu hình chi phí cho loại {charge_type.value} áp dụng tại ngày {target_date}",
            status_code=status.HTTP_400_BAD_REQUEST,
        )
