from datetime import date
from decimal import Decimal
from typing import List, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from app.models.contract_tenant import ContractTenant
from app.models.meter_reading import MeterReading
from app.models.meter import Meter
from app.models.enums import ChargeMethod, MeterType

class InvoiceCalculationService:
    async def count_active_tenants_at_cutoff(
        self, db: AsyncSession, contract_id: str, cutoff_date: date
    ) -> int:
        stmt = select(func.count(ContractTenant.id)).where(
            ContractTenant.contractId == contract_id,
            ContractTenant.joinedAt <= cutoff_date,
            and_(
                ContractTenant.leftAt.is_(None) | (ContractTenant.leftAt >= cutoff_date)
            ),
        )
        res = await db.execute(stmt)
        return res.scalar_one()

    async def get_total_consumption_for_period(
        self, db: AsyncSession, room_id: str, period: str, meter_type: MeterType
    ) -> Tuple[Decimal, List[str], List[dict]]:
        """Calculates total consumption across all meters in room for period (handles mid-period meter replacement)."""
        stmt = (
            select(MeterReading)
            .join(Meter, MeterReading.meterId == Meter.id)
            .where(
                Meter.roomId == room_id,
                Meter.type == meter_type,
                MeterReading.period == period.strip(),
            )
            .order_by(MeterReading.createdAt.asc())
        )
        res = await db.execute(stmt)
        readings = list(res.scalars().all())

        total_consumption = Decimal(0)
        reading_ids = []
        sources = []

        for r in readings:
            total_consumption += r.consumption
            reading_ids.append(r.id)
            sources.append({
                "meterId": r.meterId,
                "readingId": r.id,
                "period": r.period,
                "previousValue": float(r.previousValue),
                "currentValue": float(r.currentValue),
                "consumption": float(r.consumption),
            })

        return total_consumption, reading_ids, sources
